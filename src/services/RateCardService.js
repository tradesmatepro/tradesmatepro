/**
 * Rate Card Service - Industry Standard Pricing Management
 * Handles rate cards/price book functionality like ServiceTitan, Jobber
 */

import { supabase } from '../utils/supabaseClient';

export class RateCardService {
  /**
   * Get all rate cards for a company
   */
  static async getRateCards(companyId, options = {}) {
    try {
      let query = supabase
        .from('rate_cards')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('category', { ascending: true })
        // ✅ FIX: Removed sort_order (column doesn't exist in database)
        .order('service_name', { ascending: true });

      // Filter by category if specified
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // Filter by unit type if specified
      if (options.unitType) {
        query = query.eq('unit_type', options.unitType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching rate cards:', error);
        throw error;
      }

      console.log('✅ Rate cards fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ RateCardService.getRateCards error:', error);
      throw error;
    }
  }

  /**
   * Get rate cards grouped by category
   */
  static async getRateCardsByCategory(companyId) {
    try {
      const rateCards = await this.getRateCards(companyId);
      
      const grouped = rateCards.reduce((acc, card) => {
        if (!acc[card.category]) {
          acc[card.category] = [];
        }
        acc[card.category].push(card);
        return acc;
      }, {});

      return grouped;
    } catch (error) {
      console.error('❌ RateCardService.getRateCardsByCategory error:', error);
      throw error;
    }
  }

  /**
   * Create a new rate card
   */
  static async createRateCard(companyId, rateCardData) {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .insert([{
          company_id: companyId,
          service_name: rateCardData.service_name,
          description: rateCardData.description || null,
          category: rateCardData.category || 'OTHER',
          unit_type: rateCardData.unit_type || 'FLAT_FEE',
          rate: parseFloat(rateCardData.rate),
          min_quantity: rateCardData.min_quantity || 1,
          max_quantity: rateCardData.max_quantity || null,
          is_active: rateCardData.is_active !== false,
          is_default: rateCardData.is_default || false
          // ✅ FIX: Removed sort_order (column doesn't exist in database)
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating rate card:', error);
        throw error;
      }

      console.log('✅ Rate card created:', data);
      return data;
    } catch (error) {
      console.error('❌ RateCardService.createRateCard error:', error);
      throw error;
    }
  }

  /**
   * Update an existing rate card
   */
  static async updateRateCard(rateCardId, updates) {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .update({
          service_name: updates.service_name,
          description: updates.description,
          category: updates.category,
          unit_type: updates.unit_type,
          rate: parseFloat(updates.rate),
          min_quantity: updates.min_quantity,
          max_quantity: updates.max_quantity,
          is_active: updates.is_active,
          is_default: updates.is_default,
          // ✅ FIX: Removed sort_order (column doesn't exist in database)
          updated_at: new Date().toISOString()
        })
        .eq('id', rateCardId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating rate card:', error);
        throw error;
      }

      console.log('✅ Rate card updated:', data);
      return data;
    } catch (error) {
      console.error('❌ RateCardService.updateRateCard error:', error);
      throw error;
    }
  }

  /**
   * Delete a rate card (soft delete - set is_active = false)
   */
  static async deleteRateCard(rateCardId) {
    try {
      const { data, error} = await supabase
        .from('rate_cards')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', rateCardId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deleting rate card:', error);
        throw error;
      }

      console.log('✅ Rate card deleted:', data);
      return data;
    } catch (error) {
      console.error('❌ RateCardService.deleteRateCard error:', error);
      throw error;
    }
  }

  /**
   * Create default rate cards structure (zero prices, user fills in)
   */
  static async createDefaultRateCards(companyId) {
    try {
      console.log('🚀 Creating default rate card structure for company:', companyId);

      const { data, error } = await supabase.rpc('create_default_rate_cards', {
        p_company_id: companyId
      });

      if (error) {
        console.error('❌ Error creating default rate cards:', error);
        throw error;
      }

      console.log('✅ Default rate card structure created successfully');
      return data;
    } catch (error) {
      console.error('❌ RateCardService.createDefaultRateCards error:', error);
      throw error;
    }
  }

  /**
   * Get service categories enum values
   */
  static getServiceCategories() {
    return [
      { value: 'HVAC', label: 'HVAC' },
      { value: 'PLUMBING', label: 'Plumbing' },
      { value: 'ELECTRICAL', label: 'Electrical' },
      { value: 'GENERAL_REPAIR', label: 'General Repair' },
      { value: 'APPLIANCE_REPAIR', label: 'Appliance Repair' },
      { value: 'LANDSCAPING', label: 'Landscaping' },
      { value: 'CLEANING', label: 'Cleaning' },
      { value: 'PEST_CONTROL', label: 'Pest Control' },
      { value: 'ROOFING', label: 'Roofing' },
      { value: 'FLOORING', label: 'Flooring' },
      { value: 'PAINTING', label: 'Painting' },
      { value: 'CARPENTRY', label: 'Carpentry' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  /**
   * Get unit types enum values
   */
  static getUnitTypes() {
    return [
      { value: 'FLAT_FEE', label: 'Flat Fee', description: 'Fixed price (e.g., $150 for service call)' },
      { value: 'HOUR', label: 'Per Hour', description: 'Hourly rate (e.g., $75/hour)' },
      { value: 'SQFT', label: 'Per Square Foot', description: 'Per square foot (e.g., $5/sqft)' },
      { value: 'LINEAR_FOOT', label: 'Per Linear Foot', description: 'Per linear foot (e.g., $12/ft for pipe)' },
      { value: 'UNIT', label: 'Per Unit/Item', description: 'Per unit/item (e.g., $25 per outlet)' },
      { value: 'CUBIC_YARD', label: 'Per Cubic Yard', description: 'Per cubic yard (landscaping)' },
      { value: 'GALLON', label: 'Per Gallon', description: 'Per gallon (chemicals, etc.)' }
    ];
  }

  /**
   * Format rate display with unit type
   */
  static formatRateDisplay(rate, unitType) {
    const formattedRate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(rate);

    const unitLabels = {
      'FLAT_FEE': '',
      'HOUR': '/hr',
      'SQFT': '/sqft',
      'LINEAR_FOOT': '/ft',
      'UNIT': '/unit',
      'CUBIC_YARD': '/yd³',
      'GALLON': '/gal'
    };

    return `${formattedRate}${unitLabels[unitType] || ''}`;
  }
}
