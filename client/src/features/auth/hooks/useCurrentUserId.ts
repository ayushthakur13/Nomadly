import { useAuth } from '@/features/auth/hooks/';

/**
 * Unified hook to extract current user ID
 * Handles both _id (User interface) and id (alternative) formats
 */
export function useCurrentUserId(): string | null {
  const { user } = useAuth();
  return user?._id || (user as any)?.id || null;
}
