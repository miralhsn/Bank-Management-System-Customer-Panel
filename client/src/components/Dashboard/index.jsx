import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    accountCount: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Total Balance</h2>
          <Wallet className="w-8 h-8 opacity-80" />
        </div>
        <div className="text-4xl font-bold mb-2">
          ${dashboardData.totalBalance.toLocaleString()}
        </div>
        <div className="text-blue-100">
          Across {dashboardData.accountCount} accounts
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(dashboardData.accountTypeTotals || {}).map(([type, amount]) => (
          <div key={type} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm capitalize">{type}</h3>
                <div className="text-xl font-semibold mt-1">
                  ${amount.toLocaleString()}
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 