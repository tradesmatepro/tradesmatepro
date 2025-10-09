/**
 * Resend API Integration
 * 
 * Provides programmatic access to Resend email service:
 * - API key validation
 * - API key creation
 * - Email sending
 * - Domain management
 * 
 * Part of: Autonomous Troubleshooting System
 * Created: 2025-10-09
 */

const fs = require('fs');
const path = require('path');

class ResendAPI {
  constructor() {
    this.loadCredentials();
  }

  loadCredentials() {
    try {
      const credPath = path.join(__dirname, 'credentials.json');
      const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      
      this.apiKey = creds.resend.apiKey;
      this.fromEmail = creds.resend.fromEmail;
      this.fromName = creds.resend.fromName;
      
      if (!this.apiKey || this.apiKey === 'YOUR_RESEND_API_KEY_HERE') {
        console.warn('⚠️  Resend API key not configured in credentials.json');
      }
    } catch (error) {
      console.error('❌ Failed to load Resend credentials:', error.message);
      this.apiKey = null;
      this.fromEmail = null;
      this.fromName = null;
    }
  }

  /**
   * Validate an API key
   * @param {string} apiKey - API key to validate (defaults to configured key)
   * @returns {Promise<boolean>} True if valid, false otherwise
   */
  async validateAPIKey(apiKey = this.apiKey) {
    if (!apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/api-keys', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error validating API key:', error.message);
      return false;
    }
  }

  /**
   * Create a new API key
   * @param {string} name - Name for the new API key
   * @param {string} permission - Permission level ('full_access' or 'sending_access')
   * @returns {Promise<Object>} New API key details
   */
  async createAPIKey(name, permission = 'sending_access') {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }

    try {
      const response = await fetch('https://api.resend.com/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, permission })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create API key: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error creating API key:', error.message);
      throw error;
    }
  }

  /**
   * List all API keys
   * @returns {Promise<Array>} List of API keys
   */
  async listAPIKeys() {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }

    try {
      const response = await fetch('https://api.resend.com/api-keys', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list API keys: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('❌ Error listing API keys:', error.message);
      throw error;
    }
  }

  /**
   * Delete an API key
   * @param {string} keyId - ID of the API key to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAPIKey(keyId) {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }

    try {
      const response = await fetch(`https://api.resend.com/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete API key: ${response.status} - ${error}`);
      }

      return { success: true, keyId };
    } catch (error) {
      console.error('❌ Error deleting API key:', error.message);
      throw error;
    }
  }

  /**
   * Send a test email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendTestEmail(options = {}) {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }

    const {
      to = 'test@example.com',
      from = this.fromEmail,
      subject = 'Test Email - TradeMate Pro',
      html = '<p>This is a test email to verify the Resend API key is working.</p>',
      text = 'This is a test email to verify the Resend API key is working.'
    } = options;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${response.status} - ${error.message || JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error sending test email:', error.message);
      throw error;
    }
  }

  /**
   * Get email details
   * @param {string} emailId - Email ID
   * @returns {Promise<Object>} Email details
   */
  async getEmail(emailId) {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }

    try {
      const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get email: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting email:', error.message);
      throw error;
    }
  }

  /**
   * List domains
   * @returns {Promise<Array>} List of domains
   */
  async listDomains() {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }

    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list domains: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('❌ Error listing domains:', error.message);
      throw error;
    }
  }
}

// CLI support
if (require.main === module) {
  const api = new ResendAPI();
  
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  (async () => {
    try {
      switch (command) {
        case 'validate':
          const isValid = await api.validateAPIKey(arg1);
          console.log(isValid ? '✅ API key is valid' : '❌ API key is invalid');
          break;

        case 'create-key':
          if (!arg1) {
            console.error('Usage: node resendAPI.js create-key <name> [permission]');
            process.exit(1);
          }
          const newKey = await api.createAPIKey(arg1, arg2 || 'sending_access');
          console.log('✅ New API key created:');
          console.log(JSON.stringify(newKey, null, 2));
          break;

        case 'list-keys':
          const keys = await api.listAPIKeys();
          console.log('📋 API Keys:');
          keys.forEach(key => {
            console.log(`  - ${key.name} (${key.id}) - Created: ${key.created_at}`);
          });
          break;

        case 'delete-key':
          if (!arg1) {
            console.error('Usage: node resendAPI.js delete-key <key-id>');
            process.exit(1);
          }
          await api.deleteAPIKey(arg1);
          console.log(`✅ API key ${arg1} deleted`);
          break;

        case 'send-test':
          const result = await api.sendTestEmail({
            to: arg1 || 'test@example.com',
            subject: arg2 || 'Test Email - TradeMate Pro'
          });
          console.log('✅ Test email sent:');
          console.log(JSON.stringify(result, null, 2));
          break;

        case 'get-email':
          if (!arg1) {
            console.error('Usage: node resendAPI.js get-email <email-id>');
            process.exit(1);
          }
          const email = await api.getEmail(arg1);
          console.log(JSON.stringify(email, null, 2));
          break;

        case 'domains':
          const domains = await api.listDomains();
          console.log('📋 Domains:');
          domains.forEach(domain => {
            console.log(`  - ${domain.name} (${domain.status})`);
          });
          break;

        default:
          console.log('Usage:');
          console.log('  node resendAPI.js validate [api-key]');
          console.log('  node resendAPI.js create-key <name> [permission]');
          console.log('  node resendAPI.js list-keys');
          console.log('  node resendAPI.js delete-key <key-id>');
          console.log('  node resendAPI.js send-test [to-email] [subject]');
          console.log('  node resendAPI.js get-email <email-id>');
          console.log('  node resendAPI.js domains');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = ResendAPI;

