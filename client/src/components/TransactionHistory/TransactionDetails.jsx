import React from 'react';
import { X } from 'lucide-react';

const TransactionDetails = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Transaction Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Reference</div>
              <div className="font-medium">{transaction.reference}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="font-medium">
                {new Date(transaction.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <div className="font-medium capitalize">{transaction.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Category</div>
              <div className="font-medium capitalize">{transaction.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Amount</div>
              <div className={`font-medium ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}
                ${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {transaction.status}
              </div>
            </div>
          </div>

          {transaction.recipientInfo && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recipient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{transaction.recipientInfo.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Account Number</div>
                  <div className="font-medium">{transaction.recipientInfo.accountNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bank Name</div>
                  <div className="font-medium">{transaction.recipientInfo.bankName}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="text-sm text-gray-600">Description</div>
            <div className="font-medium">{transaction.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails; 