import React from 'react';
import { Send, Receipt, CreditCard, PiggyBank } from 'lucide-react';

const actions = [
  { icon: Send, label: 'Transfer Money', color: 'bg-blue-100 text-blue-600' },
  { icon: Receipt, label: 'Pay Bills', color: 'bg-green-100 text-green-600' },
  { icon: CreditCard, label: 'Cards', color: 'bg-purple-100 text-purple-600' },
  { icon: PiggyBank, label: 'Savings Goals', color: 'bg-orange-100 text-orange-600' },
];

function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map(({ icon: Icon, label, color }) => (
        <button
          key={label}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default QuickActions;