import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx'; 
import Navbar from './components/Navbar.jsx';       
import Sidebar from './components/Sidebar.jsx';     
import TransactionHistory from './components/TransactionHistory.jsx'; 
import FundTransfer from './components/FundTransfer/index.jsx';            
import LoanCenter from './components/LoanCenter/index.jsx';               
import Profile from './components/Profile/index.jsx';                       

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/transfer" element={<FundTransfer />} />
            <Route path="/loans" element={<LoanCenter />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;