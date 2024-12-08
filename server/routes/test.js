import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.get('/db-status', async (req, res) => {
  try {
    // Check connection
    const status = {
      connected: mongoose.connection.readyState === 1,
      dbName: mongoose.connection.name,
      collections: await mongoose.connection.db.listCollections().toArray()
    };

    // Count documents in each collection
    const counts = {
      users: await User.countDocuments(),
      accounts: await Account.countDocuments(),
      transactions: await Transaction.countDocuments()
    };

    // Get sample data
    const samples = {
      users: await User.find().limit(1),
      accounts: await Account.find().limit(1),
      transactions: await Transaction.find().limit(1)
    };

    res.json({
      status,
      counts,
      samples
    });
  } catch (error) {
    console.error('DB Status Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/accounts/:userId', async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.params.userId });
    res.json({
      count: accounts.length,
      accounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 