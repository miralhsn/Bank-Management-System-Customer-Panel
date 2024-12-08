import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AccountOverview from './components/AccountOverview';
import TransferForm from './components/Transfer/TransferForm';
import ScheduledTransfers from './components/Transfer/ScheduledTransfers';
import LoanCalculator from './components/Loan/LoanCalculator';
import LoanApplication from './components/Loan/LoanApplication';
import LoanSuccess from './components/Loan/LoanSuccess';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import Transfers from './components/Transfer';
import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import Profile from './components/Profile';

// Layout component to wrap authenticated pages
const Layout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <div className="flex-1 p-4 md:ml-64">
          <main className="container mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <PrivateRoute><Dashboard /></PrivateRoute>
      },
      {
        path: "accounts",
        element: <PrivateRoute><AccountOverview /></PrivateRoute>
      },
      {
        path: "accounts/:accountId/transactions",
        element: <PrivateRoute><TransactionHistory /></PrivateRoute>
      },
      {
        path: "transfers",
        element: <PrivateRoute><Transfers /></PrivateRoute>
      },
      {
        path: "transactions",
        element: <PrivateRoute><TransactionHistory /></PrivateRoute>
      },
      {
        path: "loans",
        element: <PrivateRoute><div><LoanCalculator /><LoanApplication /></div></PrivateRoute>
      },
      {
        path: "loans/success",
        element: <PrivateRoute><LoanSuccess /></PrivateRoute>
      },
      {
        path: "profile",
        element: <PrivateRoute><Profile /></PrivateRoute>
      }
    ]
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "register",
    element: <Register />
  }
]);

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App; 