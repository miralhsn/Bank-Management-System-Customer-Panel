import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Smartphone, Mail, Key } from 'lucide-react';
import api from '../../utils/api';

const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    twoFactorMethod: 'sms'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const response = await api.get('/profile/security');
      setFormData(prev => ({
        ...prev,
        twoFactorEnabled: response.data.twoFactorAuth.enabled,
        twoFactorMethod: response.data.twoFactorAuth.method
      }));
    } catch (error) {
      setError('Failed to load security settings');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/profile/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccess('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
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
      if (!formData.twoFactorEnabled) {
        // Send verification code
        await api.post('/profile/2fa/setup', {
          method: formData.twoFactorMethod
        });
        setShowVerification(true);
      } else {
        // Disable 2FA
        await api.post('/profile/2fa/disable');
        setFormData(prev => ({ ...prev, twoFactorEnabled: false }));
        setSuccess('Two-factor authentication disabled');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/profile/2fa/verify', {
        code: verificationCode,
        method: formData.twoFactorMethod
      });

      setFormData(prev => ({ ...prev, twoFactorEnabled: true }));
      setShowVerification(false);
      setSuccess('Two-factor authentication enabled');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">2FA Status</h4>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={handle2FAToggle}
              disabled={loading}
              className={`px-4 py-2 rounded-md ${
                formData.twoFactorEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white disabled:opacity-50`}
            >
              {formData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>

          {!formData.twoFactorEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="twoFactorMethod"
                    value="sms"
                    checked={formData.twoFactorMethod === 'sms'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <span>SMS</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="twoFactorMethod"
                    value="email"
                    checked={formData.twoFactorMethod === 'email'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>Email</span>
                </label>
              </div>
            </div>
          )}

          {showVerification && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter 6-digit code"
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 