// Customer Portal Service - API layer for customer portal functionality
// Handles authentication, data access, and business logic for customer portal

import { supaFetch } from '../utils/supaFetch';

export class CustomerPortalService {

  // Authentication Methods
  static async createPortalAccount(customerData) {
    try {
      const { customer_id, email, password } = customerData;

      // Password hashing will be handled by the backend API
      const response = await supaFetch('customer_portal_accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id,
          email,
          password, // Send plain password, backend will hash it
          is_active: true
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create portal account: ${error}`);
      }

      const account = await response.json();
      return account[0];
    } catch (error) {
      console.error('Error creating portal account:', error);
      throw error;
    }
  }

  static async authenticateCustomer(email, password) {
    try {
      // Use portal API for authentication
      const response = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const result = await response.json();
      return result; // { account, sessionToken }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  static async authenticateCustomerFallback(email, password) {
    try {
      // Fallback method using direct Supabase calls (for development)
      const response = await supaFetch(
        `customer_portal_accounts?email=eq.${encodeURIComponent(email)}&is_active=eq.true`,
        { method: 'GET' }
      );

      if (!response.ok) throw new Error('Authentication failed');

      const accounts = await response.json();
      if (accounts.length === 0) throw new Error('Account not found');

      const account = accounts[0];

      // Create session token (simple version for frontend)
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supaFetch('portal_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_portal_account_id: account.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        })
      });

      // Log activity
      await this.logActivity(account.id, 'login', null, null);

      // Update last login
      await supaFetch(`customer_portal_accounts?id=eq.${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_login: new Date().toISOString() })
      });

      return { account, sessionToken };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  static async validateSession(sessionToken) {
    try {
      const response = await supaFetch(
        `portal_sessions?session_token=eq.${sessionToken}&expires_at=gte.${new Date().toISOString()}`,
        { method: 'GET' }
      );

      if (!response.ok) return null;

      const sessions = await response.json();
      if (sessions.length === 0) return null;

      const session = sessions[0];

      // Update last accessed
      await supaFetch(`portal_sessions?id=eq.${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_accessed: new Date().toISOString() })
      });

      // Get account details
      const accountResponse = await supaFetch(
        `customer_portal_accounts?id=eq.${session.customer_portal_account_id}`,
        { method: 'GET' }
      );

      const accounts = await accountResponse.json();
      return accounts[0] || null;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Data Access Methods
  static async getCustomerQuotes(customerId, sessionToken) {
    try {
      const response = await fetch('/api/portal/quotes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch quotes');

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer quotes:', error);
      throw error;
    }
  }

  static async getCustomerInvoices(customerId, sessionToken) {
    try {
      const response = await fetch('/api/portal/invoices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      throw error;
    }
  }

  static async getCustomerJobs(customerId, sessionToken) {
    try {
      const response = await fetch('/api/portal/jobs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer jobs:', error);
      throw error;
    }
  }

  // E-Signature Methods
  static async signQuote(quoteId, signatureData, sessionToken) {
    try {
      const response = await fetch(`/api/portal/quotes/${quoteId}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signatureData })
      });
      if (!response.ok) throw new Error('Failed to sign quote');
      return await response.json();
    } catch (error) {
      console.error('Error signing quote:', error);
      throw error;
    }
  }

  // Payments Methods
  static async getInvoicePayments(invoiceId, sessionToken) {
    try {
      const response = await fetch(`/api/portal/invoices/${invoiceId}/payments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
      throw error;
    }
  }

  static async recordInvoicePayment(invoiceId, payload, sessionToken) {
    try {
      const response = await fetch(`/api/portal/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to record payment');
      return await response.json();
    } catch (error) {
      console.error('Error recording invoice payment:', error);
      throw error;
    }
  }

  // Service Request Methods
  static async createServiceRequest(requestData, sessionToken) {
    try {
      const response = await fetch('/api/portal/service-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('Failed to create service request');

      return await response.json();
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  static async getServiceRequests(sessionToken) {
    try {
      const response = await fetch('/api/portal/service-requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch service requests');

      return await response.json();
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  }

  static async getServiceRequestResponses(serviceRequestId, sessionToken) {
    try {
      const response = await fetch(`/api/portal/service-requests/${serviceRequestId}/responses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch responses');

      return await response.json();
    } catch (error) {
      console.error('Error fetching service request responses:', error);
      throw error;
    }
  }

  // Messaging Methods
  static async getCustomerMessages(sessionToken, threadId = null, type = null) {
    try {
      let url = '/api/portal/messages';
      const params = new URLSearchParams();

      if (threadId) params.append('thread_id', threadId);
      if (type) params.append('type', type);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer messages:', error);
      throw error;
    }
  }

  static async sendMessage(messageData, sessionToken) {
    try {
      const response = await fetch('/api/portal/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) throw new Error('Failed to send message');

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Utility Methods
  static async logActivity(customerPortalAccountId, action, resourceType = null, resourceId = null, metadata = {}) {
    try {
      await supaFetch('portal_activity_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_portal_account_id: customerPortalAccountId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main functionality
    }
  }

  // Utility Methods
  static generateSessionToken() {
    // Simple session token generation for frontend
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async generateMagicLink(email) {
    try {
      // Use portal API for magic link generation
      const response = await fetch('/api/portal/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate magic link');
      }

      return await response.json();
    } catch (error) {
      console.error('Magic link error:', error);
      throw error;
    }
  }

  static async logout(sessionToken) {
    try {
      const response = await fetch('/api/portal/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Logout failed');

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async generateMagicLinkFallback(email) {
    try {
      // Fallback method for development
      const response = await supaFetch(
        `customer_portal_accounts?email=eq.${encodeURIComponent(email)}&is_active=eq.true`,
        { method: 'GET' }
      );

      const accounts = await response.json();
      if (accounts.length === 0) throw new Error('Account not found');

      const account = accounts[0];

      // Generate magic link token
      const token = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store session
      await supaFetch('portal_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_portal_account_id: account.id,
          session_token: token,
          expires_at: expiresAt.toISOString()
        })
      });

      return { token, expiresAt, account };
    } catch (error) {
      console.error('Error generating magic link:', error);
      throw error;
    }
  }
}

export default CustomerPortalService;
