import React from 'react';
import { Github, Linkedin, Mail, Code, Heart, Coffee } from 'lucide-react';
import Header from "../components/Header";
import { Bookmark, TrendingUp, Bell } from 'lucide-react';

const About = () => {
  // Project and contact information
  const projectInfo = {
    version: "1.0.0",
    developer: "Francesco Zanini",
    year: "2024-2025",
    github: "https://github.com/zaninifrancesco",
    linkedin: "https://www.linkedin.com/in/francesco-zanini-54514a249/",
    email: "zaninifrancesco.bsns@gmail.com"
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-16 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Market Analytics Dashboard</h1>
                <p className="text-blue-100 text-lg">
                  A comprehensive platform for financial market analysis
                </p>
              </div>
              
              {/* Main content */}
              <div className="p-8">
                <div className="mb-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Portfolio Project</h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    This dashboard showcases a sophisticated web application built with modern full-stack development technologies,
                    focusing on financial data analysis and visualization for both stocks and cryptocurrencies.
                  </p>
                  
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                      <Code size={14} className="mr-1" />
                      Version {projectInfo.version}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      &copy; {projectInfo.year}
                    </span>
                  </div>
                </div>
                
                {/* Technologies */}
                <div className="mb-12">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Technologies Used</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-5">
                      <h3 className="font-medium text-gray-800 mb-2">Frontend</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          React.js for UI components
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Tailwind CSS for styling
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Chart.js for interactive charts
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          React Router for navigation
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-5">
                      <h3 className="font-medium text-gray-800 mb-2">Backend</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Python Flask for REST API
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          AlphaVantage API for stock data
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          CoinGecko API for crypto data
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          NewsAPI for financial news
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                

                <div className="mb-10 text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-5">Connect with the Developer</h2>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <a 
                      href={projectInfo.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-5 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Github className="mr-2" />
                      <span>Contribute on GitHub</span>
                    </a>
                    
                    <a 
                      href={projectInfo.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="mr-2" />
                      <span>Connect on LinkedIn</span>
                    </a>
                    
                    <a 
                      href={`mailto:${projectInfo.email}`}
                      className="flex items-center px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Mail className="mr-2" />
                      <span>Contact via Email</span>
                    </a>
                  </div>
                </div>
                

                <div className="text-center border-t border-gray-100 pt-8">
                  <p className="text-gray-600 mb-6">
                    Feel free to open a pull request on GitHub or reach out to me for any questions or feedback.
                  </p>
                  
                  <div className="flex items-center justify-center text-gray-400 text-sm">
                    <span className="flex items-center mr-4">
                      <Heart size={14} className="mr-1 text-red-400" />
                      Built with passion
                    </span>
                    <span className="flex items-center">
                      <Coffee size={14} className="mr-1 text-amber-600" />
                      and plenty of coffee
                    </span>
                  </div>
                </div>
              </div>
            </div>
            

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-50 p-3 rounded-full inline-block mb-4">
                  <TrendingUp className="text-blue-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Market Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Access real-time and historical data for stocks and cryptocurrencies with interactive charts.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-green-50 p-3 rounded-full inline-block mb-4">
                  <Bookmark className="text-green-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Custom Watchlists</h3>
                <p className="text-gray-600 text-sm">
                  Create and manage personalized watchlists to monitor your favorite assets.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-amber-50 p-3 rounded-full inline-block mb-4">
                  <Bell className="text-amber-500 h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Price Alerts</h3>
                <p className="text-gray-600 text-sm">
                  Set up custom notifications based on price conditions that matter to you.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;