from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import asyncio
import logging
from typing import List, Optional
from datetime import datetime

from models.project import Project, DeploymentStatus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="No-Skill Deployment API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize deployment service
try:
    from services.deployment_service import DeploymentService
    deployment_service = DeploymentService()
    logger.info("✅ Deployment service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize deployment service: {e}")
    deployment_service = None

# In-memory storage (use database in production)
projects_db: List[Project] = []

class ProjectCreateRequest(BaseModel):
    name: str
    github_url: HttpUrl

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "No-Skill Deployment API is running!",
        "docker_available": deployment_service is not None,
        "docker_version": "28.0.4" if deployment_service else "Not available"
    }

@app.post("/api/deployments", response_model=Project)
async def create_deployment(
    request: ProjectCreateRequest,
    background_tasks: BackgroundTasks
):
    """Create a new deployment from GitHub repository"""
    if not deployment_service:
        raise HTTPException(status_code=500, detail="Docker service not available")
    
    project_id = f"proj_{int(datetime.now().timestamp())}"
    domain = f"{request.name.lower().replace(' ', '-').replace('_', '-')}.noskill.com"
    
    project = Project(
        id=project_id,
        name=request.name,
        github_url=str(request.github_url),
        domain=domain,
        status=DeploymentStatus.DEPLOYING,
        created_at=datetime.now()
    )
    
    projects_db.append(project)
    deployment_service.projects_storage[project_id] = project
    
    # Start deployment in background
    background_tasks.add_task(
        deployment_service.deploy_project,
        project
    )
    
    logger.info(f"🚀 Started deployment for: {project.name} ({project_id})")
    return project

@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    """Get all projects"""
    return projects_db

@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get specific project"""
    project = next((p for p in projects_db if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.get("/api/projects/{project_id}/logs")
async def get_deployment_logs(project_id: str):
    """Get deployment logs for a project"""
    if not deployment_service:
        raise HTTPException(status_code=500, detail="Docker service not available")
    
    logs = deployment_service.get_logs(project_id)
    return {"logs": logs}

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project and its deployment"""
    global projects_db
    project = next((p for p in projects_db if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if deployment_service:
        # Remove from deployment
        await deployment_service.remove_deployment(project_id)
    
    # Remove from database
    projects_db = [p for p in projects_db if p.id != project_id]
    
    return {"message": "Project deleted successfully"}

@app.get("/api/deployments/status")
async def get_deployment_status():
    """Get status of all deployments with Docker info"""
    if not deployment_service:
        return {"error": "Docker service not available"}
    
    try:
        # Get Docker containers
        containers = deployment_service.docker_client.containers.list(all=True)
        noskill_containers = []
        
        for container in containers:
            if container.name.startswith('noskill-'):
                port_info = container.attrs.get('NetworkSettings', {}).get('Ports', {})
                assigned_ports = []
                
                for port_key, port_data in port_info.items():
                    if port_data:
                        for port_mapping in port_data:
                            assigned_ports.append(f"{port_mapping['HostPort']}:{port_key}")
                
                noskill_containers.append({
                    "name": container.name,
                    "status": container.status,
                    "ports": assigned_ports,
                    "image": container.image.tags[0] if container.image.tags else "unknown",
                    "created": container.attrs.get('Created', 'unknown')
                })
        
        return {
            "containers": noskill_containers,
            "total_projects": len(projects_db),
            "active_projects": len([p for p in projects_db if p.status == 'active']),
            "docker_images": len(deployment_service.docker_client.images.list())
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)