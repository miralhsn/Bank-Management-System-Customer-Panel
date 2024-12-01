import React from 'react';
import { Bell, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">ReliPay</span>
          </div>

          {/* Navbar Links */}
          <div className="hidden md:flex space-x-6">
            <NavLink to="/" className="text-gray-600 hover:text-blue-600" activeClassName="text-blue-600 font-semibold">
              Dashboard
            </NavLink>
            <NavLink to="/transactions" className="text-gray-600 hover:text-blue-600" activeClassName="text-blue-600 font-semibold">
              Transactions
            </NavLink>
            <NavLink to="/transfer" className="text-gray-600 hover:text-blue-600" activeClassName="text-blue-600 font-semibold">
              Fund Transfer
            </NavLink>
            <NavLink to="/loans" className="text-gray-600 hover:text-blue-600" activeClassName="text-blue-600 font-semibold">
              Loans
            </NavLink>
            <NavLink to="/profile" className="text-gray-600 hover:text-blue-600" activeClassName="text-blue-600 font-semibold">
              Profile
            </NavLink>
          </div>

          {/* Notification and User */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-6 w-6 text-gray-600" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Mark Taylor</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
