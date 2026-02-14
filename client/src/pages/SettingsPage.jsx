import React, { useState } from 'react';
import { User, Shield, CreditCard, Save } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore;
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name });
      toast.getState().success('Profile updated successfully');
    } catch (err) {
      toast.getState().error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const planInfo = {
    free: { name: 'Free', color: 'bg-gray-100 text-gray-700', limit: '1 project, 3 modules' },
    pro: { name: 'Pro', color: 'bg-primary-100 text-primary-700', limit: '5 projects, all modules' },
    enterprise: { name: 'Business', color: 'bg-purple-100 text-purple-700', limit: 'Unlimited' }
  };

  const currentPlan = planInfo[user?.plan] || planInfo.free;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Profile */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">Manage your account details</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input max-w-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input max-w-md bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Plan */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
            <p className="text-sm text-gray-500">Your current plan and usage</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${currentPlan.color}`}>
                {currentPlan.name}
              </span>
            </div>
            <p className="text-sm text-gray-500">{currentPlan.limit}</p>
          </div>
          {user?.plan === 'free' && (
            <button className="btn-primary text-sm">Upgrade to Pro</button>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500">Account security settings</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Password</p>
            <p className="text-sm text-gray-500">Last changed: Never</p>
          </div>
          <button className="btn-secondary text-sm">Change Password</button>
        </div>
      </div>
    </div>
  );
}
