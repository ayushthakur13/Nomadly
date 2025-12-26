import { useMemo } from 'react';

interface PermissionContext {
  userId?: string;
  tripCreatedById?: string;
  roles?: string[];
}

/**
 * Determines trip permissions (ownership, role-based access).
 * Pure compute only—no side effects.
 * Future: Can expand to support role matrix for team workflows.
 */
export const useTripPermissions = (context: PermissionContext) => {
  const permissions = useMemo(() => {
    const { userId, tripCreatedById } = context;

    const isOwner = userId && tripCreatedById ? userId === tripCreatedById : false;
    const canEdit = isOwner; // Future: expand based on roles
    const canDelete = isOwner; // Future: expand based on roles
    const canInvite = isOwner; // Future: expand based on roles

    return { isOwner, canEdit, canDelete, canInvite };
  }, [context.userId, context.tripCreatedById, context.roles]);

  return permissions;
};
