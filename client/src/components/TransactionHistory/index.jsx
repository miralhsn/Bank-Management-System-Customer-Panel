import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <div className="space-y-4">
        {transactions.map(transaction => (
          <div key={transaction._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <div className="mb-2 md:mb-0">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`font-medium ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory; 