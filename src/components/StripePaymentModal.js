import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripeService from '../services/StripeService';

/**
 * StripePaymentModal - Secure payment processing for quotes and invoices
 * 
 * Security:
 * - Uses Stripe Elements for PCI compliance
 * - Secret key never exposed to frontend
 * - All sensitive operations via Edge Function
 * - Beta mode badge for filtering
 */

// Payment Form Component (inside Stripe Elements context)
const PaymentForm = ({ amount, onSuccess, onCancel, metadata, billingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required'
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', result.paymentIntent.id);
        onSuccess({
          paymentIntentId: result.paymentIntent.id,
          status: result.paymentIntent.status,
          amount: result.paymentIntent.amount / 100
        });
      } else {
        setError('Payment was not successful. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Amount Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Amount to Pay:</span>
          <span className="text-lg font-bold text-blue-900">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <LockClosedIcon className="w-4 h-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>

      {/* Security Badge */}
      <div className="text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <LockClosedIcon className="w-3 h-3" />
          Secured by Stripe • PCI Compliant
        </p>
      </div>
    </form>
  );
};

// Main Modal Component
const StripePaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  onSuccess,
  metadata = {},
  billingDetails = {},
  title = 'Payment'
}) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [isBetaMode, setIsBetaMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializePayment();
    }
  }, [isOpen, amount]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if beta mode
      const betaMode = process.env.REACT_APP_STRIPE_BETA_MODE === 'true';
      setIsBetaMode(betaMode);

      // Get publishable key from env
      const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('Stripe publishable key not configured');
      }

      // Initialize Stripe
      const stripe = await stripeService.initialize(publishableKey);
      setStripePromise(Promise.resolve(stripe));

      // Create Payment Intent via Edge Function
      const paymentIntent = await stripeService.createPaymentIntent(amount, metadata);
      setClientSecret(paymentIntent.clientSecret);

      setLoading(false);
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleSuccess = (paymentResult) => {
    onSuccess(paymentResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {isBetaMode && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  Beta
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing secure payment...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          ) : clientSecret && stripePromise ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
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
                }
              }}
            >
              <PaymentForm
                amount={amount}
                onSuccess={handleSuccess}
                onCancel={onClose}
                metadata={metadata}
                billingDetails={billingDetails}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;

