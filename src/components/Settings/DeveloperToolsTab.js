/**
 * Developer Tools Tab - Experimental features and debugging tools
 * 
 * This is a NEW component for Settings page.
 * Provides controls for offline mode, enum cache, and other dev features.
 */

import React, { useState, useEffect } from 'react';
import { storageAdapter } from '../../services/StorageAdapter';
import { enumCache } from '../../services/EnumCacheService';

const DeveloperToolsTab = ({ user }) => {
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = () => {
    // Get storage adapter status
    const status = storageAdapter.getStatus();
    setStorageStatus(status);
    setOfflineEnabled(status.mode === 'offline-enabled');

    // Get enum cache info
    const info = enumCache.getCacheInfo();
    setCacheInfo(info);
  };

  const toggleOfflineMode = () => {
    if (offlineEnabled) {
      storageAdapter.disableOfflineMode();
      setOfflineEnabled(false);
    } else {
      storageAdapter.enableOfflineMode();
      setOfflineEnabled(true);
    }
    loadStatus();
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    try {
      await enumCache.refresh(user?.company_id);
      loadStatus();
      alert('✅ Enum cache refreshed successfully');
    } catch (error) {
      console.error('Error refreshing cache:', error);
      alert('❌ Failed to refresh cache: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the enum cache?')) {
      enumCache.clearCache();
      loadStatus();
      alert('✅ Enum cache cleared');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Developer Tools</h2>
        <p className="mt-1 text-sm text-gray-500">
          Experimental features and debugging tools for development and testing.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> These features are experimental and should only be enabled for testing.
              Keep all features disabled for production use.
            </p>
          </div>
        </div>
      </div>

      {/* Offline Mode Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Offline Mode (Experimental)</h3>
        
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable Offline Mode
              </label>
              <p className="text-sm text-gray-500">
                Experimental offline support for mobile devices
              </p>
            </div>
            <button
              onClick={toggleOfflineMode}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                offlineEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  offlineEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Status */}
          {storageStatus && (
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Mode:</span>
                  <span className="ml-2 font-medium">{storageStatus.mode}</span>
                </div>
                <div>
                  <span className="text-gray-500">Network:</span>
                  <span className={`ml-2 font-medium ${storageStatus.online ? 'text-green-600' : 'text-red-600'}`}>
                    {storageStatus.online ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Offline Support:</span>
                  <span className="ml-2 font-medium">
                    {storageStatus.offlineSupported ? '✅ Yes' : '⚠️ Not Yet'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Pending Sync:</span>
                  <span className="ml-2 font-medium">{storageStatus.syncPending}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enum Cache Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enum Cache</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Database enums are cached locally to improve performance and enable offline support.
          </p>

          {/* Cache Info */}
          {cacheInfo && (
            <div className="bg-gray-50 rounded p-3 text-sm">
              {cacheInfo.exists ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${cacheInfo.valid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {cacheInfo.valid ? '✅ Valid' : '⚠️ Expired'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age:</span>
                    <span className="font-medium">{cacheInfo.ageHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(cacheInfo.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cached Enums:</span>
                    <span className="font-medium">{cacheInfo.enums?.length || 0}</span>
                  </div>
                  {cacheInfo.enums && cacheInfo.enums.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-xs">Types:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {cacheInfo.enums.map(enumName => (
                          <span key={enumName} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {enumName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No cache found
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleRefreshCache}
              disabled={refreshing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Refreshing...' : '🔄 Refresh Cache'}
            </button>
            <button
              onClick={handleClearCache}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🗑️ Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* System Info Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
        
        <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Browser:</span>
            <span className="font-medium">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Online:</span>
            <span className={`font-medium ${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
              {navigator.onLine ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">LocalStorage:</span>
            <span className="font-medium">
              {typeof localStorage !== 'undefined' ? '✅ Available' : '❌ Not Available'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Company ID:</span>
            <span className="font-medium font-mono text-xs">{user?.company_id || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-xs text-gray-500 text-center">
        These tools are for development and testing only. Do not enable in production.
      </div>
    </div>
  );
};

export default DeveloperToolsTab;

