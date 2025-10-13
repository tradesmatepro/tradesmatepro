// Google Calendar OAuth and API Service
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
// SECURITY: Service key removed - use Edge Functions instead

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with actual client ID
const GOOGLE_CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET"; // Replace with actual client secret
const GOOGLE_REDIRECT_URI = `${window.location.origin}/oauth/google/callback`;
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/calendar";

class GoogleCalendarService {
  // Initiate OAuth flow
  static initiateOAuth(companyId) {
    const state = btoa(JSON.stringify({ companyId, timestamp: Date.now() }));
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: GOOGLE_SCOPE,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }

  // Exchange authorization code for tokens
  static async exchangeCodeForTokens(code, state) {
    try {
      const { companyId } = JSON.parse(atob(state));
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await response.json();
      
      // Store tokens in Supabase
      await this.saveTokens(companyId, tokens);
      
      return { success: true, companyId };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Save tokens to Supabase
  static async saveTokens(companyId, tokens) {
    try {
      const tokenData = {
        company_id: companyId,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        extra: {
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          scope: tokens.scope,
          expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
        },
        created_at: new Date().toISOString()
      };

      // Check if token exists
      const existingResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${companyId}&provider=eq.google_calendar`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      const existingTokens = await existingResponse.json();
      
      if (existingTokens.length > 0) {
        // Update existing token
        const response = await fetch(`${SUPABASE_URL}/rest/v1/integration_tokens?id=eq.${existingTokens[0].id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tokenData)
        });
        
        if (!response.ok) throw new Error('Failed to update tokens');
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
          body: JSON.stringify(tokenData)
        });
        
        if (!response.ok) throw new Error('Failed to save tokens');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  static async getValidAccessToken(companyId) {
    try {
      const tokens = await this.getStoredTokens(companyId);
      if (!tokens) {
        throw new Error('No tokens found. Please reconnect Google Calendar.');
      }

      // Check if token is expired
      const expiresAt = new Date(tokens.extra?.expires_at);
      const now = new Date();
      
      if (expiresAt <= now) {
        // Token expired, refresh it
        console.log('Access token expired, refreshing...');
        return await this.refreshAccessToken(companyId, tokens.refresh_token);
      }

      return tokens.access_token;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      throw error;
    }
  }

  // Refresh access token
  static async refreshAccessToken(companyId, refreshToken) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const newTokens = await response.json();
      
      // Update stored tokens
      await this.updateStoredTokens(companyId, newTokens);
      
      return newTokens.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Get stored tokens from Supabase
  static async getStoredTokens(companyId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${companyId}&provider=eq.google_calendar`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const tokens = await response.json();
        return tokens.length > 0 ? tokens[0] : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  }

  // Update stored tokens
  static async updateStoredTokens(companyId, newTokens) {
    try {
      const existingTokens = await this.getStoredTokens(companyId);
      if (!existingTokens) {
        throw new Error('No existing tokens to update');
      }

      const updatedData = {
        access_token: newTokens.access_token,
        extra: {
          ...existingTokens.extra,
          expires_in: newTokens.expires_in,
          expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString()
        }
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/integration_tokens?id=eq.${existingTokens.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) throw new Error('Failed to update tokens');
      return true;
    } catch (error) {
      console.error('Error updating stored tokens:', error);
      throw error;
    }
  }

  // Create test calendar event
  static async createTestEvent(companyId) {
    try {
      const accessToken = await this.getValidAccessToken(companyId);
      
      const event = {
        summary: 'TradeMate Pro Integration Test',
        description: 'This is a test event created by TradeMate Pro to verify Google Calendar integration.',
        start: {
          dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google Calendar API error: ${error.error?.message || 'Unknown error'}`);
      }

      const createdEvent = await response.json();
      
      return {
        success: true,
        message: 'Test event created successfully!',
        eventId: createdEvent.id,
        eventUrl: createdEvent.htmlLink
      };
    } catch (error) {
      console.error('Error creating test event:', error);
      
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        return {
          success: false,
          message: 'Authorization expired. Please reconnect Google Calendar.',
          requiresReauth: true
        };
      }
      
      return {
        success: false,
        message: `Failed to create test event: ${error.message}`
      };
    }
  }

  // Test connection
  static async testConnection(companyId) {
    try {
      const tokens = await this.getStoredTokens(companyId);
      if (!tokens) {
        return {
          success: false,
          message: 'No Google Calendar connection found. Please connect first.'
        };
      }

      // Try to get calendar list to test connection
      const accessToken = await this.getValidAccessToken(companyId);
      
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to access Google Calendar API');
      }

      const calendars = await response.json();
      
      return {
        success: true,
        message: `Connected to Google Calendar! Found ${calendars.items?.length || 0} calendars.`,
        calendars: calendars.items
      };
    } catch (error) {
      console.error('Error testing Google Calendar connection:', error);
      
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        return {
          success: false,
          message: 'Authorization expired. Please reconnect Google Calendar.',
          requiresReauth: true
        };
      }
      
      return {
        success: false,
        message: `Connection test failed: ${error.message}`
      };
    }
  }

  // Disconnect (delete tokens)
  static async disconnect(companyId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${companyId}&provider=eq.google_calendar`,
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
      console.error('Error disconnecting Google Calendar:', error);
      return false;
    }
  }
}

export default GoogleCalendarService;
