import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const sendEmail = async (to, subject, text) => {
  // Implement email sending logic
  console.log('Email sent:', { to, subject, text });
};

export const sendSMS = async (to, message) => {
  // Implement SMS sending logic
  console.log('SMS sent:', { to, message });
};