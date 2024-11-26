import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AccountProps {
  account: {
    type: string;
    number: string;
    balance: number;
    currency: string;
    icon: LucideIcon;
  };
}

function AccountCard({ account }: AccountProps) {
  const Icon = account.icon;
  const isNegative = account.balance < 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">{account.type}</h3>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Account Number</p>
        <p className="font-medium">{account.number}</p>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-500">Available Balance</p>
        <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
          {account.currency} {Math.abs(account.balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
        View Details
      </button>
    </div>
  );
}

export default AccountCard;