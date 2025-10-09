import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!mounted) return;

      try {
        console.log('🔍 Admin Dashboard - Checking authentication...');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Admin Dashboard - Auth error:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (!session || !session.user) {
          console.log('❌ Admin Dashboard - No session found');
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user record first (fast query)
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('id, role, company_id, auth_user_id')
          .eq('auth_user_id', session.user.id)
          .single();

        if (!mounted) return;

        if (userError || !userRecord) {
          console.error('❌ Admin Dashboard - User record error:', userError);
          setUser(null);
          setLoading(false);
          return;
        }

        // Only allow APP_OWNER role for admin dashboard
        if (userRecord.role !== 'APP_OWNER') {
          console.log('❌ Admin Dashboard - Insufficient permissions. Role:', userRecord.role);
          setUser(null);
          setLoading(false);
          return;
        }

        // Create user data with fallback name (skip profile query for speed)
        const userData = {
          id: userRecord.id,
          email: session.user.email,
          full_name: 'Admin User', // Use default name for faster login
          role: userRecord.role,
          company_id: userRecord.company_id
        };

        console.log('✅ Admin Dashboard - Authentication successful:', userData.email);
        setUser(userData);

      } catch (error) {
        console.error('❌ Admin Dashboard - Auth check failed:', error);
        if (mounted) {
          setUser(null);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    // Initial check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 Admin Dashboard - Auth state changed:', event);

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Small delay to prevent race conditions
        setTimeout(() => {
          if (mounted) checkAuth();
        }, 100);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Admin Dashboard - Attempting login:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('🔐 Admin Dashboard - Login API successful');
      return data;

    } catch (error) {
      console.error('❌ Admin Dashboard - Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('❌ Admin Dashboard - Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
