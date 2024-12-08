import mongoose from 'mongoose';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      }
    });

    // Create test accounts
    const accounts = await Account.create([
      {
        userId: user._id,
        accountType: 'savings',
        balance: 5000,
        accountNumber: '1234567890',
        currency: 'USD',
        status: 'active',
        interestRate: 2.5
      },
      {
        userId: user._id,
        accountType: 'checking',
        balance: 2500,
        accountNumber: '0987654321',
        currency: 'USD',
        status: 'active'
      }
    ]);

    // Create test transactions
    await Transaction.create([
      {
        accountId: accounts[0]._id,
        type: 'credit',
        amount: 1000,
        description: 'Initial deposit',
        category: 'deposit',
        status: 'completed'
      },
      {
        accountId: accounts[1]._id,
        type: 'debit',
        amount: 500,
        description: 'ATM withdrawal',
        category: 'withdrawal',
        status: 'completed'
      }
    ]);

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 