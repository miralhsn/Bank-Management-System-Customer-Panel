import express from 'express';
import Account from '../models/Account.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get account overview
router.get('/overview', authenticate, async (req, res) => {
  try {
    console.log('Fetching accounts for user:', req.user._id);
    const accounts = await Account.find({ userId: req.user._id });
    console.log('Found accounts:', accounts);

    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountTypeTotals = accounts.reduce((totals, acc) => {
      totals[acc.accountType] = (totals[acc.accountType] || 0) + acc.balance;
      return totals;
    }, {});

    res.json({
      accounts,
      totalBalance,
      accountTypeTotals
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new account
router.post('/', authenticate, async (req, res) => {
  try {
    const { accountType, initialBalance, currency } = req.body;

    const account = new Account({
      userId: req.user._id,
      accountType,
      balance: initialBalance || 0,
      currency: currency || 'USD',
      status: 'active',
      interestRate: accountType === 'savings' ? 2.5 : 0
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get account details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this route for fetching all accounts
router.get('/', authenticate, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;