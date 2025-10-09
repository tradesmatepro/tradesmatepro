/**
 * Tax Service - Multi-rate tax calculation with exemptions
 * 
 * This is a NEW service that doesn't modify existing code.
 * Provides multi-jurisdiction tax calculation with fallback to single-rate.
 * 
 * Features:
 * - Multi-rate tax (state + county + city)
 * - Tax exemptions
 * - Per-line-item tax rates
 * - Fallback to single rate (backward compatible)
 */

import { supaFetch } from '../utils/supaFetch.js';

export class TaxService {
  /**
   * Calculate tax for a work order
   * 
   * @param {object} workOrder - Work order data
   * @param {array} lineItems - Array of line items
   * @param {string} companyId - Company ID
   * @param {number} fallbackRate - Fallback single tax rate (default: 0)
   * @returns {object} Tax calculation result
   */
  static async calculateTax(workOrder, lineItems, companyId, fallbackRate = 0) {
    try {
      // Check if customer is tax exempt
      if (workOrder.tax_exempt && workOrder.tax_exemption_id) {
        const exemption = await this.getExemption(workOrder.tax_exemption_id);
        if (exemption && exemption.active && !this.isExpired(exemption)) {
          return {
            taxable: false,
            exemptionReason: exemption.exemption_type,
            exemptionCertificate: exemption.certificate_number,
            taxAmount: 0,
            taxRate: 0,
            lineItems: lineItems.map(item => ({ ...item, tax_amount: 0, tax_rate: 0 }))
          };
        }
      }

      // Get tax rate for service address or jurisdictions
      let taxRate = fallbackRate;
      let jurisdictions = [];

      if (workOrder.service_address_id) {
        // Use cached service address tax rate
        const addressRate = await this.getAddressTaxRate(workOrder.service_address_id);
        if (addressRate) {
          taxRate = addressRate.combined_rate;
          jurisdictions = addressRate.jurisdiction_breakdown || {};
        }
      } else if (workOrder.tax_jurisdiction_ids && workOrder.tax_jurisdiction_ids.length > 0) {
        // Calculate from jurisdictions
        const result = await this.calculateFromJurisdictions(workOrder.tax_jurisdiction_ids, companyId);
        taxRate = result.combinedRate;
        jurisdictions = result.breakdown;
      }

      // Calculate tax per line item
      let totalTax = 0;
      const itemsWithTax = lineItems.map(item => {
        if (!item.taxable) {
          return { ...item, tax_amount: 0, tax_rate: 0 };
        }

        const itemTaxRate = item.tax_rate || taxRate;
        const itemTax = (item.total_price || 0) * itemTaxRate;
        totalTax += itemTax;

        return {
          ...item,
          tax_rate: itemTaxRate,
          tax_amount: Number(itemTax.toFixed(2))
        };
      });

      return {
        taxable: true,
        taxRate,
        taxAmount: Number(totalTax.toFixed(2)),
        jurisdictions,
        lineItems: itemsWithTax
      };
    } catch (error) {
      console.error('❌ Error calculating tax:', error);
      // Fallback to simple calculation
      return this.calculateSimpleTax(lineItems, fallbackRate);
    }
  }

  /**
   * Simple tax calculation (fallback)
   */
  static calculateSimpleTax(lineItems, taxRate) {
    let totalTax = 0;
    const itemsWithTax = lineItems.map(item => {
      if (!item.taxable) {
        return { ...item, tax_amount: 0, tax_rate: 0 };
      }

      const itemTax = (item.total_price || 0) * taxRate;
      totalTax += itemTax;

      return {
        ...item,
        tax_rate: taxRate,
        tax_amount: Number(itemTax.toFixed(2))
      };
    });

    return {
      taxable: true,
      taxRate,
      taxAmount: Number(totalTax.toFixed(2)),
      jurisdictions: {},
      lineItems: itemsWithTax
    };
  }

  /**
   * Calculate combined tax rate from multiple jurisdictions
   */
  static async calculateFromJurisdictions(jurisdictionIds, companyId) {
    try {
      const jurisdictions = await this.getJurisdictionsByIds(jurisdictionIds, companyId);
      
      let combinedRate = 0;
      const breakdown = {};

      jurisdictions.forEach(j => {
        combinedRate += j.tax_rate;
        breakdown[j.jurisdiction_type] = (breakdown[j.jurisdiction_type] || 0) + j.tax_rate;
      });

      return {
        combinedRate: Number(combinedRate.toFixed(4)),
        breakdown
      };
    } catch (error) {
      console.error('❌ Error calculating from jurisdictions:', error);
      return { combinedRate: 0, breakdown: {} };
    }
  }

  /**
   * Get tax jurisdictions for a company
   */
  static async getJurisdictions(companyId) {
    try {
      const response = await supaFetch(
        `tax_jurisdictions?company_id=eq.${companyId}&active=eq.true&order=jurisdiction_type,name`,
        { method: 'GET' },
        companyId
      );
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('❌ Error fetching jurisdictions:', error);
      return [];
    }
  }

  /**
   * Get jurisdictions by IDs
   */
  static async getJurisdictionsByIds(ids, companyId) {
    try {
      const idsString = ids.map(id => `"${id}"`).join(',');
      const response = await supaFetch(
        `tax_jurisdictions?id=in.(${idsString})&active=eq.true`,
        { method: 'GET' },
        companyId
      );
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('❌ Error fetching jurisdictions by IDs:', error);
      return [];
    }
  }

  /**
   * Add tax jurisdiction
   */
  static async addJurisdiction(jurisdiction, companyId) {
    try {
      const response = await supaFetch(
        'tax_jurisdictions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...jurisdiction, company_id: companyId })
        },
        companyId
      );
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('❌ Error adding jurisdiction:', error);
      throw error;
    }
  }

  /**
   * Update tax jurisdiction
   */
  static async updateJurisdiction(id, updates, companyId) {
    try {
      const response = await supaFetch(
        `tax_jurisdictions?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        },
        companyId
      );
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('❌ Error updating jurisdiction:', error);
      throw error;
    }
  }

  /**
   * Delete tax jurisdiction
   */
  static async deleteJurisdiction(id, companyId) {
    try {
      const response = await supaFetch(
        `tax_jurisdictions?id=eq.${id}`,
        { method: 'DELETE' },
        companyId
      );
      return response.ok;
    } catch (error) {
      console.error('❌ Error deleting jurisdiction:', error);
      throw error;
    }
  }

  /**
   * Get customer tax exemption
   */
  static async getExemption(exemptionId) {
    try {
      const response = await supaFetch(
        `tax_exemptions?id=eq.${exemptionId}`,
        { method: 'GET' }
      );
      const data = await response.json();
      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Error fetching exemption:', error);
      return null;
    }
  }

  /**
   * Get customer exemptions
   */
  static async getCustomerExemptions(customerId) {
    try {
      const response = await supaFetch(
        `tax_exemptions?customer_id=eq.${customerId}&active=eq.true`,
        { method: 'GET' }
      );
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('❌ Error fetching customer exemptions:', error);
      return [];
    }
  }

  /**
   * Add tax exemption
   */
  static async addExemption(exemption) {
    try {
      const response = await supaFetch(
        'tax_exemptions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exemption)
        }
      );
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('❌ Error adding exemption:', error);
      throw error;
    }
  }

  /**
   * Check if exemption is expired
   */
  static isExpired(exemption) {
    if (!exemption.expiration_date) return false;
    return new Date(exemption.expiration_date) < new Date();
  }

  /**
   * Get or create service address tax rate
   */
  static async getAddressTaxRate(addressId) {
    try {
      const response = await supaFetch(
        `service_address_tax_rates?id=eq.${addressId}`,
        { method: 'GET' }
      );
      const data = await response.json();
      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Error fetching address tax rate:', error);
      return null;
    }
  }

  /**
   * Create service address tax rate (manual entry)
   */
  static async createAddressTaxRate(addressData, companyId) {
    try {
      const response = await supaFetch(
        'service_address_tax_rates',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...addressData, company_id: companyId })
        },
        companyId
      );
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('❌ Error creating address tax rate:', error);
      throw error;
    }
  }
}

export default TaxService;

