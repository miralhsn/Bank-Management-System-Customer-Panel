import React from 'react';

function TransactionDetails({ transaction, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="font-medium">Transaction ID:</label>
            <p className="text-gray-600">{transaction._id}</p>
          </div>
          
          <div>
            <label className="font-medium">Date:</label>
            <p className="text-gray-600">
              {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div>
            <label className="font-medium">Description:</label>
            <p className="text-gray-600">{transaction.description}</p>
          </div>
          
          <div>
            <label className="font-medium">Amount:</label>
            <p className={`font-medium ${
              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </p>
          </div>
          
          <div>
            <label className="font-medium">Category:</label>
            <p className="text-gray-600">{transaction.category}</p>
          </div>
          
          <div>
            <label className="font-medium">Recipient:</label>
            <p className="text-gray-600">{transaction.recipient}</p>
          </div>
          
          <div>
            <label className="font-medium">Status:</label>
            <p className="text-gray-600 capitalize">{transaction.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetails; 