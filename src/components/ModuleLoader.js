/**
 * Module Loader - Dynamically loads/unloads modules based on feature flags
 * Wraps routes and components to enforce module access control
 */

import React from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { MODULE_REGISTRY } from '../config/moduleRegistry';

/**
 * ModuleRoute - Wraps a route and checks if module is enabled
 */
export const ModuleRoute = ({ moduleId, children, fallback = null }) => {
  const { isModuleEnabled, loading } = useFeatureFlags();

  if (loading) {
    return <div className="p-8 text-center">Loading modules...</div>;
  }

  if (!isModuleEnabled(moduleId)) {
    const module = Object.values(MODULE_REGISTRY).find(m => m.id === moduleId);
    return fallback || (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {module?.name || 'Module'} Coming Soon
        </h2>
        <p className="text-gray-600">{module?.description}</p>
      </div>
    );
  }

  return children;
};

/**
 * ModuleGate - Conditionally renders content if module is enabled
 */
export const ModuleGate = ({ moduleId, children, fallback = null }) => {
  const { isModuleEnabled } = useFeatureFlags();

  if (!isModuleEnabled(moduleId)) {
    return fallback;
  }

  return children;
};

/**
 * PageGate - Conditionally renders content if page is enabled
 */
export const PageGate = ({ pageName, children, fallback = null }) => {
  const { isPageEnabled } = useFeatureFlags();

  if (!isPageEnabled(pageName)) {
    return fallback;
  }

  return children;
};

/**
 * ModuleNavItem - Navigation item that only shows if module is enabled
 */
export const ModuleNavItem = ({ moduleId, children }) => {
  const { isModuleEnabled } = useFeatureFlags();

  if (!isModuleEnabled(moduleId)) {
    return null;
  }

  return children;
};

/**
 * ModuleList - Get list of enabled modules for display
 */
export const ModuleList = ({ category = null, render }) => {
  const { getEnabledModules } = useFeatureFlags();
  const enabledModules = getEnabledModules();

  const modules = enabledModules
    .map(moduleId => Object.values(MODULE_REGISTRY).find(m => m.id === moduleId))
    .filter(m => m && (!category || m.category === category));

  return modules.map((module, idx) => (
    <div key={module.id}>
      {render(module)}
    </div>
  ));
};

/**
 * ComingSoonBadge - Shows "Coming Soon" badge for disabled modules
 */
export const ComingSoonBadge = ({ moduleId, children }) => {
  const { isModuleEnabled } = useFeatureFlags();

  if (isModuleEnabled(moduleId)) {
    return children;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
        Coming Soon
      </div>
    </div>
  );
};

export default ModuleLoader;

