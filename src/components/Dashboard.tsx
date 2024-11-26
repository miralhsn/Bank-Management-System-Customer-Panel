import React from 'react';
import { Wallet, CreditCard, PiggyBank } from 'lucide-react';
import AccountCard from './AccountCard';
import QuickActions from './QuickActions';

const accounts = [
  {
    id: 1,
    type: 'Savings Account',
    number: '**** 1234',
    balance: 25000.50,
    currency: 'USD',
    icon: PiggyBank
  },
  {
    id: 2,
    type: 'Checking Account',
    number: '**** 5678',
    balance: 8750.75,
    currency: 'USD',
    icon: Wallet
  },
  {
    id: 3,
    type: 'Credit Card',
    number: '**** 9012',
    balance: -2500.00,
    currency: 'USD',
    icon: CreditCard
  }
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      <QuickActions />

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {/* Placeholder for recent transactions */}
          <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Salary Deposit</p>
                <p className="text-sm text-gray-500">Mar 1, 2024</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">+$3,500.00</span>
          </div>
          {/* Add more transactions as needed */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;