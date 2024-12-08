import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AccountCard from './AccountCard';
import AccountDetails from './AccountDetails';
import CreateAccountModal from './CreateAccountModal';
import { PlusCircle } from 'lucide-react';

const AccountOverview = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [totals, setTotals] = useState({
    totalBalance: 0,
    accountTypeTotals: {}
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      console.log('Fetching accounts...');
      const token = localStorage.getItem('token');
      console.log('Auth Token:', token);

      const response = await api.get('/accounts/overview');
      console.log('Accounts Response:', response.data);

      if (response.data.accounts) {
        setAccounts(response.data.accounts);
        setTotals({
          totalBalance: response.data.totalBalance || 0,
          accountTypeTotals: response.data.accountTypeTotals || {}
        });
      } else {
        console.error('No accounts data in response');
        setError('No accounts found');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (accountData) => {
    try {
      const response = await api.post('/accounts', accountData);
      if (response.data) {
        await fetchAccounts();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Create account error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create account');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 text-lg">{error}</div>
        <button
          onClick={fetchAccounts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Overview</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Account
        </button>
      </div>

      {/* Total Balance Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Total Balance</h2>
        <div className="text-3xl font-bold text-blue-600">
          ${totals.totalBalance.toLocaleString()}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Object.entries(totals.accountTypeTotals).map(([type, amount]) => (
            <div key={type} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 capitalize">{type}</div>
              <div className="text-lg font-semibold">${amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <AccountCard
            key={account._id}
            account={account}
            onClick={() => setSelectedAccount(account)}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedAccount && (
        <AccountDetails
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAccount}
        />
      )}
    </div>
  );
};

export default AccountOverview; 