import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
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
  category: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  transferDetails: {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    },
    transferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    },
    externalAccount: {
      accountNumber: String,
      bankName: String,
      accountHolderName: String,
      routingNumber: String
    }
  },
  metadata: {
    ip: String,
    location: String,
    deviceInfo: String
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

// Create transactions for a transfer
transactionSchema.statics.createTransferTransactions = async function(transferData) {
  const { fromAccount, toAccount, amount, type, description, status, userId, transferId, externalAccount } = transferData;

  const transactions = [];

  // Debit transaction from source account
  const debitTransaction = new this({
    accountId: fromAccount,
    userId,
    type: 'debit',
    amount,
    category: 'transfer',
    description: description || 'Transfer sent',
    status,
    transferDetails: {
      fromAccount,
      toAccount,
      transferId,
      externalAccount
    }
  });

  transactions.push(debitTransaction);

  // Credit transaction for internal transfers
  if (toAccount && type === 'internal') {
    const creditTransaction = new this({
      accountId: toAccount,
      userId,
      type: 'credit',
      amount,
      category: 'transfer',
      description: description || 'Transfer received',
      status,
      transferDetails: {
        fromAccount,
        toAccount,
        transferId
      }
    });
    transactions.push(creditTransaction);
  }

  return transactions;
};

export default mongoose.model('Transaction', transactionSchema);