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
import LoanLayout from './components/Loan/LoanLayout';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import Transfers from './components/Transfer';
import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import Profile from './components/Profile';
import ErrorPage from './components/ErrorPage';

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
    errorElement: <ErrorPage />,
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
        path: "transactions",
        element: <PrivateRoute><TransactionHistory /></PrivateRoute>
      },
      {
        path: "transfers",
        element: <PrivateRoute><Transfers /></PrivateRoute>
      },
      {
        path: "loans",
        element: <PrivateRoute><LoanLayout /></PrivateRoute>,
        children: [
          {
            index: true,
            element: <Navigate to="calculator" />
          },
          {
            path: "calculator",
            element: <LoanCalculator />
          },
          {
            path: "apply",
            element: <LoanApplication />
          },
          {
            path: "success",
            element: <LoanSuccess />
          }
        ]
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
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

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