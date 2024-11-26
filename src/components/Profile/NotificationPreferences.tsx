import React from 'react';
import { useForm } from 'react-hook-form';
import { Bell, Mail, Smartphone, CreditCard, Shield } from 'lucide-react';

const notificationTypes = [
  {
    id: 'account',
    label: 'Account Activity',
    description: 'Get notified about sign-ins, password changes, and security alerts',
    icon: Shield,
  },
  {
    id: 'transactions',
    label: 'Transaction Updates',
    description: 'Receive alerts for deposits, withdrawals, and transfers',
    icon: CreditCard,
  },
  {
    id: 'marketing',
    label: 'Marketing Communications',
    description: 'Stay updated with our latest products, services, and offers',
    icon: Mail,
  },
];

function NotificationPreferences() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      account: {
        email: true,
        sms: true,
        push: false,
      },
      transactions: {
        email: true,
        sms: true,
        push: true,
      },
      marketing: {
        email: false,
        sms: false,
        push: false,
      },
    },
  });

  const onSubmit = (data: any) => {
    console.log('Notification preferences update:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {notificationTypes.map(({ id, label, description, icon: Icon }) => (
        <div key={id} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{label}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(`${id}.email`)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Email</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(`${id}.sms`)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">SMS</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(`${id}.push`)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Push Notifications</span>
            </label>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
}

export default NotificationPreferences;