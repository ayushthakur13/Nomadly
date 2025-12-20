import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLoginPage = location.pathname.includes('/login');
  const isLandingPage = location.pathname === '/';

  const isActiveLink = useCallback((path: string) => {
    if (path === '/' && isLandingPage) return true;
    if (path === '/explore' && location.pathname.startsWith('/explore')) return true;
    if (path === '/pricing' && location.pathname.startsWith('/pricing')) return true;
    return false;
  }, [location.pathname, isLandingPage]);

  const getLinkClasses = useCallback((path: string) => {
    const base = "hover:text-gray-900 font-medium transition-colors";
    const active = "text-emerald-600 border-b-2 border-emerald-600";
    return isActiveLink(path) ? `${base} ${active}` : base;
  }, [isActiveLink]);

  // Scroll detection for shadow effect
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const scrollToFeatures = useCallback(() => {
    const section = document.getElementById('features');
    section?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // ============ RENDER HELPERS ============

  const renderLogo = () => (
    <button
      className="flex items-center gap-0 flex-shrink-0"
      onClick={handleLogoClick}
      style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
      aria-label="Nomadly home"
    >
      <img src="/images/icon/Nomadly_icon_white-removebg.png" alt="" className="w-12 h-12" />
      <div className="text-3xl font-bold text-gray-900">Nomadly</div>
    </button>
  );

  const renderDesktopAuthLinks = () => {
    if (isAuthPage) {
      return null;
    }

    if (isLandingPage) {
      return (
        <>
          <button
            onClick={scrollToFeatures}
            className="hover:text-gray-900 font-medium transition-colors"
          >
            Features
          </button>
          <Link to="/explore" className={getLinkClasses('/explore')}>Explore trips</Link>
          <Link to="/pricing" className={getLinkClasses('/pricing')}>Pricing</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/#features" className={getLinkClasses('/')}>Features</Link>
        <Link to="/explore" className={getLinkClasses('/explore')}>Explore trips</Link>
        <Link to="/pricing" className={getLinkClasses('/pricing')}>Pricing</Link>
      </>
    );
  };

  const renderDesktopAuthActions = () => {
    if (isAuthPage) {
      return (
        <div className="flex items-center gap-2">
          {isLoginPage ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:inline">New to Nomadly?</span>
              <Link
                to="/auth/signup"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm"
              >
                Create account
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-500 hidden sm:inline">Have an account?</span>
              <Link
                to="/auth/login"
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          to="/auth/login"
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Log in
        </Link>
        <Link
          to="/auth/signup"
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm"
        >
          Get started
        </Link>
      </div>
    );
  };



  const renderMobileAuthLinks = () => {
    if (isLandingPage) {
      return (
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
              isActiveLink('/explore') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
            }`}
          >
            Explore trips
          </Link>
          <Link
            to="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
              isActiveLink('/pricing') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
            }`}
          >
            Pricing
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          to="/#features"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
            isActiveLink('/') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
          }`}
        >
          Features
        </Link>
        <Link
          to="/explore"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
            isActiveLink('/explore') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
          }`}
        >
          Explore trips
        </Link>
        <Link
          to="/pricing"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`px-4 py-2 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors rounded-lg ${
            isActiveLink('/pricing') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
          }`}
        >
          Pricing
        </Link>
      </>
    );
  };

  const renderMobileAuthActions = () => {
    if (isAuthPage) {
      return (
        <Link
          to={isLoginPage ? "/auth/signup" : "/auth/login"}
          onClick={() => setIsMobileMenuOpen(false)}
          className="block px-4 py-2 text-center bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors rounded-lg mx-4"
        >
          {isLoginPage ? "Create account" : "Log in"}
        </Link>
      );
    }

    return (
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
          Get started
        </Link>
      </div>
    );
  };



  // ============ MAIN RENDER ============

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-gray-50 ${isScrolled ? 'shadow-sm border-b border-gray-200' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {renderLogo()}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-gray-700">
            {renderDesktopAuthLinks()}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {renderDesktopAuthActions()}
          </div>

          {/* Mobile Menu Button */}
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
          <div className="md:hidden py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-2">
              {renderMobileAuthLinks()}
              <div className="pt-3 mt-3 border-t border-gray-200">
                {renderMobileAuthActions()}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;