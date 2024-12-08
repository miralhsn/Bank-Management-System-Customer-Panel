import express from 'express';
import Loan from '../models/Loan.js';
import { authenticate } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Apply for a loan
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      type,
      amount,
      term,
      purpose,
      employmentDetails,
      personalDetails,
      financialDetails,
      references,
      termsAccepted,
      truthfulnessDeclaration,
      monthlyPayment,
      totalPayment,
      interestRate
    } = req.body;

    // Validate required fields
    if (!termsAccepted || !truthfulnessDeclaration) {
      return res.status(400).json({
        message: 'You must accept the terms and truthfulness declaration'
      });
    }

    // Create new loan application
    const loan = new Loan({
      userId: req.user._id,
      type,
      amount: Number(amount),
      term: Number(term),
      purpose,
      employmentDetails: {
        employerName: employmentDetails.employerName,
        jobTitle: employmentDetails.jobTitle,
        monthlyIncome: Number(employmentDetails.monthlyIncome),
        employmentDuration: Number(employmentDetails.employmentDuration)
      },
      personalDetails: {
        fullName: personalDetails.fullName,
        dateOfBirth: new Date(personalDetails.dateOfBirth),
        phoneNumber: personalDetails.phoneNumber,
        address: personalDetails.address
      },
      financialDetails: {
        monthlyExpenses: Number(financialDetails.monthlyExpenses),
        existingLoans: Number(financialDetails.existingLoans),
        creditScore: Number(financialDetails.creditScore)
      },
      references,
      termsAccepted,
      truthfulnessDeclaration,
      monthlyPayment: Number(monthlyPayment),
      totalPayment: Number(totalPayment),
      interestRate: Number(interestRate),
      status: 'pending'
    });

    // Save the loan application
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

// Get specific loan details
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

// Get loan details and generate PDF
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const loan = await Loan.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'name email');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=loan-application-${loan._id}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Loan Application Details', { align: 'center' });
    doc.moveDown();

    // Add bank logo and details
    doc.fontSize(16).text('ReliBank', { align: 'center' });
    doc.fontSize(12).text('Your Trusted Financial Partner', { align: 'center' });
    doc.moveDown();

    // Application Details
    doc.fontSize(14).text('Application Details');
    doc.fontSize(12);
    doc.text(`Application ID: ${loan._id}`);
    doc.text(`Date: ${new Date(loan.applicationDate).toLocaleDateString()}`);
    doc.text(`Status: ${loan.status.toUpperCase()}`);
    doc.moveDown();

    // Loan Details
    doc.fontSize(14).text('Loan Details');
    doc.fontSize(12);
    doc.text(`Type: ${loan.type.toUpperCase()}`);
    doc.text(`Amount: $${loan.amount.toLocaleString()}`);
    doc.text(`Term: ${loan.term} months`);
    doc.text(`Purpose: ${loan.purpose}`);
    doc.text(`Interest Rate: ${loan.interestRate}%`);
    doc.text(`Monthly Payment: $${loan.monthlyPayment.toFixed(2)}`);
    doc.text(`Total Payment: $${loan.totalPayment.toFixed(2)}`);
    doc.moveDown();

    // Personal Details
    doc.fontSize(14).text('Personal Information');
    doc.fontSize(12);
    doc.text(`Full Name: ${loan.personalDetails.fullName}`);
    doc.text(`Date of Birth: ${new Date(loan.personalDetails.dateOfBirth).toLocaleDateString()}`);
    doc.text(`Phone: ${loan.personalDetails.phoneNumber}`);
    doc.moveDown();

    // Address
    doc.text('Address:');
    doc.text(loan.personalDetails.address.street);
    doc.text(`${loan.personalDetails.address.city}, ${loan.personalDetails.address.state} ${loan.personalDetails.address.zipCode}`);
    doc.text(loan.personalDetails.address.country);
    doc.moveDown();

    // Employment Details
    doc.fontSize(14).text('Employment Information');
    doc.fontSize(12);
    doc.text(`Employer: ${loan.employmentDetails.employerName}`);
    doc.text(`Position: ${loan.employmentDetails.jobTitle}`);
    doc.text(`Monthly Income: $${loan.employmentDetails.monthlyIncome.toLocaleString()}`);
    doc.text(`Employment Duration: ${loan.employmentDetails.employmentDuration} months`);
    doc.moveDown();

    // Financial Details
    doc.fontSize(14).text('Financial Information');
    doc.fontSize(12);
    doc.text(`Monthly Expenses: $${loan.financialDetails.monthlyExpenses.toLocaleString()}`);
    doc.text(`Existing Loans: $${loan.financialDetails.existingLoans.toLocaleString()}`);
    doc.text(`Credit Score: ${loan.financialDetails.creditScore}`);
    doc.moveDown();

    // References
    if (loan.references && loan.references.length > 0) {
      doc.fontSize(14).text('References');
      doc.fontSize(12);
      loan.references.forEach((ref, index) => {
        doc.text(`Reference ${index + 1}:`);
        doc.text(`Name: ${ref.name}`);
        doc.text(`Relationship: ${ref.relationship}`);
        doc.text(`Phone: ${ref.phoneNumber}`);
        doc.text(`Email: ${ref.email}`);
        doc.moveDown();
      });
    }

    // Declarations
    doc.fontSize(14).text('Declarations');
    doc.fontSize(12);
    doc.text(`Terms Accepted: ${loan.termsAccepted ? 'Yes' : 'No'}`);
    doc.text(`Truthfulness Declaration: ${loan.truthfulnessDeclaration ? 'Yes' : 'No'}`);

    // End the PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Calculate loan details (for calculator)
router.post('/calculate', authenticate, (req, res) => {
  try {
    const { type, amount, term } = req.body;
    
    // Validate inputs
    const principal = Number(amount);
    const termMonths = Number(term);

    if (isNaN(principal) || isNaN(termMonths) || principal <= 0 || termMonths <= 0) {
      return res.status(400).json({ message: 'Invalid amount or term' });
    }

    // Calculate interest rate based on loan type and amount
    const baseRate = {
      personal: 12,
      auto: 8,
      home: 6
    }[type] || 12;

    // Adjust rate based on amount and term
    let rate = baseRate;
    if (principal > 100000) rate -= 0.5;
    if (termMonths > 60) rate += 0.5;

    // Calculate monthly payment
    const monthlyRate = rate / 1200;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);

    // Calculate total payment
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - principal;

    res.json({
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      interestRate: Number(rate.toFixed(2))
    });
  } catch (error) {
    console.error('Loan calculation error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;