// Customer Authentication Service for TradeMate Pro
// Handles customer portal account creation and linking with Supabase Auth

import { getSupabaseClient } from '../utils/supabaseClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

const supabase = getSupabaseClient();

export class CustomerAuthService {
  
  /**
   * FIXED: Find or create global customer using database function
   */
  static async findOrCreateGlobalCustomer(customerData) {
    try {
      const { name, phone, email, street_address, city, state, zip_code } = customerData;

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/find_or_create_global_customer`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_name: name,
          p_email: email,
          p_phone: phone,
          p_street_address: street_address,
          p_city: city,
          p_state: state,
          p_zip_code: zip_code
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to find/create customer: ${errorText}`);
      }

      const customerId = await response.json();

      // Get the full customer record
      const customerResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customerId}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (!customerResponse.ok) {
        throw new Error('Failed to retrieve customer record');
      }

      const customers = await customerResponse.json();
      return customers[0];
    } catch (error) {
      console.error('Error finding/creating global customer:', error);
      throw error;
    }
  }

  /**
   * FIXED: Link customer to company using company_customers table
   */
  static async linkCustomerToCompany(customerId, companyId, addedByUserId = null) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/company_customers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: customerId,
          relationship_type: 'client',
          status: 'active',
          added_by: addedByUserId,
          added_at: new Date().toISOString()
        })
      });

      // 409 conflict means relationship already exists, which is fine
      if (!response.ok && response.status !== 409) {
        const errorText = await response.text();
        throw new Error(`Failed to link customer to company: ${errorText}`);
      }

      return response.status !== 409 ? await response.json() : null;
    } catch (error) {
      console.error('Error linking customer to company:', error);
      throw error;
    }
  }

  /**
   * Step 2: Check if customer email already exists in auth.users
   */
  static async checkExistingAuthUser(email) {
    try {
      // Use admin API to check auth.users
      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const { users } = await response.json();
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Error checking existing auth user:', error);
      return null;
    }
  }

  /**
   * Step 3: Create Supabase Auth user if not found
   */
  static async createAuthUser(email) {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          email_confirm: true // Auto-confirm email for invited customers
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create auth user: ${error}`);
      }

      const { user } = await response.json();
      return user;
    } catch (error) {
      console.error('Error creating auth user:', error);
      throw error;
    }
  }

  /**
   * Step 4: Create customer_portal_accounts row
   */
  static async createPortalAccount(customerId, authUserId, companyId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          customer_id: customerId,
          auth_user_id: authUserId,
          invited_by: companyId,
          needs_password_setup: true,
          is_active: true,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create portal account: ${error}`);
      }

      const accounts = await response.json();
      return accounts[0];
    } catch (error) {
      console.error('Error creating portal account:', error);
      throw error;
    }
  }

  /**
   * Step 5: Link customer to portal account
   */
  static async linkCustomerToPortalAccount(customerId, portalAccountId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customerId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portal_account_id: portalAccountId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to link customer to portal account');
      }

      return true;
    } catch (error) {
      console.error('Error linking customer to portal account:', error);
      throw error;
    }
  }

  /**
   * FIXED: Complete flow using global customer registry and company linking
   */
  static async addCustomerWithPortalAccount(customerData, companyId, addedByUserId = null) {
    try {
      // Step 1: Find or create global customer
      const customer = await this.findOrCreateGlobalCustomer(customerData);

      // Step 2: Link customer to company
      await this.linkCustomerToCompany(customer.id, companyId, addedByUserId);

      if (!customerData.email) {
        // No email provided, just return the customer without portal setup
        return { customer, portalAccount: null };
      }

      // Step 3: Check if customer already has portal account
      if (customer.portal_account_id) {
        const existingPortalAccount = await this.getPortalAccountById(customer.portal_account_id);
        if (existingPortalAccount) {
          return { customer, portalAccount: existingPortalAccount, isExisting: true };
        }
      }

      // Step 4: Check if auth user already exists
      let authUser = await this.checkExistingAuthUser(customerData.email);

      if (authUser) {
        // Step 5a: Check for existing portal account
        const existingPortalAccount = await this.getPortalAccountByAuthUserId(authUser.id);
        if (existingPortalAccount) {
          // Link customer to existing portal account
          await this.linkCustomerToPortalAccount(customer.id, existingPortalAccount.id);
          return { customer, portalAccount: existingPortalAccount, isExisting: true };
        }
      } else {
        // Step 5b: Create new auth user with invitation
        authUser = await this.createAuthUserWithInvitation(customerData.email);
      }

      // Step 6: Create portal account with invitation token
      const portalAccount = await this.createPortalAccount(customer.id, authUser.id, companyId);

      // Step 5: Link customer to portal account
      await this.linkCustomerToPortalAccount(customer.id, portalAccount.id);

      return { customer, portalAccount, isExisting: false };
    } catch (error) {
      console.error('Error in addCustomerWithPortalAccount:', error);
      throw error;
    }
  }

  /**
   * Get portal account by auth user ID
   */
  static async getPortalAccountByAuthUserId(authUserId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?auth_user_id=eq.${authUserId}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const accounts = await response.json();
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting portal account:', error);
      return null;
    }
  }

  /**
   * Send magic link to customer
   */
  static async sendMagicLink(email, redirectTo = null) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/customer-portal/login`
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw error;
    }
  }

  /**
   * Check if customer has portal account
   */
  static async checkCustomerPortalStatus(customerId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?id=eq.${customerId}&select=portal_account_id,email`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { hasPortalAccount: false };
      }

      const customers = await response.json();
      if (customers.length === 0) {
        return { hasPortalAccount: false };
      }

      const customer = customers[0];
      return {
        hasPortalAccount: !!customer.portal_account_id,
        email: customer.email,
        portalAccountId: customer.portal_account_id
      };
    } catch (error) {
      console.error('Error checking customer portal status:', error);
      return { hasPortalAccount: false };
    }
  }

  /**
   * Get portal account by ID
   */
  static async getPortalAccountById(portalAccountId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?id=eq.${portalAccountId}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const accounts = await response.json();
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting portal account by ID:', error);
      return null;
    }
  }

  /**
   * Create auth user with invitation (sends magic link)
   */
  static async createAuthUserWithInvitation(email) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin.replace('3000', '3001')}/dashboard`
        }
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error creating auth user with invitation:', error);
      throw error;
    }
  }

  /**
   * Send portal invitation email
   */
  static async sendPortalInvitation(email, invitationToken) {
    try {
      // For now, just send magic link
      // TODO: Implement proper invitation email with token
      return await this.sendMagicLink(email, `${window.location.origin.replace('3000', '3001')}/dashboard`);
    } catch (error) {
      console.error('Error sending portal invitation:', error);
      throw error;
    }
  }
}

export default CustomerAuthService;
