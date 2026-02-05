import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTripMembers, type TripMember } from '@/services/members.service';

/**
 * Custom hook to fetch and manage trip member details
 * Handles member data enrichment (names, profiles, etc.) with memoized lookups
 * Reduces prop drilling and duplication across budget components
 */
export function useMemberDetails() {
  const { tripId } = useParams<{ tripId: string }>();
  const [membersWithDetails, setMembersWithDetails] = useState<Map<string, TripMember>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) {
      setMembersWithDetails(new Map());
      return;
    }

    const loadMemberDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const members = await fetchTripMembers(tripId);
        const detailsMap = new Map<string, TripMember>();
        members.forEach((member) => {
          detailsMap.set(member.userId, member);
        });
        setMembersWithDetails(detailsMap);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch member details');
        setError(error);
        console.error('Failed to fetch member details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberDetails();
  }, [tripId]);

  /**
   * Get member name by userId with fallback chain
   * Priority: name → username → ID slice
   */
  const getMemberName = useCallback(
    (userId: string): string => {
      const member = membersWithDetails.get(userId);
      if (member?.name) return member.name;
      if (member?.username) return member.username;
      return userId.slice(0, 8).toUpperCase();
    },
    [membersWithDetails]
  );

  return {
    membersWithDetails,
    getMemberName,
    isLoading,
    error,
  };
}
