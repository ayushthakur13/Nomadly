import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@/ui/icon/';
import {
  EmailSettingsSection,
  SecuritySettingsSection,
  AccountActionsSection
} from '../components';

type SettingsSubTab = 'security' | 'preferences';

export default function SettingsPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('security');

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your email address, login password, and connected accounts
          </p>
        </div>

        {/* Modular Extensible Layout: Sidebar Sub-Nav + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sub-Navigation Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${activeTab === 'security'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon name="lock" size={18} className={activeTab === 'security' ? 'text-emerald-600' : 'text-gray-400'} />
              <span>Account & Security</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${activeTab === 'preferences'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="bell" size={18} className="text-gray-400" />
                <span>Preferences</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">
                Soon
              </span>
            </button>
          </div>

          {/* Main Content Panel */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'security' && (
              <>
                <EmailSettingsSection user={user} />
                <SecuritySettingsSection user={user} />
                <AccountActionsSection />
              </>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="bell" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Notifications & Preferences</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Custom notification alerts, email preferences, and display themes will be available in an upcoming update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
