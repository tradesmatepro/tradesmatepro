import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

class CustomerCommunicationsService {
  constructor() {
    this.baseHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all communications for a customer
  async getCustomerCommunications(companyId, customerId) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/customer_communications?company_id=eq.${companyId}&customer_id=eq.${customerId}&select=*&order=created_at.desc`;
      
      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customer communications: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer communications:', error);
      throw error;
    }
  }

  // Create a new communication record
  async createCommunication(companyId, communicationData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_communications`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: communicationData.customer_id,
          type: communicationData.type, // 'CALL', 'EMAIL', 'MEETING', 'NOTE'
          subject: communicationData.subject,
          body: communicationData.body,
          metadata: communicationData.metadata || {},
          created_by: communicationData.created_by,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create communication: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    }
  }

  // Get communications by type
  async getCommunicationsByType(companyId, customerId, type) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/customer_communications?company_id=eq.${companyId}&customer_id=eq.${customerId}&type=eq.${type}&select=*&order=created_at.desc`;
      
      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch communications by type: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching communications by type:', error);
      throw error;
    }
  }

  // Get recent communications across all customers for a company
  async getRecentCommunications(companyId, limit = 50) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/customer_communications?company_id=eq.${companyId}&select=*,customers(name,email,phone)&order=created_at.desc&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent communications: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent communications:', error);
      throw error;
    }
  }

  // Update communication record
  async updateCommunication(communicationId, updates) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_communications?id=eq.${communicationId}`, {
        method: 'PATCH',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update communication: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error updating communication:', error);
      throw error;
    }
  }

  // Delete communication record
  async deleteCommunication(communicationId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_communications?id=eq.${communicationId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to delete communication: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting communication:', error);
      throw error;
    }
  }

  // Get communication statistics for a customer
  async getCommunicationStats(companyId, customerId) {
    try {
      const communications = await this.getCustomerCommunications(companyId, customerId);
      
      const stats = {
        total: communications.length,
        byType: {},
        lastContact: null,
        thisMonth: 0
      };

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      communications.forEach(comm => {
        // Count by type
        stats.byType[comm.type] = (stats.byType[comm.type] || 0) + 1;
        
        // Find last contact
        if (!stats.lastContact || new Date(comm.created_at) > new Date(stats.lastContact)) {
          stats.lastContact = comm.created_at;
        }
        
        // Count this month
        if (new Date(comm.created_at) >= thisMonth) {
          stats.thisMonth++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting communication stats:', error);
      return {
        total: 0,
        byType: {},
        lastContact: null,
        thisMonth: 0
      };
    }
  }
}

export default new CustomerCommunicationsService();
