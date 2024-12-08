import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,
  securityQuestions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }],
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['email', 'authenticator', 'sms', null],
      default: null
    },
    secret: String,
    verified: {
      type: Boolean,
      default: false
    },
    codeExpires: Date,
    backupCodes: [String]
  },
  notificationPreferences: {
    account: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    transactions: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    marketing: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLogin: {
    timestamp: Date,
    ip: String,
    userAgent: String
  },
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    lockUntil: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = new Date();
  
  if (this.loginAttempts.count >= 5) {
    this.loginAttempts.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  await this.save();
};

// Method to generate backup codes
userSchema.methods.generateBackupCodes = async function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 15).toUpperCase();
    codes.push(code);
  }
  this.twoFactorAuth.backupCodes = codes;
  await this.save();
  return codes;
};

// Method to verify backup code
userSchema.methods.verifyBackupCode = async function(code) {
  const index = this.twoFactorAuth.backupCodes.indexOf(code);
  if (index === -1) return false;
  
  // Remove used backup code
  this.twoFactorAuth.backupCodes.splice(index, 1);
  await this.save();
  return true;
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = {
    count: 0,
    lastAttempt: null,
    lockUntil: null
  };
  await this.save();
};

export default mongoose.model('User', userSchema);