import { useCallback, useMemo } from 'react';

/**
 * Generates shareable trip URL and handles sharing via navigator.share or clipboard.
 * Pure compute + user action handler. No dispatch or navigation.
 */
export const useTripShare = (tripId: string, tripName: string) => {
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/trips/${tripId}`;
  }, [tripId]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: tripName, url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.error('Failed to share trip', error);
    }
  }, [shareUrl, tripName]);

  return { shareUrl, handleShare };
};
