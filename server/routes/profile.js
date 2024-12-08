import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Get user profile
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.patch('/', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't update password through this route

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 