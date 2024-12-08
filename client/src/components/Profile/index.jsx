import React, { useState } from 'react';
import PersonalInfo from './PersonalInfo';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import { User, Shield, Bell } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b">
          <div className="flex">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && <PersonalInfo />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationPreferences />}
        </div>
      </div>
    </div>
  );
};

export default Profile; 