import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, FileText } from 'lucide-react';

const LoanNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath.includes(path);

  return (
    <div className="bg-white shadow mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8">
          <Link
            to="/loans/calculator"
            className={`inline-flex items-center px-4 py-3 border-b-2 text-sm font-medium ${
              isActive('calculator')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Loan Calculator
          </Link>

          <Link
            to="/loans/apply"
            className={`inline-flex items-center px-4 py-3 border-b-2 text-sm font-medium ${
              isActive('apply')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Apply for Loan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoanNavigation; 