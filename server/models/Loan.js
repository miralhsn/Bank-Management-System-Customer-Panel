import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'auto', 'home'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  term: {
    type: Number, // in months
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  purpose: String,
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  employmentDetails: {
    employer: String,
    position: String,
    monthlyIncome: Number,
    employmentDuration: Number // in months
  },
  creditScore: Number,
  applicationDate: {
    type: Date,
    default: Date.now
  },
  reviewNotes: [{
    note: String,
    addedBy: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate monthly payment before saving
loanSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('term') || this.isModified('interestRate')) {
    const P = this.amount;
    const r = this.interestRate / 1200; // monthly interest rate
    const n = this.term; // number of months
    this.monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  next();
});

export default mongoose.model('Loan', loanSchema);