import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { logout } from '../../store/authSlice';
import { openCreateTripModal } from '../../store/createTripModalSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleCreateTrip = () => {
    if (isAuthenticated) {
      dispatch(openCreateTripModal());
    } else {
      navigate('/auth/login');
    }
    setIsMobileMenuOpen(false);
  };
  // Check if we're on auth pages or landing page
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLoginPage = location.pathname.includes('/login');
  const isLandingPage = location.pathname === '/' && !isAuthenticated;

  // Helper function to check if a link is active
  const isActiveLink = (path) => {
    if (path === '/' && isLandingPage) return true;
    if (path === '/home' && location.pathname === '/home') return true;
    if (path === '/trips' && location.pathname.startsWith('/trips') && location.pathname !== '/trips/create') return true;
    if (path === '/trips/create' && location.pathname === '/trips/create') return true;
    if (path === '/explore' && location.pathname === '/explore') return true;
    if (path === '/aboutus' && location.pathname === '/aboutus') return true;
    if (path === '/profile' && location.pathname === '/profile') return true;
    if (path === '/settings' && location.pathname === '/settings') return true;
    return false;
  };

  // Get active link classes
  const getLinkClasses = (path, baseClasses = "hover:text-gray-900 font-medium transition-colors") => {
    const activeClasses = "text-emerald-600 border-b-2 border-emerald-600";
    return isActiveLink(path) 
      ? `${baseClasses} ${activeClasses}`
      : baseClasses;
  };

  // Handle clicks outside of profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation guard for links
  const handleProtectedClick = (path) => {
    if (isAuthenticated) {
      // Authenticated users should never go to landing page
      if (path === '/') {
        navigate('/home');
      } else {
        navigate(path);
      }
    } else {
      // Unauthenticated users can only access /, /explore, /aboutus
      if (['/', '/explore', '/aboutus', '/contact'].includes(path)) {
        navigate(path);
      } else {
        navigate('/');
      }
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const csrf = Cookies.get('csrf_token') || '';
      await api.post('/auth/logout', {}, {
        headers: { 'x-csrf-token': csrf },
      });
    } catch {
      // ignore server errors
    } finally {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
      setIsProfileDropdownOpen(false);
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-xl ">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <button
            className="flex items-center gap-0 flex-shrink-0"
            onClick={() => handleProtectedClick(isAuthenticated ? "/home" : "/")}
            style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
          >
            <img 
              src="/images/icon/Nomadly_icon_white-removebg.png" 
              alt="Nomadly" 
              className="w-12 h-12" 
            />
            <div className="text-3xl font-bold text-gray-900">Nomadly</div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-gray-700">
            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                <button 
                    className={getLinkClasses('/home')} 
                    onClick={() => handleProtectedClick('/home')}>
                  Home
                </button>
                <button
                    className={getLinkClasses('/trips')}
                    onClick={() => handleProtectedClick('/trips')}
                >
                  Trips
                </button>
                <Link 
                    to="/explore" 
                    className={getLinkClasses('/explore')}
                >
                  Explore
                </Link>
                <button
                    onClick={handleCreateTrip}
                    className="px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <i className="fas fa-plus text-sm"></i>
                  <span>Create Trip</span>
                </button>
              </>
            ) : isAuthPage ? (
              // Auth page navigation (minimal)
              <>
                <Link to="/" className={getLinkClasses('/')}>Home</Link>
                <button className={getLinkClasses('/aboutus')} onClick={() => handleProtectedClick('/aboutus')}>About</button>
                <Link to="/explore" className={getLinkClasses('/explore')}>Explore</Link>
              </>
            ) : isLandingPage ? (
              // Landing page navigation
              <>
                <button 
                  onClick={scrollToFeatures}
                  className="hover:text-gray-900 font-medium transition-colors cursor-pointer"
                >
                  Features
                </button>
                <Link to="/explore" className={getLinkClasses('/explore')}>Explore</Link>
                <Link to="/aboutus" className={getLinkClasses('/aboutus')}>About Us</Link>
                {/* <Link to="/pricing" className={getLinkClasses('/pricing')}>Pricing</Link> */}
              </>
            ) : (
              // Other unauthenticated pages navigation
              <>
                <Link to="/" className={getLinkClasses('/')}>Home</Link>
                <Link to="/aboutus" className={getLinkClasses('/aboutus')}>About Us</Link>
                <Link to="/explore" className={getLinkClasses('/explore')}>Explore</Link>
              </>
            )}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              // Authenticated user profile dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-gray-300 flex items-center justify-center hover:border-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  style={{ backgroundImage: user?.profilePic ? `url('${user.profilePic}')` : 'none' }}
                  aria-label="Profile menu"
                  aria-expanded={isProfileDropdownOpen}
                >
                  {!user?.profilePic && <i className="fas fa-user text-gray-600"></i>}
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name || user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        isActiveLink('/profile') 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-gray-700'
                      }`}
                    >
                      <i className={`fas fa-user mr-3 ${
                        isActiveLink('/profile') ? 'text-emerald-600' : 'text-gray-400'
                      }`}></i>
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        isActiveLink('/settings') 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-gray-700'
                      }`}
                    >
                      <i className={`fas fa-cog mr-3 ${
                        isActiveLink('/settings') ? 'text-emerald-600' : 'text-gray-400'
                      }`}></i>
                      Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-red-400"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : isAuthPage ? (
              // Auth page toggle
              <div className="flex items-center gap-3">
                {isLoginPage ? (
                  <>
                    <span className="text-sm text-gray-600 hidden lg:block">Don't have an account?</span>
                    <Link 
                      to="/auth/signup" 
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600 hidden lg:block">Already have an account?</span>
                    <Link 
                      to="/auth/login" 
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            ) : isLandingPage ? (
              // Landing page buttons
              <div className="flex items-center gap-3">
                <Link to="/auth/login" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">Log in</Link>
                <Link to="/auth/signup" className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm">Sign up free</Link>
              </div>
            ) : (
              // Other pages buttons
              <div className="flex items-center gap-3">
                <Link to="/auth/login" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">Log in</Link>
                <Link to="/auth/signup" className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col space-y-3">
              {/* Mobile Navigation Links */}
              {isAuthenticated ? (
                // Authenticated mobile navigation
                <>
                  <button
                    onClick={() => handleProtectedClick('/home')}
                    className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                      isActiveLink('/home') 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-gray-700'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleProtectedClick('/trips')}
                    className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg flex items-center gap-2 ${
                      isActiveLink('/trips') 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-gray-700'
                    }`}
                  >
                    Trips
                  </button>
                  <Link
                    to="/explore"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                      isActiveLink('/explore') 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-gray-700'
                    }`}
                  >
                    Explore
                  </Link>
                    <button
                      onClick={handleCreateTrip}
                      className="px-4 py-2 font-medium transition-colors rounded-lg flex items-center gap-2 mx-4 mt-2 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <i className="fas fa-plus text-sm"></i>
                    <span>Create Trip</span>
                    </button>
                  
                  {/* Mobile Profile Section */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-gray-300 flex items-center justify-center"
                        style={{ backgroundImage: user?.profilePic ? `url('${user.profilePic}')` : 'none' }}
                      >
                        {!user?.profilePic && <i className="fas fa-user text-gray-600 text-sm"></i>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg flex items-center gap-3 ${
                        isActiveLink('/profile') 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-gray-700'
                      }`}
                    >
                      <i className={`fas fa-user ${
                        isActiveLink('/profile') ? 'text-emerald-600' : 'text-gray-400'
                      }`}></i>
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg flex items-center gap-3 ${
                        isActiveLink('/settings') 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-gray-700'
                      }`}
                    >
                      <i className={`fas fa-cog ${
                        isActiveLink('/settings') ? 'text-emerald-600' : 'text-gray-400'
                      }`}></i>
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors rounded-lg flex items-center gap-3 w-full text-left"
                    >
                      <i className="fas fa-sign-out-alt text-red-400"></i>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                // Unauthenticated mobile navigation
                <>
                  {isLandingPage ? (
                    // Landing page mobile navigation
                    <>
                      <button 
                        onClick={scrollToFeatures}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg text-left"
                      >
                        Features
                      </button>
                      <Link 
                        to="/explore" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                          isActiveLink('/explore') 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-gray-700'
                        }`}
                      >
                        Explore
                      </Link>
                      <button
                        onClick={() => handleProtectedClick('/aboutus')}
                        className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                          isActiveLink('/aboutus') 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-gray-700'
                        }`}
                      >
                        About Us
                      </button>
                      {/* <Link 
                        to="/pricing" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg"
                      >
                        Pricing
                      </Link> */}
                    </>
                  ) : (
                    // Other pages mobile navigation
                    <>
                      <Link 
                        to="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                          isActiveLink('/') 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-gray-700'
                        }`}
                      >
                        Home
                      </Link>
                      <Link 
                        to="/aboutus" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                          isActiveLink('/aboutus') 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-gray-700'
                        }`}
                      >
                        About Us
                      </Link>
                      <Link 
                        to="/explore" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
                          isActiveLink('/explore') 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-gray-700'
                        }`}
                      >
                        Explore
                      </Link>
                    </>
                  )}
                </>
              )}
              
              {/* Mobile Auth Actions */}
              {!isAuthenticated && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  {isAuthPage ? (
                    // Auth page mobile toggle
                    <Link 
                      to={isLoginPage ? "/auth/signup" : "/auth/login"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-center bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors rounded-lg mx-4"
                    >
                      {isLoginPage ? "Sign up" : "Log in"}
                    </Link>
                  ) : isLandingPage ? (
                    // Landing page mobile auth buttons
                    <div className="flex flex-col gap-2 mx-4">
                      <Link 
                        to="/auth/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2 text-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors rounded-lg"
                      >
                        Log in
                      </Link>
                      <Link 
                        to="/auth/signup" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2 text-center bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors rounded-lg"
                      >
                        Sign up free
                      </Link>
                    </div>
                  ) : (
                    // Other pages mobile auth buttons
                    <div className="flex flex-col gap-2 mx-4">
                      <Link 
                        to="/auth/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2 text-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors rounded-lg"
                      >
                        Log in
                      </Link>
                      <Link 
                        to="/auth/signup" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-2 text-center bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors rounded-lg"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
