import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github as GitHub } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would authenticate the user here
    navigate('/dashboard');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <GitHub className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">
            {isLogin ? 'Log in to your account' : 'Create your account'}
          </h2>

          <div className="flex justify-center mb-6">
            <button className="flex items-center justify-center w-full bg-slate-800 dark:bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
              <GitHub className="h-5 w-5 mr-2" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-sm">or</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleAuthMode}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;