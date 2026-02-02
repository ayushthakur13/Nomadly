import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@/ui/icon/';
import InvitationCard from './InvitationCard';
import { useInvitations } from '../hooks';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const NotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { invitations, count, loading, accept, reject, isAccepting, isRejecting } = useInvitations();

  useOnClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleAccept = async (id: string) => {
    try {
      await accept(id);
      
      // Check if already on trips page
      const isOnTripsPage = location.pathname === '/trips' || location.pathname.startsWith('/trips/');
      
      if (isOnTripsPage) {
        // Already on trips page - just close dropdown and show success
        toast.success('Invitation accepted! Trip added to your list.');
        setIsOpen(false);
        // Trigger page refresh to show updated trips list
        window.location.reload();
      } else {
        // Not on trips page - redirect after short delay
        toast.success('Invitation accepted! Redirecting...');
        setTimeout(() => {
          navigate('/trips');
        }, 1000);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject(id);
      toast.success('Invitation declined');
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline invitation');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Icon name="bell" className="w-6 h-6" />
        
        {/* Badge */}
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Trip Invitations
            </h3>
            {loading && (
              <Icon name="loader" className="w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {invitations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="inbox" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No pending invitations</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {invitations.map((invitation) => (
                  <InvitationCard
                    key={invitation._id}
                    invitation={invitation}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isAccepting={isAccepting(invitation._id)}
                    isRejecting={isRejecting(invitation._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
