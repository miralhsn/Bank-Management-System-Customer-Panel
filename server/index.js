import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import transferRoutes from './routes/transfers.js';
import loanRoutes from './routes/loans.js';
import dashboardRoutes from './routes/dashboard.js';
import profileRoutes from './routes/profile.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Not Found',
    path: req.path
  });
});

const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

const startServer = async (retryCount = 0) => {
  try {
    // Check if MongoDB is installed
    try {
      await import('mongodb');
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', 'MongoDB driver not found. Please install MongoDB:');
      console.log('\x1b[36m%s\x1b[0m', '1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community');
      console.log('\x1b[36m%s\x1b[0m', '2. Run the installer and follow the installation steps');
      console.log('\x1b[36m%s\x1b[0m', '3. Make sure MongoDB service is running:');
      console.log('\x1b[36m%s\x1b[0m', '   - Windows: Open Services app and check if MongoDB is running');
      console.log('\x1b[36m%s\x1b[0m', '   - Mac/Linux: Run sudo service mongod start');
      process.exit(1);
    }

    // Connect to MongoDB
    const conn = await connectDB();
    
    if (!conn) {
      throw new Error('Failed to connect to MongoDB');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('\x1b[32m%s\x1b[0m', `Server running on port ${PORT}`);
      console.log('\x1b[32m%s\x1b[0m', `MongoDB connected to ${conn.connection.host}`);
      console.log('\x1b[32m%s\x1b[0m', `Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Server startup error:', error.message);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retry attempt ${retryCount + 1} of ${MAX_RETRIES} in ${RETRY_INTERVAL/1000} seconds...`);
      setTimeout(() => startServer(retryCount + 1), RETRY_INTERVAL);
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'Maximum retry attempts reached. Please:');
      console.log('\x1b[36m%s\x1b[0m', '1. Verify MongoDB is installed and running:');
      console.log('\x1b[36m%s\x1b[0m', '   - Windows: Open Services app and start MongoDB');
      console.log('\x1b[36m%s\x1b[0m', '   - Mac/Linux: Run sudo service mongod start');
      console.log('\x1b[36m%s\x1b[0m', '2. Check if MongoDB is running on the default port (27017)');
      console.log('\x1b[36m%s\x1b[0m', '3. Verify your MongoDB connection string in .env file');
      console.log('\x1b[36m%s\x1b[0m', '4. Try running mongod command in a new terminal');
      process.exit(1);
    }
  }
};

startServer();