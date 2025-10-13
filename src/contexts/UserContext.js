import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDefaultPermissions } from '../utils/simplePermissions';
import { supabase } from '../utils/supabaseClient';
// No service keys needed - using anon key with proper auth

// Legacy environment variables for beta (will be removed after full Supabase client migration)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Map database roles to permission system roles
// Database: lowercase enums (technician) -> Frontend: uppercase constants (TECHNICIAN)
const mapDatabaseRoleToPermissionRole = (dbRole) => {
  const roleMap = {
    // Core roles
    'owner': 'OWNER',
    'admin': 'ADMIN',
    'manager': 'ADMIN',
    'dispatcher': 'ADMIN',
    'supervisor': 'ADMIN',

    // Technician roles
    'lead_technician': 'EMPLOYEE',
    'technician': 'EMPLOYEE',
    'apprentice': 'EMPLOYEE',
    'helper': 'EMPLOYEE',

    // Office roles
    'accountant': 'ADMIN',
    'sales_rep': 'ADMIN',
    'customer_service': 'EMPLOYEE',

    // Portal roles
    'customer_portal': 'CUSTOMER',
    'vendor_portal': 'VENDOR',

    // Legacy/special roles
    'app_owner': 'OWNER',
    'employee': 'EMPLOYEE'
  };

  return roleMap[dbRole?.toLowerCase()] || 'EMPLOYEE';
};

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const createDemoUser = async () => {
  try {
    // First create a demo company using Supabase client
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Demo Company',
        street_address: '123 Business Street',
        city: 'Demo City',
        state: 'CA',
        postal_code: '12345',
        phone: '555-123-4567',
        email: 'info@democompany.com'
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating demo company:', companyError);
      return null;
    }

    const companyId = companyData?.id;

    // Create demo user using Supabase client
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .insert({
        email: 'demo@trademateapp.com',
        full_name: 'Demo User',
        company_id: companyId,
        role: 'OWNER', // Demo user is owner
        status: 'ACTIVE',
        phone: '555-123-4567'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating demo user:', userError);
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error creating demo user:', error);
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 REAL AUTHENTICATION - Auth bypass removed

  // STRICT AUTHENTICATION - No fake fallbacks, Supabase session required
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication state...');

        // STRICT: Only check Supabase session, ignore localStorage
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Supabase session error:', error);
          // Clean up any stale localStorage data
          localStorage.removeItem('trademate_user');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // STRICT: Must have valid session and user
        if (!session || !session.user) {
          console.log('❌ No valid Supabase session found - user must log in');
          // Clean up any stale localStorage data
          localStorage.removeItem('trademate_user');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // STRICT: Session must not be expired
        if (session.expires_at && session.expires_at < Date.now() / 1000) {
          console.log('❌ Supabase session expired - user must log in again');
          localStorage.removeItem('trademate_user');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log('✅ Valid Supabase session found, loading user data...');

        // INDUSTRY STANDARD: Query users + profiles separately (like Jobber, ServiceTitan)
        // Step 1: Get business user record
        const { data: businessUser, error: userError } = await supabase
          .from('users')
          .select('id,company_id,role,status,created_at,updated_at')
          .eq('auth_user_id', session.user.id)
          .single();

        if (userError || !businessUser) {
          console.error('❌ Business user record not found:', userError);
          console.log('🚨 AUTHENTICATION FAILED: User has Supabase account but no business user record');
          localStorage.removeItem('trademate_user');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Step 2: Get user profile data (UI preferences only)
        const { data: userProfile, error: profileError} = await supabase
          .from('profiles')
          .select('avatar_url,preferences,timezone,language,notification_preferences')
          .eq('user_id', businessUser.id)
          .single();

        if (profileError) {
          console.warn('⚠️ Profile not found, using defaults:', profileError);
        }

        // Step 3: Combine data (industry standard pattern)
        const firstName = businessUser.first_name || '';
        const lastName = businessUser.last_name || '';
        const fullName = businessUser.name || `${firstName} ${lastName}`.trim() || session.user.email?.split('@')[0] || 'User';

        const userData = {
          user_id: businessUser.id,
          company_id: businessUser.company_id,
          email: businessUser.email || session.user.email, // From users table
          role: businessUser.role,
          status: businessUser.status,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          phone: businessUser.phone || '',
          phone_number: businessUser.phone || '', // Alias for compatibility
          avatar_url: userProfile?.avatar_url || '',
          preferences: userProfile?.preferences || {},
          timezone: userProfile?.timezone || 'America/Los_Angeles',
          language: userProfile?.language || 'en',
          notification_preferences: userProfile?.notification_preferences || {},
          // Address fields (from users table)
          address_line_1: businessUser.address_line_1 || '',
          city: businessUser.city || '',
          state_province: businessUser.state_province || '',
          postal_code: businessUser.postal_code || '',
          created_at: businessUser.created_at,
          updated_at: businessUser.updated_at
        };

        // Step 4: Get company name (industry standard)
        let companyName = 'Unknown Company';
        if (userData.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', userData.company_id)
            .single();
          companyName = company?.name || 'Unknown Company';
        }

        // Step 5: Create final user session (industry standard structure)
        const dbRole = userData.role || 'technician';
        const permissionRole = mapDatabaseRoleToPermissionRole(dbRole);

        const userSession = {
          id: userData.user_id,  // Use business user ID as primary
          user_id: userData.user_id,  // Also include user_id for compatibility
          email: userData.email,
          full_name: userData.full_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          company_id: userData.company_id,
          company_name: companyName,
          role: permissionRole, // Use mapped role for permissions
          db_role: dbRole, // Keep original database role for reference
          status: userData.status || 'active',
          tier: 'free_trial',
          phone: userData.phone,
          phone_number: userData.phone,
          avatar_url: userData.avatar_url,
          timezone: userData.timezone,
          language: userData.language,
          notification_preferences: userData.notification_preferences,
          address_line_1: userData.address_line_1,
          city: userData.city,
          state_province: userData.state_province,
          postal_code: userData.postal_code,
          permissions: getDefaultPermissions(permissionRole),
          // Store session info for debugging
          session_expires_at: session.expires_at,
          session_valid: true
        };

        console.log('✅ Authentication successful for:', session.user.email);
        localStorage.setItem('trademate_user', JSON.stringify(userSession));
        setUser(userSession);
        setIsAuthenticated(true);

      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('trademate_user');
        setUser(null);
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 UserContext: Auth state changed:', event);

      if (event === 'SIGNED_OUT' || !session) {
        console.log('🚨 User signed out or session lost');
        localStorage.removeItem('trademate_user');
        setUser(null);
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔄 Session updated, re-checking auth...');
        // Re-run auth check to sync user data
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      // First, authenticate with Supabase Auth
      console.log('Attempting login for:', email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        console.error('❌ Supabase Auth Error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.session || !authData.user) {
        console.error('❌ No session returned from Supabase');
        throw new Error('Authentication failed: No session created');
      }

      console.log('✅ Auth successful:', authData.user.email);
      console.log('✅ Session created, expires at:', new Date(authData.session.expires_at * 1000));

      // INDUSTRY STANDARD: Query users + profiles separately (like Jobber, ServiceTitan)
      // Step 1: Get business user record
      const { data: businessUser, error: userError } = await supabase
        .from('users')
        .select('id,company_id,role,status,created_at,updated_at')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError || !businessUser) {
        console.error('❌ Error fetching business user data:', userError);
        // Sign out the user since they don't have a business user record
        await supabase.auth.signOut();
        throw new Error('User account not found. Please contact your administrator.');
      }

      // Step 2: Get user profile data (UI preferences only)
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url,preferences,timezone,language,notification_preferences')
        .eq('user_id', businessUser.id)
        .single();

      if (profileError) {
        console.warn('⚠️ Profile not found during login, using defaults:', profileError);
      }

      // Step 3: Combine data (industry standard pattern)
      const firstName = businessUser.first_name || '';
      const lastName = businessUser.last_name || '';
      const fullName = businessUser.name || `${firstName} ${lastName}`.trim() || authData.user.email?.split('@')[0] || 'User';

      const loginUserData = {
        user_id: businessUser.id,
        company_id: businessUser.company_id,
        email: authData.user.email, // From auth.users
        role: businessUser.role,
        status: businessUser.status,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone: userProfile?.phone || '',
        phone_number: userProfile?.phone || '', // Alias for compatibility
        avatar_url: userProfile?.avatar_url || '',
        preferences: userProfile?.preferences || {},
        timezone: userProfile?.timezone || 'America/Los_Angeles',
        language: userProfile?.language || 'en',
        notification_preferences: userProfile?.notification_preferences || {},
        // Address fields
        address_line_1: userProfile?.address_line_1 || '',
        city: userProfile?.city || '',
        state_province: userProfile?.state_province || '',
        postal_code: userProfile?.postal_code || '',
        created_at: businessUser.created_at,
        updated_at: businessUser.updated_at
      };

      console.log('✅ User data loaded for user:', loginUserData.user_id);

      // Step 4: Get company name (industry standard)
      let companyName = 'Unknown Company';
      if (loginUserData.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', loginUserData.company_id)
          .single();
        companyName = company?.name || 'Unknown Company';
      }

      // Step 5: Update last login in users table (business data)
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', loginUserData.user_id);

      // Step 6: Create final user session (industry standard structure)
      const dbRole = loginUserData.role || 'technician';
      const permissionRole = mapDatabaseRoleToPermissionRole(dbRole);

      const userSession = {
        id: loginUserData.user_id,  // Use business user ID as primary
        user_id: loginUserData.user_id,  // Also include user_id for compatibility
        email: loginUserData.email,
        full_name: loginUserData.full_name,
        first_name: loginUserData.first_name,
        last_name: loginUserData.last_name,
        company_id: loginUserData.company_id,
        company_name: companyName,
        role: permissionRole, // Use mapped role for permissions
        db_role: dbRole, // Keep original database role for reference
        status: loginUserData.status || 'active',
        tier: 'free_trial',
        phone: loginUserData.phone,
        phone_number: loginUserData.phone,
        avatar_url: loginUserData.avatar_url,
        timezone: loginUserData.timezone,
        language: loginUserData.language,
        notification_preferences: loginUserData.notification_preferences,
        address_line_1: loginUserData.address_line_1,
        city: loginUserData.city,
        state_province: loginUserData.state_province,
        postal_code: loginUserData.postal_code,
        permissions: getDefaultPermissions(permissionRole),
        // Store session info for validation
        session_expires_at: authData.session.expires_at,
        session_valid: true
      };

      console.log('✅ Login successful, storing session...');
      localStorage.setItem('trademate_user', JSON.stringify(userSession));
      setUser(userSession);
      setIsAuthenticated(true);

      console.log('✅ User session established for:', authData.user.email);
      return userSession;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('Logging out user...');

    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clean up local state (this will also be triggered by auth state change)
    localStorage.removeItem('trademate_user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('User logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('trademate_user', JSON.stringify(newUserData));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
