import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

class CustomerMessagesService {
  constructor() {
    this.baseHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Get messages for a customer
  async getCustomerMessages(companyId, customerId) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/customer_messages?company_id=eq.${companyId}&customer_id=eq.${customerId}&select=*,users(full_name)&order=created_at.desc`;
      
      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customer messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer messages:', error);
      throw error;
    }
  }

  // Send message to customer
  async sendMessage(companyId, messageData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_messages`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: messageData.customer_id,
          sender_id: messageData.sender_id,
          message: messageData.message,
          status: 'SENT',
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark message as delivered
  async markAsDelivered(messageId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: this.baseHeaders,
        body: JSON.stringify({
          status: 'DELIVERED'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as delivered: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: this.baseHeaders,
        body: JSON.stringify({
          status: 'READ'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Get unread message count for a customer
  async getUnreadCount(companyId, customerId) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/customer_messages?company_id=eq.${companyId}&customer_id=eq.${customerId}&status=eq.SENT&select=id`;
      
      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.statusText}`);
      }

      const messages = await response.json();
      return messages.length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Get recent messages across all customers
  async getRecentMessages(companyId, limit = 50) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/customer_messages?company_id=eq.${companyId}&select=*,customers(name,email,phone),users(full_name)&order=created_at.desc&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      throw error;
    }
  }

  // Get message statistics
  async getMessageStats(companyId) {
    try {
      const messages = await this.getRecentMessages(companyId, 1000); // Get more for stats
      
      const stats = {
        total: messages.length,
        byStatus: {},
        todayCount: 0,
        thisWeekCount: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      thisWeek.setHours(0, 0, 0, 0);

      messages.forEach(message => {
        // Count by status
        stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1;
        
        const messageDate = new Date(message.created_at);
        
        // Count today
        if (messageDate >= today) {
          stats.todayCount++;
        }
        
        // Count this week
        if (messageDate >= thisWeek) {
          stats.thisWeekCount++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting message stats:', error);
      return {
        total: 0,
        byStatus: {},
        todayCount: 0,
        thisWeekCount: 0
      };
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_messages?id=eq.${messageId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Search messages
  async searchMessages(companyId, searchTerm, customerId = null) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/customer_messages?company_id=eq.${companyId}&message=ilike.*${searchTerm}*&select=*,customers(name,email,phone),users(full_name)&order=created_at.desc`;
      
      if (customerId) {
        url += `&customer_id=eq.${customerId}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to search messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }
}

export default new CustomerMessagesService();
