import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AccountOverview from './components/AccountOverview';
import Transfer from './components/Transfer';
import TransactionHistory from './components/TransactionHistory';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Loan from './components/Loan';
import LoanApplication from './components/Loan/LoanApplication';
import ErrorBoundary from './components/ErrorBoundary';
import Profile from './components/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col md:flex-row pt-16">
              <Sidebar />
              <main className="w-full md:flex-1 md:ml-64 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<PrivateRoute><AccountOverview /></PrivateRoute>} />
                    <Route path="/accounts" element={<PrivateRoute><AccountOverview /></PrivateRoute>} />
                    <Route path="/transfers" element={<PrivateRoute><Transfer /></PrivateRoute>} />
                    <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
                    <Route path="/accounts/:accountId/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
                    <Route path="/loans" element={<PrivateRoute><Loan /></PrivateRoute>} />
                    <Route path="/loans/apply" element={<PrivateRoute><LoanApplication /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App; 