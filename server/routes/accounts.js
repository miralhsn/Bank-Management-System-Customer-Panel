import express from 'express';
import Account from '../models/Account.js';

const router = express.Router();

// Get all accounts for a user
router.get('/:userId', async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.params.userId });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get account details
router.get('/details/:accountId', async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;