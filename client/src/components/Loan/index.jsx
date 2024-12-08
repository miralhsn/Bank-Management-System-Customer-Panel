import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calculator } from 'lucide-react';
import api from '../../utils/api';
import LoanCalculator from './LoanCalculator';

const Loan = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setError('Failed to load loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600 bg-gray-100';
    
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' 
      ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '$0.00';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Loans</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Loan Calculator
          </button>
          <button
            onClick={() => navigate('/loans/apply')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Apply for Loan
          </button>
        </div>
      </div>

      {showCalculator && (
        <div className="mb-6">
          <LoanCalculator />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Your Loan Applications</h2>

        {error ? (
          <div className="text-center p-6">
            <div className="text-red-600 text-lg">{error}</div>
            <button
              onClick={fetchLoans}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No loan applications found</p>
            <button
              onClick={() => navigate('/loans/apply')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply for your first loan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              if (!loan) return null;

              return (
                <div
                  key={loan._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {loan.type ? (
                          `${loan.type.charAt(0).toUpperCase()}${loan.type.slice(1)} Loan`
                        ) : (
                          'Unknown Loan Type'
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{loan.purpose || 'No purpose specified'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status ? (
                        `${loan.status.charAt(0).toUpperCase()}${loan.status.slice(1)}`
                      ) : (
                        'Unknown Status'
                      )}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="font-medium">{formatCurrency(loan.amount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Monthly Payment</div>
                      <div className="font-medium">{formatCurrency(loan.monthlyPayment)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Term</div>
                      <div className="font-medium">{loan.term ? `${loan.term} months` : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Applied on {formatDate(loan.applicationDate)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loan; 