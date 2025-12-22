import { useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Icon from '../icon/Icon';

interface MobileSidebarProps {
  onClose: () => void;
}

type NavItem = {
  label: string;
  path?: string;
  icon: ReactNode;
  badge?: string;
  disabled?: boolean;
};

const MobileSidebar = ({ onClose }: MobileSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const topNavItems: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', path: '/dashboard', icon: iconHome() },
      { label: 'Trips', path: '/trips', icon: iconTrips() },
      { label: 'Explore', path: '/explore', icon: iconCompass() },
      { label: 'AI Planner', icon: iconSparkle(), badge: 'Coming soon', disabled: true },
      { label: 'Saved Trips', icon: iconBookmark(), badge: 'Soon', disabled: true },
      { label: 'Community', icon: iconUsers(), badge: 'Soon', disabled: true },
    ],
    []
  );

  const bottomNavItems: NavItem[] = useMemo(
    () => [
      { label: 'Settings', icon: iconSettings(), disabled: true },
    ],
    []
  );

  const handleNav = (item: NavItem) => {
    if (item.disabled || !item.path) return;
    navigate(item.path);
    onClose();
  };

  const isActive = (path?: string) => path && location.pathname.startsWith(path);
  const displayName = user?.firstName || user?.name || user?.email || 'Nomad';

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Top: Logo */}
        <div className="px-3 py-3 flex items-center gap-2 flex-shrink-0">
          <img
            src="/images/icon/Nomadly_icon_white-removebg.png"
            alt="Nomadly"
            className="w-10 h-10"
          />
          <span className="text-lg font-semibold text-gray-900">Nomadly</span>
        </div>

        {/* Top Navigation - grows to fill available space */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-1">
            {topNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleNav(item)}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    } ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">{item.icon}</span>
                    <span className="flex-1 text-left font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation + Account */}
        <div className="mt-auto px-2 py-3 space-y-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">{item.icon}</span>
                <span className="flex-1 text-left font-medium truncate">{item.label}</span>
              </button>
            );
          })}
          
          {/* Profile Button */}
          <button
            onClick={() => {
              navigate('/profile');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 bg-cover bg-center flex items-center justify-center"
              style={{ backgroundImage: user?.profilePicUrl ? `url('${user.profilePicUrl}')` : 'none' }}
            >
              {!user?.profilePicUrl && (
                <span className="text-gray-600 text-xs font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'Traveler'}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const iconHome = () => (
  <Icon name="home" size={20} />
);

const iconTrips = () => (
  <Icon name="compass" size={20} />
);

const iconCompass = () => (
  <Icon name="compass" size={20} />
);

const iconSparkle = () => (
  <Icon name="sparkles" size={20} />
);

const iconBookmark = () => (
  <Icon name="bookmark" size={20} />
);

const iconUsers = () => (
  <Icon name="users" size={20} />
);

const iconUser = () => (
  <Icon name="user" size={20} />
);

const iconSettings = () => (
  <Icon name="settings" size={20} />
);

const iconHelp = () => (
  <Icon name="help" size={20} />
);

export default MobileSidebar;
