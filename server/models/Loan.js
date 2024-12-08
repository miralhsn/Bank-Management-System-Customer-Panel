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
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phoneNumber: {
      type: String,
      required: true
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
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  interestRate: {
    type: Number,
    required: true
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  totalPayment: {
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

// Calculate loan details before saving
loanSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('term') || this.isModified('type')) {
    // Calculate interest rate based on loan type and amount
    const baseRate = {
      personal: 12,
      auto: 8,
      home: 6
    }[this.type];

    // Adjust rate based on amount and term
    let rate = baseRate;
    if (this.amount > 100000) rate -= 0.5;
    if (this.term > 60) rate += 0.5;

    this.interestRate = rate;

    // Calculate monthly payment
    const monthlyRate = rate / 1200;
    this.monthlyPayment = (this.amount * monthlyRate * Math.pow(1 + monthlyRate, this.term)) / 
                         (Math.pow(1 + monthlyRate, this.term) - 1);

    // Calculate total payment
    this.totalPayment = this.monthlyPayment * this.term;
  }
  next();
});

export default mongoose.model('Loan', loanSchema);