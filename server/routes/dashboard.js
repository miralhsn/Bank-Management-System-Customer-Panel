import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get dashboard overview
router.get('/', authenticate, async (req, res) => {
  try {
    // Get all accounts for the user
    const accounts = await Account.find({ userId: req.user._id });
    
    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    // Calculate account type totals
    const accountTypeTotals = accounts.reduce((totals, account) => {
      totals[account.accountType] = (totals[account.accountType] || 0) + account.balance;
      return totals;
    }, {});

    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      accountId: { $in: accounts.map(acc => acc._id) }
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      totalBalance,
      accountTypeTotals,
      accountCount: accounts.length,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

export default router; 