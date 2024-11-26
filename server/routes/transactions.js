import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get transactions for an account
router.get('/:accountId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ accountId: req.params.accountId })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction details
router.get('/details/:transactionId', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;