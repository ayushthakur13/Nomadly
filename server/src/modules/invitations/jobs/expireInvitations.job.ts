import Invitation, { InvitationStatus } from '../invitation.model';

/**
 * Job to expire old pending invitations
 * This should be run periodically (e.g., via cron job or scheduled task)
 * 
 * Usage:
 * ```
 * import { expirePendingInvitations } from './invitations/jobs/expireInvitations.job';
 * 
 * // Run manually or via cron
 * const expiredCount = await expirePendingInvitations();
 * console.log(`Expired ${expiredCount} invitations`);
 * ```
 */
export async function expirePendingInvitations(): Promise<number> {
  const result = await Invitation.updateMany(
    {
      status: InvitationStatus.PENDING,
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: InvitationStatus.EXPIRED }
    }
  );

  return result.modifiedCount;
}

export default expirePendingInvitations;
