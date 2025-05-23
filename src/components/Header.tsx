import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isAuthPage = location.pathname === '/auth';
  const isDashboard = location.pathname.includes('/dashboard') || 
                     location.pathname.includes('/deployment');

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || isAuthPage || isDashboard
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 shadow-md'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2" 
          onClick={closeMenu}
        >
          <Github className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            NO<span className="text-blue-600 dark:text-blue-400">SKILL</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {!isDashboard && (
            <>
              <Link 
                to="/" 
                className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              <a 
                href="#features" 
                className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </a>
            </>
          )}
          
          {!isAuthPage && !isDashboard ? (
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          ) : !isDashboard ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
            >
              Logout
            </Link>
          )}
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-slate-700" />
            ) : (
              <Sun className="h-5 w-5 text-slate-200" />
            )}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-700" />
            ) : (
              <Sun className="h-5 w-5 text-slate-200" />
            )}
          </button>
          
          <button 
            onClick={toggleMenu} 
            className="text-slate-900 dark:text-white"
            aria-label="Menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 shadow-lg absolute top-full left-0 right-0 p-4 border-t dark:border-slate-700">
          <nav className="flex flex-col space-y-4">
            {!isDashboard && (
              <>
                <Link 
                  to="/" 
                  className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors py-2"
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <a 
                  href="#features" 
                  className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors py-2"
                  onClick={closeMenu}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors py-2"
                  onClick={closeMenu}
                >
                  Pricing
                </a>
              </>
            )}
            
            {!isAuthPage && !isDashboard ? (
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-center"
                onClick={closeMenu}
              >
                Get Started
              </Link>
            ) : !isDashboard ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-center"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/"
                className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors py-2"
                onClick={closeMenu}
              >
                Logout
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;