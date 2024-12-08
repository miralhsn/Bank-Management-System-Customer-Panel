import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { generatePDF, generateCSV } from '../utils/documentGenerator.js';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';

const router = express.Router();

// Get all transactions
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching transactions for user:', req.user._id);
    
    // Get user's accounts
    const accounts = await Account.find({ userId: req.user._id });
    console.log('Found accounts:', accounts.length);
    
    if (accounts.length === 0) {
      console.log('No accounts found for user');
      return res.json({
        transactions: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      });
    }

    const accountIds = accounts.map(acc => acc._id);
    console.log('Account IDs:', accountIds);

    // Build query
    const query = {
      $or: [
        { accountId: { $in: accountIds } },
        { userId: req.user._id }
      ]
    };

    // Add filters if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.minAmount) {
      query.amount = { $gte: parseFloat(req.query.minAmount) };
    }
    if (req.query.maxAmount) {
      query.amount = { ...query.amount, $lte: parseFloat(req.query.maxAmount) };
    }
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    console.log('Transaction query:', query);

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Transaction.countDocuments(query);
    console.log('Total transactions found:', total);

    // Get transactions with pagination and populate references
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('accountId', 'accountNumber accountType')
      .populate('transferDetails.fromAccount', 'accountNumber accountType')
      .populate('transferDetails.toAccount', 'accountNumber accountType')
      .populate('userId', 'name email');

    console.log('Retrieved transactions:', transactions.length);

    const response = {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    console.log('Sending response with transaction count:', transactions.length);
    res.json(response);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate transaction receipt
router.get('/:id/receipt', authenticate, async (req, res) => {
  try {
    console.log('Generating receipt for transaction:', req.params.id);
    
    const transaction = await Transaction.findById(req.params.id)
      .populate('accountId', 'accountNumber accountType')
      .populate('userId', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify transaction belongs to user
    if (transaction.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to transaction' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transaction-${transaction._id}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    // Header
    doc.fontSize(20).text('Transaction Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);

    // Bank logo and details
    doc.text('ReliBank', { align: 'center' });
    doc.moveDown();

    // Add border and background to the main content
    doc.rect(50, doc.y, 500, 300).stroke();
    doc.fill('#f8f9fa').rect(51, doc.y + 1, 498, 298).fill();
    doc.fill('#000000');

    // Transaction details
    const details = [
      { label: 'Transaction ID', value: transaction._id },
      { label: 'Date', value: new Date(transaction.createdAt).toLocaleString() },
      { label: 'Account', value: `${transaction.accountId.accountType.toUpperCase()} - ${transaction.accountId.accountNumber}` },
      { label: 'Type', value: transaction.type.toUpperCase() },
      { label: 'Amount', value: `$${transaction.amount.toLocaleString()}` },
      { label: 'Description', value: transaction.description },
      { label: 'Status', value: transaction.status.toUpperCase() },
      { label: 'Category', value: transaction.category },
      { label: 'Reference', value: transaction.reference }
    ];

    let yPos = doc.y + 20;
    details.forEach(({ label, value }) => {
      doc.text(label + ':', 70, yPos);
      doc.text(value, 250, yPos);
      yPos += 25;
    });

    // Add footer
    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for banking with ReliBank', { align: 'center' });
    doc.moveDown();
    doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ message: 'Failed to generate receipt' });
  }
});

// Create test transactions
router.post('/create-test', authenticate, async (req, res) => {
  try {
    console.log('Creating test transactions for user:', req.user._id);
    
    // Get user's accounts
    const accounts = await Account.find({ userId: req.user._id });
    console.log('Found accounts:', accounts.length);
    
    if (accounts.length === 0) {
      console.log('No accounts found - cannot create test transactions');
      return res.status(400).json({ 
        message: 'Please create an account first',
        error: 'NO_ACCOUNTS'
      });
    }

    // Check if test transactions already exist
    const existingTransactions = await Transaction.countDocuments({
      accountId: { $in: accounts.map(acc => acc._id) }
    });

    console.log('Existing transactions:', existingTransactions);

    if (existingTransactions > 0) {
      console.log('Test transactions already exist');
      return res.json({ 
        message: 'Test transactions already exist',
        count: existingTransactions
      });
    }

    // Create test transactions
    const testTransactions = [];
    const types = ['credit', 'debit'];
    const categories = ['transfer', 'deposit', 'withdrawal', 'payment', 'other'];
    const descriptions = [
      'Monthly salary',
      'Grocery shopping',
      'Utility bill payment',
      'Online purchase',
      'ATM withdrawal',
      'Restaurant payment',
      'Transfer to savings',
      'Mobile recharge',
      'Insurance premium',
      'Investment deposit'
    ];

    // Create 20 test transactions
    for (let i = 0; i < 20; i++) {
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = parseFloat((Math.random() * 990 + 10).toFixed(2));
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

      const transaction = new Transaction({
        accountId: account._id,
        userId: req.user._id,
        type,
        amount,
        description,
        category,
        status: 'completed',
        createdAt: date,
        currency: 'USD'
      });

      testTransactions.push(transaction);

      // Update account balance
      if (type === 'credit') {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
    }

    console.log('Created test transactions:', testTransactions.length);

    // Save all transactions and update account balances
    await Promise.all([
      ...testTransactions.map(transaction => transaction.save()),
      ...accounts.map(account => account.save())
    ]);

    console.log('Successfully saved all test transactions and updated account balances');

    res.json({ 
      message: 'Test transactions created successfully',
      count: testTransactions.length
    });
  } catch (error) {
    console.error('Create test transactions error:', error);
    res.status(500).json({ 
      message: error.message,
      error: 'CREATE_TEST_FAILED'
    });
  }
});

// Download transactions
router.get('/download/:format', authenticate, async (req, res) => {
  try {
    const { format } = req.params;
    if (!['pdf', 'csv'].includes(format)) {
      return res.status(400).json({ message: 'Invalid format. Use pdf or csv.' });
    }

    // Get user's accounts
    const accounts = await Account.find({ userId: req.user._id });
    const accountIds = accounts.map(acc => acc._id);

    // Get all transactions
    const transactions = await Transaction.find({
      $or: [
        { accountId: { $in: accountIds } },
        { userId: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('accountId', 'accountNumber accountType')
    .populate('transferDetails.fromAccount', 'accountNumber accountType')
    .populate('transferDetails.toAccount', 'accountNumber accountType')
    .lean();

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found to download' });
    }

    let data;
    let contentType;
    let filename;

    try {
      if (format === 'pdf') {
        data = await generatePDF(transactions);
        contentType = 'application/pdf';
        filename = `transactions_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        data = await generateCSV(transactions);
        contentType = 'text/csv';
        filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      }

      if (!data) {
        throw new Error('Failed to generate document');
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', data.length);
      res.send(data);
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error);
      res.status(500).json({ message: `Failed to generate ${format.toUpperCase()}` });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to process download request' });
  }
});

export default router;