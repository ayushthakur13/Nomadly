import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation, type NavItem } from '@/hooks/useNavigation';
import { useLogout } from '@/features/auth';
import Icon from '../icon/Icon';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const Sidebar = ({ collapsed, onToggle, className = '' }: SidebarProps) => {
  const navigate = useNavigate();
  const { topNavItems, isActive, displayName, user } = useNavigation();
  const { performLogout } = useLogout();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (item: NavItem) => {
    if (item.disabled || !item.path) return;
    navigate(item.path);
  };

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 bg-gray-50 border-r border-gray-200 shadow-sm transition-all duration-200 flex flex-col z-30 ${collapsed ? "w-16" : "w-64"
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
                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm ${collapsed ? "gap-0" : "gap-3"
                          } ${active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "text-gray-700 hover:bg-gray-100"
                          } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">
                          <Icon name={item.icon} size={20} />
                        </span>
                        <span className={`flex-1 text-left font-medium truncate transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden pointer-events-none" : "opacity-100 w-auto"
                          }`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 transition-all duration-200 ${collapsed ? "opacity-0 scale-0 w-0 overflow-hidden p-0 border-0 pointer-events-none" : "opacity-100 scale-100 w-auto"
                            }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Collapse/Expand Button - always visible after top links */}
            <div className={`pt-3 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation + Account */}
        <div className="px-2 py-3 space-y-1 flex-shrink-0 border-t border-gray-100">
          <div ref={profileRef} className="relative w-full">
            {/* Profile Button */}
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 ${collapsed ? "gap-0" : "gap-3"
                }`}
              title={collapsed ? "Profile" : undefined}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center flex items-center justify-center"
                style={{
                  backgroundImage: user?.profilePicUrl
                    ? `url('${user.profilePicUrl}')`
                    : "none",
                }}
              >
                {!user?.profilePicUrl && (
                  <span className="text-gray-600 text-xs font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className={`min-w-0 flex-1 text-left transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden pointer-events-none" : "opacity-100 w-auto"
                }`}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "Traveler"}
                </p>
              </div>
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div
                className={`absolute z-[9999] bg-white border border-gray-200/80 rounded-2xl p-1.5 shadow-xl shadow-gray-200/50 min-w-[200px] transition-all duration-150 ${
                  collapsed 
                    ? "left-16 bottom-2" 
                    : "left-2 right-2 bottom-14"
                }`}
              >
                {/* User Info Header */}
                <div className="px-3 py-1.5 text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                    {user?.name || displayName || "Account"}
                  </p>
                </div>
                <div className="border-b border-gray-100 my-1" />
                
                {/* View Profile Link */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon name="user" size={16} className="text-gray-500" />
                  <span>View Profile</span>
                </button>
                
                {/* Settings Link */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon name="settings" size={16} className="text-gray-500" />
                  <span>Settings</span>
                </button>
                
                <div className="border-b border-gray-100 my-1" />
                
                {/* Log Out */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    performLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/50 transition-colors text-left"
                >
                  <Icon name="logout" size={16} className="text-red-500" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
