import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTripMembers } from './hooks';
import { useTripInvitations } from '@/features/invitations';
import { MemberCard, AddMemberModal } from './components/';
import { ErrorAlert, PageHeader, ConfirmationModal } from '@/ui/common/';
import { Icon } from '@/ui/icon/';
import type { AddMemberPayload } from '@/services/members.service';
import { createInvitation, cancelInvitation } from '@/services/invitations.service';
import type { Trip } from '@shared/types';

interface MembersPageProps {
  tripId: string;
  trip: Trip;
  isOwner: boolean;
}

const MembersPage = ({ tripId, trip, isOwner }: MembersPageProps) => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.auth?.user);
  const currentUserId = currentUser?._id ?? currentUser?.id;
    
  // Fetch pending invitations first (needed for conditional polling)
  const { invitations, loading: invitesLoading, refetch: refetchInvitations } = useTripInvitations(tripId);
  
  // Members hook with eventual consistency:
  // - Refetches on visibility change and window focus
  // - Polls every 45s only when pending invitations exist
  // - Stops polling when no pending invitations
  const { members, loading, error, removeMember, leaveTrip, reload } = useTripMembers(tripId, { 
    pendingInvitesCount: invitations.length 
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leavingTrip, setLeavingTrip] = useState(false);

  const isSoloTrip = trip?.category === 'solo';

  const handleAddMember = async (payload: AddMemberPayload) => {
    setAddingMember(true);
    try {
      await createInvitation(tripId, {
        email: payload.email,
        username: payload.username,
        message: payload.message,
      });
      await refetchInvitations();
      toast.success('Invitation sent');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
      throw err;
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingUserId) return;
    try {
      await removeMember(removingUserId);
      toast.success('Member removed from trip');
      setRemovingUserId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const handleLeaveTrip = async () => {
    setLeavingTrip(true);
    try {
      await leaveTrip();
      toast.success('You have left the trip');
      navigate('/trips');
    } catch (err: any) {
      toast.error(err.message || 'Failed to leave trip');
      setLeavingTrip(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      await refetchInvitations();
      toast.success('Invitation cancelled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel invitation');
    }
  };

  if (isSoloTrip) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
        <Icon name="info" className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Solo Trip</h3>
          <p className="text-sm text-gray-600">
            This is a solo trip. To collaborate with others, change the trip category in settings.
          </p>
        </div>
      </div>
    );
  }

  const memberCount = members.length;
  const subtext = `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;

  return (
    <div>
      <PageHeader
        title="Trip Collaborators"
        subtitle={subtext}
        action={
          isOwner
            ? {
                label: 'Invite Member',
                onClick: () => setShowAddModal(true),
                icon: <Icon name="userPlus" className="w-4 h-4" />,
              }
            : undefined
        }
      />

      {error && (
        <ErrorAlert error={error} onDismiss={reload} />
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading members...</p>
          </div>
        </div>
      ) : members.length === 1 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="max-w-sm mx-auto">
            <Icon name="users" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
            <p className="text-sm text-gray-600 mb-6">
              {isOwner 
                ? 'Invite members to collaborate and share this trip planning experience.'
                : 'This trip has no members yet.'}
            </p>
            {isOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Icon name="user-plus" className="w-4 h-4" />
                Add Your First Member
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberCard
              key={member.userId}
              member={member}
              currentUserId={currentUserId}
              canRemove={isOwner && member.userId !== currentUserId}
              canLeave={member.userId === currentUserId && member.role !== 'creator'}
              onRemove={(userId) => setRemovingUserId(userId)}
              onLeave={() => setShowLeaveModal(true)}
            />
          ))}
        </div>
      )}

      {isOwner && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Pending invitations</h3>
              <p className="text-xs text-gray-500">Awaiting acceptance</p>
            </div>
            {invitesLoading && <span className="text-xs text-gray-500">Refreshing…</span>}
          </div>
          {(!Array.isArray(invitations) || invitations.length === 0) ? (
            <p className="text-sm text-gray-500">No pending invitations.</p>
          ) : (
            <div className="space-y-2">
              {invitations.map((inv) => {
                if (!inv) return null;
                // Extract invitee label - backend populates invitedUserId as object
                const invitedUserObj = (inv as any)?.invitedUserId;
                const inviteLabel =
                  (typeof invitedUserObj === 'object'
                    ? invitedUserObj?.name || invitedUserObj?.username
                    : invitedUserObj) ||
                  (inv as any)?.invitedUsername ||
                  (inv as any)?.invitedEmail ||
                  'Pending user';
                return (
                  <div key={(inv as any)._id || inviteLabel} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 bg-white">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{inviteLabel}</p>
                      {(inv as any)?.message && <p className="text-xs text-gray-500">{(inv as any).message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Pending</span>
                      <button
                        onClick={() => handleCancelInvitation((inv as any)._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel invitation"
                      >
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMember}
        loading={addingMember}
      />

      {/* Remove Member Confirmation */}
      <ConfirmationModal
        isOpen={!!removingUserId}
        title="Remove Member"
        description="Are you sure you want to remove this member from the trip? They will lose access to all trip data."
        confirmText="Remove"
        isDangerous={true}
        onConfirm={handleRemoveMember}
        onCancel={() => setRemovingUserId(null)}
      />

      {/* Leave Trip Confirmation */}
      <ConfirmationModal
        isOpen={showLeaveModal}
        title="Leave Trip"
        description="Are you sure you want to leave this trip? You will lose access to all trip data unless invited again."
        confirmText="Leave Trip"
        isDangerous={true}
        isLoading={leavingTrip}
        onConfirm={handleLeaveTrip}
        onCancel={() => setShowLeaveModal(false)}
      />
    </div>
  );
};

export default MembersPage;
