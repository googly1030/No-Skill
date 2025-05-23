import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, CheckCircle } from 'lucide-react';
import Terminal from '../components/Terminal';

const DeploymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  
  useEffect(() => {
    // Simulate deployment logs
    const deploymentSteps = [
      'Cloning repository...',
      'Installing dependencies...',
      'Running build command...',
      'Optimizing assets...',
      'Uploading files...',
      'Configuring DNS...',
      'Setting up SSL certificate...',
      'Deployment complete!',
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < deploymentSteps.length) {
        setLogs(prev => [...prev, deploymentSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsLoading(false);
        setDeploymentComplete(true);
        
        // Generate a domain based on the project ID
        const projectName = `project-${id}`;
        setDomain(`${projectName}.noskill.com`);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [id]);
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Deployment in Progress
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          We're setting up your project. This may take a few minutes.
        </p>
        
        <div className="mb-8">
          <Terminal logs={logs} isLoading={isLoading} />
        </div>
        
        {deploymentComplete && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Deployment Completed Successfully!
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Your project is now live at:
            </p>
            
            <div className="flex items-center justify-center mb-8">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <a 
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                {domain}
              </a>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Visit Your Site
              </a>
              
              <button
                onClick={handleGoToDashboard}
                className="border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentPage;