import express from 'express';
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import { stripe } from '../config/services.js';
import { detectFraud } from '../middleware/fraudDetection.js';
import { sendEmail, sendSMS } from '../config/services.js';

const router = express.Router();

// Create a new transfer with Stripe integration
router.post('/', detectFraud, async (req, res) => {
  try {
    const {
      fromAccount,
      toAccount,
      amount,
      type,
      description,
      currency = 'USD'
    } = req.body;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      payment_method_types: ['card'],
    });

    const transfer = new Transfer({
      userId: req.user.id,
      fromAccount,
      toAccount,
      amount,
      type,
      description,
      stripePaymentIntentId: paymentIntent.id
    });

    await transfer.save();

    // Send notifications
    await Promise.all([
      sendEmail(req.user.email, 'Transfer Initiated', 
        `Your transfer of ${amount} ${currency} has been initiated.`),
      sendSMS(req.user.phone, 
        `ReliPay: Transfer of ${amount} ${currency} initiated.`)
    ]);

    res.status(201).json({
      transfer,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;