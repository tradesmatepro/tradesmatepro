// Customer Portal Context - Authentication and state management for customer portal
import React, { createContext, useContext, useState, useEffect } from 'react';
import CustomerPortalService from '../services/CustomerPortalService';

const CustomerPortalContext = createContext();

export const useCustomerPortal = () => {
  const context = useContext(CustomerPortalContext);
  if (!context) {
    throw new Error('useCustomerPortal must be used within a CustomerPortalProvider');
  }
  return context;
};

export const CustomerPortalProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('customer_portal_token');
    if (token) {
      validateSession(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (token) => {
    try {
      setLoading(true);
      const account = await CustomerPortalService.validateSession(token);
      if (account) {
        setCustomer(account);
        setSessionToken(token);
        localStorage.setItem('customer_portal_token', token);
      } else {
        // Invalid session
        localStorage.removeItem('customer_portal_token');
        setCustomer(null);
        setSessionToken(null);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('customer_portal_token');
      setCustomer(null);
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { account, sessionToken: token } = await CustomerPortalService.authenticateCustomer(email, password);
      
      setCustomer(account);
      setSessionToken(token);
      localStorage.setItem('customer_portal_token', token);
      
      return { success: true, account };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithMagicLink = async (token) => {
    try {
      setLoading(true);
      const account = await CustomerPortalService.validateSession(token);
      
      if (account) {
        setCustomer(account);
        setSessionToken(token);
        localStorage.setItem('customer_portal_token', token);
        return { success: true, account };
      } else {
        return { success: false, error: 'Invalid or expired magic link' };
      }
    } catch (error) {
      console.error('Magic link login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await CustomerPortalService.logout(sessionToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCustomer(null);
      setSessionToken(null);
      localStorage.removeItem('customer_portal_token');
    }
  };

  const createAccount = async (customerData) => {
    try {
      setLoading(true);
      const account = await CustomerPortalService.createPortalAccount(customerData);
      return { success: true, account };
    } catch (error) {
      console.error('Account creation error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const requestMagicLink = async (email) => {
    try {
      const { token } = await CustomerPortalService.generateMagicLink(email);
      // In a real app, this would send an email with the magic link
      // For now, we'll return the token for testing
      return { success: true, token };
    } catch (error) {
      console.error('Magic link request error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    customer,
    sessionToken,
    loading,
    isAuthenticated: !!customer,
    login,
    loginWithMagicLink,
    logout,
    createAccount,
    requestMagicLink,
    validateSession
  };

  return (
    <CustomerPortalContext.Provider value={value}>
      {children}
    </CustomerPortalContext.Provider>
  );
};

export default CustomerPortalContext;
