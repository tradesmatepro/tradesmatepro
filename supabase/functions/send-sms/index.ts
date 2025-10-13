// Supabase Edge Function: send-sms
// Purpose: Securely send SMS via Twilio API
// Security: Credentials stored in Supabase secrets (never exposed to frontend)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Twilio API endpoint
const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01/Accounts'

interface SMSRequest {
  to: string
  message: string
  companyId: string
  userId?: string
  relatedType?: 'quote' | 'job' | 'invoice' | 'custom'
  relatedId?: string
}

interface SMSResponse {
  success: boolean
  messageSid?: string
  error?: string
  cost?: string
  status?: string
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Twilio credentials from environment (Supabase secrets)
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

    // Support both Auth Token and API Key authentication
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_API_KEY_SID = Deno.env.get('TWILIO_API_KEY_SID')
    const TWILIO_API_KEY_SECRET = Deno.env.get('TWILIO_API_KEY_SECRET')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_PHONE_NUMBER in Supabase secrets.')
    }

    // Determine which authentication method to use
    let authUsername: string
    let authPassword: string

    if (TWILIO_API_KEY_SID && TWILIO_API_KEY_SECRET) {
      // Use API Key authentication (more secure, recommended)
      authUsername = TWILIO_API_KEY_SID
      authPassword = TWILIO_API_KEY_SECRET
      console.log('🔑 Using Twilio API Key authentication')
    } else if (TWILIO_AUTH_TOKEN) {
      // Fallback to Auth Token authentication
      authUsername = TWILIO_ACCOUNT_SID
      authPassword = TWILIO_AUTH_TOKEN
      console.log('🔑 Using Twilio Auth Token authentication')
    } else {
      throw new Error('Twilio authentication not configured. Please set either TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET or TWILIO_AUTH_TOKEN in Supabase secrets.')
    }

    // Parse request body
    const body: SMSRequest = await req.json()
    const { to, message, companyId, userId, relatedType, relatedId } = body

    // Validate required fields
    if (!to || !message || !companyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, message, companyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(to)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number format. Use E.164 format (e.g., +15551234567)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check rate limits (max 10 SMS per minute per company)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const { count: recentCount } = await supabase
      .from('integration_logs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('integration_type', 'twilio')
      .eq('action', 'send_sms')
      .gte('created_at', oneMinuteAgo)

    if (recentCount && recentCount >= 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Maximum 10 SMS per minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare Twilio API request
    const twilioUrl = `${TWILIO_API_URL}/${TWILIO_ACCOUNT_SID}/Messages.json`
    const twilioAuth = btoa(`${authUsername}:${authPassword}`)

    const twilioBody = new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: message
    })

    // Send SMS via Twilio API
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: twilioBody.toString()
    })

    const twilioData = await twilioResponse.json()

    // Check if Twilio request was successful
    if (!twilioResponse.ok) {
      // Log failed attempt
      await supabase.from('integration_logs').insert({
        company_id: companyId,
        user_id: userId,
        integration_type: 'twilio',
        action: 'send_sms',
        status: 'failed',
        request_data: { to, message: message.substring(0, 100) },
        response_data: twilioData,
        error_message: twilioData.message || 'Unknown Twilio error'
      })

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: twilioData.message || 'Failed to send SMS via Twilio',
          details: twilioData
        }),
        { status: twilioResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful SMS
    await supabase.from('integration_logs').insert({
      company_id: companyId,
      user_id: userId,
      integration_type: 'twilio',
      action: 'send_sms',
      status: 'success',
      request_data: { 
        to, 
        message: message.substring(0, 100),
        related_type: relatedType,
        related_id: relatedId
      },
      response_data: {
        message_sid: twilioData.sid,
        status: twilioData.status,
        price: twilioData.price,
        price_unit: twilioData.price_unit
      }
    })

    // Return success response
    const response: SMSResponse = {
      success: true,
      messageSid: twilioData.sid,
      status: twilioData.status,
      cost: twilioData.price ? `${twilioData.price} ${twilioData.price_unit}` : undefined
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-sms function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

