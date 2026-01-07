import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from '@/components/icon/Icon';
import type { Invitation } from '@/services/invitations.service';

interface InvitationCardProps {
  invitation: Invitation;
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isCanceling?: boolean;
  /**
   * Context type determines which actions to show
   * 'user' (default): User receiving invite - shows Accept/Reject
   * 'creator': Trip creator managing invites - shows Cancel only
   */
  context?: 'user' | 'creator';
}

const InvitationCard = ({ 
  invitation, 
  onAccept,
  onReject,
  onCancel,
  isAccepting = false,
  isRejecting = false,
  isCanceling = false,
  context = 'user'
}: InvitationCardProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!onAccept) return;
    setError(null);
    try {
      await onAccept(invitation._id);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setError(null);
    try {
      await onReject(invitation._id);
    } catch (err: any) {
      setError(err.message || 'Failed to reject invitation');
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setError(null);
    try {
      await onCancel(invitation._id);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  const timeAgo = formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true });

  const tripName = invitation.tripId?.tripName || 'Trip';
  const inviterName = invitation.invitedBy?.name || invitation.invitedBy?.username || 'Someone';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Trip Category Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Icon name="mapPin" className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {tripName}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            Invited by {inviterName}
          </p>
          
          {invitation.message && (
            <p className="text-xs text-gray-500 mt-2 italic">
              "{invitation.message}"
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>

          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}

          {/* Actions - Context-aware rendering */}
          <div className="flex items-center gap-2 mt-3">
            {context === 'user' && (
              <>
                {/* User receiving invite: Accept/Reject buttons */}
                <button
                  onClick={handleAccept}
                  disabled={isAccepting || isRejecting || !onAccept}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAccepting ? (
                    <>
                      <Icon name="loader" className="w-3 h-3 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="w-3 h-3" />
                      Accept
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReject}
                  disabled={isAccepting || isRejecting || !onReject}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRejecting ? (
                    <>
                      <Icon name="loader" className="w-3 h-3 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    <>
                      <Icon name="x" className="w-3 h-3" />
                      Decline
                    </>
                  )}
                </button>
              </>
            )}

            {context === 'creator' && (
              <>
                {/* Creator managing sent invites: Cancel button */}
                <button
                  onClick={handleCancel}
                  disabled={isCanceling || !onCancel}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCanceling ? (
                    <>
                      <Icon name="loader" className="w-3 h-3 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    <>
                      <Icon name="x" className="w-3 h-3" />
                      Cancel
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationCard;
