/**
 * Supabase Management API
 * 
 * Provides programmatic access to Supabase project management:
 * - Edge Function logs
 * - Secrets management
 * - Function deployment
 * - Project configuration
 * 
 * Part of: Autonomous Troubleshooting System
 * Created: 2025-10-09
 */

const fs = require('fs');
const path = require('path');

class SupabaseManagementAPI {
  constructor() {
    this.loadCredentials();
  }

  loadCredentials() {
    try {
      const credPath = path.join(__dirname, 'credentials.json');
      const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      
      this.accessToken = creds.supabase.accessToken;
      this.projectRef = creds.supabase.projectRef;
      this.serviceRoleKey = creds.supabase.serviceRoleKey;
      
      if (!this.accessToken || this.accessToken === 'YOUR_SUPABASE_ACCESS_TOKEN_HERE') {
        console.warn('⚠️  Supabase access token not configured in credentials.json');
      }
    } catch (error) {
      console.error('❌ Failed to load Supabase credentials:', error.message);
      this.accessToken = null;
      this.projectRef = null;
      this.serviceRoleKey = null;
    }
  }

  /**
   * Get Edge Function logs
   * @param {string} functionName - Name of the Edge Function
   * @param {number} limit - Number of log entries to retrieve
   * @returns {Promise<Object>} Log entries
   */
  async getEdgeFunctionLogs(functionName, limit = 100) {
    if (!this.accessToken) {
      throw new Error('Supabase access token not configured');
    }

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${this.projectRef}/functions/${functionName}/logs?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get logs: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting Edge Function logs:', error.message);
      throw error;
    }
  }

  /**
   * Update a secret in Supabase
   * @param {string} name - Secret name
   * @param {string} value - Secret value
   * @returns {Promise<Object>} Update result
   */
  async updateSecret(name, value) {
    if (!this.accessToken) {
      throw new Error('Supabase access token not configured');
    }

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${this.projectRef}/secrets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{ name, value }])
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update secret: ${response.status} - ${error}`);
      }

      return { success: true, name };
    } catch (error) {
      console.error('❌ Error updating secret:', error.message);
      throw error;
    }
  }

  /**
   * Deploy an Edge Function
   * @param {string} functionName - Name of the function to deploy
   * @returns {Promise<Object>} Deployment result
   */
  async deployFunction(functionName) {
    if (!this.accessToken) {
      throw new Error('Supabase access token not configured');
    }

    try {
      // Note: Supabase Management API doesn't have a direct deploy endpoint
      // This would typically be done via Supabase CLI
      // For now, we'll return a message indicating manual deployment is needed
      console.warn('⚠️  Edge Function deployment requires Supabase CLI');
      console.log('   Run: supabase functions deploy', functionName);
      
      return { 
        success: false, 
        message: 'Deployment requires Supabase CLI',
        command: `supabase functions deploy ${functionName}`
      };
    } catch (error) {
      console.error('❌ Error deploying function:', error.message);
      throw error;
    }
  }

  /**
   * List all secrets
   * @returns {Promise<Array>} List of secret names (values are hidden)
   */
  async listSecrets() {
    if (!this.accessToken) {
      throw new Error('Supabase access token not configured');
    }

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${this.projectRef}/secrets`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list secrets: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error listing secrets:', error.message);
      throw error;
    }
  }

  /**
   * Get project details
   * @returns {Promise<Object>} Project information
   */
  async getProjectDetails() {
    if (!this.accessToken) {
      throw new Error('Supabase access token not configured');
    }

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${this.projectRef}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get project details: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting project details:', error.message);
      throw error;
    }
  }

  /**
   * Test Edge Function by invoking it
   * @param {string} functionName - Name of the function
   * @param {Object} payload - Request payload
   * @returns {Promise<Object>} Function response
   */
  async invokeEdgeFunction(functionName, payload = {}) {
    if (!this.serviceRoleKey) {
      throw new Error('Supabase service role key not configured');
    }

    try {
      const response = await fetch(
        `https://${this.projectRef}.supabase.co/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      
      return {
        success: response.ok,
        status: response.status,
        data: result
      };
    } catch (error) {
      console.error('❌ Error invoking Edge Function:', error.message);
      throw error;
    }
  }
}

// CLI support
if (require.main === module) {
  const api = new SupabaseManagementAPI();
  
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  (async () => {
    try {
      switch (command) {
        case 'logs':
          const logs = await api.getEdgeFunctionLogs(arg1 || 'send-quote-email', parseInt(arg2) || 50);
          console.log(JSON.stringify(logs, null, 2));
          break;

        case 'secrets':
          const secrets = await api.listSecrets();
          console.log('📋 Secrets:', secrets.map(s => s.name).join(', '));
          break;

        case 'update-secret':
          if (!arg1 || !arg2) {
            console.error('Usage: node supabaseManagementAPI.js update-secret <name> <value>');
            process.exit(1);
          }
          await api.updateSecret(arg1, arg2);
          console.log(`✅ Secret ${arg1} updated`);
          break;

        case 'project':
          const project = await api.getProjectDetails();
          console.log(JSON.stringify(project, null, 2));
          break;

        case 'invoke':
          if (!arg1) {
            console.error('Usage: node supabaseManagementAPI.js invoke <function-name> [payload-json]');
            process.exit(1);
          }
          const payload = arg2 ? JSON.parse(arg2) : {};
          const result = await api.invokeEdgeFunction(arg1, payload);
          console.log(JSON.stringify(result, null, 2));
          break;

        default:
          console.log('Usage:');
          console.log('  node supabaseManagementAPI.js logs [function-name] [limit]');
          console.log('  node supabaseManagementAPI.js secrets');
          console.log('  node supabaseManagementAPI.js update-secret <name> <value>');
          console.log('  node supabaseManagementAPI.js project');
          console.log('  node supabaseManagementAPI.js invoke <function-name> [payload-json]');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = SupabaseManagementAPI;

