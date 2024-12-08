import React, { useState } from 'react';
import PersonalInfo from './PersonalInfo';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import { User, Lock, Bell } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Security Settings', icon: Lock },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                py-4 px-1 flex items-center border-b-2 font-medium text-sm
                ${activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'personal' && <PersonalInfo />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'notifications' && <NotificationPreferences />}
      </div>
    </div>
  );
};

export default Profile; 