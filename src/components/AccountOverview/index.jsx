import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountCard from './AccountCard';
import AccountDetails from './AccountDetails';
import { PlusCircle } from 'lucide-react';

const AccountOverview = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalBalance: 0,
    accountTypeTotals: {}
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/accounts/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAccounts(response.data.accounts);
      setTotals({
        totalBalance: response.data.totalBalance,
        accountTypeTotals: response.data.accountTypeTotals
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
      setLoading(false);
    }
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
  };

  const handleCreateAccount = () => {
    navigate('/accounts/new');
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Overview</h1>
        <button
          onClick={handleCreateAccount}
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
            onClick={() => handleAccountClick(account)}
          />
        ))}
      </div>

      {/* Account Details Modal */}
      {selectedAccount && (
        <AccountDetails
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
};

export default AccountOverview; 