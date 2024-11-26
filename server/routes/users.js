import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Update personal information
router.put('/profile', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.address = address;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update security settings
router.put('/security', async (req, res) => {
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

// Update notification preferences
router.put('/notifications', async (req, res) => {
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