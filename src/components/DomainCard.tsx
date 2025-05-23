import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface DomainCardProps {
  domain: string;
  status: 'deploying' | 'active' | 'error';
  lastDeployed?: string;
}

const DomainCard: React.FC<DomainCardProps> = ({ 
  domain, 
  status, 
  lastDeployed 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${domain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'deploying':
        return 'bg-yellow-500';
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'deploying':
        return 'Deploying';
      case 'active':
        return 'Active';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {getStatusText()}
          </span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          aria-label="Copy domain"
        >
          {copied ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate">
        {domain}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
        https://{domain}
      </p>
      
      {lastDeployed && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Last deployed: {lastDeployed}
        </p>
      )}
      
      <div className="mt-6 flex space-x-2">
        <a 
          href={`https://${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 text-center transition-colors"
        >
          Visit Site
        </a>
        <a 
          href="#"
          className="border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex-1 text-center transition-colors"
        >
          Manage
        </a>
      </div>
    </div>
  );
};

export default DomainCard;