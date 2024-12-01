import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const applications = [
  {
    id: 1,
    type: 'Personal Loan',
    amount: 10000,
    status: 'pending',
    submittedDate: '2024-03-01',
    lastUpdated: '2024-03-02',
  },
  {
    id: 2,
    type: 'Auto Loan',
    amount: 25000,
    status: 'approved',
    submittedDate: '2024-02-15',
    lastUpdated: '2024-02-20',
  },
];

function LoanStatus() {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {application.type}
                </h3>
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(application.submittedDate).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                <span className="text-sm font-medium capitalize">
                  {application.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Loan Amount</p>
                <p className="font-medium">
                  ${application.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(application.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoanStatus;
