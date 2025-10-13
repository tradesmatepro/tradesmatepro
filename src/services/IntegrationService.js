// Integration Service for managing OAuth flows and API connections
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

class IntegrationService {
  // Save integration tokens to database
  static async saveTokens(companyId, provider, tokenData) {
    try {
      // Check if token exists
      const existingResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${companyId}&provider=eq.${provider}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      const existingTokens = await existingResponse.json();
      
      const payload = {
        company_id: companyId,
        provider: provider,
        access_token: tokenData.access_token || null,
        refresh_token: tokenData.refresh_token || null,
        extra: tokenData.extra || null,
        created_at: new Date().toISOString()
      };

      if (existingTokens.length > 0) {
        // Update existing token
        const response = await fetch(`${SUPABASE_URL}/rest/v1/integration_tokens?id=eq.${existingTokens[0].id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Failed to update token');
      } else {
        // Create new token
        const response = await fetch(`${SUPABASE_URL}/rest/v1/integration_tokens`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Failed to create token');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  // Get integration tokens for a company
  static async getTokens(companyId, provider = null) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${companyId}`;
      if (provider) {
        url += `&provider=eq.${provider}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Error getting tokens:', error);
      return [];
    }
  }

  // Test connection for different providers
  static async testConnection(provider, credentials) {
    try {
      switch (provider) {
        case 'twilio':
          return await this.testTwilioConnection(credentials);
        case 'smtp':
          return await this.testSMTPConnection(credentials);
        case 'stripe':
          return await this.testStripeConnection(credentials);
        case 'google_calendar':
          return await this.testGoogleCalendarConnection(credentials);
        case 'quickbooks':
          return await this.testQuickBooksConnection(credentials);
        case 'zapier':
          return await this.testZapierConnection(credentials);
        default:
          return { success: false, message: 'Provider not supported for testing' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Test Twilio connection
  static async testTwilioConnection(credentials) {
    try {
      // In a real implementation, this would make an API call to Twilio
      // For now, we'll simulate the test
      if (!credentials.account_sid || !credentials.auth_token) {
        return { success: false, message: 'Account SID and Auth Token are required' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success/failure (90% success rate for demo)
      const success = Math.random() > 0.1;
      
      return {
        success,
        message: success 
          ? 'Twilio connection successful! SMS notifications are ready.' 
          : 'Failed to connect to Twilio. Please check your credentials.'
      };
    } catch (error) {
      return { success: false, message: 'Connection test failed: ' + error.message };
    }
  }

  // Test SMTP connection
  static async testSMTPConnection(credentials) {
    try {
      if (!credentials.host || !credentials.port || !credentials.username || !credentials.password) {
        return { success: false, message: 'All SMTP fields are required' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure (85% success rate for demo)
      const success = Math.random() > 0.15;
      
      return {
        success,
        message: success 
          ? 'SMTP connection successful! Email automation is ready.' 
          : 'Failed to connect to SMTP server. Please check your settings.'
      };
    } catch (error) {
      return { success: false, message: 'Connection test failed: ' + error.message };
    }
  }

  // Test Stripe connection
  static async testStripeConnection(credentials) {
    try {
      if (!credentials.access_token) {
        return { success: false, message: 'Stripe access token is required' };
      }

      // Simulate OAuth validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Stripe connection verified! Payment processing is ready.'
      };
    } catch (error) {
      return { success: false, message: 'Stripe connection failed: ' + error.message };
    }
  }

  // Test Google Calendar connection
  static async testGoogleCalendarConnection(credentials) {
    try {
      if (!credentials.access_token) {
        return { success: false, message: 'Google access token is required' };
      }

      // Simulate OAuth validation
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        success: true,
        message: 'Google Calendar connection verified! Schedule sync is ready.'
      };
    } catch (error) {
      return { success: false, message: 'Google Calendar connection failed: ' + error.message };
    }
  }

  // Initiate OAuth flow (for non-Google providers)
  static initiateOAuthFlow(provider, companyId) {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/oauth/callback/${provider}`;

    switch (provider) {
      case 'stripe':
        // Stripe Connect OAuth URL
        const stripeUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=YOUR_STRIPE_CLIENT_ID&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${companyId}`;
        window.location.href = stripeUrl;
        break;

      default:
        alert(`OAuth flow for ${provider} not implemented yet. This would redirect to the provider's authorization page.`);
    }
  }

  // Test QuickBooks connection (placeholder)
  static async testQuickBooksConnection(credentials) {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        message: 'QuickBooks OAuth setup ready. Click "Connect to QuickBooks" to authorize.'
      };
    } catch (error) {
      return { success: false, message: 'QuickBooks test failed: ' + error.message };
    }
  }

  // Test Zapier connection (placeholder)
  static async testZapierConnection(credentials) {
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Zapier webhook endpoint is ready to receive triggers.',
        webhookUrl: credentials.webhook_url
      };
    } catch (error) {
      return { success: false, message: 'Zapier test failed: ' + error.message };
    }
  }

  // Send test email
  static async sendTestEmail(companyId, credentials, testEmail) {
    try {
      // In a real implementation, this would send via SMTP
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        return {
          success: true,
          message: `Test email sent successfully to ${testEmail}!`
        };
      } else {
        return {
          success: false,
          message: 'Failed to send test email. Please check your SMTP settings.'
        };
      }
    } catch (error) {
      return { success: false, message: 'Email test failed: ' + error.message };
    }
  }

  // Send test SMS
  static async sendTestSMS(companyId, credentials, testNumber) {
    try {
      // In a real implementation, this would send via Twilio
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success/failure (85% success rate)
      const success = Math.random() > 0.15;

      if (success) {
        return {
          success: true,
          message: `Test SMS sent successfully to ${testNumber}!`
        };
      } else {
        return {
          success: false,
          message: 'Failed to send test SMS. Please check your Twilio settings.'
        };
      }
    } catch (error) {
      return { success: false, message: 'SMS test failed: ' + error.message };
    }
  }

  // Create pending integration
  static async createPendingIntegration(companyId, provider, config = {}) {
    try {
      const tokenData = {
        company_id: companyId,
        provider: provider,
        access_token: null,
        refresh_token: null,
        extra: {
          status: 'pending',
          config: config,
          created_at: new Date().toISOString()
        }
      };

      await this.saveTokens(companyId, provider, tokenData);
      return true;
    } catch (error) {
      console.error('Error creating pending integration:', error);
      return false;
    }
  }

  // Delete integration tokens
  static async deleteTokens(companyId, provider) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${companyId}&provider=eq.${provider}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting tokens:', error);
      return false;
    }
  }
}

export default IntegrationService;
