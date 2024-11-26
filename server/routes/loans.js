import express from 'express';
import Loan from '../models/Loan.js';

const router = express.Router();

// Submit loan application
router.post('/apply', async (req, res) => {
  try {
    const {
      type,
      amount,
      interestRate,
      term,
      monthlyPayment,
      documents
    } = req.body;

    const loan = new Loan({
      userId: req.user.id,
      type,
      amount,
      interestRate,
      term,
      monthlyPayment,
      documents
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get loan applications
router.get('/applications', async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id })
      .sort({ applicationDate: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get loan application status
router.get('/status/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;