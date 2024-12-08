import React, { useState, useEffect } from 'react';
import { X, Download, Filter } from 'lucide-react';
import api from '../../utils/api';
import TransactionFilters from '../TransactionHistory/TransactionFilters';
import TransactionDetails from '../TransactionHistory/TransactionDetails';

const AccountDetails = ({ account, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    status: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [account._id, filters]);

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        accountId: account._id
      }).toString();

      const response = await api.get(`/transactions?${queryParams}`);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch transactions');
      console.error('Error:', error);
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await api.get('/transactions/download', {
        params: { ...filters, accountId: account._id, format },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `account_${account.accountNumber}_transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error downloading ${format}:`, err);
      setError(`Failed to download ${format}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Account Details</h2>
            <p className="text-sm text-gray-600">Account Number: {account.accountNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Account Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <div className="font-medium capitalize">{account.accountType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Balance</div>
              <div className="font-medium">${account.balance.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium capitalize">{account.status}</div>
            </div>
            {account.interestRate && (
              <div>
                <div className="text-sm text-gray-600">Interest Rate</div>
                <div className="font-medium">{account.interestRate}%</div>
              </div>
            )}
          </div>

          {/* Transactions Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Transactions</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
                <div className="relative">
                  <button
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => handleDownload('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDownload('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showFilters && (
              <TransactionFilters
                filters={filters}
                setFilters={setFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* Transactions Table */}
            <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`capitalize ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default AccountDetails; 