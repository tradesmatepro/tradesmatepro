import { supaFetch } from '../utils/supaFetch';

/**
 * Auto-Accept Service
 * Handles automatic booking of marketplace requests based on company rules
 */
class AutoAcceptService {
  
  /**
   * Check if a response should be auto-accepted based on company rules
   * @param {Object} request - The marketplace request
   * @param {Object} response - The marketplace response
   * @param {string} companyId - The company ID for scoping
   * @returns {Promise<boolean>} - Whether the response should be auto-accepted
   */
  static async shouldAutoAccept(request, response, companyId) {
    try {
      // Only auto-accept if the request allows it
      if (!request.allow_auto_booking) {
        return false;
      }

      // Only auto-accept 'accepted' responses (not counters or declines)
      if (response.response_status !== 'accepted') {
        return false;
      }

      // Get auto-accept rules for the requesting company
      const rulesQuery = `auto_accept_rules?requester_company_id=eq.${request.company_id || request.customer_id}&trade_tag=eq.${request.trade_tag}&request_type=eq.${request.request_type}&enabled=eq.true`;
      
      const rulesResponse = await supaFetch(rulesQuery, { method: 'GET' }, companyId);
      
      if (!rulesResponse.ok) {
        console.error('Failed to fetch auto-accept rules');
        return false;
      }

      const rules = await rulesResponse.json();
      
      if (!rules || rules.length === 0) {
        return false; // No matching rules
      }

      // Get the responding company's details
      const companyQuery = `companies?id=eq.${response.company_id}&select=avg_rating,rating_count,verified`;
      const companyResponse = await supaFetch(companyQuery, { method: 'GET' }, companyId);
      
      if (!companyResponse.ok) {
        console.error('Failed to fetch company details');
        return false;
      }

      const companies = await companyResponse.json();
      const company = companies[0];
      
      if (!company) {
        return false;
      }

      // Check each rule - ALL must pass for auto-accept
      for (const rule of rules) {
        // Check minimum rating
        if (rule.min_internal_rating && company.avg_rating < rule.min_internal_rating) {
          return false;
        }

        // Check verification requirement
        if (rule.require_verified && !company.verified) {
          return false;
        }

        // Check maximum hourly rate (if response has counter offer)
        if (rule.max_hourly_rate && response.counter_offer && response.counter_offer > rule.max_hourly_rate) {
          return false;
        }

        // Check maximum ETA (if response has availability)
        if (rule.max_eta_hours && response.available_start) {
          const now = new Date();
          const availableStart = new Date(response.available_start);
          const etaHours = (availableStart - now) / (1000 * 60 * 60);
          
          if (etaHours > rule.max_eta_hours) {
            return false;
          }
        }

        // TODO: Check max_distance_km when location data is available
        // This would require geocoding and distance calculation
      }

      return true; // All rules passed
      
    } catch (error) {
      console.error('Error checking auto-accept rules:', error);
      return false;
    }
  }

  /**
   * Auto-book a request with the given response
   * @param {string} requestId - The marketplace request ID
   * @param {string} responseId - The marketplace response ID
   * @param {string} companyId - The company ID for scoping
   * @returns {Promise<boolean>} - Whether the auto-booking was successful
   */
  static async autoBookRequest(requestId, responseId, companyId) {
    try {
      // Update the request status and set booked response
      const updateResponse = await supaFetch(`marketplace_requests?id=eq.${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'booked',
          booked_response_id: responseId,
          updated_at: new Date().toISOString()
        })
      }, companyId);

      if (!updateResponse.ok) {
        console.error('Failed to update request status for auto-booking');
        return false;
      }

      // TODO: Send notifications to both parties
      // This would integrate with the notification system when available
      console.log(`Auto-booked request ${requestId} with response ${responseId}`);
      
      return true;
      
    } catch (error) {
      console.error('Error auto-booking request:', error);
      return false;
    }
  }

  /**
   * Process a new response and check for auto-accept
   * @param {Object} request - The marketplace request
   * @param {Object} response - The newly created marketplace response
   * @param {string} companyId - The company ID for scoping
   * @returns {Promise<boolean>} - Whether the response was auto-accepted
   */
  static async processNewResponse(request, response, companyId) {
    try {
      const shouldAccept = await this.shouldAutoAccept(request, response, companyId);
      
      if (shouldAccept) {
        const success = await this.autoBookRequest(request.id, response.id, companyId);
        return success;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error processing new response for auto-accept:', error);
      return false;
    }
  }

  /**
   * Check if current time is outside normal business hours
   * @returns {boolean} - Whether it's currently after hours
   */
  static isAfterHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Consider after hours: before 8 AM, after 6 PM, or weekends
    return hour < 8 || hour >= 18 || day === 0 || day === 6;
  }

  /**
   * Get companies eligible for emergency requests
   * @param {Object} request - The marketplace request
   * @param {string} companyId - The company ID for scoping
   * @returns {Promise<Array>} - Array of eligible company IDs
   */
  static async getEmergencyEligibleCompanies(request, companyId) {
    try {
      let query = 'companies?accepts_emergency=eq.true&select=id,emergency_fee';
      
      // If it's after hours, also require nights_weekends = true
      if (this.isAfterHours()) {
        query += '&nights_weekends=eq.true';
      }
      
      const response = await supaFetch(query, { method: 'GET' }, companyId);
      
      if (!response.ok) {
        console.error('Failed to fetch emergency-eligible companies');
        return [];
      }
      
      const companies = await response.json();
      return companies || [];
      
    } catch (error) {
      console.error('Error fetching emergency-eligible companies:', error);
      return [];
    }
  }
}

export default AutoAcceptService;
