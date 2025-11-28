import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe operations will fail.')
}

export const stripe = secretKey ? new Stripe(secretKey, { apiVersion: '2024-04-10' }) : null


