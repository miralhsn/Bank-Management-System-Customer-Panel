import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Bell, Mail, Smartphone, Globe, Receipt } from 'lucide-react';

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    account: {
      email: true,
      sms: true,
      push: false
    },
    transactions: {
      email: true,
      sms: true,
      push: true
    },
    marketing: {
      email: false,
      sms: false,
      push: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user]);

  const handleToggle = (category, method) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [method]: !prev[category][method]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/profile/notifications', preferences);
      setSuccess('Notification preferences updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const NotificationCategory = ({ title, category, icon: Icon }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 mr-2 text-gray-600" />
        <h4 className="text-lg font-medium">{title}</h4>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">Email Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences[category].email}
              onChange={() => handleToggle(category, 'email')}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">SMS Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences[category].sms}
              onChange={() => handleToggle(category, 'sms')}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">Push Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences[category].push}
              onChange={() => handleToggle(category, 'push')}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        <NotificationCategory
          title="Account Notifications"
          category="account"
          icon={Bell}
        />
        <NotificationCategory
          title="Transaction Alerts"
          category="transactions"
          icon={Receipt}
        />
        <NotificationCategory
          title="Marketing Communications"
          category="marketing"
          icon={Mail}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences; 