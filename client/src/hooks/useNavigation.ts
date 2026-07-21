import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export type NavItem = {
  label: string;
  path?: string;
  icon: string; // Icon name to render via <Icon />
  badge?: string;
  disabled?: boolean;
};

export const useNavigation = () => {
  const location = useLocation();
  const { user } = useSelector((state: any) => state.auth);

  const topNavItems: NavItem[] = useMemo(
    () => [
      { label: 'My Trips', path: '/trips', icon: 'home' },
      { label: 'Explore', path: '/explore', icon: 'compass' },
      { label: 'AI Planner', icon: 'sparkles', disabled: true },
      { label: 'Community', icon: 'users', disabled: true },
    ],
    []
  );

  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  const displayName = user?.name || user?.email || 'Nomad';

  return {
    topNavItems,
    isActive,
    displayName,
    user,
  };
};
