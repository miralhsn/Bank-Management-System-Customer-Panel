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
      truthfulnessDeclaration
    } = req.body;

    // Validate required fields
    if (!termsAccepted || !truthfulnessDeclaration) {
      return res.status(400).json({
        message: 'You must accept the terms and truthfulness declaration'
      });
    }

    const loan = new Loan({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      term: parseInt(term),
      purpose,
      employmentDetails,
      personalDetails,
      financialDetails,
      references,
      termsAccepted,
      truthfulnessDeclaration
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

    // Terms and Declarations
    doc.fontSize(14).text('Terms and Declarations');
    doc.fontSize(12);
    doc.text('By submitting this application, I declare that:');
    doc.text('1. All information provided in this application is true and accurate.');
    doc.text('2. I understand that providing false information may result in legal consequences.');
    doc.text('3. I authorize ReliBank to verify all information provided.');
    doc.text('4. I agree to the terms and conditions of the loan agreement.');
    doc.moveDown();

    doc.text(`Terms Accepted: ${loan.termsAccepted ? 'Yes' : 'No'}`);
    doc.text(`Truthfulness Declared: ${loan.truthfulnessDeclaration ? 'Yes' : 'No'}`);
    doc.moveDown();

    // Footer
    doc.fontSize(10).text('This is a computer-generated document and does not require a signature.', {
      align: 'center'
    });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate loan PDF error:', error);
    res.status(500).json({ message: 'Failed to generate loan PDF' });
  }
});

// Calculate loan details (for calculator)
router.post('/calculate', authenticate, (req, res) => {
  try {
    const { type, amount, term } = req.body;
    
    // Calculate interest rate based on loan type and amount
    const baseRate = {
      personal: 12,
      auto: 8,
      home: 6
    }[type];

    // Adjust rate based on amount and term
    let rate = baseRate;
    if (amount > 100000) rate -= 0.5;
    if (term > 60) rate += 0.5;

    // Calculate monthly payment
    const monthlyRate = rate / 1200;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                          (Math.pow(1 + monthlyRate, term) - 1);

    // Calculate total payment
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    res.json({
      monthlyPayment,
      totalPayment,
      totalInterest,
      interestRate: rate
    });
  } catch (error) {
    console.error('Loan calculation error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;