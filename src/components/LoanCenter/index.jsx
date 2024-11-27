import React, { useState } from 'react';
import { Calculator, FileText, Clock } from 'lucide-react';
import LoanCalculator from './LoanCalculator';
import LoanApplication from './LoanApplication';
import LoanStatus from './LoanStatus';

const sections = [
  { id: 'calculator', label: 'Loan Calculator', icon: Calculator },
  { id: 'apply', label: 'Apply for Loan', icon: FileText },
  { id: 'status', label: 'Application Status', icon: Clock },
];

function LoanCenter() {
  const [activeSection, setActiveSection] = useState('calculator');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Loan Center</h1>

      <div className="grid grid-cols-3 gap-4">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              activeSection === id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <Icon className={`h-6 w-6 ${
              activeSection === id ? 'text-blue-500' : 'text-gray-500'
            }`} />
            <span className={`font-medium ${
              activeSection === id ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {activeSection === 'calculator' && <LoanCalculator />}
        {activeSection === 'apply' && <LoanApplication />}
        {activeSection === 'status' && <LoanStatus />}
      </div>
    </div>
  );
}

export default LoanCenter;