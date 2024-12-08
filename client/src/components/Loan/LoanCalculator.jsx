import React, { useState } from 'react';
import api from '../../utils/api';

const LoanCalculator = () => {
  const [formData, setFormData] = useState({
    type: 'personal',
    amount: '',
    term: 12
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/loans/calculate', formData);
      setResult(response.data);
    } catch (error) {
      setError('Failed to calculate loan details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Loan Calculator</h2>

      <form onSubmit={handleCalculate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="personal">Personal Loan</option>
            <option value="auto">Auto Loan</option>
            <option value="home">Home Loan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="1000"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Term (months)</label>
          <select
            name="term"
            value={formData.term}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map(months => (
              <option key={months} value={months}>
                {months} months ({(months / 12).toFixed(1)} years)
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Loan Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Monthly Payment</div>
              <div className="text-lg font-semibold">${result.monthlyPayment.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Interest Rate</div>
              <div className="text-lg font-semibold">{result.interestRate}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Interest</div>
              <div className="text-lg font-semibold">${result.totalInterest.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Payment</div>
              <div className="text-lg font-semibold">${result.totalPayment.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator; 