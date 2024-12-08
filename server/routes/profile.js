import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.js';
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

    // Validate input
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Invalid enabled value' });
    }

    if (enabled && !['sms', 'email', 'authenticator'].includes(method)) {
      return res.status(400).json({ message: 'Invalid 2FA method' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update 2FA settings
    user.twoFactorAuth = {
      enabled,
      method: enabled ? method : null,
      verified: false // Reset verification status when changing settings
    };

    await user.save();
    
    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: '2FA settings updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('2FA update error:', error);
    res.status(500).json({ message: 'Failed to update 2FA settings' });
  }
});

// Get security settings
router.get('/security', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      twoFactorAuth: user.twoFactorAuth,
      lastLogin: user.lastLogin,
      securityQuestions: user.securityQuestions?.length || 0
    });
  } catch (error) {
    console.error('Get security settings error:', error);
    res.status(500).json({ message: 'Failed to load security settings' });
  }
});

// Update security settings
router.patch('/security', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, securityQuestions } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update security questions if provided
    if (securityQuestions && Array.isArray(securityQuestions)) {
      // Validate security questions
      if (securityQuestions.some(q => !q.question || !q.answer)) {
        return res.status(400).json({ message: 'Invalid security questions format' });
      }

      user.securityQuestions = securityQuestions;
    }

    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.securityQuestions;

    res.json({
      message: 'Security settings updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({ message: 'Failed to update security settings' });
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