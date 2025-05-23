import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, CheckCircle, ArrowLeft, ExternalLink, Sparkles, Clock, Zap } from 'lucide-react';
import Terminal from '../components/Terminal';

const DeploymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [deploymentTime, setDeploymentTime] = useState(0);
  
  useEffect(() => {
    // Start timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setDeploymentTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    // Simulate deployment logs
    const deploymentSteps = [
      'Initializing deployment pipeline...',
      'Connecting to GitHub repository...',
      'Cloning repository...',
      'Installing dependencies with npm...',
      'Running build command...',
      'Optimizing assets and bundles...',
      'Uploading files to CDN...',
      'Configuring custom domain...',
      'Setting up SSL certificate...',
      'Deployment complete! 🎉',
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < deploymentSteps.length) {
        setLogs(prev => [...prev, deploymentSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        clearInterval(timer);
        setIsLoading(false);
        setDeploymentComplete(true);
        
        // Generate a domain based on the project ID
        const projectName = `project-${id}`;
        setDomain(`${projectName}.noskill.com`);
      }
    }, 1200);
    
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [id]);
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
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
                {deploymentComplete 
                  ? 'Your project is now live and ready to share with the world!'
                  : 'We\'re setting up your project with zero configuration required.'
                }
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              deploymentComplete 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
            }`}>
              {deploymentComplete ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deployed
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  In Progress
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        {!deploymentComplete && (
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Steps Completed</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{logs.length}/10</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round((logs.length / 10) * 100)}%</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}
        
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
            <Terminal logs={logs} isLoading={isLoading} />
          </div>
        </div>
        
        {/* Success State */}
        {deploymentComplete && (
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
                  Your application has been successfully deployed and is accessible worldwide with HTTPS enabled.
                </p>
                
                <div className="bg-white dark:bg-slate-700 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <a 
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-lg"
                    >
                      {domain}
                    </a>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(deploymentTime)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Deployment Time</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">SSL</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Security Enabled</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                >
                  <ExternalLink className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Visit Your Site
                </a>
                
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