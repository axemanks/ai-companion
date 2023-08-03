// stripe

import Stripe from 'stripe';

// create new stripe instance
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: '2022-11-15',
    typescript: true,
});