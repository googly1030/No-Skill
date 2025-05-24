import docker
import json
import subprocess
from pathlib import Path
from typing import Dict, List
import logging
from datetime import datetime
import asyncio
import tempfile
import os
import requests

from models.project import Project, DeploymentStatus

logger = logging.getLogger(__name__)

class DeploymentService:
    def __init__(self):
        """Initialize with the working TCP connection"""
        self.logs_storage: Dict[str, List[str]] = {}
        self.projects_storage: Dict[str, Project] = {}
        
        try:
            # Use the TCP connection that works
            self.docker_client = docker.DockerClient(base_url='tcp://localhost:2375')
            # Test the connection
            version = self.docker_client.version()
            logger.info(f"✅ Docker connected via TCP, version: {version['Version']}")
        except Exception as e:
            logger.error(f"Docker connection failed: {e}")
            # Don't raise exception - let the service start without Docker
            self.docker_client = None
            logger.warning("⚠️ Docker not available - deployment features will be disabled")
    
    def _log(self, project_id: str, message: str):
        """Add log entry for project"""
        if project_id not in self.logs_storage:
            self.logs_storage[project_id] = []
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.logs_storage[project_id].append(log_entry)
        logger.info(f"Project {project_id}: {message}")
    
    async def deploy_project(self, project: Project):
        """Deploy a project directly using Docker build with Git clone inside"""
        if not self.docker_client:
            self._log(project.id, "❌ Docker not available")
            return
            
        try:
            self._log(project.id, "🚀 Starting deployment...")
            logger.info(f"Starting deployment for project {project.id}: {project.name}")
            
            # Step 1: Detect project type from GitHub API (without cloning)
            project_type = await self._detect_project_type_from_github(project)
            
            # Step 2: Generate Dockerfile that clones and builds inside Docker
            dockerfile_content = self._generate_dockerfile_with_clone(project, project_type)
            
            # Step 3: Build Docker image using the generated Dockerfile
            await self._build_docker_image_with_dockerfile(project, dockerfile_content)
            
            # Step 4: Deploy container
            await self._deploy_container(project)
            
            # Update project status
            self._update_project_status(project.id, DeploymentStatus.ACTIVE)
            self._log(project.id, "✅ Deployment completed successfully!")
            logger.info(f"Deployment completed successfully for project {project.id}")
            
        except Exception as e:
            logger.error(f"Deployment failed for {project.id}: {str(e)}")
            logger.error(f"Full error details: {repr(e)}")
            self._log(project.id, f"❌ Deployment failed: {str(e)}")
            self._update_project_status(project.id, DeploymentStatus.ERROR)
    
    async def _detect_project_type_from_github(self, project: Project) -> str:
        """Detect project type by checking GitHub API for key files"""
        self._log(project.id, "🔍 Analyzing project type from GitHub...")
        
        try:
            # Extract owner and repo from GitHub URL
            url_parts = project.github_url.rstrip('/').split('/')
            if len(url_parts) >= 2:
                owner = url_parts[-2]
                repo = url_parts[-1]
                
                # Check for key files using GitHub API
                api_base = f"https://api.github.com/repos/{owner}/{repo}/contents"
                
                response = requests.get(api_base, timeout=10)
                if response.status_code == 200:
                    files = response.json()
                    file_names = [f['name'] for f in files if f['type'] == 'file']
                    
                    self._log(project.id, f"📁 Found files: {file_names[:10]}")
                    
                    if 'package.json' in file_names:
                        # Get package.json to check for React/Next.js
                        pkg_response = requests.get(f"{api_base}/package.json")
                        if pkg_response.status_code == 200:
                            pkg_content = pkg_response.json()
                            if 'content' in pkg_content:
                                import base64
                                decoded = base64.b64decode(pkg_content['content']).decode('utf-8')
                                pkg_json = json.loads(decoded)
                                
                                dependencies = pkg_json.get('dependencies', {})
                                dev_dependencies = pkg_json.get('devDependencies', {})
                                all_deps = {**dependencies, **dev_dependencies}
                                
                                if 'next' in all_deps:
                                    self._log(project.id, "🔍 Detected: Next.js project")
                                    return "nextjs"
                                elif 'react' in all_deps:
                                    self._log(project.id, "🔍 Detected: React project")
                                    return "react"
                                else:
                                    self._log(project.id, "🔍 Detected: Node.js project")
                                    return "nodejs"
                    
                    elif 'requirements.txt' in file_names or 'pyproject.toml' in file_names:
                        self._log(project.id, "🔍 Detected: Python project")
                        return "python"
                    
                    elif any(f.endswith('.html') for f in file_names):
                        self._log(project.id, "🔍 Detected: Static HTML project")
                        return "static"
            
        except Exception as e:
            self._log(project.id, f"⚠️ Could not detect from GitHub API: {e}")
        
        # Default fallback
        self._log(project.id, "🔍 Detected: Static project (fallback)")
        return "static"
    
    def _generate_dockerfile_with_clone(self, project: Project, project_type: str) -> str:
        """Generate Dockerfile that clones the repository inside Docker"""
        
        github_url = project.github_url
        
        if project_type == "react":
            return f"""# Multi-stage build for React app
FROM node:18-alpine as cloner
RUN apk add --no-cache git
WORKDIR /app
RUN git clone {github_url} .

FROM node:18-alpine as builder
WORKDIR /app
COPY --from=cloner /app/package*.json ./
RUN npm ci
COPY --from=cloner /app .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""
        
        elif project_type == "nextjs":
            return f"""# Multi-stage build for Next.js app
FROM node:18-alpine as cloner
RUN apk add --no-cache git
WORKDIR /app
RUN git clone {github_url} .

FROM node:18-alpine as builder
WORKDIR /app
COPY --from=cloner /app/package*.json ./
RUN npm ci
COPY --from=cloner /app .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
"""
        
        elif project_type == "nodejs":
            return f"""# Node.js app
FROM node:18-alpine
RUN apk add --no-cache git
WORKDIR /app
RUN git clone {github_url} .
RUN npm ci
EXPOSE 3000
CMD ["npm", "start"]
"""
        
        elif project_type == "python":
            return f"""# Python app
FROM python:3.11-slim
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN git clone {github_url} .
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["python", "app.py"]
"""
        
        else:  # static
            return f"""# Static website
FROM alpine/git as cloner
WORKDIR /app
RUN git clone {github_url} .

FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy repository content and find the best HTML files
COPY --from=cloner /app /tmp/repo

# Smart detection and setup for static sites
RUN cd /tmp/repo && \\
    if [ -f "index.html" ]; then \\
        echo "Found index.html in root" && \\
        cp -r . /usr/share/nginx/html/; \\
    elif [ -f "public/index.html" ]; then \\
        echo "Found index.html in public/" && \\
        cp -r public/* /usr/share/nginx/html/; \\
    elif [ -f "portfolio/index.html" ]; then \\
        echo "Found index.html in portfolio/" && \\
        cp -r portfolio/* /usr/share/nginx/html/; \\
    elif [ -f "docs/index.html" ]; then \\
        echo "Found index.html in docs/" && \\
        cp -r docs/* /usr/share/nginx/html/; \\
    elif [ -f "dist/index.html" ]; then \\
        echo "Found index.html in dist/" && \\
        cp -r dist/* /usr/share/nginx/html/; \\
    elif [ -f "build/index.html" ]; then \\
        echo "Found index.html in build/" && \\
        cp -r build/* /usr/share/nginx/html/; \\
    else \\
        echo "No index.html found, checking for any HTML files" && \\
        HTML_DIR=$(find . -name "*.html" -type f | head -1 | xargs dirname) && \\
        if [ "$HTML_DIR" != "." ] && [ -n "$HTML_DIR" ]; then \\
            echo "Found HTML files in: $HTML_DIR" && \\
            cp -r "$HTML_DIR"/* /usr/share/nginx/html/ 2>/dev/null || cp -r . /usr/share/nginx/html/; \\
        else \\
            echo "Copying all files and creating fallback" && \\
            cp -r . /usr/share/nginx/html/ && \\
            cd /usr/share/nginx/html && \\
            echo '<!DOCTYPE html>' > index.html && \\
            echo '<html><head><title>Repository Deployed</title>' >> index.html && \\
            echo '<style>body{{font-family:Arial;margin:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:100vh}}' >> index.html && \\
            echo '.container{{background:rgba(255,255,255,0.1);padding:40px;border-radius:15px;max-width:900px;margin:0 auto}}' >> index.html && \\
            echo 'h1{{text-align:center;color:#4CAF50}}pre{{background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;overflow-x:auto}}</style></head>' >> index.html && \\
            echo '<body><div class="container"><h1>🚀 Repository Deployed!</h1>' >> index.html && \\
            echo '<p>Your project from <strong>{github_url}</strong> is now live!</p>' >> index.html && \\
            echo '<p><strong>Note:</strong> No index.html found in common directories. Repository structure:</p><pre>' >> index.html && \\
            find . -type f -name "*.html" -o -name "*.css" -o -name "*.js" | head -20 >> index.html && \\
            echo '</pre><p>💡 <strong>Tip:</strong> Move your index.html to the repository root or create a public/ folder.</p>' >> index.html && \\
            echo '<p>Powered by No-Skill Platform</p></div></body></html>' >> index.html; \\
        fi; \\
    fi && \\
    echo "Final content in nginx:" && \\
    ls -la /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""
    
    async def _build_docker_image_with_dockerfile(self, project: Project, dockerfile_content: str):
        """Build Docker image using the generated Dockerfile"""
        self._log(project.id, "🔨 Building Docker image with integrated Git clone...")
        
        image_tag = f"noskill-{project.id}:latest"
        
        try:
            # Create a temporary directory just for the Dockerfile
            with tempfile.TemporaryDirectory() as temp_dir:
                dockerfile_path = os.path.join(temp_dir, "Dockerfile")
                
                # Write the Dockerfile with UTF-8 encoding to handle Unicode characters
                with open(dockerfile_path, "w", encoding='utf-8') as f:
                    f.write(dockerfile_content)
                
                self._log(project.id, f"🏗️ Building image: {image_tag}")
                self._log(project.id, f"📄 Using generated Dockerfile with Git clone")
                
                # Build the image
                def build_image():
                    return self.docker_client.images.build(
                        path=temp_dir,
                        tag=image_tag,
                        rm=True,
                        forcerm=True,
                        pull=True  # Pull latest base images
                    )
                
                image, logs = await asyncio.get_event_loop().run_in_executor(None, build_image)
                
                # Process build logs
                for log in logs:
                    if 'stream' in log:
                        log_line = log['stream'].strip()
                        if log_line:
                            self._log(project.id, f"🔨 {log_line}")
                    elif 'error' in log:
                        raise Exception(f"Build error: {log['error']}")
                
                self._log(project.id, f"✅ Docker image built successfully: {image_tag}")
                
        except Exception as e:
            logger.error(f"Docker build error: {e}")
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
            
            self._log(project.id, f"▶️ Starting container: {container_name}")
            
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
            
            self._log(project.id, f"🔍 Port mapping: {port_info}")
            
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
            logger.error(f"Container deployment error: {e}")
            raise Exception(f"Failed to deploy container: {str(e)}")

    def _update_project_status(self, project_id: str, status: DeploymentStatus):
        """Update project status"""
        if project_id in self.projects_storage:
            self.projects_storage[project_id].status = status
            self.projects_storage[project_id].last_deployed = datetime.now()
        
        # Also update in the main projects_db
        try:
            import main
            for project in main.projects_db:
                if project.id == project_id:
                    project.status = status
                    project.last_deployed = datetime.now()
                    break
        except Exception as e:
            logger.warning(f"Could not update project in main db: {e}")

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
            
            # Remove logs
            if project_id in self.logs_storage:
                del self.logs_storage[project_id]
            
        except Exception as e:
            logger.error(f"Error removing deployment {project_id}: {str(e)}")
        
    def get_logs(self, project_id: str) -> List[str]:
        """Get logs for project"""
        return self.logs_storage.get(project_id, [])