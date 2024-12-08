import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { AlertCircle } from 'lucide-react';

const LoanCalculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'personal',
    amount: '',
    term: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/loans/calculate', {
        type: formData.type,
        amount: parseFloat(formData.amount),
        term: parseInt(formData.term)
      });

      setResult(response.data);
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.response?.data?.message || 'Failed to calculate loan details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = () => {
    navigate('/loans/apply', { 
      state: { 
        calculatedLoan: {
          ...formData,
          ...result
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Loan Calculator</h2>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="personal">Personal Loan</option>
                <option value="auto">Auto Loan</option>
                <option value="home">Home Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Term (months)
              </label>
              <input
                type="number"
                name="term"
                value={formData.term}
                onChange={handleChange}
                min="6"
                max="360"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Monthly Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${result.monthlyPayment.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Interest Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.interestRate}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${result.totalPayment.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Interest</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${result.totalInterest.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleApplyNow}
                className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Apply Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator; 