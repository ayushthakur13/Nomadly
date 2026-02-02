import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchTripMembers,
  addTripMember,
  removeTripMember,
  leaveTripAsMe,
  type TripMember,
  type AddMemberPayload,
} from '@/services/members.service';
import { extractApiError, type ApiError } from '@/utils/errorHandling';

const POLL_INTERVAL = 45000; // 45 seconds (calm polling when pending invites exist)

/**
 * Hook to manage trip members with eventual consistency
 * Refetches on: visibility change, focus, and conditional polling when pending invites exist
 */
export function useTripMembers(tripId?: string, options?: { pendingInvitesCount?: number }) {
  const [members, setMembers] = useState<TripMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPendingInvites = (options?.pendingInvitesCount ?? 0) > 0;

  const load = useCallback(async () => {
    if (!tripId) {
      setError('Invalid trip ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTripMembers(tripId);
      setMembers(data || []);
    } catch (err) {
      setError(extractApiError(err as ApiError, 'Failed to load members'));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Conditional polling: Only when pending invitations exist
  useEffect(() => {
    if (!hasPendingInvites || !tripId) {
      // Clear any existing polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start polling when there are pending invites
    pollingIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        load();
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [hasPendingInvites, tripId, load]);

  // Refetch on visibility change and focus (only when pending invites exist)
  useEffect(() => {
    if (!hasPendingInvites || !tripId) {
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
  }, [hasPendingInvites, tripId, load]);

  const addMember = useCallback(async (payload: AddMemberPayload) => {
    if (!tripId) return null;
    setError(null);
    try {
      await addTripMember(tripId, payload);
      await load();
      return null;
    } catch (err) {
      const errorMsg = extractApiError(err as ApiError, 'Failed to add member');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [tripId, load]);

  const removeMember = useCallback(async (userId: string) => {
    if (!tripId) return;
    setError(null);
    try {
      await removeTripMember(tripId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      const errorMsg = extractApiError(err as ApiError, 'Failed to remove member');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [tripId]);

  const leaveTrip = useCallback(async () => {
    if (!tripId) return;
    setError(null);
    try {
      await leaveTripAsMe(tripId);
      // Don't update local state - user will be redirected
    } catch (err) {
      const errorMsg = extractApiError(err as ApiError, 'Failed to leave trip');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [tripId]);

  return {
    tripId,
    members,
    loading,
    error,
    addMember,
    removeMember,
    leaveTrip,
    reload: load,
  };
}
