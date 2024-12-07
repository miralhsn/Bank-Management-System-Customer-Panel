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
    ref: 'Account',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['internal', 'external', 'wire']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'scheduled'],
    default: 'pending'
  },
  description: String,
  scheduledDate: Date,
  recurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() {
      return this.recurring;
    }
  },
  nextExecutionDate: Date
}, {
  timestamps: true
});

export default mongoose.model('Transfer', transferSchema);