// Pricing Service for TradeMate Pro
// Implements standardized pricing pipeline: service_rates → pricing_rules → rate_cards
// Industry standard pricing engine for trade management systems

import { supabase } from '../utils/supabaseClient';

class PricingService {
  constructor() {
    this.cachedRates = null;
    this.cachedRules = null;
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get base service rates for a company
  async getServiceRates(companyId, effectiveDate = null) {
    try {
      const targetDate = effectiveDate || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('service_rates')
        .select('*,service_categories(name)')
        .eq('company_id', companyId)
        .lte('effective_date', targetDate)
        .or('end_date.is.null,end_date.gte.' + targetDate)
        .order('effective_date', { ascending: false });

      if (error) {
        console.error('Error fetching service rates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching service rates:', error);
      return [];
    }
  }

  // Get pricing rules for a company
  async getPricingRules(companyId, validDate = null) {
    try {
      const targetDate = validDate || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('company_id', companyId)
        .lte('valid_from', targetDate)
        .or('valid_to.is.null,valid_to.gte.' + targetDate)
        .order('applies_to', { ascending: true }); // Customer > Category > Item order

      if (error) {
        console.error('Error fetching pricing rules:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      return [];
    }
  }

  // Get active rate card for a customer
  async getCustomerRateCard(customerId, companyId) {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .select('*,rate_card_items(*,service_rates(*))')
        .eq('customer_id', customerId)
        .eq('company_id', companyId)
        .eq('active', true)
        .limit(1);

      if (error) {
        console.error('Error fetching rate card:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching rate card:', error);
      return null;
    }
  }

  // Calculate price for a service using the standardized pipeline
  async calculateServicePrice(params) {
    const {
      companyId,
      customerId,
      serviceCategoryId,
      itemId,
      rateType,
      quantity = 1,
      estimatedHours = 1
    } = params;

    try {
      // Step 1: Get base service rates
      const serviceRates = await this.getServiceRates(companyId);
      let baseRate = 0;

      // Find matching service rate
      const matchingRate = serviceRates.find(rate => 
        rate.service_category_id === serviceCategoryId && 
        rate.rate_type === rateType
      );

      if (matchingRate) {
        baseRate = parseFloat(matchingRate.rate);
      } else {
        console.warn('No matching service rate found, using default');
        baseRate = 75; // Default rate
      }

      // Step 2: Apply rate type calculation
      let calculatedPrice = 0;
      switch (rateType) {
        case 'HOURLY':
          calculatedPrice = baseRate * estimatedHours;
          break;
        case 'FLAT':
          calculatedPrice = baseRate;
          break;
        case 'PER_UNIT':
          calculatedPrice = baseRate * quantity;
          break;
        default:
          calculatedPrice = baseRate;
      }

      // Step 3: Apply pricing rules (customer > category > item order)
      const pricingRules = await this.getPricingRules(companyId);
      let finalPrice = calculatedPrice;

      for (const rule of pricingRules) {
        let ruleApplies = false;

        // Check if rule applies
        switch (rule.applies_to) {
          case 'CUSTOMER':
            ruleApplies = rule.reference_id === customerId;
            break;
          case 'CATEGORY':
            ruleApplies = rule.reference_id === serviceCategoryId;
            break;
          case 'ITEM':
            ruleApplies = rule.reference_id === itemId;
            break;
        }

        if (ruleApplies) {
          const ruleValue = parseFloat(rule.value);
          
          if (rule.rule_type === 'DISCOUNT') {
            if (rule.value_type === 'PERCENTAGE') {
              finalPrice = finalPrice - (finalPrice * ruleValue / 100);
            } else { // FIXED
              finalPrice = finalPrice - ruleValue;
            }
          } else if (rule.rule_type === 'SURCHARGE') {
            if (rule.value_type === 'PERCENTAGE') {
              finalPrice = finalPrice + (finalPrice * ruleValue / 100);
            } else { // FIXED
              finalPrice = finalPrice + ruleValue;
            }
          }
        }
      }

      // Step 4: Check for rate card override
      if (customerId) {
        const rateCard = await this.getCustomerRateCard(customerId, companyId);
        if (rateCard && rateCard.rate_card_items) {
          const overrideItem = rateCard.rate_card_items.find(item => 
            item.service_rates && 
            item.service_rates.service_category_id === serviceCategoryId &&
            item.service_rates.rate_type === rateType
          );

          if (overrideItem && overrideItem.override_rate) {
            // Recalculate with override rate
            const overrideRate = parseFloat(overrideItem.override_rate);
            switch (rateType) {
              case 'HOURLY':
                finalPrice = overrideRate * estimatedHours;
                break;
              case 'FLAT':
                finalPrice = overrideRate;
                break;
              case 'PER_UNIT':
                finalPrice = overrideRate * quantity;
                break;
            }
          }
        }
      }

      return {
        baseRate,
        calculatedPrice,
        finalPrice: Math.max(0, finalPrice), // Ensure non-negative
        appliedRules: pricingRules.filter(rule => {
          switch (rule.applies_to) {
            case 'CUSTOMER': return rule.reference_id === customerId;
            case 'CATEGORY': return rule.reference_id === serviceCategoryId;
            case 'ITEM': return rule.reference_id === itemId;
            default: return false;
          }
        })
      };
    } catch (error) {
      console.error('Error calculating service price:', error);
      return {
        baseRate: 75,
        calculatedPrice: 75,
        finalPrice: 75,
        appliedRules: []
      };
    }
  }

  // Get all rate cards for a company
  async getRateCards(companyId) {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .select('*,customers(name),rate_card_items(*)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rate cards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching rate cards:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cachedRates = null;
    this.cachedRules = null;
    this.lastFetch = null;
  }
}

// Export singleton instance
const pricingService = new PricingService();
export default pricingService;
