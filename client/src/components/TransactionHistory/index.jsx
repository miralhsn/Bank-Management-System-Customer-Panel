import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import TransactionFilters from './TransactionFilters';
import TransactionDetails from './TransactionDetails';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        minAmount: filters.minAmount || undefined,
        maxAmount: filters.maxAmount || undefined
      }).toString();

      const response = await api.get(`/transactions?${queryParams}`);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transaction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await api.get('/transactions/download', {
        params: { ...filters, format },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error downloading ${format}:`, err);
      setError(`Failed to download ${format}`);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          <div className="dropdown relative">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
            <div className="dropdown-menu">
              <button onClick={() => handleDownload('pdf')} className="dropdown-item">
                Download PDF
              </button>
              <button onClick={() => handleDownload('csv')} className="dropdown-item">
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionHistory; 