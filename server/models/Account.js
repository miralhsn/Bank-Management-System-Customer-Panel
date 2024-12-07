import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['savings', 'checking', 'loan']
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'frozen'],
    default: 'active'
  },
  interestRate: {
    type: Number,
    default: 0
  },
  minimumBalance: {
    type: Number,
    default: 0
  },
  overdraftLimit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Account', accountSchema);