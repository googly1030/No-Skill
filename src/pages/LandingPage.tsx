import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {  Rocket, GitBranch, Globe, Database, Shield, Zap, ArrowRight , CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const typewriter = async () => {
      if (!terminalRef.current) return;
      
      const text = [
        'https://github.com/googly1030/No-Skill.git',
        'cd project',
        'npm install',
        'npm run build',
        'Deploying to NOSKILL...',
        'Deployment complete! Your site is live at googly1030.noskill.com'
      ];
      
      for (let i = 0; i < text.length; i++) {
        const line = document.createElement('div');
        line.innerHTML = '<span class="text-blue-400">$ </span>';
        terminalRef.current.appendChild(line);
        
        for (let j = 0; j < text[i].length; j++) {
          await new Promise(resolve => setTimeout(resolve, 30));
          line.innerHTML += text[i][j];
        }
        
        if (i === text.length - 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    };
    
    typewriter();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Deploy Your GitHub Projects
                <span className="text-blue-600 dark:text-blue-400 block">
                  With Zero Technical Skills
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-lg">
                Host your projects, get a custom domain, and share your work with the world - all without writing a single line of configuration.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-center transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started for Free
                </Link>
                <a
                  href="#features"
                  className="border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-8 py-3 rounded-lg font-medium text-center transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-12">
              <div className="bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-700">
                <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4 text-slate-400 text-sm font-mono">
                    terminal
                  </div>
                </div>
                
                <div 
                  ref={terminalRef}
                  className="p-4 h-64 font-mono text-sm text-green-400 overflow-hidden"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
<section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">
              Join Our Growing Community
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Be part of the next generation of effortless deployment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { 
                count: '0', 
                label: 'Active Projects',
                description: 'Projects deployed'
              },
              { 
                count: '0', 
                label: 'Community Members',
                description: 'Developers joined'
              },
              { 
                count: '0', 
                label: 'Deployments',
                description: 'Total deployments'
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.count}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Ready to be our first success story?
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Start Building Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Deploy
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Focus on building your project, not on DevOps. We handle all the complexities of deployment for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<GitBranch />}
              title="GitHub Integration"
              description="Connect your GitHub repository with just one click and we'll take care of the rest."
            />
            <FeatureCard 
              icon={<Rocket />}
              title="One-Click Deployments"
              description="Deploy straight from your repository without any configuration or DevOps knowledge."
            />
            <FeatureCard 
              icon={<Globe />}
              title="Custom Domains"
              description="Get a free subdomain for your project or connect your own custom domain."
            />
            <FeatureCard 
              icon={<Database />}
              title="Database Support"
              description="Support for popular databases with automatic setup and configuration."
            />
            <FeatureCard 
              icon={<Shield />}
              title="SSL Certificates"
              description="Automatic SSL certificates for all your deployments to keep your sites secure."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Global CDN"
              description="Lightning-fast content delivery with our global CDN infrastructure."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get your project online in three simple steps
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-12 md:space-y-0 md:space-x-8">
            <StepCard 
              number={1}
              title="Connect GitHub"
              description="Link your GitHub account and select the repository you want to deploy."
            />
            <StepCard 
              number={2}
              title="Configure Settings"
              description="Choose your build settings or use our auto-detection for popular frameworks."
            />
            <StepCard 
              number={3}
              title="Deploy"
              description="Click deploy and we'll build, optimize, and host your project instantly."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start for free, upgrade as you grow
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-center space-y-8 lg:space-y-0 lg:space-x-8">
            <PricingCard 
              title="Free"
              price="$0"
              description="Perfect for hobbyists and small projects"
              features={[
                "3 projects",
                "Shared subdomain",
                "Community support",
                "1GB bandwidth per month",
                "GitHub integration"
              ]}
              buttonText="Get Started"
              buttonLink="/auth"
              recommended={false}
            />
            
            <PricingCard 
              title="Pro"
              price="$12"
              description="For developers who need more power"
              features={[
                "Unlimited projects",
                "Custom domains",
                "Priority support",
                "100GB bandwidth per month",
                "Advanced analytics",
                "Team collaboration"
              ]}
              buttonText="Sign Up"
              buttonLink="/auth"
              recommended={true}
            />
            
            <PricingCard 
              title="Team"
              price="$49"
              description="For teams building multiple projects"
              features={[
                "Everything in Pro",
                "Unlimited bandwidth",
                "99.9% uptime SLA",
                "24/7 premium support",
                "Team member management",
                "SSO authentication"
              ]}
              buttonText="Contact Sales"
              buttonLink="#"
              recommended={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Deploy Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust NOSKILL for their hosting needs.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-center transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-xl">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
};

const StepCard: React.FC<{
  number: number;
  title: string;
  description: string;
}> = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center max-w-xs">
      <div className="w-16 h-16 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3 text-center">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-center">{description}</p>
    </div>
  );
};

const PricingCard: React.FC<{
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  recommended: boolean;
}> = ({ title, price, description, features, buttonText, buttonLink, recommended }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl border ${
      recommended 
        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400' 
        : 'border-slate-200 dark:border-slate-700'
    } p-8 flex flex-col transition-all relative w-full max-w-sm`}>
      {recommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold py-1 px-4 rounded-full">
          Recommended
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-slate-500 dark:text-slate-400 ml-2">/month</span>
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-6">{description}</p>
      
      <ul className="mb-8 space-y-3 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link
        to={buttonLink}
        className={`${
          recommended 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        } px-6 py-3 rounded-lg font-medium text-center transition-colors`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default LandingPage;