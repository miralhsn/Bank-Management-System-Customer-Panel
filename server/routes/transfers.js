import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all transfers
router.get('/', authenticate, async (req, res) => {
  try {
    const transfers = await Transfer.find({ userId: req.user._id })
      .populate('fromAccount', 'accountNumber accountType')
      .populate('toAccount', 'accountNumber accountType')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new transfer
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      fromAccountId,
      toAccountId,
      externalAccount,
      amount,
      type,
      description,
      scheduledDate,
      recurringDetails
    } = req.body;

    // Validate fromAccount belongs to user
    const fromAccount = await Account.findOne({
      _id: fromAccountId,
      userId: req.user._id
    });

    if (!fromAccount) {
      return res.status(404).json({ message: 'Source account not found' });
    }

    // Check sufficient balance
    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const transfer = new Transfer({
      userId: req.user._id,
      fromAccount: fromAccountId,
      amount,
      type,
      description,
      scheduledDate,
      recurringDetails
    });

    if (type === 'internal') {
      // Validate toAccount exists
      const toAccount = await Account.findById(toAccountId);
      if (!toAccount) {
        return res.status(404).json({ message: 'Destination account not found' });
      }
      transfer.toAccount = toAccountId;
    } else {
      transfer.externalAccount = externalAccount;
    }

    // If scheduled for future or recurring, save transfer and return
    if (scheduledDate || recurringDetails) {
      transfer.status = 'pending';
      await transfer.save();
      return res.status(201).json(transfer);
    }

    // Process immediate transfer
    transfer.status = 'completed';

    // Update account balances
    fromAccount.balance -= amount;
    await fromAccount.save();

    if (type === 'internal') {
      const toAccount = await Account.findById(toAccountId);
      toAccount.balance += amount;
      await toAccount.save();
    }

    await transfer.save();
    res.status(201).json(transfer);
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;