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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique account number before saving
accountSchema.pre('save', async function(next) {
  if (!this.accountNumber) {
    let isUnique = false;
    let randomNum;
    
    // Keep trying until we get a unique account number
    while (!isUnique) {
      randomNum = Math.floor(Math.random() * 9000000000) + 1000000000;
      const existingAccount = await mongoose.model('Account').findOne({
        accountNumber: randomNum.toString()
      });
      if (!existingAccount) {
        isUnique = true;
      }
    }
    
    this.accountNumber = randomNum.toString();
  }
  next();
});

export default mongoose.model('Account', accountSchema);