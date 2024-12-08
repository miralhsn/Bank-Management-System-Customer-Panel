import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AccountCard from './AccountCard';
import AccountDetails from './AccountDetails';
import CreateAccountModal from './CreateAccountModal';
import { PlusCircle, AlertCircle } from 'lucide-react';

const AccountOverview = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts/overview');
      setAccounts(response.data.accounts || []);
    } catch (err) {
      setError('Failed to load accounts');
      console.error('Account fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (accountData) => {
    try {
      await api.post('/accounts', accountData);
      await fetchAccounts();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Create account error:', err);
      throw new Error(err.response?.data?.message || 'Failed to create account');
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
      <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Accounts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <AccountCard
            key={account._id}
            account={account}
            onClick={() => setSelectedAccount(account)}
          />
        ))}
      </div>

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