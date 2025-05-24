import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, CheckCircle, ArrowLeft, ExternalLink, Sparkles, Clock, Zap } from 'lucide-react';
import Terminal from '../components/Terminal';

interface ProjectData {
  id: string;
  name: string;
  github_url: string;
  domain: string;
  status: 'deploying' | 'active' | 'error' | 'stopped';
  created_at: string;
  last_deployed?: string;
  container_id?: string;
  port?: string;
}

const DeploymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [deploymentTime, setDeploymentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const startTime = Date.now();
    
    // Timer for deployment time
    const timer = setInterval(() => {
      setDeploymentTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // Fetch project data and logs
    const fetchData = async () => {
      try {
        // Fetch project info
        const projectResponse = await fetch(`http://localhost:8000/api/projects/${id}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData);
          
          // Check if deployment is complete
          if (projectData.status === 'active') {
            setDeploymentComplete(true);
            setIsLoading(false);
          } else if (projectData.status === 'error') {
            setError('Deployment failed');
            setIsLoading(false);
          }
        }
        
        // Fetch logs
        const logsResponse = await fetch(`http://localhost:8000/api/projects/${id}/logs`);
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setLogs(logsData.logs || []);
        }
      } catch (err) {
        console.error('Error fetching deployment data:', err);
        setError('Failed to fetch deployment status');
      }
    };
    
    // Fetch immediately
    fetchData();
    
    // Poll every 2 seconds for updates
    const pollInterval = setInterval(fetchData, 2000);
    
    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [id]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4">Deployment Error</h2>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={handleGoToDashboard}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoToDashboard}
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {deploymentComplete ? 'Deployment Complete' : 'Deploying Your Project'}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {project?.name || 'Loading project...'} • {project?.domain || 'Generating domain...'}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              deploymentComplete 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                : project?.status === 'error'
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
            }`}>
              {deploymentComplete ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deployed
                </>
              ) : project?.status === 'error' ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Error
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  {project?.status || 'Deploying'}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Deployment Time</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(deploymentTime)}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Build Steps</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{logs.length}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {project?.status === 'active' ? 'Live' : 
                   project?.status === 'error' ? 'Failed' : 'Building'}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Terminal Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-slate-300 font-medium ml-4">Deployment Terminal</span>
              </div>
              <div className="text-xs text-slate-400">
                Project ID: {id}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <Terminal logs={logs} isLoading={isLoading && !deploymentComplete} />
          </div>
        </div>
        
        {/* Success State */}
        {deploymentComplete && project && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  Deployment Successful!
                </h2>
              </div>
            </div>
            
            <div className="p-8 text-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Your project is now live!
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Your application has been successfully deployed and is accessible worldwide.
                </p>
                
                <div className="bg-white dark:bg-slate-700 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {project.port ? (
                      <a 
                        href={`http://localhost:${project.port}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-lg"
                      >
                        localhost:{project.port}
                      </a>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                        {project.domain}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(deploymentTime)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Deployment Time</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">HTTPS</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Security Enabled</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {project.port && (
                  <a 
                    href={`http://localhost:${project.port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                  >
                    <ExternalLink className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                    Visit Your Site
                  </a>
                )}
                
                <button
                  onClick={handleGoToDashboard}
                  className="border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentPage;