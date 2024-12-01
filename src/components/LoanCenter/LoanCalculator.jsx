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
            <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Loan Term (months)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Monthly Payment</p>
            <p className="text-lg font-semibold text-gray-900">${monthlyPayment.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Payment</p>
            <p className="text-lg font-semibold text-gray-900">${totalPayment.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanCalculator;
