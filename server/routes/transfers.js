import express from 'express';
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/authenticate.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new transfer
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    let transfer = new Transfer({
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
      await transfer.save({ session });
      await session.commitTransaction();
      return res.status(201).json(transfer);
    }

    // Process immediate transfer
    transfer.status = 'completed';
    
    // Create transactions
    const debitTransaction = new Transaction({
      accountId: fromAccountId,
      type: 'debit',
      amount,
      description: `Transfer to ${type === 'internal' ? 'account ending in ' + toAccount.accountNumber.slice(-4) : externalAccount.accountHolderName}`,
      category: 'transfer',
      status: 'completed'
    });

    // Update account balances
    fromAccount.balance -= amount;
    await fromAccount.save({ session });
    await debitTransaction.save({ session });

    if (type === 'internal') {
      const toAccount = await Account.findById(toAccountId);
      toAccount.balance += amount;
      await toAccount.save({ session });

      const creditTransaction = new Transaction({
        accountId: toAccountId,
        type: 'credit',
        amount,
        description: `Transfer from account ending in ${fromAccount.accountNumber.slice(-4)}`,
        category: 'transfer',
        status: 'completed'
      });
      await creditTransaction.save({ session });
    }

    await transfer.save({ session });
    await session.commitTransaction();

    res.status(201).json(transfer);
  } catch (error) {
    await session.abortTransaction();
    console.error('Transfer error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Get user's transfers
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

// Cancel scheduled transfer
router.patch('/:transferId/cancel', authenticate, async (req, res) => {
  try {
    const transfer = await Transfer.findOne({
      _id: req.params.transferId,
      userId: req.user._id,
      status: 'pending'
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found or cannot be cancelled' });
    }

    transfer.status = 'cancelled';
    await transfer.save();

    res.json(transfer);
  } catch (error) {
    console.error('Cancel transfer error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;