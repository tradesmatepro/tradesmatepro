import { supaFetch } from '../utils/supaFetch';

class MarketplaceMessagingService {
  /**
   * Send a message related to a marketplace request
   * @param {string} requestId - The marketplace request ID
   * @param {string} senderId - The sender's user ID
   * @param {string} recipientId - The recipient's user ID or company ID
   * @param {string} message - The message content
   * @param {string} companyId - The sender's company ID
   * @returns {Promise<Object>} The created message
   */
  async sendMarketplaceMessage(requestId, senderId, recipientId, message, companyId, context = {}) {
    try {
      const messageData = {
        sender_id: senderId,
        recipient_id: recipientId || null,
        // Use supported columns
        message_type: 'client', // allowed: internal | client | system
        body: message.trim(), // 'body' is the required text column
        status: 'sent',
        // Conversation grouping + context
        conversation_id: requestId,
        metadata: {
          marketplace_request_id: requestId,
          requester_company_id: context.requester_company_id || null,
          contractor_company_id: context.contractor_company_id || null
        },
        created_at: new Date().toISOString()
      };

      const response = await supaFetch('messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }, null); // unscoped so both parties can see messages

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to send message');
      }

      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error sending marketplace message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a marketplace request
   * @param {string} requestId - The marketplace request ID
   * @param {string} companyId - The company ID for RLS
   * @returns {Promise<Array>} Array of messages
   */
  async getMarketplaceMessages(requestId) {
    try {
      // Filter by JSON metadata to avoid schema coupling; unscoped so both sides are visible
      const msgTypes = encodeURIComponent('(client,system,internal)');
      const query = `messages?select=*,sender:users!sender_id(full_name,role,company_id)` +
        `&metadata->>marketplace_request_id=eq.${requestId}` +
        `&message_type=in.${msgTypes}` +
        `&order=created_at.asc`;

      const response = await supaFetch(query, { method: 'GET' }, null);

      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading marketplace messages:', error);
      return [];
    }
  }

  /**
   * Get message threads for a company (all marketplace conversations)
   * @param {string} companyId - The company ID
   * @returns {Promise<Array>} Array of message threads
   */
  async getMarketplaceThreads(companyId) {
    try {
      // Get all marketplace messages where this company is a participant (sender or recipient)
      const msgTypes = encodeURIComponent('(client,system,internal)');
      const query = `messages?select=*,sender:users!sender_id(full_name,company_id)` +
        `&message_type=in.${msgTypes}` +
        `&or=(sender_id.eq.${companyId},recipient_id.eq.${companyId})` +
        `&order=created_at.desc`;

      const response = await supaFetch(query, { method: 'GET' }, null);
      if (!response.ok) throw new Error('Failed to load message threads');
      const data = await response.json();

      // Group by request id stored in metadata
      const threads = {};
      data.forEach(message => {
        const requestId = message?.metadata?.marketplace_request_id || message?.conversation_id;
        if (!requestId) return;
        if (!threads[requestId]) {
          threads[requestId] = {
            request_id: requestId,
            messages: [],
            last_message: null,
            unread_count: 0
          };
        }
        threads[requestId].messages.push(message);
        if (!threads[requestId].last_message ||
            new Date(message.created_at) > new Date(threads[requestId].last_message.created_at)) {
          threads[requestId].last_message = message;
        }
      });

      return Object.values(threads);
    } catch (error) {
      console.error('Error loading marketplace threads:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   * @param {Array<string>} messageIds - Array of message IDs to mark as read
   * @param {string} companyId - The company ID
   * @returns {Promise<boolean>} Success status
   */
  async markMessagesAsRead(messageIds, companyId) {
    try {
      const updates = messageIds.map(id => ({
        id,
        status: 'read',
        read_at: new Date().toISOString()
      }));

      const promises = updates.map(update => 
        supaFetch(`messages?id=eq.${update.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: update.status,
            read_at: update.read_at 
          })
        }, companyId)
      );

      const responses = await Promise.all(promises);
      return responses.every(response => response.ok);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get unread message count for a company
   * @param {string} companyId - The company ID
   * @returns {Promise<number>} Number of unread messages
   */
  async getUnreadCount(companyId) {
    try {
      const query = `messages?select=id&message_type=eq.marketplace_communication&recipient_id=eq.${companyId}&status=neq.read`;
      
      const response = await supaFetch(query, { method: 'GET' }, companyId);
      
      if (response.ok) {
        const data = await response.json();
        return data.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Send a system notification message
   * @param {string} requestId - The marketplace request ID
   * @param {string} recipientId - The recipient's user ID
   * @param {string} message - The system message content
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} The created message
   */
  async sendSystemMessage(requestId, recipientId, message, companyId, context = {}) {
    try {
      const messageData = {
        sender_id: null,
        recipient_id: recipientId || null,
        message_type: 'system',
        body: message,
        status: 'sent',
        conversation_id: requestId,
        metadata: {
          marketplace_request_id: requestId,
          requester_company_id: context.requester_company_id || null,
          contractor_company_id: context.contractor_company_id || null
        },
        created_at: new Date().toISOString()
      };

      const response = await supaFetch('messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }, null);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to send system message');
      }
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
    }
  }
}

const marketplaceMessagingService = new MarketplaceMessagingService();
export default marketplaceMessagingService;
