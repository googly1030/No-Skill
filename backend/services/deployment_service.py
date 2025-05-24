import docker
import git
import os
import shutil
import json
import subprocess
from pathlib import Path
from typing import Dict, List
import logging
from datetime import datetime
import asyncio

from models.project import Project, DeploymentStatus

logger = logging.getLogger(__name__)

class DeploymentService:
    def __init__(self):
        """Initialize with the working TCP connection"""
        try:
            # Use the TCP connection that works
            self.docker_client = docker.DockerClient(base_url='tcp://localhost:2375')
            # Test the connection
            version = self.docker_client.version()
            logger.info(f"✅ Docker connected via TCP, version: {version['Version']}")
        except Exception as e:
            logger.error(f"Docker connection failed: {e}")
            raise Exception(f"Docker is not running or accessible: {e}")
            
        self.workspace_dir = Path("workspace")
        self.nginx_config_dir = Path("nginx/sites")
        self.logs_storage: Dict[str, List[str]] = {}
        self.projects_storage: Dict[str, Project] = {}
        
        # Ensure directories exist
        self.workspace_dir.mkdir(exist_ok=True)
        self.nginx_config_dir.mkdir(parents=True, exist_ok=True)
    
    async def deploy_project(self, project: Project):
        """Deploy a project from GitHub repository"""
        try:
            self._log(project.id, "🚀 Starting deployment...")
            
            # Step 1: Clone repository
            await self._clone_repository(project)
            
            # Step 2: Detect project type and create Dockerfile
            await self._prepare_dockerfile(project)
            
            # Step 3: Build Docker image
            await self._build_docker_image(project)
            
            # Step 4: Deploy container
            await self._deploy_container(project)
            
            # Update project status
            self._update_project_status(project.id, DeploymentStatus.ACTIVE)
            self._log(project.id, "✅ Deployment completed successfully!")
            
        except Exception as e:
            logger.error(f"Deployment failed for {project.id}: {str(e)}")
            self._log(project.id, f"❌ Deployment failed: {str(e)}")
            self._update_project_status(project.id, DeploymentStatus.ERROR)
    
    async def _clone_repository(self, project: Project):
        """Clone GitHub repository"""
        self._log(project.id, "📥 Cloning repository...")
        
        project_dir = self.workspace_dir / project.id
        if project_dir.exists():
            shutil.rmtree(project_dir)
        
        try:
            # Use asyncio to run git clone in a thread to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, git.Repo.clone_from, project.github_url, str(project_dir)
            )
            self._log(project.id, "✅ Repository cloned successfully")
        except Exception as e:
            raise Exception(f"Failed to clone repository: {str(e)}")
    
    async def _prepare_dockerfile(self, project: Project):
        """Detect project type and create appropriate Dockerfile"""
        project_dir = self.workspace_dir / project.id
        
        # Check for existing Dockerfile
        if (project_dir / "Dockerfile").exists():
            self._log(project.id, "📄 Found existing Dockerfile")
            return
        
        # Detect project type
        project_type = self._detect_project_type(project_dir)
        self._log(project.id, f"🔍 Detected project type: {project_type}")
        
        # Create appropriate Dockerfile
        dockerfile_content = self._get_dockerfile_template(project_type)
        
        with open(project_dir / "Dockerfile", "w") as f:
            f.write(dockerfile_content)
        
        self._log(project.id, "📄 Dockerfile created")
    
    def _detect_project_type(self, project_dir: Path) -> str:
        """Detect the type of project"""
        if (project_dir / "package.json").exists():
            # Check if it's a React/Next.js project
            try:
                with open(project_dir / "package.json") as f:
                    package_json = json.load(f)
                    dependencies = package_json.get("dependencies", {})
                    dev_dependencies = package_json.get("devDependencies", {})
                    all_deps = {**dependencies, **dev_dependencies}
                    
                    if "next" in all_deps:
                        return "nextjs"
                    elif "react" in all_deps:
                        return "react"
                    else:
                        return "nodejs"
            except:
                return "nodejs"
        
        elif (project_dir / "requirements.txt").exists() or (project_dir / "pyproject.toml").exists():
            return "python"
        
        elif (project_dir / "index.html").exists():
            return "static"
        
        elif (project_dir / "Cargo.toml").exists():
            return "rust"
        
        elif (project_dir / "go.mod").exists():
            return "go"
        
        else:
            return "static"  # Default to static
    
    def _get_dockerfile_template(self, project_type: str) -> str:
        """Get Dockerfile template based on project type"""
        templates = {
            "react": """# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
""",
            "nextjs": """FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
""",
            "nodejs": """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
""",
            "python": """FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt* ./
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
""",
            "static": """FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
""",
        }
        
        return templates.get(project_type, templates["static"])
    
    async def _build_docker_image(self, project: Project):
        """Build Docker image"""
        self._log(project.id, "🔨 Building Docker image...")
        
        project_dir = self.workspace_dir / project.id
        image_tag = f"noskill-{project.id}:latest"
        
        try:
            # Build image using Docker client
            self._log(project.id, f"Building image: {image_tag}")
            
            # Run build in executor to avoid blocking
            def build_image():
                return self.docker_client.images.build(
                    path=str(project_dir),
                    tag=image_tag,
                    rm=True,
                    forcerm=True
                )
            
            image, logs = await asyncio.get_event_loop().run_in_executor(None, build_image)
            
            # Process build logs
            for log in logs:
                if 'stream' in log:
                    self._log(project.id, log['stream'].strip())
                elif 'error' in log:
                    raise Exception(f"Build error: {log['error']}")
            
            self._log(project.id, f"✅ Docker image built successfully: {image_tag}")
            
        except Exception as e:
            raise Exception(f"Failed to build Docker image: {str(e)}")
    
    async def _deploy_container(self, project: Project):
        """Deploy Docker container"""
        self._log(project.id, "🚀 Deploying container...")
        
        image_tag = f"noskill-{project.id}:latest"
        container_name = f"noskill-{project.id}"
        
        try:
            # Remove existing container if exists
            try:
                existing_container = self.docker_client.containers.get(container_name)
                existing_container.stop()
                existing_container.remove()
                self._log(project.id, "🗑️ Removed existing container")
            except docker.errors.NotFound:
                pass
            
            # Run new container with port mapping
            container = self.docker_client.containers.run(
                image_tag,
                name=container_name,
                ports={
                    '80/tcp': None,    # For nginx/static sites
                    '3000/tcp': None,  # For Node.js/React
                    '8000/tcp': None   # For Python apps
                },
                detach=True,
                restart_policy={"Name": "unless-stopped"}
            )
            
            # Wait for container to be ready
            await asyncio.sleep(3)
            
            # Get the assigned port
            container.reload()
            port_info = container.attrs['NetworkSettings']['Ports']
            assigned_port = None
            
            for port_key in ['80/tcp', '3000/tcp', '8000/tcp']:
                if port_key in port_info and port_info[port_key]:
                    assigned_port = port_info[port_key][0]['HostPort']
                    break
            
            if assigned_port:
                self._log(project.id, f"🌐 Container running on http://localhost:{assigned_port}")
                # Store the port for later use
                project.container_id = container.id
                project.port = assigned_port
            else:
                raise Exception("No port was assigned to the container")
            
            self._log(project.id, f"✅ Container deployed successfully: {container_name}")
            
        except Exception as e:
            raise Exception(f"Failed to deploy container: {str(e)}")
    
    async def remove_deployment(self, project_id: str):
        """Remove deployment and cleanup"""
        try:
            # Stop and remove container
            container_name = f"noskill-{project_id}"
            try:
                container = self.docker_client.containers.get(container_name)
                container.stop()
                container.remove()
                logger.info(f"Removed container: {container_name}")
            except docker.errors.NotFound:
                pass
            
            # Remove Docker image
            image_tag = f"noskill-{project_id}:latest"
            try:
                self.docker_client.images.remove(image_tag, force=True)
                logger.info(f"Removed image: {image_tag}")
            except docker.errors.ImageNotFound:
                pass
            
            # Remove project directory
            project_dir = self.workspace_dir / project_id
            if project_dir.exists():
                shutil.rmtree(project_dir)
            
            # Remove logs
            if project_id in self.logs_storage:
                del self.logs_storage[project_id]
            
        except Exception as e:
            logger.error(f"Error removing deployment {project_id}: {str(e)}")
    
    def _log(self, project_id: str, message: str):
        """Add log entry for project"""
        if project_id not in self.logs_storage:
            self.logs_storage[project_id] = []
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.logs_storage[project_id].append(log_entry)
        logger.info(f"Project {project_id}: {message}")
    
    def get_logs(self, project_id: str) -> List[str]:
        """Get logs for project"""
        return self.logs_storage.get(project_id, [])
    
    def _update_project_status(self, project_id: str, status: DeploymentStatus):
        """Update project status"""
        if project_id in self.projects_storage:
            self.projects_storage[project_id].status = status
            self.projects_storage[project_id].last_deployed = datetime.now()
        
        # Also update in the main projects_db
        from main import projects_db
        for project in projects_db:
            if project.id == project_id:
                project.status = status
                project.last_deployed = datetime.now()
                break