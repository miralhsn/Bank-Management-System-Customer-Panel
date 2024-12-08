import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const LoanSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-green-500 mb-4">
        <CheckCircle className="h-16 w-16" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Your loan application has been successfully submitted. We will review your application
        and get back to you soon.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/loans')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Applications
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LoanSuccess; 