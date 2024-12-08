import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Eye, EyeOff, Smartphone, Mail, Key, Shield, CheckCircle, XCircle } from 'lucide-react';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: null,
    securityQuestions: []
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/security');
      setSecurityData(response.data);
      if (response.data.securityQuestions) {
        setSecurityQuestions(response.data.securityQuestions);
      }
    } catch (err) {
      setError('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      await api.post('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setSuccess('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSecurityQuestionsUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Validate all questions are filled
      if (securityQuestions.some(q => !q.question || !q.answer)) {
        setError('All security questions and answers are required');
        return;
      }

      await api.post('/profile/security-questions', {
        securityQuestions
      });

      setSuccess('Security questions updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update security questions');
    }
  };

  const setupTwoFactor = async (method) => {
    try {
      setError(null);
      setSuccess(null);
      setQrCode(null);
      setSecret(null);

      const response = await api.post('/profile/2fa/setup', { method });
      
      if (method === 'authenticator') {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setSuccess('Please scan the QR code with your Google Authenticator app');
      } else if (method === 'email') {
        setSuccess('Verification code sent to your email');
      }
      
      setSecurityData(prev => ({
        ...prev,
        twoFactorMethod: method
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup two-factor authentication');
    }
  };

  const verifyTwoFactor = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!verificationCode) {
        setError('Please enter the verification code');
        return;
      }

      await api.post('/profile/2fa/verify', {
        code: verificationCode
      });

      setSecurityData(prev => ({
        ...prev,
        twoFactorEnabled: true
      }));
      setSuccess('Two-factor authentication enabled successfully');
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      
      // Refresh security settings
      await fetchSecuritySettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify code');
    }
  };

  const disableTwoFactor = async () => {
    try {
      setError(null);
      setSuccess(null);

      await api.post('/profile/2fa/disable');
      setSecurityData(prev => ({
        ...prev,
        twoFactorEnabled: false,
        twoFactorMethod: null
      }));
      setSuccess('Two-factor authentication disabled successfully');
      setQrCode(null);
      setSecret(null);
      
      // Refresh security settings
      await fetchSecuritySettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable two-factor authentication');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="ml-3 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="ml-3 text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Change Password Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="mt-1 relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="mt-1 relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Security Questions Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Questions</h3>
        <form onSubmit={handleSecurityQuestionsUpdate} className="space-y-4">
          {securityQuestions.map((q, index) => (
            <div key={index} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Question {index + 1}
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => {
                    const newQuestions = [...securityQuestions];
                    newQuestions[index].question = e.target.value;
                    setSecurityQuestions(newQuestions);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Answer</label>
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => {
                    const newQuestions = [...securityQuestions];
                    newQuestions[index].answer = e.target.value;
                    setSecurityQuestions(newQuestions);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Security Questions
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        
        {!securityData.twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            
            {!securityData.twoFactorMethod ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setupTwoFactor('authenticator')}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  Google Authenticator
                </button>
                <button
                  onClick={() => setupTwoFactor('email')}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Authentication
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {qrCode && (
                  <div className="flex flex-col items-center space-y-4">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your Google Authenticator app
                    </p>
                    {secret && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">Manual entry code:</p>
                        <code className="block mt-1 text-sm bg-gray-100 p-2 rounded">{secret}</code>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter 6-digit code"
                    />
                    <button
                      onClick={verifyTwoFactor}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-700">
              <Shield className="h-5 w-5" />
              <span>Two-factor authentication is enabled</span>
            </div>
            <button
              onClick={disableTwoFactor}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings; 