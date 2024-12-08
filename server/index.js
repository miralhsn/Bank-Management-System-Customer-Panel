import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import accountRoutes from './routes/accounts.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import transferRoutes from './routes/transfers.js';
import loanRoutes from './routes/loans.js';
import userRoutes from './routes/users.js';
import { startScheduler } from './utils/scheduledTransfers.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import testRoutes from './routes/test.js';
import profileRoutes from './routes/profile.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the scheduler
startScheduler();

// Monitor MongoDB connection
setInterval(async () => {
  try {
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    console.error('MongoDB connection lost:', error);
    process.exit(1);
  }
}, 30000); // Check every 30 seconds

// Add MongoDB connection monitoring
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB shutdown:', err);
    process.exit(1);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;