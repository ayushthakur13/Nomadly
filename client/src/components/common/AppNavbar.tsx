import nomadlyIcon from "../../assets/logos/b-icon-no-bg.svg"
import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Icon from '../icon/Icon';
import { NotificationBell } from '@/features/invitations';

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

  const path = location.pathname;
  const displayName = user?.firstName || user?.name || 'Nomad';
  const showAddTrip = !path.startsWith('/trips/new');

  // Mobile title: Nomadly or mapped page title
  const mobileTitle = (() => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/trips/new')) return 'New Trip';
    if (path.startsWith('/trips')) return 'Trips';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/explore')) return 'Explore';
    return 'Nomadly';
  })();

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="flex items-center h-16 px-4 gap-4">
        {/* Left: Mobile hamburger (md:hidden) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon name="menu" size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Left: Desktop/Tablet logo + toggle (hidden on mobile) */}
        <div className={`hidden md:flex items-center gap-3 flex-shrink-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Go to dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <img 
              src={nomadlyIcon}
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
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              placeholder="Search trips, destinations, people..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showAddTrip && (
            <button
              onClick={handleAddTrip}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              aria-label="Add trip"
            >
              <Icon name="add" size={16} />
              <span className="font-semibold text-sm hidden lg:inline">Add Trip</span>
            </button>
          )}
          <NotificationBell />
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Toggle theme"
            title="Toggle light/dark"
          >
            {theme === 'light' ? (
              <Icon name="sun" size={20} />
            ) : (
              <Icon name="moon" size={20} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
