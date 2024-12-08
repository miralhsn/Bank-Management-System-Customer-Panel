import React, { useState, useEffect } from 'react';
import TransferForm from './TransferForm';
import ScheduledTransfers from './ScheduledTransfers';
import api from '../../utils/api';

const Transfers = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <TransferForm accounts={accounts} onSuccess={fetchAccounts} />
      <ScheduledTransfers />
    </div>
  );
};

export default Transfers; 