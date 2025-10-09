/**
 * Storage Adapter - Abstraction layer for online/offline data access
 * 
 * Phase 1: Pass-through mode (no changes to existing behavior)
 * Phase 2: Add offline support (opt-in)
 * 
 * This file is NEW and doesn't modify any existing code.
 * Web app continues to use supaFetch directly until ready to migrate.
 */

import { supaFetch } from '../utils/supaFetch.js';

export class StorageAdapter {
  constructor() {
    // Start in online-only mode (safe default)
    this.mode = 'online-only';
    this.online = navigator.onLine;
    
    // Monitor network status
    this.setupNetworkListeners();
    
    console.log('✅ StorageAdapter initialized in online-only mode');
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.online = true;
      console.log('🌐 Network: Online');
      this.onNetworkStatusChange('online');
    });

    window.addEventListener('offline', () => {
      this.online = false;
      console.log('📡 Network: Offline');
      this.onNetworkStatusChange('offline');
    });
  }

  /**
   * Network status change callback (override in subclass or set externally)
   */
  onNetworkStatusChange(status) {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('storage-adapter-network-change', {
      detail: { status, online: this.online }
    }));
  }

  /**
   * Main fetch method - same signature as supaFetch
   * 
   * Phase 1: Just passes through to supaFetch (no changes)
   * Phase 2: Will add offline logic when mode is 'offline-enabled'
   * 
   * @param {string} path - Supabase path (e.g., 'work_orders?select=*')
   * @param {object} options - Fetch options (method, body, headers)
   * @param {string} companyId - Company ID for scoping
   * @returns {Promise<Response>} - Fetch response
   */
  async fetch(path, options = {}, companyId = null) {
    // Phase 1: Always use online (pass-through)
    if (this.mode === 'online-only') {
      return await supaFetch(path, options, companyId);
    }

    // Phase 2: Offline support (not implemented yet)
    if (this.mode === 'offline-enabled') {
      if (!this.online) {
        console.warn('⚠️ Offline mode not fully implemented yet, attempting online request');
        // TODO: Implement offline storage
        // return await this.offlineFetch(path, options, companyId);
      }
      return await supaFetch(path, options, companyId);
    }

    // Default: pass through
    return await supaFetch(path, options, companyId);
  }

  /**
   * Enable offline mode (opt-in)
   * WARNING: Not fully implemented yet
   */
  enableOfflineMode() {
    console.warn('⚠️ Offline mode is experimental and not fully implemented');
    this.mode = 'offline-enabled';
    console.log('✅ Offline mode enabled (experimental)');
  }

  /**
   * Disable offline mode (back to safe default)
   */
  disableOfflineMode() {
    this.mode = 'online-only';
    console.log('✅ Offline mode disabled (back to online-only)');
  }

  /**
   * Check if offline mode is enabled
   */
  isOfflineModeEnabled() {
    return this.mode === 'offline-enabled';
  }

  /**
   * Check if currently online
   */
  isOnline() {
    return this.online;
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get status info
   */
  getStatus() {
    return {
      mode: this.mode,
      online: this.online,
      offlineSupported: false, // Phase 2
      syncPending: 0 // Phase 2
    };
  }
}

// Singleton instance
export const storageAdapter = new StorageAdapter();

// Export for testing
export default StorageAdapter;

