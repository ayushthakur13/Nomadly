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
      { label: 'Dashboard', path: '/dashboard', icon: 'home' },
      { label: 'Trips', path: '/trips', icon: 'plane' },
      { label: 'Explore', path: '/explore', icon: 'compass' },
      { label: 'AI Planner', icon: 'sparkles', badge: 'Coming soon', disabled: true },
      { label: 'Saved Trips', icon: 'bookmark', badge: 'Soon', disabled: true },
      { label: 'Community', icon: 'users', badge: 'Soon', disabled: true },
    ],
    []
  );

  const bottomNavItems: NavItem[] = useMemo(
    () => [
      { label: 'Settings', icon: 'settings', disabled: true },
    ],
    []
  );

  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  const displayName = user?.name || user?.email || 'Nomad';

  return {
    topNavItems,
    bottomNavItems,
    isActive,
    displayName,
    user,
  };
};
