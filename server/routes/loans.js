import express from 'express';
import Loan from '../models/Loan.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadDocument, handleUploadError } from '../utils/fileUpload.js';

const router = express.Router();

// Apply for a loan
router.post('/', authenticate, uploadDocument.array('documents'), handleUploadError, async (req, res) => {
  try {
    const {
      type,
      amount,
      term,
      purpose,
      employmentDetails
    } = req.body;

    const documents = req.files?.map(file => ({
      name: file.originalname,
      url: file.path,
      type: file.mimetype,
      uploadedAt: new Date()
    }));

    const loan = new Loan({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      term: parseInt(term),
      purpose,
      employmentDetails: JSON.parse(employmentDetails),
      documents,
      interestRate: calculateInterestRate(type, parseFloat(amount), parseInt(term))
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's loans
router.get('/', authenticate, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id })
      .sort({ applicationDate: -1 });
    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get loan details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan details error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Calculate loan details (for calculator)
router.post('/calculate', authenticate, (req, res) => {
  try {
    const { type, amount, term } = req.body;
    const interestRate = calculateInterestRate(type, amount, term);
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, term);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    res.json({
      monthlyPayment,
      totalPayment,
      totalInterest,
      interestRate
    });
  } catch (error) {
    console.error('Loan calculation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function calculateInterestRate(type, amount, term) {
  // Simple interest rate calculation logic
  const baseRate = {
    personal: 12,
    auto: 8,
    home: 6
  }[type];

  // Adjust based on amount and term
  let rate = baseRate;
  if (amount > 100000) rate -= 0.5;
  if (term > 60) rate += 0.5;

  return rate;
}

function calculateMonthlyPayment(principal, annualRate, term) {
  const monthlyRate = annualRate / 1200;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
         (Math.pow(1 + monthlyRate, term) - 1);
}

export default router;