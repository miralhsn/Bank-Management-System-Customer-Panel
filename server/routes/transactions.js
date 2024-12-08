import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { generatePDF, generateCSV } from '../utils/documentGenerator.js';

const router = express.Router();

// Get filtered transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      category,
      minAmount,
      maxAmount,
      status,
      accountId
    } = req.query;

    // Get user's accounts
    const accounts = await Account.find({ userId: req.user._id });
    const accountIds = accounts.map(acc => acc._id.toString());

    // Build query
    const query = {
      accountId: accountId ? accountId : { $in: accountIds }
    };

    // Verify the requested account belongs to the user
    if (accountId && !accountIds.includes(accountId)) {
      return res.status(403).json({ message: 'Unauthorized access to account' });
    }

    // Add other filters
    Object.assign(query, buildQuery({
      startDate,
      endDate,
      type,
      category,
      minAmount,
      maxAmount,
      status
    }));

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate('accountId', 'accountNumber accountType');

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download transactions
router.get('/download', authenticate, async (req, res) => {
  try {
    const { format, ...filters } = req.query;
    
    // Get user's accounts
    const accounts = await Account.find({ userId: req.user._id });
    const accountIds = accounts.map(acc => acc._id);

    // Get transactions
    const transactions = await Transaction.find({
      accountId: { $in: accountIds },
      ...buildQuery(filters)
    })
    .sort({ createdAt: -1 })
    .populate('accountId', 'accountNumber accountType');

    // Generate document
    let data;
    let contentType;
    let filename;

    if (format === 'pdf') {
      data = await generatePDF(transactions);
      contentType = 'application/pdf';
      filename = 'transactions.pdf';
    } else {
      data = await generateCSV(transactions);
      contentType = 'text/csv';
      filename = 'transactions.csv';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(data);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to build query
const buildQuery = (filters) => {
  const query = {};
  
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;

  // Only add amount filters if they are valid numbers
  if (filters.minAmount && !isNaN(filters.minAmount)) {
    query.amount = { ...query.amount, $gte: parseFloat(filters.minAmount) };
  }
  if (filters.maxAmount && !isNaN(filters.maxAmount)) {
    query.amount = { ...query.amount, $lte: parseFloat(filters.maxAmount) };
  }

  return query;
};

export default router;