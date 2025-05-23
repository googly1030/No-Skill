import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Github as GitHub, ArrowRight } from 'lucide-react';
import DomainCard from '../components/DomainCard';

interface Project {
  id: string;
  name: string;
  domain: string;
  status: 'deploying' | 'active' | 'error';
  lastDeployed?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  
  // Mock data for deployed projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Personal Blog',
      domain: 'blog.noskill.com',
      status: 'active',
      lastDeployed: 'May 15, 2025'
    },
    {
      id: '2',
      name: 'Portfolio Website',
      domain: 'portfolio.noskill.com',
      status: 'active',
      lastDeployed: 'June 2, 2025'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new project
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      domain: `${projectName.toLowerCase().replace(/\s+/g, '-')}.noskill.com`,
      status: 'deploying'
    };
    
    setProjects([...projects, newProject]);
    setShowNewProjectForm(false);
    
    // Navigate to deployment page to show logs
    navigate(`/deployment/${newProject.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage and deploy your GitHub projects
            </p>
          </div>
          
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="mt-4 md:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>
        
        {showNewProjectForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Deploy a New Project
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="githubUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Repository URL
                </label>
                <div className="flex">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-lg px-3">
                    <GitHub className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-600 border-l-0 rounded-r-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repository"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Deploy Project
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  className="border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <DomainCard
                key={project.id}
                domain={project.domain}
                status={project.status}
                lastDeployed={project.lastDeployed}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <GitHub className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Deploy your first GitHub project to get started
            </p>
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;