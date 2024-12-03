import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Banknote, PiggyBank, UserCircle } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CreditCard, label: 'Transactions', path: '/transactions' },
  { icon: Banknote, label: 'Fund Transfer', path: '/transfer' },
  { icon: PiggyBank, label: 'Loans', path: '/loans' },
  { icon: UserCircle, label: 'Profile', path: '/profile' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-md h-[calc(100vh-4rem)]">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
