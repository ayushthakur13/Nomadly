import { useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * Computes which sidebar item is currently active based on route.
 * Pure compute hook—no side effects.
 */
export const useSidebarActive = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();

  const activeId = useMemo(() => {
    const path = location.pathname;
    if (path === `/trips/${tripId}`) return 'overview';
    if (path === `/trips/${tripId}/destinations`) return 'destinations';
    if (path === `/trips/${tripId}/tasks`) return 'tasks';
    if (path === `/trips/${tripId}/budget`) return 'budget';
    if (path === `/trips/${tripId}/accommodations`) return 'accommodations';
    if (path === `/trips/${tripId}/members`) return 'members';
    if (path === `/trips/${tripId}/memories`) return 'memories';
    if (path === `/trips/${tripId}/chat`) return 'chat';
    return null;
  }, [location.pathname, tripId]);

  return { activeId };
};
