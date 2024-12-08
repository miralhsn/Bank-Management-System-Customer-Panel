import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { CheckCircle, XCircle, Bell } from 'lucide-react';

const NotificationPreferences = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preferences, setPreferences] = useState({
    account: {
      email: true,
      sms: false
    },
    transactions: {
      email: true,
      sms: false
    },
    marketing: {
      email: false,
      sms: false
    }
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user]);

  const handleChange = (category, method) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [method]: !prev[category][method]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/profile/notifications', {
        notificationPreferences: preferences
      });
      updateUser(response.data.user);
      setSuccess('Notification preferences updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'account',
      title: 'Account Notifications',
      description: 'Get notified about important account activities and security alerts.'
    },
    {
      id: 'transactions',
      title: 'Transaction Notifications',
      description: 'Receive alerts about deposits, withdrawals, and transfers.'
    },
    {
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Stay updated about new features, promotions, and special offers.'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="ml-3 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="ml-3 text-green-700">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-8">
          {categories.map(({ id, title, description }) => (
            <div key={id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">{description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences[id].email}
                      onChange={() => handleChange(id, 'email')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Email Notifications
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences[id].sms}
                      onChange={() => handleChange(id, 'sms')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      SMS Notifications
                    </label>
                  </div>
                  <span className="text-sm text-gray-500">
                    {user?.phone || 'No phone number added'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences; 