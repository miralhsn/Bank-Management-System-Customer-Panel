import express from 'express';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/authenticate.js';
import { generatePDF, generateCSV } from '../utils/documentGenerator.js';

const router = express.Router();

// Create a new account
router.post('/', authenticate, async (req, res) => {
  try {
    const { accountType, accountNumber, balance, currency } = req.body;

    // Check if account number already exists
    const existingAccount = await Account.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(400).json({ message: 'Account number already exists' });
    }

    const account = new Account({
      userId: req.user._id,
      accountType,
      accountNumber,
      balance,
      currency
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all accounts for a user
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching accounts for user:', req.user._id);
    console.log('User object:', req.user);

    const accounts = await Account.find({ userId: req.user._id });
    console.log('Found accounts:', accounts);

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get account details by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    console.log('Looking for account:', req.params.id);
    console.log('User ID:', req.user._id);

    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    console.error('Get account details error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update account
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (status) account.status = status;
    await account.save();
    
    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get account overview (all accounts)
router.get('/overview', authenticate, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id });
    
    // Calculate totals for each account type
    const overview = {
      accounts,
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      accountTypeTotals: accounts.reduce((totals, acc) => {
        totals[acc.accountType] = (totals[acc.accountType] || 0) + acc.balance;
        return totals;
      }, {})
    };
    
    res.json(overview);
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get account statements
router.get('/:accountId/statements', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;
    const account = await Account.findOne({
      _id: req.params.accountId,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const transactions = await Transaction.find({
      accountId: account._id,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ createdAt: -1 });

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(transactions, account);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=statement.pdf');
      return res.send(pdfBuffer);
    }

    if (format === 'csv') {
      const csvData = await generateCSV(transactions, account);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=statement.csv');
      return res.send(csvData);
    }

    res.json(transactions);
  } catch (error) {
    console.error('Get statements error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;