import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Lock, Smartphone, Key } from 'lucide-react';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorAuth?.enabled || false);
  const [twoFactorMethod, setTwoFactorMethod] = useState(user?.twoFactorAuth?.method || 'sms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/profile/2fa/toggle', {
        enabled: !twoFactorEnabled,
        method: twoFactorMethod
      });
      setTwoFactorEnabled(!twoFactorEnabled);
      setSuccess(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      {/* Password Change Section */}
      <div>
        <h3 className="text-lg font-medium flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication Section */}
      <div>
        <h3 className="text-lg font-medium flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Two-Factor Authentication
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-gray-500">
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button
              onClick={handle2FAToggle}
              disabled={loading}
              className={`px-4 py-2 rounded-md ${
                twoFactorEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white disabled:opacity-50`}
            >
              {loading ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>

          {twoFactorEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verification Method
              </label>
              <select
                value={twoFactorMethod}
                onChange={(e) => setTwoFactorMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="authenticator">Authenticator App</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 