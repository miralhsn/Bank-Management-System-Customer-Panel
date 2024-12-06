import express from 'express';
import Loan from '../models/Loan.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Submit loan application
router.post('/apply', authenticate, async (req, res) => {
  try {
    console.log('Loan application request:', req.body);
    console.log('User ID:', req.user._id);

    const {
      type,
      amount,
      interestRate,
      term,
      monthlyPayment,
      documents
    } = req.body;

    const loan = new Loan({
      userId: req.user._id,
      type,
      amount,
      interestRate,
      term,
      monthlyPayment,
      documents
    });

    const savedLoan = await loan.save();
    console.log('Loan saved:', savedLoan);
    res.status(201).json(savedLoan);
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get loan applications
router.get('/applications', authenticate, async (req, res) => {
  try {
    console.log('Fetching loans for user:', req.user._id);
    const loans = await Loan.find({ userId: req.user._id })
      .sort({ applicationDate: -1 });
    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get loan application status
router.get('/status/:id', authenticate, async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan status error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;