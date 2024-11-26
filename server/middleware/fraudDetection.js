// Simplified fraud detection middleware
export const detectFraud = async (req, res, next) => {
  try {
    // Basic fraud check implementation
    const { amount } = req.body;
    
    // Example: Flag transactions over $10,000 as high risk
    if (amount > 10000) {
      return res.status(403).json({ 
        message: 'Transaction flagged as potentially fraudulent'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};