import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useUser } from './UserContext';
import settingsService from '../services/SettingsService';
import { supabase } from '../utils/supabaseClient';

const IntegrationsContext = createContext();

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};

const DEFAULTS = {
  enableQuickbooks: false,
  enableSms: false,
  enableGoogleCalendar: false,
  enableCloudStorage: false,
  enableCrm: false,
  enableZapier: false,
  enableStripe: false,
  enableSquare: false,
  enableMailchimp: false,
  enableXero: false,
  enableGoogleMaps: false,
  enableDocuSign: false,
  enablePandaDoc: false,
  enableClockify: false,
};

function mapDbToState(db) {
  if (!db) return { ...DEFAULTS };
  return {
    enableQuickbooks: !!db.enable_quickbooks,
    enableSms: !!db.enable_sms,
    enableGoogleCalendar: !!db.enable_google_calendar,
    enableCloudStorage: !!db.enable_cloud_storage,
    enableCrm: !!db.enable_crm,
    enableZapier: !!db.enable_zapier,
    enableStripe: !!db.enable_stripe,
    enableSquare: !!db.enable_square,
    enableMailchimp: !!db.enable_mailchimp,
    enableXero: !!db.enable_xero,
    enableGoogleMaps: !!db.enable_google_maps,
    enableDocuSign: !!db.enable_docusign,
    enablePandaDoc: !!db.enable_pandadoc,
    enableClockify: !!db.enable_clockify,
  };
}

export const IntegrationsProvider = ({ children }) => {
  const { user } = useUser();
  const [integrations, setIntegrations] = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(false);

  // Load from DB when user/company changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Don't load settings on public/auth pages - no user exists yet!
      const publicPaths = ['/onboarding', '/oauth/google/callback', '/logout', '/portal', '/schedule-appointment'];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

      if (isPublicPath) {
        console.log('🚫 Skipping settings load on public page:', currentPath);
        return;
      }

      console.log('🔍 IntegrationsContext loading...', {
        user: user ? { id: user.id, email: user.email, company_id: user.company_id } : 'NO USER'
      });

      // Check if we have a valid authenticated session first
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth Session:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        accessToken: session?.access_token ? 'EXISTS' : 'MISSING'
      });

      // Don't proceed without both session and user with company_id
      if (!session || !session.user) {
        console.log('❌ No authenticated session, skipping settings load');
        return;
      }

      if (!user?.company_id || !user?.id) {
        // Don't log this message as it's expected during initialization
        return;
      }

      setLoading(true);
      try {
        console.log('📡 Calling settingsService.getSettings with company_id:', user.company_id);
        const settings = await settingsService.getSettings(user.company_id);
        console.log('✅ Settings loaded:', settings);
        if (!cancelled) setIntegrations(mapDbToState(settings));
      } catch (error) {
        console.error('❌ Settings loading failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.company_id]);

  const updateIntegration = async (key, value) => {
    setIntegrations(prev => ({ ...prev, [key]: value }));
    if (!user?.company_id) return;
    await settingsService.setIntegrationFlag(user.company_id, key, value);
  };

  // Helper functions to check specific integrations
  const isQuickBooksEnabled = () => integrations.enableQuickbooks;
  const isSmsEnabled = () => integrations.enableSms;
  const isGoogleCalendarEnabled = () => integrations.enableGoogleCalendar;
  const isCloudStorageEnabled = () => integrations.enableCloudStorage;
  const isCrmEnabled = () => integrations.enableCrm;
  const isZapierEnabled = () => integrations.enableZapier;

  // Dashboard tile visibility helpers
  const shouldShowExpensesTile = () => integrations.enableQuickbooks;
  const shouldShowNotificationSettings = () => integrations.enableSms;
  const shouldShowCalendarSync = () => integrations.enableGoogleCalendar;
  const shouldShowDocumentBackup = () => integrations.enableCloudStorage;
  const shouldShowCrmLeads = () => integrations.enableCrm;
  const shouldShowAutomationRules = () => integrations.enableZapier;

  const value = useMemo(() => ({
    integrations,
    loading,
    updateIntegration,
    isQuickBooksEnabled,
    isSmsEnabled,
    isGoogleCalendarEnabled,
    isCloudStorageEnabled,
    isCrmEnabled,
    isZapierEnabled,
    shouldShowExpensesTile,
    shouldShowNotificationSettings,
    shouldShowCalendarSync,
    shouldShowDocumentBackup,
    shouldShowCrmLeads,
    shouldShowAutomationRules,
  }), [integrations, loading]);

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
};

export default IntegrationsContext;
