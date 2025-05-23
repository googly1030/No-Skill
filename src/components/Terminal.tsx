import React, { useEffect, useRef, useState } from 'react';

interface TerminalProps {
  logs: string[];
  isLoading?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isLoading = false }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-slate-400 text-sm font-mono">
          deployment-logs
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="p-4 h-96 overflow-y-auto font-mono text-sm text-green-400"
      >
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            <span className="text-blue-400">$ </span>
            {log}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center">
            <span className="text-blue-400">$ </span>
            <span className="mr-1">Running deployment</span>
            <span className={`h-4 w-2 bg-green-400 ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;