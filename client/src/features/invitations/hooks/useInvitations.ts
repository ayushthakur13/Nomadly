import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  fetchMyPendingInvitations, 
  acceptInvitation, 
  rejectInvitation,
  type Invitation 
} from '@/services/invitations.service';

const POLL_INTERVAL = 45000; // 45 seconds
const POLL_INTERVAL_FAST = 15000; // 15 seconds when there are pending invites

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActiveRef = useRef<boolean>(false);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPendingInvitations();
      setInvitations(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load invitations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const accept = useCallback(async (invitationId: string) => {
    setAcceptingId(invitationId);
    try {
      await acceptInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to accept invitation');
    } finally {
      setAcceptingId(null);
    }
  }, []);

  const reject = useCallback(async (invitationId: string) => {
    setRejectingId(invitationId);
    try {
      await rejectInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to reject invitation');
    } finally {
      setRejectingId(null);
    }
  }, []);

  // Polling logic
  const startPolling = useCallback(() => {
    if (isPollingActiveRef.current) return;
    
    isPollingActiveRef.current = true;
    
    const poll = async () => {
      if (!document.hidden) { // Only poll when tab is visible
        const data = await fetchInvitations();
        
        // Use faster polling if there are pending invitations
        const interval = data.length > 0 ? POLL_INTERVAL_FAST : POLL_INTERVAL;
        
        pollingIntervalRef.current = setTimeout(poll, interval);
      }
    };

    poll(); // Initial fetch
  }, [fetchInvitations]);

  const stopPolling = useCallback(() => {
    isPollingActiveRef.current = false;
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);

  // Start polling on mount
  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    invitations,
    count: invitations.length,
    loading,
    error,
    accept,
    reject,
    refetch: fetchInvitations,
    isAccepting: (id: string) => acceptingId === id,
    isRejecting: (id: string) => rejectingId === id,
  };
}
