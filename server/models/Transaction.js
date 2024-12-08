import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'other'],
    default: 'other'
  },
  recipientInfo: {
    name: String,
    accountNumber: String,
    bankName: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  reference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique reference number before saving
transactionSchema.pre('save', async function(next) {
  if (!this.reference) {
    const date = new Date();
    const randomNum = Math.floor(Math.random() * 1000000);
    this.reference = `TXN${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${randomNum}`;
  }
  next();
});

export default mongoose.model('Transaction', transactionSchema);