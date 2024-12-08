import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.post('/update', authenticate, async (req, res) => {
  try {
    const { name, email, phone, address, dateOfBirth } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only if provided
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    const updatedUser = await user.save();
    // Remove sensitive data
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.twoFactorAuth.secret;

    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get security settings
router.get('/security', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('twoFactorAuth securityQuestions');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      twoFactorEnabled: user.twoFactorAuth.enabled,
      twoFactorMethod: user.twoFactorAuth.method,
      securityQuestions: user.securityQuestions || []
    });
  } catch (error) {
    console.error('Get security settings error:', error);
    res.status(500).json({ message: 'Failed to fetch security settings' });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Update security questions
router.post('/security-questions', authenticate, async (req, res) => {
  try {
    const { securityQuestions } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate security questions
    if (!Array.isArray(securityQuestions) || securityQuestions.length !== 3) {
      return res.status(400).json({ message: 'Three security questions are required' });
    }

    for (const q of securityQuestions) {
      if (!q.question || !q.answer) {
        return res.status(400).json({ message: 'Question and answer are required for each security question' });
      }
    }

    user.securityQuestions = securityQuestions;
    await user.save();

    res.json({ message: 'Security questions updated successfully' });
  } catch (error) {
    console.error('Update security questions error:', error);
    res.status(500).json({ message: 'Failed to update security questions' });
  }
});

// Setup 2FA
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const { method } = req.body;

    if (!['authenticator', 'email'].includes(method)) {
      return res.status(400).json({ message: 'Invalid 2FA method' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (method === 'authenticator') {
      // Generate secret
      const secret = authenticator.generateSecret();
      
      // Save secret (unverified)
      user.twoFactorAuth = {
        ...user.twoFactorAuth,
        secret,
        method: 'authenticator',
        verified: false,
        enabled: false
      };
      await user.save();

      // Generate QR code
      const otpauth = authenticator.keyuri(
        user.email,
        'ReliBank',
        secret
      );
      const qrCode = await qrcode.toDataURL(otpauth);

      res.json({ qrCode });
    } else if (method === 'email') {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save code temporarily (expires in 10 minutes)
      user.twoFactorAuth = {
        ...user.twoFactorAuth,
        method: 'email',
        secret: verificationCode,
        verified: false,
        enabled: false,
        codeExpires: new Date(Date.now() + 10 * 60 * 1000)
      };
      await user.save();

      // Send verification email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'ReliBank - Email Verification Code',
        text: `Your verification code is: ${verificationCode}\nThis code will expire in 10 minutes.`,
        html: `
          <h2>ReliBank Email Verification</h2>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      });

      res.json({ message: 'Verification code sent to your email' });
    }
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ message: 'Failed to setup 2FA' });
  }
});

// Verify 2FA
router.post('/2fa/verify', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth.method) {
      return res.status(400).json({ message: '2FA not setup' });
    }

    let isValid = false;

    if (user.twoFactorAuth.method === 'authenticator') {
      // Verify authenticator code
      isValid = authenticator.verify({
        token: code,
        secret: user.twoFactorAuth.secret
      });
    } else if (user.twoFactorAuth.method === 'email') {
      // Verify email code
      isValid = user.twoFactorAuth.secret === code &&
                user.twoFactorAuth.codeExpires > new Date();
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Enable 2FA
    user.twoFactorAuth = {
      ...user.twoFactorAuth,
      enabled: true,
      verified: true,
      codeExpires: undefined
    };
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Failed to verify 2FA' });
  }
});

// Disable 2FA
router.post('/2fa/disable', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset 2FA settings
    user.twoFactorAuth = {
      enabled: false,
      method: null,
      secret: null,
      verified: false
    };
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
});

// Update notification preferences
router.post('/notifications', authenticate, async (req, res) => {
  try {
    const { notificationPreferences } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = notificationPreferences;
    await user.save();

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
});

export default router; 