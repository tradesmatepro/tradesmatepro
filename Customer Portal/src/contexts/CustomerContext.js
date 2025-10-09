import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// Disable auth persistence at the storage layer and proactively clear any leftover sessions before initializing Supabase
const noPersistStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

try {
  if (typeof window !== 'undefined') {
    // Best-effort cleanup of prior Supabase auth artifacts
    const ls = window.localStorage;
    if (ls) {
      Object.keys(ls).forEach((k) => {
        if (k.startsWith('sb-') || k.toLowerCase().includes('supabase') || k.toLowerCase().includes('auth')) {
          ls.removeItem(k);
        }
      });
    }
    window.sessionStorage?.clear?.();
    if (window.indexedDB?.databases) {
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          const name = (db.name || '').toLowerCase();
          if (name.includes('supabase') || name.includes('auth')) {
            try { window.indexedDB.deleteDatabase(db.name); } catch {}
          }
        });
      }).catch(() => {});
    }
    console.log('🧹 Pre-init: cleared persisted auth storage');
  }
} catch (_) {}

// Supabase client for Customer Portal
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Do not persist sessions in Customer Portal
    autoRefreshToken: false,
    storageKey: 'customer-portal-auth',
    storage: noPersistStorage // Force no-op storage so old sessions are ignored entirely
  }
});

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);

  // Debug loading state changes
  const setLoadingWithDebug = (value) => {
    console.log(`🔧 LOADING STATE CHANGE: ${loading} → ${value}`);
    setLoading(value);
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking auth status...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        console.log('🔧 Setting loading to false due to error');
        setLoadingWithDebug(false);
        return;
      }

      console.log('📊 Session status:', session ? 'Found' : 'None');

      if (session) {
        console.log('🔧 Session found, loading customer data...');
        setSession(session);
        await loadCustomerData(session.user);
        // Don't set loading to false here - let loadCustomerData handle it
      } else {
        console.log('✅ No session - setting loading to false');
        setLoadingWithDebug(false);
        setIsAuthenticated(false);
        setCustomer(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      console.log('🔧 Setting loading to false due to catch error');
      setLoadingWithDebug(false);
    }
  }, []);

  const loadCustomerData = useCallback(async (authUser) => {
    try {
      console.log('🔍 Loading customer data for user:', authUser.email);

      // Simple approach - just get portal accounts first, then get customer data separately if needed
      const result = await supabase
        .from('customer_portal_accounts')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true);

      const accounts = result.data;
      const error = result.error;

      console.log('📊 Portal accounts query result:', { accounts, error });

      if (error) {
        console.error('Error loading customer data:', error);
        return;
      }

      if (accounts && accounts.length > 0) {
        const account = accounts[0];

        // Get customer data separately if we have a customer_id
        let customer = null;
        if (account.customer_id) {
          const customerResult = await supabase
            .from('customers')
            .select('*')
            .eq('id', account.customer_id)
            .single();

          if (!customerResult.error) {
            customer = customerResult.data;
          }
        }

        const customerData = {
          id: account.id,
          customer_id: account.customer_id,
          auth_user_id: authUser.id,
          email: authUser.email || account.email,
          name: customer?.name || 'Customer',
          phone: customer?.phone,
          street_address: customer?.street_address,
          city: customer?.city,
          state: customer?.state,
          zip_code: customer?.zip_code,
          customer_type: customer?.customer_type,
          needs_password_setup: account.needs_password_setup,
          last_login_at: account.last_login_at,
          created_at: account.created_at,
          created_via: account.created_via
        };

        setCustomer(customerData);
        setIsAuthenticated(true);
        console.log('🔧 Customer data loaded, setting loading to false');
        setLoading(false);

        // Update last login
        await updateLastLogin(account.id);
      } else {
        console.log('📋 No customer portal account found for user:', authUser.email);
        console.log('   This is normal for new users during signup process');
        console.log('🔧 No portal account found, setting loading to false');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      console.log('🔧 Setting loading to false due to loadCustomerData error');
      setLoadingWithDebug(false);
      setIsAuthenticated(false);
    }
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    // Clear any persisted sessions on app load to prevent fake user persistence
    const clearPersistedSessions = async () => {
      try {
        await supabase.auth.signOut();
        console.log('🧹 Cleared any persisted sessions');
      } catch (error) {
        // Ignore errors during cleanup
      }
    };

    clearPersistedSessions().then(() => {
      checkAuthStatus();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');

      if (session) {
        setSession(session);
        await loadCustomerData(session.user);
      } else {
        // Don't immediately clear customer data on SIGNED_OUT if we just signed up
        // This prevents the "kick out" behavior during email verification
        if (event === 'SIGNED_OUT' && customer && customer.created_via === 'self_signup') {
          console.log('📋 Keeping customer logged in during email verification process');
          // Keep the customer data but clear the session
          setSession(null);
        } else {
          console.log('📋 Clearing customer data - full logout');
          setCustomer(null);
          setIsAuthenticated(false);
          setSession(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    try {
      console.log('🔧 Logging out user...');

      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }

      // Clear local state
      setCustomer(null);
      setIsAuthenticated(false);
      setSession(null);
      setLoadingWithDebug(false);

      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateLastLogin = async (accountId) => {
    try {
      console.log('🔧 Updating last login for account:', accountId);
      const result = await supabase
        .from('customer_portal_accounts')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (result.error) {
        console.error('❌ Error updating last login:', result.error);
      } else {
        console.log('✅ Last login updated successfully');
      }
    } catch (error) {
      console.error('❌ Exception updating last login:', error);
    }
  };

  // Magic link login (primary method)
  const loginWithMagicLink = async (email) => {
    try {
      setLoading(true);

      const { data: __, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      return { success: true, message: 'Magic link sent to your email!' };
    } catch (error) {
      console.error('Magic link error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Password login using Supabase Auth
  const login = async (email, password) => {
    try {
      setLoading(true);

      // Use Supabase Auth for login
      const { data: __, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Set up password (first-time setup)
  const setupPassword = async (password) => {
    try {
      setLoading(true);

      const { data: __, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Update needs_password_setup flag
      if (customer?.id) {
        await fetch(`${SUPABASE_URL}/rest/v1/customer_portal_accounts?id=eq.${customer.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            needs_password_setup: false
          })
        });

        // Update local customer state
        setCustomer(prev => ({ ...prev, needs_password_setup: false }));
      }

      return { success: true };
    } catch (error) {
      console.error('Password setup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function moved up to avoid duplication

  // Self-signup for new customers (network hub functionality)
  const selfSignup = async (customerData) => {
    try {
      setLoading(true);

      // Step 1: Create Supabase Auth user
      console.log('🔧 Creating Supabase Auth user for:', customerData.email);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password || 'TempPassword123!', // Use provided password or temp
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: customerData.name,
            phone: customerData.phone
          }
        }
      });

      console.log('📊 Auth signup result:', { authData, authError });

      if (authError) {
        // If user already exists, check if they have a portal account
        if (authError.message.includes('User already registered')) {
          // Check if this email has a portal account
          const { data: existingAccounts } = await supabase
            .from('customer_portal_accounts')
            .select('*')
            .eq('email', customerData.email);

          if (existingAccounts && existingAccounts.length > 0) {
            throw new Error('You already have an account. Please use the login page instead.');
          } else {
            throw new Error('Email already registered but no portal account found. Please contact support or try logging in.');
          }
        }
        throw authError;
      }
      const authUser = authData.user;

      // Step 2: Create global customer entry
      console.log('🔧 Creating customer record...');
      let customer, customerError;

      try {
        // Try with created_via column first - using correct status and customer_type values
        const result = await supabase
          .from('customers')
          .insert({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            street_address: customerData.street_address,
            city: customerData.city,
            state: customerData.state,
            zip_code: customerData.zip_code,
            country: 'United States',
            customer_type: 'COMMERCIAL', // Fixed: use database's expected value
            status: 'active', // Fixed: use lowercase 'active' not 'ACTIVE'
            created_via: 'self_signup'
          })
          .select()
          .single();

        customer = result.data;
        customerError = result.error;
      } catch (columnError) {
        console.warn('created_via column missing, trying without it:', columnError);

        // Fallback: create customer without created_via column - using correct values
        const result = await supabase
          .from('customers')
          .insert({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            street_address: customerData.street_address,
            city: customerData.city,
            state: customerData.state,
            zip_code: customerData.zip_code,
            country: 'United States',
            customer_type: 'COMMERCIAL', // Fixed: use database's expected value
            status: 'active' // Fixed: use lowercase 'active' not 'ACTIVE'
          })
          .select()
          .single();

        customer = result.data;
        customerError = result.error;
      }

      if (customerError) throw customerError;

      // Step 3: Link to portal account
      console.log('🔧 Creating portal account...');
      const { data: portalData, error: portalError } = await supabase
        .from('customer_portal_accounts')
        .insert({
          customer_id: customer.id,
          auth_user_id: authUser.id,
          email: customerData.email,
          is_active: true,
          created_via: 'self_signup',
          needs_password_setup: false
        })
        .select()
        .single();

      if (portalError) {
        console.error('❌ Portal account creation failed:', portalError);
        throw portalError;
      }

      console.log('✅ Portal account created:', portalData.id);

      // Step 4: Set up the customer context immediately (don't wait for email verification)
      const customerContextData = {
        id: portalData.id,
        customer_id: customer.id,
        auth_user_id: authUser.id,
        email: customerData.email,
        name: customer.name,
        phone: customer.phone,
        street_address: customer.street_address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zip_code,
        customer_type: customer.customer_type,
        needs_password_setup: false,
        created_at: portalData.created_at,
        created_via: 'self_signup'
      };

      // Set customer data immediately so user stays logged in
      setCustomer(customerContextData);
      setIsAuthenticated(true);
      setSession(authData.session);

      console.log('✅ Customer context set - user should stay logged in');

      return {
        success: true,
        message: authData.session ?
          'Account created successfully! You are now logged in.' :
          'Account created successfully! Please check your email to verify your account.',
        user: authUser,
        customer: customer,
        requiresEmailVerification: !authData.session
      };
    } catch (error) {
      console.error('Self signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Legacy service request functions - kept for backward compatibility
  // New requests should use marketplace tables directly via supabase client
  const submitServiceRequest = async (requestData) => {
    console.warn('submitServiceRequest is deprecated. Use marketplace tables directly.');
    // This function is kept for backward compatibility but should not be used for new requests
    return null;
  };

  const loadServiceRequests = async () => {
    console.warn('loadServiceRequests is deprecated. Use marketplace tables directly.');
    // This function is kept for backward compatibility but should not be used
    return [];
  };

  const loadServiceRequestResponses = async (requestId) => {
    console.warn('loadServiceRequestResponses is deprecated. Use marketplace tables directly.');
    // This function is kept for backward compatibility but should not be used
    return [];
  };

  const value = {
    customer,
    loading,
    isAuthenticated,
    session,
    login,
    loginWithMagicLink,
    setupPassword,
    logout,
    checkAuthStatus,
    selfSignup,
    submitServiceRequest,
    loadServiceRequests,
    loadServiceRequestResponses,
    supabase // Expose supabase client for direct use if needed
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export { CustomerContext };
