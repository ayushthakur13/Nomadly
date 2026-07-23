import { Icon } from '@/ui/icon/';
import { useLogout } from '@/features/auth';

export default function AccountActionsSection() {
  const { performLogout } = useLogout();

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="logout" size={20} className="text-red-600" />
          Sign Out
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign out of your account on this browser
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Sign Out of Nomadly</h4>
          <p className="text-xs text-gray-500">You can log back in anytime with your credentials</p>
        </div>

        <button
          type="button"
          onClick={performLogout}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm flex-shrink-0"
        >
          <Icon name="logout" size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
