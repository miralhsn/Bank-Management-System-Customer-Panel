import express from 'express';
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import { authenticate } from '../middleware/authenticate.js';
import { stripe } from '../config/services.js';

const router = express.Router();

// Create a new transfer
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('Transfer request:', req.body);
    const {
      fromAccount,
      toAccount,
      amount,
      type,
      description
    } = req.body;

    // Verify accounts exist and belong to user
    const sourceAccount = await Account.findOne({
      _id: fromAccount,
      userId: req.user._id
    });

    if (!sourceAccount) {
      return res.status(404).json({ message: 'Source account not found' });
    }

    // Check sufficient balance
    if (sourceAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Create transfer record
    const transfer = new Transfer({
      userId: req.user._id,
      fromAccount,
      toAccount,
      amount,
      type,
      description
    });

    // Save transfer
    const savedTransfer = await transfer.save();

    // Update account balances
    sourceAccount.balance -= amount;
    await sourceAccount.save();

    if (type === 'internal') {
      const destinationAccount = await Account.findById(toAccount);
      if (destinationAccount) {
        destinationAccount.balance += amount;
        await destinationAccount.save();
      }
    }

    res.status(201).json(savedTransfer);
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's transfers
router.get('/', authenticate, async (req, res) => {
  try {
    const transfers = await Transfer.find({
      $or: [
        { userId: req.user._id },
        { toAccount: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(transfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get transfer details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Get transfer details error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;