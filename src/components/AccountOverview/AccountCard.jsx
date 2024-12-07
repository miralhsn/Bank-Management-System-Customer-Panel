import React from 'react';
import { CreditCard, ArrowUpRight } from 'lucide-react';

const AccountCard = ({ account, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-gray-500';
      case 'frozen':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
          <div>
            <h3 className="text-lg font-semibold capitalize">{account.accountType}</h3>
            <p className="text-sm text-gray-500">****{account.accountNumber.slice(-4)}</p>
          </div>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold">
          ${account.balance.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">{account.currency}</div>
      </div>

      <div className="flex justify-between items-center">
        <div className={`text-sm font-medium capitalize ${getStatusColor(account.status)}`}>
          {account.status}
        </div>
        {account.accountType === 'savings' && (
          <div className="text-sm text-gray-600">
            {account.interestRate}% APY
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountCard; 