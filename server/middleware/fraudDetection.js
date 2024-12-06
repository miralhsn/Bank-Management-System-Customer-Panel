// Simplified fraud detection middleware
export const detectFraud = async (req, res, next) => {
  try {
    // Implement your fraud detection logic here
    // For now, we'll just pass through
    next();
  } catch (error) {
    res.status(400).json({ message: 'Transaction flagged for fraud' });
  }
};