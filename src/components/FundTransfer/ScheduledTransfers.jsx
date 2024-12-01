import React from 'react';
import { Calendar, Clock, ArrowRight, Trash2 } from 'lucide-react';

const scheduledTransfers = [
  {
    id: 1,
    fromAccount: 'Checking (*5678)',
    toAccount: 'Savings (*1234)',
    amount: 500,
    frequency: 'Monthly',
    nextDate: '2024-04-01',
    description: 'Savings transfer',
  },
  {
    id: 2,
    fromAccount: 'Checking (*5678)',
    toAccount: 'External (*9012)',
    amount: 1000,
    frequency: 'Weekly',
    nextDate: '2024-03-15',
    description: 'Rent payment',
  },
];

function ScheduledTransfers() {
  const cancelTransfer = (id) => {
    console.log('Canceling transfer:', id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Scheduled Transfers</h2>
      
      <div className="space-y-4">
        {scheduledTransfers.map((transfer) => (
          <div
            key={transfer.id}
            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{transfer.fromAccount}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{transfer.toAccount}</span>
                </div>
                <span className="text-sm text-gray-500">{transfer.description}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-end">
                <span className="font-medium text-green-600">
                  ${transfer.amount.toLocaleString()}
                </span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{transfer.frequency}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Next: {new Date(transfer.nextDate).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => cancelTransfer(transfer.id)}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduledTransfers;
