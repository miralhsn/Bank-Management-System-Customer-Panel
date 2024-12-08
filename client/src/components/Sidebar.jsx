import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Receipt,
  Landmark,
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/',
      onClick: () => navigate('/')
    },
    { 
      icon: CreditCard, 
      label: 'Accounts', 
      path: '/accounts',
      onClick: () => navigate('/accounts')
    },
    { 
      icon: ArrowLeftRight, 
      label: 'Transfers', 
      path: '/transfers',
      onClick: () => navigate('/transfers')
    },
    { 
      icon: Receipt, 
      label: 'Transactions', 
      path: '/transactions',
      onClick: () => navigate('/transactions')
    },
    { 
      icon: Landmark, 
      label: 'Loans', 
      path: '/loans',
      onClick: () => navigate('/loans')
    },
    { 
      icon: UserCircle, 
      label: 'Profile', 
      path: '/profile',
      onClick: () => navigate('/profile')
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-blue-600 text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="mt-8">
          <ul className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path, onClick }) => (
              <li key={path}>
                <button
                  onClick={onClick}
                  className={`w-full flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                    isActive(path) ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="px-4 mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar; 