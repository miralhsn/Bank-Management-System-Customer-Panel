import React, { useState, useEffect } from 'react';
import { Calendar, Clock, XCircle } from 'lucide-react';
import api from '../../utils/api';

const ScheduledTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScheduledTransfers();
  }, []);

  const fetchScheduledTransfers = async () => {
    try {
      const response = await api.get('/transfers', {
        params: { status: 'pending' }
      });
      setTransfers(response.data.filter(t => t.scheduledDate || t.recurringDetails));
    } catch (error) {
      console.error('Error fetching scheduled transfers:', error);
      setError('Failed to load scheduled transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (transferId) => {
    try {
      await api.patch(`/transfers/${transferId}/cancel`);
      fetchScheduledTransfers();
    } catch (error) {
      console.error('Error cancelling transfer:', error);
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
          onClick={fetchScheduledTransfers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Scheduled Transfers</h2>

      {transfers.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No scheduled transfers found
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div
              key={transfer._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {transfer.type === 'internal'
                      ? `To Account: ${transfer.toAccount?.accountNumber}`
                      : `To: ${transfer.externalAccount.accountHolderName}`}
                  </h3>
                  <p className="text-sm text-gray-500">{transfer.description}</p>
                </div>
                <button
                  onClick={() => handleCancel(transfer._id)}
                  className="text-red-600 hover:text-red-700"
                  title="Cancel Transfer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(transfer.scheduledDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  ${transfer.amount.toLocaleString()}
                </div>
              </div>

              {transfer.recurringDetails && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Recurring: {transfer.recurringDetails.frequency}
                    {transfer.recurringDetails.endDate && 
                      ` until ${new Date(transfer.recurringDetails.endDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledTransfers; 