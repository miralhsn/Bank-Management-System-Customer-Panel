import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(12);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    const calculateLoan = () => {
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1);
      
      setMonthlyPayment(monthlyPayment);
      setTotalPayment(monthlyPayment * loanTerm);
    };

    calculateLoan();
  }, [loanAmount, interestRate, loanTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Loan Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loan Amount ($)
            </label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate (%)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loan Term (months)
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="12">1 Year (12 months)</option>
              <option value="24">2 Years (24 months)</option>
              <option value="36">3 Years (36 months)</option>
              <option value="48">4 Years (48 months)</option>
              <option value="60">5 Years (60 months)</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Payment Summary</h3>
          
          <div>
            <p className="text-sm text-gray-500">Monthly Payment</p>
            <p className="text-2xl font-bold text-blue-600">
              ${monthlyPayment.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Payment</p>
            <p className="text-xl font-semibold text-gray-900">
              ${totalPayment.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Interest</p>
            <p className="text-xl font-semibold text-gray-900">
              ${(totalPayment - loanAmount).toFixed(2)}
            </p>
          </div>

          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Apply for This Loan
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanCalculator;