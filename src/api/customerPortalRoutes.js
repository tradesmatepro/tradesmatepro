// Customer Portal API Routes - Express routes for customer portal functionality
// This would typically be in a separate backend service, but included here for reference

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase } = require('../utils/supabase');

const router = express.Router();

// Middleware to validate customer portal session
const validatePortalSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    const { data: sessions, error } = await supabase
      .from('portal_sessions')
      .select('*, customer_portal_accounts(*)')
      .eq('session_token', token)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !sessions) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.customer = sessions.customer_portal_accounts;
    req.session = sessions;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
};

// Authentication Routes
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get portal account
    const { data: accounts, error: accountError } = await supabase
      .from('customer_portal_accounts')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (accountError || !accounts) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password if provided
    if (password && accounts.password_hash) {
      const isValid = await bcrypt.compare(password, accounts.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: sessionError } = await supabase
      .from('portal_sessions')
      .insert({
        customer_portal_account_id: accounts.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    if (sessionError) {
      throw sessionError;
    }

    // Update last login
    await supabase
      .from('customer_portal_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', accounts.id);

    // Log activity
    await supabase
      .from('portal_activity_log')
      .insert({
        customer_portal_account_id: accounts.id,
        action: 'login',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    res.json({
      success: true,
      account: accounts,
      sessionToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/auth/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    // Find customer portal account
    const { data: accounts, error } = await supabase
      .from('customer_portal_accounts')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !accounts) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store session
    const { error: sessionError } = await supabase
      .from('portal_sessions')
      .insert({
        customer_portal_account_id: accounts.id,
        session_token: token,
        expires_at: expiresAt.toISOString(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    if (sessionError) {
      throw sessionError;
    }

    // TODO: Send email with magic link
    // For now, return the token for testing
    res.json({
      success: true,
      token,
      expiresAt
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Failed to generate magic link' });
  }
});

// Data Routes (all require authentication)
router.get('/quotes', validatePortalSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_portal_quotes_v')
      .select('*')
      .eq('customer_id', req.customer.customer_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

router.get('/invoices', validatePortalSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_portal_invoices_v')
      .select('*')
      .eq('customer_id', req.customer.customer_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/jobs', validatePortalSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', req.customer.customer_id)
      .in('job_status', ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// E-Signature Routes
router.post('/quotes/:id/sign', validatePortalSession, async (req, res) => {
  try {
    const { id: quoteId } = req.params;
    const { signatureData } = req.body;

    // Get quote details
    const { data: quotes, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('customer_id', req.customer.customer_id)
      .single();

    if (quoteError || !quotes) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Create e-signature record
    const { data: signature, error: signatureError } = await supabase
      .from('esignatures')
      .insert({
        company_id: quotes.company_id,
        customer_id: quotes.customer_id,
        quote_id: quoteId,
        signed_by: signatureData.signed_by,
        signature_data: signatureData,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
      .select()
      .single();

    if (signatureError) throw signatureError;

    // Update quote status
    await supabase
      .from('quotes')
      .update({
        status: 'APPROVED',
        approved_at: new Date().toISOString()
      })
      .eq('id', quoteId);

    // Log activity
    await supabase
      .from('portal_activity_log')
      .insert({
        customer_portal_account_id: req.customer.id,
        action: 'quote_signed',
        resource_type: 'quote',
        resource_id: quoteId,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    res.json({ success: true, signature });
  } catch (error) {
    console.error('Error signing quote:', error);
    res.status(500).json({ error: 'Failed to sign quote' });
  }
});

// Service Request Routes
router.post('/service-requests', validatePortalSession, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      customer_id: req.customer.customer_id,
      status: 'open'
    };

    const { data, error } = await supabase
      .from('service_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase
      .from('portal_activity_log')
      .insert({
        customer_portal_account_id: req.customer.id,
        action: 'service_request_created',
        resource_type: 'service_request',
        resource_id: data.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    res.json(data);
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

router.get('/service-requests', validatePortalSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_requests_with_responses_v')
      .select('*')
      .eq('customer_id', req.customer.customer_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

// Messages Routes
router.get('/messages', validatePortalSession, async (req, res) => {
  try {
    const { service_request_id } = req.query;
    
    let query = supabase
      .from('messages')
      .select('*')
      .eq('customer_id', req.customer.customer_id);

    if (service_request_id) {
      query = query.eq('service_request_id', service_request_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/messages', validatePortalSession, async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      customer_id: req.customer.customer_id,
      portal_customer_id: req.customer.id
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
