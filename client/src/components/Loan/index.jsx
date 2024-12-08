import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calculator, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';

const LoanDashboard = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (err) {
      setError('Failed to fetch loan applications');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Loan Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/loans/calculator')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Calculator className="h-5 w-5 mr-2" />
            Loan Calculator
          </button>
          <button
            onClick={() => navigate('/loans/apply')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Apply for Loan
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No loan applications</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by applying for a loan.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/loans/apply')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Apply Now
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loans.map((loan) => (
              <li key={loan._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(loan.status)}
                      <p className="ml-2 text-sm font-medium text-gray-600">
                        Application ID: {loan._id}
                      </p>
                    </div>
                    <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="mr-6">
                        <p className="text-sm text-gray-500">Loan Type</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} Loan
                        </p>
                      </div>
                      <div className="mr-6">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div className="mr-6">
                        <p className="text-sm text-gray-500">Monthly Payment</p>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.monthlyPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Interest Rate</p>
                        <p className="mt-1 text-sm text-gray-900">{loan.interestRate}%</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Applied on {formatDate(loan.applicationDate)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/loans/${loan._id}`)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoanDashboard; 