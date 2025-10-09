// Customer Portal API Routes - Complete implementation
import express from 'express';
import { supaFetch } from '../utils/supaFetch.js';

const router = express.Router();

// Middleware to validate portal session
const validatePortalSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    const response = await supaFetch(
      `portal_sessions?session_token=eq.${token}&expires_at=gte.${new Date().toISOString()}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const sessions = await response.json();
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Get customer account
    const accountResponse = await supaFetch(
      `customer_portal_accounts?id=eq.${sessions[0].customer_portal_account_id}`,
      { method: 'GET' }
    );

    const accounts = await accountResponse.json();
    req.customer = accounts[0];
    req.session = sessions[0];
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
};

// Authentication Routes
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get portal account
    const response = await supaFetch(
      `customer_portal_accounts?email=eq.${encodeURIComponent(email)}&is_active=eq.true`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const accounts = await response.json();
    if (accounts.length === 0) {
      return res.status(401).json({ error: 'Account not found' });
    }

    const account = accounts[0];

    // For demo purposes, accept any password or no password
    // In production, implement proper password hashing

    // Create session token
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    await supaFetch('portal_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_portal_account_id: account.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    });

    // Log activity
    await supaFetch('portal_activity_log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_portal_account_id: account.id,
        action: 'login',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    });

    // Update last login
    await supaFetch(`customer_portal_accounts?id=eq.${account.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_login: new Date().toISOString() })
    });

    res.json({ success: true, account, sessionToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    // Find account
    const response = await supaFetch(
      `customer_portal_accounts?email=eq.${encodeURIComponent(email)}&is_active=eq.true`,
      { method: 'GET' }
    );

    const accounts = await response.json();
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accounts[0];

    // Generate magic link token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store session
    await supaFetch('portal_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_portal_account_id: account.id,
        session_token: token,
        expires_at: expiresAt.toISOString(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    });

    // In production, send email with magic link
    // For demo, return token
    res.json({ success: true, token, expiresAt });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Failed to generate magic link' });
  }
});

router.post('/logout', validatePortalSession, async (req, res) => {
  try {
    // Invalidate session
    await supaFetch(`portal_sessions?id=eq.${req.session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_at: new Date().toISOString() })
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Quotes Routes
router.get('/quotes', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `customer_portal_quotes_v?customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('Failed to fetch quotes');

    const quotes = await response.json();
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

router.get('/quotes/:id', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `customer_portal_quotes_v?id=eq.${req.params.id}&customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    const quotes = await response.json();
    if (quotes.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quotes[0]);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

router.post('/quotes/:id/sign', validatePortalSession, async (req, res) => {
  try {
    const { signatureData } = req.body;
    const quoteId = req.params.id;

    // Get quote
    const quoteResponse = await supaFetch(
      `quotes?id=eq.${quoteId}&customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    const quotes = await quoteResponse.json();
    if (quotes.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const quote = quotes[0];

    // Create e-signature
    const signatureResponse = await supaFetch('esignatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: quote.company_id,
        customer_id: quote.customer_id,
        quote_id: quoteId,
        signed_by: signatureData.signed_by,
        signature_data: signatureData,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    });

    if (!signatureResponse.ok) throw new Error('Failed to create signature');

    // Update quote status
    await supaFetch(`quotes?id=eq.${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'APPROVED',
        approved_at: new Date().toISOString()
      })
    });

    // Log activity
    await supaFetch('portal_activity_log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_portal_account_id: req.customer.id,
        action: 'quote_signed',
        resource_type: 'quote',
        resource_id: quoteId,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    });

    const signature = await signatureResponse.json();
    res.json({ success: true, signature });
  } catch (error) {
    console.error('Error signing quote:', error);
    res.status(500).json({ error: 'Failed to sign quote' });
  }
});

// Jobs Routes
router.get('/jobs', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `work_orders?customer_id=eq.${req.customer.customer_id}&job_status=in.(SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED)&order=created_at.desc`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('Failed to fetch jobs');

    const jobs = await response.json();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/jobs/:id', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `work_orders?id=eq.${req.params.id}&customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    const jobs = await response.json();
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Invoices Routes
router.get('/invoices', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `customer_portal_invoices_v?customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('Failed to fetch invoices');

    const invoices = await response.json();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/invoices/:id', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `customer_portal_invoices_v?id=eq.${req.params.id}&customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    const invoices = await response.json();
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoices[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Payments Routes (Customer Portal)
router.get('/invoices/:id/payments', validatePortalSession, async (req, res) => {
  try {
    // Verify invoice belongs to this customer
    const invRes = await supaFetch(
      `customer_portal_invoices_v?id=eq.${req.params.id}&customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );
    const invRows = await invRes.json();
    if (invRows.length === 0) return res.status(404).json({ error: 'Invoice not found' });

    const payRes = await supaFetch(
      `payments?invoice_id=eq.${req.params.id}&order=received_at.desc`,
      { method: 'GET' }
    );
    const payments = await payRes.json();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/invoices/:id/payments', validatePortalSession, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { amount, method, reference } = req.body;

    // Verify invoice belongs to this customer
    const invRes = await supaFetch(
      `customer_portal_invoices_v?id=eq.${invoiceId}&customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );
    const invRows = await invRes.json();
    if (invRows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    const invoice = invRows[0];

    // Create payment
    const payInsert = await supaFetch('payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        invoice_id: invoiceId,
        amount: Number(amount),
        method: method || 'card',
        reference: reference || null,
        received_at: new Date().toISOString(),
        source: 'portal'
      }])
    });
    if (!payInsert.ok) return res.status(400).json({ error: 'Payment insert failed' });

    // Refresh payments to compute status
    const payListRes = await supaFetch(
      `payments?invoice_id=eq.${invoiceId}`,
      { method: 'GET' }
    );
    const payList = await payListRes.json();
    const paid = (payList||[]).reduce((s,p)=> s + Math.max(0, Number(p.amount||0)), 0);
    const total = Number(invoice.total_amount||0);
    if (paid + 0.005 >= total && total > 0) {
      await supaFetch(`invoices?id=eq.${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', invoice_status: 'PAID' })
      });
    } else if (paid > 0 && paid < total) {
      await supaFetch(`invoices?id=eq.${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PARTIALLY_PAID', invoice_status: 'PARTIALLY_PAID' })
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});


// Service Requests Routes
router.post('/service-requests', validatePortalSession, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      customer_id: req.customer.customer_id,
      status: 'open',
      requested_at: new Date().toISOString()
    };

    const response = await supaFetch('service_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) throw new Error('Failed to create service request');

    const serviceRequest = await response.json();

    // Log activity
    await supaFetch('portal_activity_log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_portal_account_id: req.customer.id,
        action: 'service_request_created',
        resource_type: 'service_request',
        resource_id: serviceRequest[0].id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    });

    res.json(serviceRequest[0]);
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

router.get('/service-requests', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `service_requests_with_responses_v?customer_id=eq.${req.customer.customer_id}`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('Failed to fetch service requests');

    const requests = await response.json();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

router.get('/service-requests/:id/responses', validatePortalSession, async (req, res) => {
  try {
    const response = await supaFetch(
      `service_request_responses?service_request_id=eq.${req.params.id}&order=created_at.desc`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('Failed to fetch responses');

    const responses = await response.json();
    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Messages Routes
router.get('/messages', validatePortalSession, async (req, res) => {
  try {
    const { thread_id, type } = req.query;

    let query = `messages?customer_id=eq.${req.customer.customer_id}`;

    if (thread_id && type === 'service_request') {
      query += `&service_request_id=eq.${thread_id}`;
    } else if (thread_id && type === 'work_order') {
      query += `&work_order_id=eq.${thread_id}`;
    }

    query += '&order=created_at.desc';

    const response = await supaFetch(query, { method: 'GET' });

    if (!response.ok) throw new Error('Failed to fetch messages');

    const messages = await response.json();
    res.json(messages);
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
      portal_customer_id: req.customer.id,
      message_type: 'customer_to_company',
      created_at: new Date().toISOString()
    };

    const response = await supaFetch('messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) throw new Error('Failed to send message');

    const message = await response.json();
    res.json(message[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
