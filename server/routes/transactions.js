import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Get all transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get transactions by account
router.get('/account/:accountId', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      accountId: req.params.accountId,
      userId: req.user._id
    }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get account transactions error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;