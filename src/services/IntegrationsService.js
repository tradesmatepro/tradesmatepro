// Integrations Service for TradeMate Pro
// Manages third-party API connections and webhook handling

import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

class IntegrationsService {
  constructor() {
    this.connectedIntegrations = new Map();
    this.webhookEndpoints = new Map();
  }

  // Create integrations table for storing connection data
  async createIntegrationsTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS integrations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        integration_type TEXT NOT NULL,
        integration_name TEXT NOT NULL,
        status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
        
        -- OAuth and API credentials (encrypted)
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP WITH TIME ZONE,
        api_key TEXT,
        webhook_url TEXT,
        
        -- Configuration settings
        settings JSONB DEFAULT '{}',
        
        -- Sync information
        last_sync_at TIMESTAMP WITH TIME ZONE,
        sync_frequency TEXT DEFAULT 'daily',
        auto_sync_enabled BOOLEAN DEFAULT TRUE,
        
        -- Error tracking
        last_error TEXT,
        error_count INTEGER DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON integrations(company_id);
      CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
      CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
    `;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createTableSQL })
      });

      if (response.ok) {
        console.log('✅ Integrations table created successfully');
        return true;
      }
    } catch (error) {
      console.error('Error creating integrations table:', error);
    }
    return false;
  }

  // QuickBooks Integration
  async connectQuickBooks(companyId) {
    console.log('🔗 Initiating QuickBooks connection...');
    
    // Future implementation:
    // 1. Redirect to QuickBooks OAuth
    // 2. Handle callback with authorization code
    // 3. Exchange for access/refresh tokens
    // 4. Store encrypted tokens in database
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'quickbooks',
      integration_name: 'QuickBooks',
      status: 'pending',
      settings: {
        syncInvoices: true,
        syncPayments: true,
        syncCustomers: true,
        autoCreateInvoices: false
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Google Calendar Integration
  async connectGoogleCalendar(companyId) {
    console.log('🔗 Initiating Google Calendar connection...');
    
    // Future implementation:
    // 1. Google OAuth 2.0 flow
    // 2. Request calendar.events scope
    // 3. Store tokens and calendar IDs
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'google_calendar',
      integration_name: 'Google Calendar',
      status: 'pending',
      settings: {
        calendarId: 'primary',
        syncJobs: true,
        createReminders: true,
        reminderMinutes: 30
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Outlook Calendar Integration
  async connectOutlookCalendar(companyId) {
    console.log('🔗 Initiating Outlook Calendar connection...');
    
    // Future implementation:
    // 1. Microsoft Graph API OAuth
    // 2. Request calendars.readwrite scope
    // 3. Handle multi-tenant scenarios
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'outlook_calendar',
      integration_name: 'Outlook Calendar',
      status: 'pending',
      settings: {
        syncJobs: true,
        createMeetings: false,
        teamSync: true
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // HubSpot CRM Integration
  async connectHubSpot(companyId) {
    console.log('🔗 Initiating HubSpot CRM connection...');
    
    // Future implementation:
    // 1. HubSpot OAuth flow
    // 2. Request contacts, deals, companies scopes
    // 3. Set up webhook subscriptions
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'hubspot_crm',
      integration_name: 'HubSpot CRM',
      status: 'pending',
      settings: {
        syncContacts: true,
        syncDeals: true,
        createDealsFromQuotes: true,
        pipelineId: null
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Twilio SMS Integration
  async connectTwilio(companyId, accountSid, authToken) {
    console.log('🔗 Initiating Twilio connection...');
    
    // Future implementation:
    // 1. Validate Twilio credentials
    // 2. Test SMS sending capability
    // 3. Store encrypted credentials
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'twilio',
      integration_name: 'Twilio',
      status: 'pending',
      api_key: authToken, // Should be encrypted
      settings: {
        accountSid: accountSid,
        fromNumber: null,
        sendJobReminders: true,
        sendQuoteNotifications: true,
        sendInvoiceReminders: true
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // SendGrid Email Integration
  async connectSendGrid(companyId, apiKey) {
    console.log('🔗 Initiating SendGrid connection...');
    
    // Future implementation:
    // 1. Validate SendGrid API key
    // 2. Test email sending
    // 3. Set up email templates
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'sendgrid',
      integration_name: 'SendGrid',
      status: 'pending',
      api_key: apiKey, // Should be encrypted
      settings: {
        fromEmail: null,
        fromName: null,
        sendJobSummaries: true,
        sendFollowUps: true,
        templateIds: {}
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Zapier Integration
  async connectZapier(companyId) {
    console.log('🔗 Initiating Zapier connection...');
    
    // Future implementation:
    // 1. Generate webhook URLs for Zapier
    // 2. Provide API endpoints for Zapier to consume
    // 3. Set up trigger events
    
    const webhookUrl = `${window.location.origin}/api/webhooks/zapier/${companyId}`;
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'zapier',
      integration_name: 'Zapier',
      status: 'pending',
      webhook_url: webhookUrl,
      settings: {
        enabledTriggers: ['quote_created', 'job_completed', 'invoice_paid'],
        webhookSecret: this.generateWebhookSecret()
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Google Drive Integration
  async connectGoogleDrive(companyId) {
    console.log('🔗 Initiating Google Drive connection...');
    
    // Future implementation:
    // 1. Google OAuth with drive.file scope
    // 2. Create TradeMate Pro folder
    // 3. Set up automatic photo/document backup
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'google_drive',
      integration_name: 'Google Drive',
      status: 'pending',
      settings: {
        folderId: null,
        autoBackupPhotos: true,
        autoBackupDocuments: true,
        organizeFoldersByJob: true
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Dropbox Integration
  async connectDropbox(companyId) {
    console.log('🔗 Initiating Dropbox connection...');
    
    // Future implementation:
    // 1. Dropbox OAuth flow
    // 2. Create app folder structure
    // 3. Set up file sync
    
    const integrationData = {
      company_id: companyId,
      integration_type: 'dropbox',
      integration_name: 'Dropbox',
      status: 'pending',
      settings: {
        appFolderPath: '/TradeMate Pro',
        autoSync: true,
        syncPhotos: true,
        syncDocuments: true
      }
    };

    return await this.saveIntegration(integrationData);
  }

  // Save integration to database
  async saveIntegration(integrationData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/integrations`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...integrationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${integrationData.integration_name} integration saved`);
        return result;
      }
    } catch (error) {
      console.error(`Error saving ${integrationData.integration_name} integration:`, error);
    }
    return null;
  }

  // Get all integrations for a company
  async getIntegrations(companyId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integrations?company_id=eq.${companyId}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
    return [];
  }

  // Disconnect integration
  async disconnectIntegration(integrationId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integrations?id=eq.${integrationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'disconnected',
            access_token: null,
            refresh_token: null,
            updated_at: new Date().toISOString()
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      return false;
    }
  }

  // Generate secure webhook secret
  generateWebhookSecret() {
    return 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Webhook handler for incoming data
  async handleWebhook(integrationId, payload, signature) {
    // Future implementation:
    // 1. Verify webhook signature
    // 2. Route to appropriate handler
    // 3. Update local data
    // 4. Log webhook activity
    
    console.log(`📥 Webhook received for integration ${integrationId}`);
    return { success: true };
  }
}

// Export singleton instance
const integrationsService = new IntegrationsService();
export default integrationsService;
