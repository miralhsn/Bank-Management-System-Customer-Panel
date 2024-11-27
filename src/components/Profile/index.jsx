import React, { useState } from 'react';
import { User, Mail, Phone, Lock, MapPin, Bell } from 'lucide-react';
import PersonalInfo from './PersonalInfo';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';

const sections = [
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'security', label: 'Security Settings', icon: Lock },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
];

function Profile() {
  const [activeSection, setActiveSection] = useState('personal');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

      <div className="grid grid-cols-3 gap-4">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              activeSection === id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <Icon className={`h-6 w-6 ${
              activeSection === id ? 'text-blue-500' : 'text-gray-500'
            }`} />
            <span className={`font-medium ${
              activeSection === id ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {activeSection === 'personal' && <PersonalInfo />}
        {activeSection === 'security' && <SecuritySettings />}
        {activeSection === 'notifications' && <NotificationPreferences />}
      </div>
    </div>
  );
}

export default Profile;