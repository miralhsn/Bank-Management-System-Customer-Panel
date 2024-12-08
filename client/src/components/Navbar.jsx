import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts/overview');
      if (response.data.accounts) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-bold text-blue-600">
              ReliPay
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              {/* Account Selector */}
              <div className="hidden md:block">
                <select
                  onChange={(e) => navigate(`/accounts/${e.target.value}/transactions`)}
                  className="form-select rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountType} - ${account.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="hidden md:block text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 