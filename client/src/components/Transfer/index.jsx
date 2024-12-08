import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import TransferForm from './TransferForm';
import ScheduledTransfers from './ScheduledTransfers';

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (transferData) => {
    try {
      await api.post('/transfers', transferData);
      // Show success message or redirect
      navigate('/transfers/success');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Transfer failed');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transfer Money</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransferForm accounts={accounts} onSubmit={handleTransfer} />
        <ScheduledTransfers />
      </div>
    </div>
  );
};

export default Transfer; 