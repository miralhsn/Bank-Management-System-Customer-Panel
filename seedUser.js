import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './server/models/User.js' // Adjust the path to your User model

dotenv.config();

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const passwordHash = await bcrypt.hash('password123', 10);
    const newUser = new User({
      firstName: 'Alex',
      lastName: 'Smith',
      email: 'alex@gmail.com',
      password: passwordHash,
    });

    await newUser.save();
    console.log('User seeded:', newUser);
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedUser();
