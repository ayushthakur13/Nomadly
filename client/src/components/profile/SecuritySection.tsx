import React from 'react';

interface SecuritySectionProps {
  hasPassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  pwdLoading: boolean;
  onChangePassword: () => void;
}

export default function SecuritySection({
  hasPassword,
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  pwdLoading,
  onChangePassword,
}: SecuritySectionProps) {
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-[#2E2E2E] mb-3">Security</h2>
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-4">
        {hasPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
              placeholder="Enter current password"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-[#aaa] rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-[#4a90e2] focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            placeholder="Re-enter new password"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onChangePassword}
            disabled={pwdLoading || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
            className="px-6 py-3 bg-[#4FB286] text-white rounded-lg text-base font-medium hover:bg-[#3F9470] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pwdLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
