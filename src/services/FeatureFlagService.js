/**
 * Feature Flag Service - Manages feature flags and module enablement
 * Supports runtime toggling and database persistence
 */

import { supaFetch } from '../utils/supaFetch';
import { MODULE_REGISTRY, getModulesForDeployment } from '../config/moduleRegistry';

class FeatureFlagService {
  constructor() {
    this.flags = {};
    this.enabledModules = new Set();
    this.initialized = false;
  }

  /**
   * Initialize feature flags from database or defaults
   */
  async initialize(companyId, deploymentType = 'beta') {
    try {
      console.log('🚀 Initializing Feature Flags for deployment:', deploymentType);

      // Get company-specific feature flags from database
      const flagsRes = await supaFetch(
        `feature_flags?company_id=eq.${companyId}&select=*`,
        { method: 'GET' },
        companyId
      );

      if (flagsRes && flagsRes.length > 0) {
        const dbFlags = flagsRes[0];
        this.flags = dbFlags.flags || {};
        console.log('✅ Loaded feature flags from database:', this.flags);
      } else {
        // Use defaults based on deployment type
        this.flags = this.getDefaultFlags(deploymentType);
        console.log('📝 Using default feature flags for deployment:', deploymentType);
      }

      // Enable modules based on flags
      this.updateEnabledModules();
      this.initialized = true;
      console.log('✅ Feature flags initialized, enabled modules:', Array.from(this.enabledModules));
    } catch (e) {
      console.warn('⚠️ Failed to initialize feature flags:', e);
      // Fall back to defaults
      this.flags = this.getDefaultFlags(deploymentType);
      this.updateEnabledModules();
      this.initialized = true;
    }
  }

  /**
   * Get default flags based on deployment type
   */
  getDefaultFlags(deploymentType = 'beta') {
    const defaults = {};
    const modules = getModulesForDeployment(deploymentType);
    
    modules.forEach(module => {
      defaults[module.id] = true;
    });

    return defaults;
  }

  /**
   * Update enabled modules based on current flags
   */
  updateEnabledModules() {
    this.enabledModules.clear();
    Object.entries(this.flags).forEach(([moduleId, enabled]) => {
      if (enabled) {
        this.enabledModules.add(moduleId);
      }
    });
  }

  /**
   * Check if a module is enabled
   */
  isModuleEnabled(moduleId) {
    return this.enabledModules.has(moduleId);
  }

  /**
   * Check if a page is accessible (module enabled)
   */
  isPageEnabled(pageName) {
    // Find which module owns this page
    for (const module of Object.values(MODULE_REGISTRY)) {
      if (module.pages.includes(pageName)) {
        return this.isModuleEnabled(module.id);
      }
    }
    return false;
  }

  /**
   * Get all enabled modules
   */
  getEnabledModules() {
    return Array.from(this.enabledModules);
  }

  /**
   * Toggle a feature flag (admin only)
   */
  async toggleFeature(companyId, moduleId, enabled) {
    try {
      console.log(`🔄 Toggling feature ${moduleId} to ${enabled}`);
      
      this.flags[moduleId] = enabled;
      this.updateEnabledModules();

      // Persist to database
      const flagsRes = await supaFetch(
        `feature_flags?company_id=eq.${companyId}&select=*`,
        { method: 'GET' },
        companyId
      );

      if (flagsRes && flagsRes.length > 0) {
        // Update existing
        await supaFetch(
          `feature_flags?id=eq.${flagsRes[0].id}`,
          { method: 'PATCH', body: { flags: this.flags } },
          companyId
        );
      } else {
        // Create new
        await supaFetch(
          'feature_flags',
          { method: 'POST', body: { company_id: companyId, flags: this.flags } },
          companyId
        );
      }

      console.log('✅ Feature flag updated:', moduleId, enabled);
      return true;
    } catch (e) {
      console.error('❌ Failed to toggle feature:', e);
      return false;
    }
  }

  /**
   * Get feature flag value
   */
  getFlag(moduleId) {
    return this.flags[moduleId] ?? false;
  }

  /**
   * Set multiple flags at once
   */
  async setFlags(companyId, flagsObject) {
    try {
      this.flags = { ...this.flags, ...flagsObject };
      this.updateEnabledModules();

      const flagsRes = await supaFetch(
        `feature_flags?company_id=eq.${companyId}&select=*`,
        { method: 'GET' },
        companyId
      );

      if (flagsRes && flagsRes.length > 0) {
        await supaFetch(
          `feature_flags?id=eq.${flagsRes[0].id}`,
          { method: 'PATCH', body: { flags: this.flags } },
          companyId
        );
      } else {
        await supaFetch(
          'feature_flags',
          { method: 'POST', body: { company_id: companyId, flags: this.flags } },
          companyId
        );
      }

      console.log('✅ Feature flags updated');
      return true;
    } catch (e) {
      console.error('❌ Failed to set flags:', e);
      return false;
    }
  }
}

export default new FeatureFlagService();

