import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class MessagingService {
  /**
   * Get all message threads for a customer
   * Groups messages by request_id or work_order_id
   */
  static async getMessageThreads(customerId) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          marketplace_requests:request_id (
            id,
            title,
            description
          ),
          work_orders:work_order_id (
            id,
            job_number,
            title,
            description
          )
        `)
        .or(`sender_id.eq.${customerId},recipient_id.eq.${customerId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by context (request or work order)
      const threads = {};
      
      messages.forEach(message => {
        let threadKey, threadData;
        
        if (message.request_id) {
          threadKey = `request_${message.request_id}`;
          threadData = {
            id: threadKey,
            type: 'request',
            context_id: message.request_id,
            title: message.marketplace_requests?.title || `Request #${message.request_id.slice(-8)}`,
            description: message.marketplace_requests?.description,
            messages: []
          };
        } else if (message.work_order_id) {
          threadKey = `job_${message.work_order_id}`;
          threadData = {
            id: threadKey,
            type: 'job',
            context_id: message.work_order_id,
            title: message.work_orders?.title || `Job #${message.work_orders?.job_number || message.work_order_id.slice(-8)}`,
            description: message.work_orders?.description,
            messages: []
          };
        }

        if (threadKey) {
          if (!threads[threadKey]) {
            threads[threadKey] = threadData;
          }
          threads[threadKey].messages.push(message);
        }
      });

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
  static async getMessagesForContext(contextType, contextId, customerId) {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${customerId},recipient_id.eq.${customerId}`)
        .order('created_at', { ascending: true });

      if (contextType === 'request') {
        query = query.eq('request_id', contextId);
      } else if (contextType === 'job') {
        query = query.eq('work_order_id', contextId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
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
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          message_text: messageText,
          request_id: requestId,
          response_id: responseId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          message_text: messageText,
          work_order_id: workOrderId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message in job:', error);
      throw error;
    }
  }

  /**
   * Get contractor info for a request (to determine recipient_id)
   */
  static async getContractorForRequest(requestId) {
    try {
      // Get the accepted response for this request
      const { data: response, error: responseError } = await supabase
        .from('marketplace_responses')
        .select(`
          *,
          companies (
            id,
            name,
            users (id, name, email)
          )
        `)
        .eq('request_id', requestId)
        .eq('response_status', 'ACCEPTED')
        .single();

      if (responseError) throw responseError;

      // Return the first user from the company (could be enhanced to get specific contact)
      const contractor = response.companies?.users?.[0];
      return {
        contractor_id: contractor?.id,
        contractor_name: contractor?.name,
        company_id: response.companies?.id,
        company_name: response.companies?.name,
        response_id: response.id
      };
    } catch (error) {
      console.error('Error getting contractor for request:', error);
      throw error;
    }
  }

  /**
   * Get contractor info for a work order (to determine recipient_id)
   */
  static async getContractorForJob(workOrderId) {
    try {
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          companies (
            id,
            name,
            users (id, name, email)
          )
        `)
        .eq('id', workOrderId)
        .single();

      if (error) throw error;

      // Return the first user from the company (could be enhanced to get specific contact)
      const contractor = workOrder.companies?.users?.[0];
      return {
        contractor_id: contractor?.id,
        contractor_name: contractor?.name,
        company_id: workOrder.companies?.id,
        company_name: workOrder.companies?.name
      };
    } catch (error) {
      console.error('Error getting contractor for job:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(messageIds, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .eq('recipient_id', userId)
        .is('read_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

export default MessagingService;
