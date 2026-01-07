import { useState, useEffect, useCallback } from 'react';
import { fetchTripInvitations, type Invitation } from '@/services/invitations.service';
import { extractApiError, type ApiError } from '@/utils/errorHandling';

/**
 * Hook to manage trip-specific pending invitations
 * Refetches when invitations exist to stay in sync with members list
 */
export function useTripInvitations(tripId?: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tripId) {
      setError('Invalid trip ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTripInvitations(tripId, { status: 'pending' });
      setInvitations(data || []);
    } catch (err) {
      setError(extractApiError(err as ApiError, 'Failed to load invitations'));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  const hasInvitations = invitations.length > 0;

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Refetch on visibility change and focus (only when invitations exist)
  useEffect(() => {
    if (!hasInvitations || !tripId) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        load();
      }
    };

    const handleFocus = () => {
      load();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [hasInvitations, tripId, load]);

  return {
    tripId,
    invitations,
    count: invitations.length,
    loading,
    error,
    refetch: load,
  };
}
