import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

class LeadsService {
  constructor() {
    this.baseHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all leads for a company
  async getLeads(companyId, filters = {}) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/leads?company_id=eq.${companyId}&select=*,customers(name,email,phone),profiles!assigned_to(full_name)&order=created_at.desc`;
      
      if (filters.status) {
        url += `&status=eq.${filters.status}`;
      }
      
      if (filters.assigned_to) {
        url += `&assigned_to=eq.${filters.assigned_to}`;
      }
      
      if (filters.limit) {
        url += `&limit=${filters.limit}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  // Create a new lead
  async createLead(companyId, leadData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: leadData.customer_id || null,
          source: leadData.source,
          status: leadData.status || 'NEW',
          potential_value: leadData.potential_value || null,
          assigned_to: leadData.assigned_to || null,
          created_by: leadData.created_by,
          updated_by: leadData.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create lead: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Update lead status
  async updateLeadStatus(leadId, status, updatedBy) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: status, // 'NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update lead status: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  // Convert lead to customer
  async convertLead(leadId, customerId, updatedBy) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'CONVERTED',
          customer_id: customerId,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to convert lead: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error converting lead:', error);
      throw error;
    }
  }

  // Assign lead to user
  async assignLead(leadId, assignedTo, updatedBy) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`, {
        method: 'PATCH',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          assigned_to: assignedTo,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign lead: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw error;
    }
  }

  // Get lead statistics
  async getLeadStats(companyId) {
    try {
      const leads = await this.getLeads(companyId);
      
      const stats = {
        total: leads.length,
        byStatus: {},
        totalValue: 0,
        averageValue: 0,
        conversionRate: 0
      };

      let convertedCount = 0;
      let totalValue = 0;
      let valueCount = 0;

      leads.forEach(lead => {
        // Count by status
        stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
        
        // Track conversions
        if (lead.status === 'CONVERTED') {
          convertedCount++;
        }
        
        // Calculate total value
        if (lead.potential_value) {
          totalValue += Number(lead.potential_value);
          valueCount++;
        }
      });

      stats.totalValue = totalValue;
      stats.averageValue = valueCount > 0 ? totalValue / valueCount : 0;
      stats.conversionRate = leads.length > 0 ? (convertedCount / leads.length) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error getting lead stats:', error);
      return {
        total: 0,
        byStatus: {},
        totalValue: 0,
        averageValue: 0,
        conversionRate: 0
      };
    }
  }

  // Delete lead
  async deleteLead(leadId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to delete lead: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Get leads assigned to a specific user
  async getMyLeads(companyId, userId) {
    return this.getLeads(companyId, { assigned_to: userId });
  }

  // Get leads by status
  async getLeadsByStatus(companyId, status) {
    return this.getLeads(companyId, { status });
  }
}

export default new LeadsService();
