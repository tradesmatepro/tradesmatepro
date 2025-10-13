import { supaFetch } from '../utils/supaFetch';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

class MessagingService {
  /**
   * Get all message threads for a contractor company
   * Groups messages by request_id or work_order_id
   */
  static async getMessageThreads(companyId, userId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?or=(sender_id.eq.${userId},recipient_id.eq.${userId})&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();

      // Group messages by context (request or work order)
      const threads = {};
      
      for (const message of messages) {
        let threadKey, threadData;
        
        if (message.request_id) {
          threadKey = `request_${message.request_id}`;
          
          // Get request details if not already cached
          if (!threads[threadKey]) {
            const requestDetails = await this.getRequestDetails(message.request_id);
            threadData = {
              id: threadKey,
              type: 'request',
              context_id: message.request_id,
              title: requestDetails?.title || `Request #${message.request_id.slice(-8)}`,
              description: requestDetails?.description,
              customer_name: requestDetails?.customer_name,
              messages: []
            };
          }
        } else if (message.work_order_id) {
          threadKey = `job_${message.work_order_id}`;
          
          // Get work order details if not already cached
          if (!threads[threadKey]) {
            const jobDetails = await this.getJobDetails(message.work_order_id);
            threadData = {
              id: threadKey,
              type: 'job',
              context_id: message.work_order_id,
              title: jobDetails?.title || `Job #${jobDetails?.job_number || message.work_order_id.slice(-8)}`,
              description: jobDetails?.description,
              customer_name: jobDetails?.customer_name,
              messages: []
            };
          }
        }

        if (threadKey) {
          if (!threads[threadKey]) {
            threads[threadKey] = threadData;
          }
          threads[threadKey].messages.push(message);
        }
      }

      // Sort messages within each thread by created_at
      Object.values(threads).forEach(thread => {
        thread.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        thread.lastMessage = thread.messages[thread.messages.length - 1];
      });

      return Object.values(threads);
    } catch (error) {
      console.error('Error fetching message threads:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific context (request or work order)
   */
  static async getMessagesForContext(contextType, contextId, userId) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/messages?or=(sender_id.eq.${userId},recipient_id.eq.${userId})&order=created_at.asc`;
      
      if (contextType === 'request') {
        url += `&request_id=eq.${contextId}`;
      } else if (contextType === 'job') {
        url += `&work_order_id=eq.${contextId}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages for context:', error);
      throw error;
    }
  }

  /**
   * Send a message in a request context
   */
  static async sendMessageInRequest(requestId, responseId, senderId, recipientId, messageText) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: senderId,
          recipient_id: recipientId,
          message_text: messageText,
          request_id: requestId,
          response_id: responseId,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error('Error sending message in request:', error);
      throw error;
    }
  }

  /**
   * Send a message in a work order context
   */
  static async sendMessageInJob(workOrderId, senderId, recipientId, messageText) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: senderId,
          recipient_id: recipientId,
          message_text: messageText,
          work_order_id: workOrderId,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error('Error sending message in job:', error);
      throw error;
    }
  }

  /**
   * Get customer info for a request (to determine recipient_id)
   */
  static async getCustomerForRequest(requestId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_requests?id=eq.${requestId}&select=*,customers(id,name,email)`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch request details');
      const data = await response.json();
      const request = data[0];

      return {
        customer_id: request.customers?.id,
        customer_name: request.customers?.name,
        customer_email: request.customers?.email
      };
    } catch (error) {
      console.error('Error getting customer for request:', error);
      throw error;
    }
  }

  /**
   * Get customer info for a work order (to determine recipient_id)
   */
  static async getCustomerForJob(workOrderId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/work_orders?id=eq.${workOrderId}&select=*,customers(id,name,email)`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch work order details');
      const data = await response.json();
      const workOrder = data[0];

      return {
        customer_id: workOrder.customers?.id,
        customer_name: workOrder.customers?.name,
        customer_email: workOrder.customers?.email
      };
    } catch (error) {
      console.error('Error getting customer for job:', error);
      throw error;
    }
  }

  /**
   * Get request details for thread display
   */
  static async getRequestDetails(requestId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_requests?id=eq.${requestId}&select=*,customers(name)`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch request details');
      const data = await response.json();
      const request = data[0];

      return {
        title: request?.title,
        description: request?.description,
        customer_name: request?.customers?.name
      };
    } catch (error) {
      console.error('Error getting request details:', error);
      return null;
    }
  }

  /**
   * Get job details for thread display
   */
  static async getJobDetails(workOrderId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/work_orders?id=eq.${workOrderId}&select=*,customers(name)`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch work order details');
      const data = await response.json();
      const workOrder = data[0];

      return {
        title: workOrder?.title,
        description: workOrder?.description,
        job_number: workOrder?.job_number,
        customer_name: workOrder?.customers?.name
      };
    } catch (error) {
      console.error('Error getting job details:', error);
      return null;
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(messageIds, userId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=in.(${messageIds.join(',')})&recipient_id=eq.${userId}&read_at=is.null`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          read_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to mark messages as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

export default MessagingService;
