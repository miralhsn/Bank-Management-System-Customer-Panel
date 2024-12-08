import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      notificationPreferences: {
        account: {
          email: true,
          sms: true,
          push: false
        },
        transactions: {
          email: true,
          sms: true,
          push: true
        },
        marketing: {
          email: false,
          sms: false,
          push: false
        }
      }
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update 2FA settings
router.post('/2fa/update', authenticate, async (req, res) => {
  try {
    const { enable, token } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Enabling 2FA
    if (enable && !user.twoFactorAuth.secret) {
      // Generate new secret
      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(user.email, 'ReliBank', secret);
      
      try {
        // Generate QR code
        const qrCode = await QRCode.toDataURL(otpauth);
        
        // Store secret temporarily
        user.twoFactorAuth.tempSecret = secret;
        await user.save();

        return res.json({
          message: 'Two-factor authentication setup initiated',
          qrCode,
          secret
        });
      } catch (error) {
        console.error('QR Code generation error:', error);
        return res.status(500).json({ message: 'Failed to generate QR code' });
      }
    }

    // Verifying and activating 2FA
    if (enable && user.twoFactorAuth.tempSecret && token) {
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorAuth.tempSecret
      });

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Activate 2FA
      user.twoFactorAuth.secret = user.twoFactorAuth.tempSecret;
      user.twoFactorAuth.enabled = true;
      user.twoFactorAuth.tempSecret = undefined;
      await user.save();

      return res.json({ message: 'Two-factor authentication enabled successfully' });
    }

    // Disabling 2FA
    if (!enable && user.twoFactorAuth.enabled) {
      if (!token) {
        return res.status(400).json({ message: 'Verification code required to disable 2FA' });
      }

      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorAuth.secret
      });

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Disable 2FA
      user.twoFactorAuth.secret = undefined;
      user.twoFactorAuth.enabled = false;
      user.twoFactorAuth.tempSecret = undefined;
      await user.save();

      return res.json({ message: 'Two-factor authentication disabled successfully' });
    }

    return res.status(400).json({ message: 'Invalid request' });
  } catch (error) {
    console.error('2FA update error:', error);
    res.status(500).json({ message: 'Failed to update 2FA settings' });
  }
});

// Verify 2FA token
router.post('/2fa/verify', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !user.twoFactorAuth.enabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorAuth.secret
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    res.json({ message: 'Verification successful' });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Failed to verify 2FA token' });
  }
});

export default router;