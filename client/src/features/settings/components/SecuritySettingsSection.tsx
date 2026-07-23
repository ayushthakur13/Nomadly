import { useState } from 'react';
import { Icon } from '@/ui/icon/';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { updatePasswordAPI } from '@/services/users.service';
import { TOAST_MESSAGES } from '@/constants/toastMessages';
import toast from 'react-hot-toast';

interface SecuritySettingsSectionProps {
  user: any;
}

export default function SecuritySettingsSection({ user }: SecuritySettingsSectionProps) {
  const isOAuthUser = Boolean(user?.googleId && !user?.hasPassword);
  const hasPassword = Boolean(user?.hasPassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { execute: changePassword, isLoading: pwdLoading } = useAsyncAction({
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(TOAST_MESSAGES.PROFILE.PASSWORD_UPDATE_SUCCESS);
    },
    errorMessage: 'Failed to update password',
  });

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    await changePassword(async () => {
      const payload: any = { newPassword };
      if (hasPassword) payload.currentPassword = currentPassword;
      await updatePasswordAPI(payload);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="lock" size={20} className="text-emerald-600" />
          Password & Sign In
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account password and sign-in method
        </p>
      </div>

      {/* Connected Accounts */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          How you sign in
        </label>
        {isOAuthUser || user?.googleId ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                G
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Google Account</p>
                <p className="text-xs text-gray-500">Signed in with Google</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                <Icon name="lock" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Email & Password</p>
                <p className="text-xs text-gray-500">Password protection enabled</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        )}
      </div>

      {/* Password Management */}
      {isOAuthUser ? (
        <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl text-blue-900 text-xs leading-relaxed flex items-start gap-2">
          <Icon name="info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p>
            You sign in with your <strong>Google account</strong>, so you don't need a password for Nomadly.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          {hasPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={pwdLoading || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {pwdLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
}
