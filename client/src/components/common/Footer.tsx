import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Footer = () => {
  const { isAuthenticated } = useSelector((s: any) => s.auth);
  const navigate = useNavigate();

  const handleProtectedClick = (path: string) => {
    if (isAuthenticated) navigate(path);
    else navigate('/auth/login');
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 lg:gap-16">
          {/* About section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <img 
                  src="/images/icon/Nomadly_icon-removebg.png" 
                  alt="Nomadly Logo" 
                  className="w-6 h-6"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Nomadly</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              The modern way to plan, collaborate, and explore. Join thousands of travelers making unforgettable memories with Nomadly.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-sm font-medium">Always Free Core Features</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to={isAuthenticated ? "/home" : "/"} 
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>{isAuthenticated ? "Dashboard" : "Home"}</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedClick('/trips')}
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 text-left group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>My Trips</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedClick('/trips/create')}
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 text-left group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create Trip</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
              <li>
                <Link 
                  to="/aboutus" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>About Us</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Contact Us</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Connect
            </h4>
            <div className="space-y-4">
              <div className="space-y-3">
                <a 
                  href="mailto:ayushpratap.singh.23cse@bmu.edu.in"
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-200">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span>Get in Touch</span>
                </a>
                <a 
                  href="https://github.com/ayushthakur13/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-200">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>GitHub</span>
                </a>
              </div>
              
              <div className="pt-4">
                <p className="text-gray-500 text-sm mb-3">Follow us</p>
                <div className="flex gap-3">
                  <a 
                    href="https://www.linkedin.com/in/ayush-pratap-singh-8b8958284/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/ayushhpratapsingh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C7.284 0 6.944.012 5.877.06 2.246.227.227 2.242.06 5.877.012 6.944 0 7.284 0 10s.012 3.056.06 4.123c.167 3.632 2.182 5.65 5.817 5.817C6.944 19.988 7.284 20 10 20s3.056-.012 4.123-.06c3.629-.167 5.652-2.182 5.817-5.817C19.988 13.056 20 12.716 20 10s-.012-3.056-.06-4.123C19.773 2.245 17.755.227 14.123.06 13.056.012 12.716 0 10 0zm0 1.802c2.67 0 2.986.01 4.04.058 2.71.123 4.197 1.595 4.32 4.32.048 1.054.058 1.37.058 4.04 0 2.67-.01 2.986-.058 4.04-.123 2.71-1.595 4.197-4.32 4.32-1.054.048-1.37.058-4.04.058-2.67 0-2.986-.01-4.04-.058-2.717-.123-4.194-1.602-4.32-4.32C1.812 12.986 1.802 12.67 1.802 10c0-2.67.01-2.986.058-4.04.123-2.717 1.6-4.194 4.32-4.32C7.014 1.812 7.33 1.802 10 1.802zm0 3.065a5.133 5.133 0 100 10.266A5.133 5.133 0 0010 4.867zm0 8.464a3.331 3.331 0 110-6.662 3.331 3.331 0 010 6.662zm5.338-9.87a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-sm">&copy; 2025 Nomadly. All rights reserved.</p>
              <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                <span>Built with</span>
                <span className="text-red-400">❤️</span>
                <span>for travelers</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-emerald-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-emerald-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-emerald-400 font-medium animate-pulse">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
