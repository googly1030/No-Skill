import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Github as GitHub, ArrowRight, Sparkles, Users, Zap } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Starting deployment with:', { projectName, githubUrl });
    
    try {
      console.log('📡 Making API request to: http://localhost:8000/api/deployments');
      
      const response = await fetch('http://localhost:8000/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          github_url: githubUrl,
        }),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📥 Response body:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      const newProject = JSON.parse(responseText);
      console.log('✅ Deployment created:', newProject);
      
      setProjects([...projects, newProject]);
      setShowNewProjectForm(false);
      setProjectName('');
      setGithubUrl('');
      
      // Navigate to deployment page to show logs
      navigate(`/deployment/${newProject.id}`);
    } catch (error) {
      console.error('❌ Deployment error details:', error);
      
      // More specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Cannot connect to backend server. Make sure the backend is running on http://localhost:8000');
      } else if (error instanceof Error) {
        alert(`Deployment failed: ${error.message}`);
      } else {
        alert('Failed to start deployment. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                Welcome back! 👋
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Manage and deploy your GitHub projects with zero configuration
              </p>
            </div>
            
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              New Project
              <Sparkles className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Projects</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <GitHub className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Deployments</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Team Members</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">1</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* New Project Form */}
        {showNewProjectForm && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Deploy a New Project
              </h2>
              <p className="text-blue-100">
                Connect your GitHub repository and deploy in seconds
              </p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                      placeholder="My Awesome Project"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      This will be used for your domain: {projectName ? `${projectName.toLowerCase().replace(/\s+/g, '-')}.noskill.com` : 'project-name.noskill.com'}
                    </p>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="githubUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      GitHub Repository URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <GitHub className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="githubUrl"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                        placeholder="https://github.com/username/repository"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                  >
                    Deploy Project
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewProjectForm(false);
                      setProjectName('');
                      setGithubUrl('');
                    }}
                    className="border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Projects Section */}
        {projects.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Your Projects
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map(project => (
                <DomainCard
                  key={project.id}
                  domain={project.domain}
                  status={project.status}
                  lastDeployed={project.lastDeployed}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <GitHub className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Ready to deploy your first project?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Connect your GitHub repository and watch your project come to life with zero configuration required.
            </p>
            
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Create Your First Project
              <Sparkles className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;