import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import Icon from '../icon/Icon';

interface TripSidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

const TripSidebar = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const items: TripSidebarItem[] = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: 'layout', href: `/trips/${tripId}` },
      { id: 'destinations', label: 'Route', icon: 'map', href: `/trips/${tripId}/destinations` },
      { id: 'tasks', label: 'Tasks', icon: 'checkSquare', href: `/trips/${tripId}/tasks` },
      { id: 'budget', label: 'Budget', icon: 'dollarSign', href: `/trips/${tripId}/budget` },
      { id: 'accommodations', label: 'Stay', icon: 'home', href: `/trips/${tripId}/accommodations` },
      { id: 'members', label: 'Members', icon: 'users', href: `/trips/${tripId}/members` },
      { id: 'memories', label: 'Memories', icon: 'image', href: `/trips/${tripId}/memories` },
      { id: 'chat', label: 'Chat', icon: 'messageCircle', href: `/trips/${tripId}/chat` },
    ],
    [tripId]
  );

  const isActive = (item: TripSidebarItem) => {
    if (item.id === 'overview') {
      return location.pathname === `/trips/${tripId}`;
    }
    return location.pathname === item.href;
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 h-full flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* INTERNAL SCROLL CONTAINER */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                name={item.icon as any}
                size={18}
                className={active ? 'text-emerald-600' : 'text-gray-400'}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};


export default TripSidebar;
