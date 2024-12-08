import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

    // Connection options with better defaults for Windows
    const options = {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 2000
    };

    // Try different connection strings
    const connectionStrings = [
      'mongodb://127.0.0.1:27017/bankingapp',
      'mongodb://localhost:27017/bankingapp',
      process.env.MONGO_URI
    ].filter(Boolean); // Remove any undefined/null values

    let lastError = null;
    
    // Try each connection string
    for (const uri of connectionStrings) {
      try {
        console.log(`Attempting to connect to MongoDB at ${uri}...`);
        const conn = await mongoose.connect(uri, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        return conn;
      } catch (error) {
        console.log(`Failed to connect to ${uri}:`, error.message);
        lastError = error;
        // Continue to next connection string
        continue;
      }
    }

    // If we get here, all connection attempts failed
    throw lastError || new Error('All MongoDB connection attempts failed');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Return null to indicate connection failure
    return null;
  }
};

// Add connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Handle process termination
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

export default connectDB;