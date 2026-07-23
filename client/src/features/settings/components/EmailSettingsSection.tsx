import { useState } from 'react';
import { Icon } from '@/ui/icon/';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { updateEmailAPI } from '@/services/users.service';
import { updateProfileSuccess } from '@/features/auth';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

interface EmailSettingsSectionProps {
  user: any;
}

export default function EmailSettingsSection({ user }: EmailSettingsSectionProps) {
  const dispatch = useDispatch();
  const isOAuthUser = Boolean(user?.googleId && !user?.hasPassword);
  const hasPassword = Boolean(user?.hasPassword);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const { execute: updateEmail, isLoading: emailLoading } = useAsyncAction({
    onSuccess: () => {
      toast.success('Email address updated successfully');
      setNewEmail('');
      setCurrentPassword('');
    },
    errorMessage: 'Failed to update email address',
  });

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a new email address');
      return;
    }
    if (hasPassword && !currentPassword) {
      toast.error('Current password is required to update email');
      return;
    }

    await updateEmail(async () => {
      const response = await updateEmailAPI({
        newEmail: newEmail.trim(),
        ...(hasPassword ? { currentPassword } : {}),
      });
      if (response.data?.user) {
        dispatch(updateProfileSuccess({ user: response.data.user }));
      }
      return response.data;
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="mail" size={20} className="text-emerald-600" />
          Email Address
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          View or update your account email address
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          Current Email
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-gray-900 text-base">{user?.email || 'No email set'}</span>
          {isOAuthUser && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
              <Icon name="shield" size={14} />
              Connected to Google
            </span>
          )}
        </div>
      </div>

      {isOAuthUser ? (
        <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl text-blue-900 text-xs leading-relaxed">
          <div className="flex items-start gap-2">
            <Icon name="info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              You sign in using your <strong>Google account</strong>. To update your email address, please manage it directly through Google.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="enter.new@email.com"
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {hasPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to verify"
                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleUpdateEmail}
            disabled={emailLoading || !newEmail || (hasPassword && !currentPassword)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
          >
            {emailLoading ? 'Updating Email...' : 'Update Email Address'}
          </button>
        </div>
      )}
    </div>
  );
}
