// StripeService.js - Frontend service for Stripe payment processing
// Security: Only uses publishable key (safe to expose in frontend)
// Secret key is NEVER exposed - all sensitive operations go through Edge Function

import { loadStripe } from '@stripe/stripe-js';
import { getSupabaseClient } from '../utils/supabaseClient';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

class StripeService {
  constructor() {
    this.stripe = null;
    this.publishableKey = null;
  }

  /**
   * Initialize Stripe with publishable key
   * @param {string} publishableKey - Stripe publishable key (pk_live_... or pk_test_...)
   */
  async initialize(publishableKey) {
    if (!publishableKey) {
      throw new Error('Stripe publishable key is required');
    }

    if (!publishableKey.startsWith('pk_')) {
      throw new Error('Invalid Stripe publishable key format');
    }

    this.publishableKey = publishableKey;
    this.stripe = await loadStripe(publishableKey);
    
    if (!this.stripe) {
      throw new Error('Failed to load Stripe');
    }

    console.log('✅ Stripe initialized successfully');
    return this.stripe;
  }

  /**
   * Create Payment Intent via secure Edge Function
   * @param {number} amount - Amount in dollars
   * @param {object} metadata - Payment metadata
   * @returns {Promise<object>} Payment Intent with client secret
   */
  async createPaymentIntent(amount, metadata = {}) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      console.log('💳 Creating payment intent:', { amount, metadata });

      // Get current user session for auth
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Call Edge Function to create Payment Intent (secret key stays server-side)
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      
      if (!data.success || !data.clientSecret) {
        throw new Error(data.error || 'Invalid payment intent response');
      }

      console.log('✅ Payment intent created:', data.paymentIntentId);
      return data;

    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment with Stripe Elements
   * @param {string} clientSecret - Payment Intent client secret
   * @param {object} elements - Stripe Elements instance
   * @param {object} billingDetails - Customer billing details
   * @returns {Promise<object>} Payment confirmation result
   */
  async confirmPayment(clientSecret, elements, billingDetails = {}) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized. Call initialize() first.');
      }

      console.log('💳 Confirming payment...');

      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required' // Don't redirect, handle in-app
      });

      if (error) {
        console.error('❌ Payment confirmation error:', error);
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100 // Convert cents to dollars
        };
      } else {
        console.warn('⚠️ Payment not succeeded:', paymentIntent.status);
        return {
          success: false,
          status: paymentIntent.status,
          error: `Payment status: ${paymentIntent.status}`
        };
      }

    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Create Stripe Elements instance
   * @param {object} options - Elements options
   * @returns {object} Stripe Elements instance
   */
  createElements(options = {}) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized. Call initialize() first.');
    }

    const defaultOptions = {
      mode: 'payment',
      currency: 'usd',
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#ffffff',
          colorText: '#1F2937',
          colorDanger: '#EF4444',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '6px'
        }
      },
      ...options
    };

    return this.stripe.elements(defaultOptions);
  }

  /**
   * Check if Stripe is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return !!this.stripe;
  }

  /**
   * Get publishable key (safe to expose)
   * @returns {string}
   */
  getPublishableKey() {
    return this.publishableKey;
  }
}

// Export singleton instance
const stripeService = new StripeService();
export default stripeService;

