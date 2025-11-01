import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

/**
 * UnifiedMessagingService - Unified inbox across all 3 message types
 * Aggregates: Internal + Customer + Marketplace messages
 * Provides unified view, search, and filtering
 */
class UnifiedMessagingService {
  constructor() {
    this.baseHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all message threads across all types
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID
   * @param {string} messageType - Optional filter: 'internal' | 'customer' | 'marketplace' | null (all)
   * @returns {Promise<Array>} Array of unified message threads
   */
  async getAllThreads(companyId, userId, messageType = null) {
    try {
      // Use user_profiles view (industry standard - joins users + profiles)
      let query = `${SUPABASE_URL}/rest/v1/messages?` +
        `company_id=eq.${companyId}&` +
        `or=(sender_id.eq.${userId},recipient_id.eq.${userId})&` +
        `select=*,user_profiles!sender_id(first_name,last_name,name),customers(name),marketplace_requests:request_id(title),work_orders:work_order_id(job_number,title)&` +
        `order=created_at.desc`;

      // Filter by message type if specified
      if (messageType) {
        query = `${SUPABASE_URL}/rest/v1/messages?` +
          `message_type=eq.${messageType}&` +
          `company_id=eq.${companyId}&` +
          `or=(sender_id.eq.${userId},recipient_id.eq.${userId})&` +
          `select=*,user_profiles!sender_id(first_name,last_name,name),customers(name),marketplace_requests:request_id(title),work_orders:work_order_id(job_number,title)&` +
          `order=created_at.desc`;
      }

      const response = await fetch(query, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error('Failed to fetch message threads');
      }

      const messages = await response.json();

      // Group messages into threads
      const threads = this._groupMessagesIntoThreads(messages);

      return threads;
    } catch (error) {
      console.error('Error fetching all threads:', error);
      throw error;
    }
  }

  /**
   * Group messages into threads based on context
   * @private
   */
  _groupMessagesIntoThreads(messages) {
    const threads = {};

    messages.forEach(message => {
      let threadKey;
      let threadTitle;
      let threadType = message.message_type;

      // Determine thread key based on message type
      if (message.message_type === 'internal') {
        if (message.work_order_id) {
          threadKey = `job_${message.work_order_id}`;
          threadTitle = `Job: ${message.work_orders?.job_number || message.work_orders?.title || 'Unknown'}`;
        } else if (message.thread_id) {
          threadKey = `thread_${message.thread_id}`;
          threadTitle = `Direct Message`;
        } else {
          threadKey = `message_${message.id}`;
          threadTitle = `Message`;
        }
      } else if (message.message_type === 'customer') {
        threadKey = `customer_${message.customer_id}`;
        threadTitle = `Customer: ${message.customers?.name || 'Unknown'}`;
      } else if (message.message_type === 'marketplace') {
        threadKey = `marketplace_${message.request_id}`;
        threadTitle = `Marketplace: ${message.marketplace_requests?.title || 'Request'}`;
      } else {
        threadKey = `message_${message.id}`;
        threadTitle = `Message`;
      }

      // Create thread if it doesn't exist
      if (!threads[threadKey]) {
        threads[threadKey] = {
          thread_key: threadKey,
          thread_type: threadType,
          title: threadTitle,
          messages: [],
          last_message: null,
          unread_count: 0,
          participants: new Set()
        };
      }

      // Add message to thread
      threads[threadKey].messages.push(message);

      // Track participants
      if (message.sender_id) threads[threadKey].participants.add(message.sender_id);
      if (message.recipient_id) threads[threadKey].participants.add(message.recipient_id);

      // Count unread messages
      if (!message.read_at && message.recipient_id) {
        threads[threadKey].unread_count++;
      }

      // Update last message
      if (!threads[threadKey].last_message ||
          new Date(message.created_at) > new Date(threads[threadKey].last_message.created_at)) {
        threads[threadKey].last_message = message;
      }
    });

    // Convert participants Set to Array
    Object.values(threads).forEach(thread => {
      thread.participants = Array.from(thread.participants);
    });

    return Object.values(threads);
  }

  /**
   * Get unread counts across all message types
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Unread counts by type
   */
  async getUnreadCounts(companyId, userId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/messages?` +
        `company_id=eq.${companyId}&` +
        `recipient_id=eq.${userId}&` +
        `read_at=is.null&` +
        `select=message_type`,
        {
          headers: this.baseHeaders
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch unread counts');
      }

      const messages = await response.json();

      // Count by type
      const counts = {
        internal: 0,
        customer: 0,
        marketplace: 0,
        total: messages.length
      };

      messages.forEach(message => {
        if (counts.hasOwnProperty(message.message_type)) {
          counts[message.message_type]++;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return {
        internal: 0,
        customer: 0,
        marketplace: 0,
        total: 0
      };
    }
  }

  /**
   * Search messages across all types
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID
   * @param {string} searchTerm - The search term
   * @param {string} messageType - Optional filter by type
   * @returns {Promise<Array>} Array of matching messages
   */
  async searchMessages(companyId, userId, searchTerm, messageType = null) {
    try {
      let query = `${SUPABASE_URL}/rest/v1/messages?` +
        `company_id=eq.${companyId}&` +
        `or=(sender_id.eq.${userId},recipient_id.eq.${userId})&` +
        `content=ilike.*${searchTerm}*&` +
        `select=*,user_profiles!sender_id(first_name,last_name,name),customers(name),marketplace_requests:request_id(title)&` +
        `order=created_at.desc`;

      if (messageType) {
        query = `${SUPABASE_URL}/rest/v1/messages?` +
          `message_type=eq.${messageType}&` +
          `company_id=eq.${companyId}&` +
          `or=(sender_id.eq.${userId},recipient_id.eq.${userId})&` +
          `content=ilike.*${searchTerm}*&` +
          `select=*,user_profiles!sender_id(first_name,last_name,name),customers(name),marketplace_requests:request_id(title)&` +
          `order=created_at.desc`;
      }

      const response = await fetch(query, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error('Failed to search messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get recent activity across all message types
   * @param {string} companyId - The company ID
   * @param {number} limit - Number of recent messages to fetch
   * @returns {Promise<Array>} Array of recent messages
   */
  async getRecentActivity(companyId, limit = 50) {
    try {
      const query = `${SUPABASE_URL}/rest/v1/messages?` +
        `company_id=eq.${companyId}&` +
        `select=*,user_profiles!sender_id(first_name,last_name,name),customers(name),marketplace_requests:request_id(title)&` +
        `order=created_at.desc&` +
        `limit=${limit}`;

      const response = await fetch(query, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get message statistics
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} Message statistics
   */
  async getMessageStats(companyId) {
    try {
      const messages = await this.getRecentActivity(companyId, 1000);

      const stats = {
        total: messages.length,
        byType: {
          internal: 0,
          customer: 0,
          marketplace: 0
        },
        todayCount: 0,
        thisWeekCount: 0,
        thisMonthCount: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      thisWeek.setHours(0, 0, 0, 0);

      const thisMonth = new Date();
      thisMonth.setDate(thisMonth.getDate() - 30);
      thisMonth.setHours(0, 0, 0, 0);

      messages.forEach(message => {
        // Count by type
        if (stats.byType.hasOwnProperty(message.message_type)) {
          stats.byType[message.message_type]++;
        }

        const messageDate = new Date(message.created_at);

        // Count by time period
        if (messageDate >= today) {
          stats.todayCount++;
        }
        if (messageDate >= thisWeek) {
          stats.thisWeekCount++;
        }
        if (messageDate >= thisMonth) {
          stats.thisMonthCount++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting message stats:', error);
      return {
        total: 0,
        byType: { internal: 0, customer: 0, marketplace: 0 },
        todayCount: 0,
        thisWeekCount: 0,
        thisMonthCount: 0
      };
    }
  }
}

const unifiedMessagingService = new UnifiedMessagingService();
export default unifiedMessagingService;

