import Stripe from 'stripe';
//import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
//import pkg from '@google/maps';
//const { Client } = pkg;

import { Onfido } from '@onfido/api';

// Initialize services only if API keys are present
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const mapsClient = process.env.GOOGLE_MAPS_API_KEY 
  ? new Client({ key: process.env.GOOGLE_MAPS_API_KEY })
  : null;

const onfidoClient = process.env.ONFIDO_API_KEY 
  ? new Onfido({ apiToken: process.env.ONFIDO_API_KEY })
  : null;

export {
  stripe,
  twilioClient,
  //sgMail,
  mapsClient,
  onfidoClient
};