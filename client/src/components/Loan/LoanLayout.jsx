import React from 'react';
import { Outlet } from 'react-router-dom';
import LoanNavigation from './LoanNavigation';

const LoanLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LoanNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default LoanLayout; 