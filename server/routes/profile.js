import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/authenticate.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/', authenticate, async (req, res) => {
  try {
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

// Update personal information
router.patch('/', authenticate, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();
    
    // Remove sensitive information before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update 2FA settings
router.post('/2fa', authenticate, async (req, res) => {
  try {
    const { enabled, method } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.twoFactorAuth = {
      enabled,
      method,
      verified: enabled ? true : false // In a real app, you'd want to verify the 2FA setup
    };

    await user.save();
    res.json({ message: '2FA settings updated successfully' });
  } catch (error) {
    console.error('2FA update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update notification preferences
router.patch('/notifications', authenticate, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = preferences;
    await user.save();

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 