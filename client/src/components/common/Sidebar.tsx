import { useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

type NavItem = {
  label: string;
  path?: string;
  icon: ReactNode;
  badge?: string;
  disabled?: boolean;
};

const Sidebar = ({ collapsed, onToggle, className = '' }: SidebarProps) => {
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
  };

  const isActive = (path?: string) => path && location.pathname.startsWith(path);
  const displayName = user?.firstName || user?.name || user?.email || 'Nomad';

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-200 flex flex-col overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      <div className="flex h-full flex-col">
        

        {/* Content: top links + gap + bottom links */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3">
            <nav>
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
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">{item.icon}</span>
                        {!collapsed && (
                          <span className="flex-1 text-left font-medium truncate">
                            {item.label}
                          </span>
                        )}
                        {!collapsed && item.badge && (
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
          </div>

          {/* Bottom Navigation + Account */}
          <div className="px-2 py-3 space-y-1 flex-shrink-0 border-t border-gray-100">
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
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">{item.icon}</span>
                  {!collapsed && (
                    <span className="flex-1 text-left font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              title={collapsed ? 'Profile' : undefined}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: user?.profilePicUrl ? `url('${user.profilePicUrl}')` : 'none' }}
              >
                {!user?.profilePicUrl && <span className="text-gray-600 text-xs font-semibold">{displayName.charAt(0).toUpperCase()}</span>}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'Traveler'}</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const iconHome = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V12H9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const iconTrips = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M3 10h18M9 14h12M9 18h12M7 4v2m0 4v2m0 4v2" strokeLinecap="round" />
  </svg>
);

const iconCompass = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 15l1.5-4.5L15 9l-1.5 4.5L9 15z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const iconSparkle = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19l1 2M4 21h2M19 5l1 2M18 7h2" strokeLinecap="round" />
  </svg>
);

const iconBookmark = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const iconUsers = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
  </svg>
);

const iconSettings = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Sidebar;