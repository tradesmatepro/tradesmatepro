/**
 * Enum Cache Service - Cache database enums locally for offline support
 * 
 * This file is NEW and doesn't modify any existing code.
 * Enums are fetched from database and cached in localStorage.
 * If cache fails, app continues to work by fetching from database.
 */

import { supaFetch } from '../utils/supaFetch.js';

export class EnumCacheService {
  constructor() {
    this.cacheKey = 'trademate_enum_cache';
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    console.log('✅ EnumCacheService initialized');
  }

  /**
   * Fetch all enums from database and cache locally
   * Non-blocking - if it fails, app continues to work
   */
  async fetchAndCache(companyId) {
    try {
      console.log('🔄 Fetching enums from database...');

      // Fetch all enum types
      const enums = {
        work_order_status: await this.fetchEnumValues('work_order_status_enum'),
        invoice_status: await this.fetchEnumValues('invoice_status_enum'),
        payment_method: await this.fetchEnumValues('payment_method_enum'),
        line_item_type: await this.fetchEnumValues('line_item_type_enum'),
        // Add more enums as needed
      };

      // Cache with timestamp
      const cache = {
        data: enums,
        timestamp: Date.now(),
        companyId,
        version: '1.0'
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
      console.log('✅ Enums cached successfully:', Object.keys(enums));
      
      return enums;
    } catch (error) {
      console.error('❌ Error caching enums:', error);
      // Non-blocking - return cached data if available
      return this.getCached();
    }
  }

  /**
   * Get cached enums (if available and not expired)
   */
  getCached() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) {
        console.log('ℹ️ No enum cache found');
        return null;
      }

      const cache = JSON.parse(cached);
      const age = Date.now() - cache.timestamp;

      if (age > this.cacheExpiry) {
        console.log('⚠️ Enum cache expired (age: ' + Math.round(age / 1000 / 60 / 60) + ' hours)');
        return null;
      }

      console.log('✅ Using cached enums (age: ' + Math.round(age / 1000 / 60) + ' minutes)');
      return cache.data;
    } catch (error) {
      console.error('❌ Error reading enum cache:', error);
      return null;
    }
  }

  /**
   * Get specific enum from cache or fetch from database
   */
  async getEnum(enumName) {
    const cached = this.getCached();
    if (cached && cached[enumName]) {
      return cached[enumName];
    }

    // Fallback: fetch from database
    console.log(`ℹ️ Enum ${enumName} not in cache, fetching from database...`);
    return await this.fetchEnumValues(enumName + '_enum');
  }

  /**
   * Fetch enum values from database
   * Uses PostgreSQL's enum_range function
   */
  async fetchEnumValues(enumTypeName) {
    try {
      // Try using RPC function if available
      const response = await supaFetch(
        `rpc/get_enum_values?enum_name=${enumTypeName}`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      // Fallback: Query a table that uses this enum
      // This is less reliable but works if RPC function doesn't exist
      console.warn(`⚠️ RPC function not available for ${enumTypeName}, using fallback`);
      return await this.fetchEnumValuesFallback(enumTypeName);
    } catch (error) {
      console.error(`❌ Error fetching enum ${enumTypeName}:`, error);
      return [];
    }
  }

  /**
   * Fallback method to get enum values
   * Queries a table that uses the enum and extracts unique values
   */
  async fetchEnumValuesFallback(enumTypeName) {
    try {
      // Map enum types to tables and columns
      const enumMap = {
        'work_order_status_enum': { table: 'work_orders', column: 'status' },
        'invoice_status_enum': { table: 'invoices', column: 'status' },
        'payment_method_enum': { table: 'payments', column: 'payment_method' },
        'line_item_type_enum': { table: 'work_order_line_items', column: 'line_type' }
      };

      const mapping = enumMap[enumTypeName];
      if (!mapping) {
        console.warn(`⚠️ No fallback mapping for ${enumTypeName}`);
        return [];
      }

      const response = await supaFetch(
        `${mapping.table}?select=${mapping.column}&limit=1000`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        // Extract unique values
        const uniqueValues = [...new Set(data.map(row => row[mapping.column]).filter(Boolean))];
        return uniqueValues;
      }

      return [];
    } catch (error) {
      console.error(`❌ Error in fallback fetch for ${enumTypeName}:`, error);
      return [];
    }
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache() {
    localStorage.removeItem(this.cacheKey);
    console.log('✅ Enum cache cleared');
  }

  /**
   * Check if cache exists and is valid
   */
  isCacheValid() {
    const cached = this.getCached();
    return cached !== null;
  }

  /**
   * Get cache info
   */
  getCacheInfo() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) {
        return { exists: false };
      }

      const cache = JSON.parse(cached);
      const age = Date.now() - cache.timestamp;
      const ageHours = Math.round(age / 1000 / 60 / 60 * 10) / 10;

      return {
        exists: true,
        valid: age < this.cacheExpiry,
        ageHours,
        timestamp: new Date(cache.timestamp).toISOString(),
        companyId: cache.companyId,
        version: cache.version,
        enums: Object.keys(cache.data || {})
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * Refresh cache (force update)
   */
  async refresh(companyId) {
    this.clearCache();
    return await this.fetchAndCache(companyId);
  }
}

// Singleton instance
export const enumCache = new EnumCacheService();

// Export for testing
export default EnumCacheService;

