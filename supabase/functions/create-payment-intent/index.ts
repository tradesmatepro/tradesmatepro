// Supabase Edge Function: create-payment-intent
// Purpose: Securely create Stripe Payment Intent for quote/invoice deposits
// Security: Stripe secret key stored in Supabase secrets (never exposed to frontend)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentIntentRequest {
  amount: number // Amount in dollars (will be converted to cents)
  currency?: string
  description?: string
  metadata?: {
    company_id?: string
    customer_id?: string
    work_order_id?: string
    invoice_id?: string
    type?: 'deposit' | 'invoice' | 'payment'
  }
}

interface PaymentIntentResponse {
  success: boolean
  clientSecret?: string
  paymentIntentId?: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe secret key from Supabase secrets
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured')
    }

    // Parse request body
    const requestData: PaymentIntentRequest = await req.json()
    const { amount, currency = 'usd', description, metadata } = requestData

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    console.log('💳 Creating Stripe Payment Intent:', {
      amount: amountInCents,
      currency,
      description,
      metadata
    })

    // Create Payment Intent via Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: currency,
        'automatic_payment_methods[enabled]': 'true',
        ...(description ? { description } : {}),
        ...(metadata ? Object.entries(metadata).reduce((acc, [key, value]) => {
          if (value) acc[`metadata[${key}]`] = value.toString()
          return acc
        }, {} as Record<string, string>) : {})
      })
    })

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json()
      console.error('❌ Stripe API error:', errorData)
      throw new Error(errorData.error?.message || 'Failed to create payment intent')
    }

    const paymentIntent = await stripeResponse.json()
    console.log('✅ Payment Intent created:', paymentIntent.id)

    // Log payment intent creation to database (optional)
    if (metadata?.company_id) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        await supabase.from('integration_logs').insert({
          company_id: metadata.company_id,
          integration_type: 'stripe',
          event_type: 'payment_intent_created',
          request_data: { amount, currency, description },
          response_data: { payment_intent_id: paymentIntent.id, status: paymentIntent.status },
          status: 'success',
          created_at: new Date().toISOString()
        })
      } catch (logError) {
        console.warn('Failed to log payment intent creation:', logError)
        // Don't fail the request if logging fails
      }
    }

    // Return client secret to frontend
    const response: PaymentIntentResponse = {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error creating payment intent:', error)
    
    const response: PaymentIntentResponse = {
      success: false,
      error: error.message || 'Failed to create payment intent'
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

