import mongoose from 'mongoose';
import Transaction from './Transaction.js';

const transferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  externalAccount: {
    accountNumber: String,
    bankName: String,
    accountHolderName: String,
    routingNumber: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  type: {
    type: String,
    enum: ['internal', 'external'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: String,
  scheduledDate: Date,
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    endDate: Date
  },
  reference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique reference before saving
transferSchema.pre('save', async function(next) {
  if (!this.reference) {
    const date = new Date();
    const randomNum = Math.floor(Math.random() * 1000000);
    this.reference = `TRF${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${randomNum}`;
  }
  next();
});

// Create transaction records after transfer is saved
transferSchema.post('save', async function(doc) {
  try {
    // Only create transactions for completed transfers
    if (doc.status === 'completed') {
      const transactions = await Transaction.createTransferTransactions({
        fromAccount: doc.fromAccount,
        toAccount: doc.toAccount,
        amount: doc.amount,
        type: doc.type,
        description: doc.description,
        status: 'completed',
        userId: doc.userId,
        transferId: doc._id,
        externalAccount: doc.externalAccount
      });

      await Promise.all(transactions.map(transaction => transaction.save()));
    }
  } catch (error) {
    console.error('Error creating transfer transactions:', error);
  }
});

export default mongoose.model('Transfer', transferSchema);