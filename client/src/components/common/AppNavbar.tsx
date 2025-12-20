import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface AppNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenMobileSidebar?: () => void;
}

const AppNavbar = ({ onToggleSidebar, isSidebarCollapsed, onOpenMobileSidebar }: AppNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: any) => state.auth);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleAddTrip = useCallback(() => {
    navigate('/trips/new');
  }, [navigate]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const displayName = user?.firstName || user?.name || 'Nomad';

  // Mobile title: Nomadly or mapped page title
  const path = location.pathname;
  const mobileTitle = (() => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/trips/new')) return 'New Trip';
    if (path.startsWith('/trips')) return 'Trips';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/explore')) return 'Explore';
    return 'Nomadly';
  })();

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center h-16 px-4 gap-4">
        {/* Left: Mobile hamburger (md:hidden) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Left: Desktop/Tablet logo + toggle (hidden on mobile) */}
        <div className={`hidden md:flex items-center gap-3 flex-shrink-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <img 
              src="/images/icon/Nomadly_icon_white-removebg.png" 
              alt="Nomadly" 
              className="w-10 h-10" 
            />
          </button>
          {!isSidebarCollapsed && (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-2xl font-bold text-gray-900 flex-1 text-left"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-label="Go to dashboard"
            >
              Nomadly
            </button>
          )}
        </div>

        {/* Center: Mobile title (md:hidden) */}
        <div className="flex-1 min-w-0 md:hidden">
          <p className="text-base font-semibold text-gray-900 truncate text-center">{mobileTitle}</p>
        </div>

        {/* Center: Global Search (hidden on mobile, shorter on tablet) */}
        <div className="flex-1 min-w-0 hidden md:block">
          <div className="relative md:max-w-sm lg:max-w-2xl mx-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search trips, destinations, people..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAddTrip}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            aria-label="Add trip"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-sm hidden lg:inline">Add Trip</span>
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Toggle theme"
            title="Toggle light/dark"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
