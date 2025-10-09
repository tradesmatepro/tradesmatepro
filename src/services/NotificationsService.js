import { getSupabaseClient } from '../utils/supabaseClient';

// Business event/category for in-app notifications (stored in notifications.data JSON)
const ALLOWED_CATEGORIES = new Set([
  'INVOICE_OVERDUE', 'QUOTE_EXPIRED', 'WORK_ORDER_CREATED', 'WORK_ORDER_COMPLETED',
  'INVENTORY', 'JOB', 'WORK_ORDER', 'EXPENSE', 'PAYMENT', 'CUSTOMER', 'EMPLOYEE',
  'TIMESHEET', 'PTO', 'PURCHASE_ORDER', 'SCHEDULE', 'QUOTE', 'SYSTEM'
]);
const normalizeCategory = (t) => {
  const v = t ? String(t).toUpperCase() : 'SYSTEM';
  return ALLOWED_CATEGORIES.has(v) ? v : 'SYSTEM';
};

class NotificationsService {
  constructor() {
    this.supabase = getSupabaseClient();
  }

  // Get notifications for a company/user
  async getNotifications(companyId, userId = null, filters = {}) {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (userId) {
        // Include user-specific and broadcast (null user) notifications
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      if (filters.type || filters.category) {
        // Filter by business category stored in data JSON
        const cat = normalizeCategory(filters.type || filters.category);
        query = query.contains('data', { category: cat });
      }

      if (filters.unreadOnly) {
        // Fixed: Use correct notification_status_enum value
        query = query.eq('status', 'pending');
      }

      if (filters.since) {
        query = query.gte('created_at', filters.since);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return []; // Return empty array instead of throwing
    }
  }

  // Get unread notification count
  async getUnreadCount(companyId, userId = null) {
    try {
      let query = this.supabase
        .from('notifications')
        .select('id')
        .eq('company_id', companyId)
        .eq('status', 'pending');

      if (userId) {
        // Include user-specific and broadcast (null user) notifications in count
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch unread count: ${error.message}`);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(companyId, userId = null) {
    try {
      let query = this.supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('company_id', companyId)
        .eq('status', 'pending');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Create a new in-app notification; store business category in data JSON
  async createNotification(companyId, notificationData) {
    try {
      const category = normalizeCategory(notificationData.type);
      const payload = {
        company_id: companyId,
        user_id: notificationData.user_id || null, // null for broadcast notifications
        type: 'in_app', // matches notification_type_enum
        title: notificationData.title || category,
        message: notificationData.message || '',
        status: 'pending',
        created_at: new Date().toISOString(),
        data: {
          category,
          severity: notificationData.severity || 'INFO',
          related_id: notificationData.related_id || null,
          meta: notificationData.data || null
        }
      };

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(payload)
        .select();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Check if a similar notification exists recently (to avoid spam)
  async hasRecent(companyId, { type, related_id = null, withinMs = 24 * 60 * 60 * 1000 }) {
    try {
      const since = new Date(Date.now() - withinMs).toISOString();
      const category = normalizeCategory(type);
      let query = this.supabase
        .from('notifications')
        .select('id')
        .eq('company_id', companyId)
        .contains('data', { category })
        .gte('created_at', since);

      if (related_id) {
        query = query.contains('data', { related_id });
      }

      const { data, error } = await query;
      if (error) return false;
      return Array.isArray(data) && data.length > 0;
    } catch (e) {
      console.warn('hasRecent check failed', e);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification icon based on type and severity
  getNotificationIcon(type, severity) {
    const icons = {
      INVENTORY: {
        CRITICAL: '🚨',
        WARNING: '⚠️',
        INFO: '📦'
      },
      SYSTEM: {
        CRITICAL: '🔴',
        WARNING: '🟡',
        INFO: 'ℹ️'
      },
      JOB: {
        CRITICAL: '🔥',
        WARNING: '⚠️',
        INFO: '🔧'
      }
    };

    return icons[type]?.[severity] || icons.SYSTEM.INFO;
  }

  // Get notification color based on severity
  getNotificationColor(severity) {
    const colors = {
      CRITICAL: 'text-red-600 bg-red-100',
      WARNING: 'text-yellow-600 bg-yellow-100',
      INFO: 'text-blue-600 bg-blue-100'
    };

    return colors[severity] || colors.INFO;
  }

  // Format notification time
  formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }
}

export default new NotificationsService();
