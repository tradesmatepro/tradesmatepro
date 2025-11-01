/**
 * Feature Flag Context - Provides feature flags to entire app
 * Allows components to check if features are enabled
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import featureFlagService from '../services/FeatureFlagService';
import { useUser } from './UserContext';

const FeatureFlagContext = createContext();

export const FeatureFlagProvider = ({ children, deploymentType = 'beta' }) => {
  const { user } = useUser();
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFlags = async () => {
      if (!user?.company_id) {
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 FeatureFlagContext: Initializing for company:', user.company_id);
        await featureFlagService.initialize(user.company_id, deploymentType);
        setFlags(featureFlagService.flags);
        setError(null);
      } catch (e) {
        console.error('❌ Failed to initialize feature flags:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    initializeFlags();
  }, [user?.company_id, deploymentType]);

  const isModuleEnabled = (moduleId) => {
    return featureFlagService.isModuleEnabled(moduleId);
  };

  const isPageEnabled = (pageName) => {
    return featureFlagService.isPageEnabled(pageName);
  };

  const getEnabledModules = () => {
    return featureFlagService.getEnabledModules();
  };

  const toggleFeature = async (moduleId, enabled) => {
    if (!user?.company_id) return false;
    const success = await featureFlagService.toggleFeature(user.company_id, moduleId, enabled);
    if (success) {
      setFlags({ ...featureFlagService.flags });
    }
    return success;
  };

  const value = {
    flags,
    loading,
    error,
    isModuleEnabled,
    isPageEnabled,
    getEnabledModules,
    toggleFeature
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};

