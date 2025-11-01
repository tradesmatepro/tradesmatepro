/**
 * Feature Flag Admin Panel - Allows admins to toggle features
 * Shows which modules are enabled/disabled and allows runtime toggling
 */

import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { useUser } from '../contexts/UserContext';
import { MODULE_REGISTRY } from '../config/moduleRegistry';
import { getCurrentDeploymentConfig } from '../config/deploymentConfig';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const FeatureFlagAdmin = () => {
  const { flags, toggleFeature, getEnabledModules } = useFeatureFlags();
  const { user } = useUser();
  const [loading, setLoading] = useState({});
  const [deploymentConfig, setDeploymentConfig] = useState(null);

  useEffect(() => {
    setDeploymentConfig(getCurrentDeploymentConfig());
  }, []);

  // Only show to admins
  if (user?.role !== 'admin' && user?.role !== 'ADMIN') {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Only administrators can manage feature flags.</p>
      </div>
    );
  }

  const handleToggle = async (moduleId) => {
    setLoading(prev => ({ ...prev, [moduleId]: true }));
    const currentState = flags[moduleId] ?? false;
    await toggleFeature(moduleId, !currentState);
    setLoading(prev => ({ ...prev, [moduleId]: false }));
  };

  const enabledModules = getEnabledModules();
  const modules = Object.values(MODULE_REGISTRY);

  // Group modules by category
  const groupedModules = {
    core: modules.filter(m => m.category === 'core'),
    beta: modules.filter(m => m.category === 'beta'),
    enterprise: modules.filter(m => m.category === 'enterprise')
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Feature Flag Management</h1>
        <p className="text-blue-100">
          Deployment: <span className="font-semibold">{deploymentConfig?.name}</span>
        </p>
        <p className="text-blue-100 text-sm mt-1">
          Enabled modules: {enabledModules.length} / {modules.length}
        </p>
      </div>

      {/* Core Modules */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          Core Modules (Always Required)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedModules.core.map(module => (
            <ModuleToggle
              key={module.id}
              module={module}
              enabled={flags[module.id] ?? false}
              loading={loading[module.id]}
              onToggle={() => handleToggle(module.id)}
              disabled={module.required}
            />
          ))}
        </div>
      </div>

      {/* Beta Modules */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          Beta Modules (Ready for Launch)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedModules.beta.map(module => (
            <ModuleToggle
              key={module.id}
              module={module}
              enabled={flags[module.id] ?? false}
              loading={loading[module.id]}
              onToggle={() => handleToggle(module.id)}
            />
          ))}
        </div>
      </div>

      {/* Enterprise Modules */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
          Enterprise Modules (Post-Beta)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedModules.enterprise.map(module => (
            <ModuleToggle
              key={module.id}
              module={module}
              enabled={flags[module.id] ?? false}
              loading={loading[module.id]}
              onToggle={() => handleToggle(module.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual module toggle card
 */
const ModuleToggle = ({ module, enabled, loading, onToggle, disabled = false }) => {
  return (
    <div className={`border rounded-lg p-4 transition-all ${
      enabled 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{module.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded ${
              module.category === 'core' ? 'bg-red-100 text-red-700' :
              module.category === 'beta' ? 'bg-yellow-100 text-yellow-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {module.category.toUpperCase()}
            </span>
            {module.betaReady && (
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                Beta Ready
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onToggle}
          disabled={disabled || loading}
          className={`ml-4 flex-shrink-0 transition-all ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {loading ? (
            <div className="animate-spin">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            </div>
          ) : enabled ? (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FeatureFlagAdmin;

