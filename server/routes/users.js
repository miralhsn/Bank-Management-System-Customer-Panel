import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes should use authenticate middleware
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { phone, address } = req.body;

    // Find user by ID (attached to req.user by authenticate middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the phone and address fields if provided
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/security', authenticate, async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      twoFactorEnabled
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    if (typeof twoFactorEnabled === 'boolean') {
      user.twoFactorEnabled = twoFactorEnabled;
    }

    await user.save();
    res.json({ message: 'Security settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/notifications', authenticate, async (req, res) => {
  try {
    const { notificationPreferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = notificationPreferences;
    await user.save();
    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;