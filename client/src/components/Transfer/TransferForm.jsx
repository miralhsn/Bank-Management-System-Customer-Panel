import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const TransferForm = ({ accounts, onSuccess }) => {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    externalAccount: {
      accountNumber: '',
      bankName: '',
      accountHolderName: '',
      routingNumber: ''
    },
    amount: '',
    type: 'internal',
    description: '',
    isScheduled: false,
    scheduledDate: '',
    isRecurring: false,
    recurringDetails: {
      frequency: 'monthly',
      endDate: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const transferData = {
        fromAccountId: formData.fromAccountId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description
      };

      if (formData.type === 'internal') {
        transferData.toAccountId = formData.toAccountId;
      } else {
        transferData.externalAccount = formData.externalAccount;
      }

      if (formData.isScheduled) {
        transferData.scheduledDate = formData.scheduledDate;
      }

      if (formData.isRecurring) {
        transferData.recurringDetails = formData.recurringDetails;
      }

      const response = await api.post('/transfers', transferData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/transactions'); // Redirect to transactions page
      }, 2000);
      onSuccess?.();
      
      // Reset form
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        externalAccount: {
          accountNumber: '',
          bankName: '',
          accountHolderName: '',
          routingNumber: ''
        },
        amount: '',
        type: 'internal',
        description: '',
        isScheduled: false,
        scheduledDate: '',
        isRecurring: false,
        recurringDetails: {
          frequency: 'monthly',
          endDate: ''
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Transfer Successful!</h3>
            <p className="text-gray-600">Redirecting to transactions...</p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">New Transfer</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700">From Account</label>
            <select
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select account</option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.accountType} - {account.accountNumber} (${account.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Transfer Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="internal">Internal Transfer</option>
              <option value="external">External Transfer</option>
            </select>
          </div>

          {/* To Account (Internal) or External Account Details */}
          {formData.type === 'internal' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">To Account</label>
              <select
                name="toAccountId"
                value={formData.toAccountId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select account</option>
                {accounts
                  .filter(account => account._id !== formData.fromAccountId)
                  .map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountType} - {account.accountNumber}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="externalAccount.bankName"
                  value={formData.externalAccount.bankName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                  type="text"
                  name="externalAccount.accountHolderName"
                  value={formData.externalAccount.accountHolderName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="externalAccount.accountNumber"
                  value={formData.externalAccount.accountNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                <input
                  type="text"
                  name="externalAccount.routingNumber"
                  value={formData.externalAccount.routingNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Amount and Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Scheduling Options */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isScheduled"
                name="isScheduled"
                checked={formData.isScheduled}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    isScheduled: e.target.checked,
                    isRecurring: false // Reset recurring when toggling scheduled
                  }));
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isScheduled" className="text-sm font-medium text-gray-700">
                Schedule for later
              </label>
            </div>

            {formData.isScheduled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transfer Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required={formData.isScheduled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.isScheduled && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isRecurring: e.target.checked
                    }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Make this a recurring transfer
                </label>
              </div>
            )}

            {formData.isRecurring && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <select
                    name="recurringDetails.frequency"
                    value={formData.recurringDetails.frequency}
                    onChange={handleChange}
                    required={formData.isRecurring}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="recurringDetails.endDate"
                    value={formData.recurringDetails.endDate}
                    onChange={handleChange}
                    min={formData.scheduledDate || new Date().toISOString().split('T')[0]}
                    required={formData.isRecurring}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setFormData({
                fromAccountId: '',
                toAccountId: '',
                externalAccount: {
                  accountNumber: '',
                  bankName: '',
                  accountHolderName: '',
                  routingNumber: ''
                },
                amount: '',
                type: 'internal',
                description: '',
                isScheduled: false,
                scheduledDate: '',
                isRecurring: false,
                recurringDetails: {
                  frequency: 'monthly',
                  endDate: ''
                }
              })}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm; 