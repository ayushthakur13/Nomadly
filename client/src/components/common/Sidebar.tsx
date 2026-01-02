import { useNavigate } from 'react-router-dom';
import { useNavigation, type NavItem } from '@/hooks/useNavigation';
import Icon from '../icon/Icon';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const Sidebar = ({ collapsed, onToggle, className = '' }: SidebarProps) => {
  const navigate = useNavigate();
  const { topNavItems, bottomNavItems, isActive, displayName, user } = useNavigation();

  const handleNav = (item: NavItem) => {
    if (item.disabled || !item.path) return;
    navigate(item.path);
  };

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 bg-gray-50 border-r border-gray-200 shadow-sm transition-all duration-200 flex flex-col overflow-hidden ${
        collapsed ? "w-16" : "w-64"
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
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "text-gray-700 hover:bg-gray-100"
                        } ${
                          item.disabled ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">
                          <Icon name={item.icon} size={20} />
                        </span>
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
            {bottomNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600">
                    <Icon name={item.icon} size={20} />
                  </span>
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
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "Traveler"}
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
  );
};

export default Sidebar;
