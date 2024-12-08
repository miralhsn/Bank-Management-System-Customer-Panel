import mongoose from 'mongoose';

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

export default mongoose.model('Transfer', transferSchema);