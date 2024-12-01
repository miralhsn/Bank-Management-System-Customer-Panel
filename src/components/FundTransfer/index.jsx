import React, { useState } from 'react';
import { Send, Clock, Building } from 'lucide-react';
import TransferForm from './TransferForm';
import ScheduledTransfers from './ScheduledTransfers';

const transferTypes = [
  { id: 'internal', label: 'Internal Transfer', icon: Send },
  { id: 'external', label: 'External Transfer', icon: Building },
  { id: 'scheduled', label: 'Scheduled Transfer', icon: Clock },
];

function FundTransfer() {
  const [activeType, setActiveType] = useState('internal');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Fund Transfer</h1>

      <div className="grid grid-cols-3 gap-4">
        {transferTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveType(id)}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              activeType === id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <Icon className={`h-6 w-6 ${
              activeType === id ? 'text-blue-500' : 'text-gray-500'
            }`} />
            <span className={`font-medium ${
              activeType === id ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {activeType === 'scheduled' ? (
          <ScheduledTransfers />
        ) : (
          <TransferForm type={activeType} />
        )}
      </div>
    </div>
  );
}

export default FundTransfer;
