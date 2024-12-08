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
    min: 1000
  },
  term: {
    type: Number,
    required: true,
    min: 6,
    max: 360
  },
  purpose: {
    type: String,
    required: true
  },
  employmentDetails: {
    employerName: {
      type: String,
      required: true
    },
    jobTitle: {
      type: String,
      required: true
    },
    monthlyIncome: {
      type: Number,
      required: true
    },
    employmentDuration: {
      type: Number,
      required: true
    }
  },
  personalDetails: {
    fullName: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  financialDetails: {
    monthlyExpenses: {
      type: Number,
      required: true
    },
    existingLoans: {
      type: Number,
      default: 0
    },
    creditScore: {
      type: Number,
      min: 300,
      max: 850
    }
  },
  references: [{
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  }],
  termsAccepted: {
    type: Boolean,
    required: true
  },
  truthfulnessDeclaration: {
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  totalPayment: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  notes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,
  reviewNotes: String
}, {
  timestamps: true
});

export default mongoose.model('Loan', loanSchema);