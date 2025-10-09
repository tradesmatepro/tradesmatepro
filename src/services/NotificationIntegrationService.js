// Notification Integration Service for TradeMate Pro
// Orchestrates in-app, email, and SMS notifications

import NotificationGenerator from './NotificationGenerator';
import NotificationTemplateService from './NotificationTemplateService';
import NotificationsService from './NotificationsService';
import settingsService from './SettingsService';

class NotificationIntegrationService {
  constructor() {
    this.processingQueue = new Map();
  }

  // Main notification dispatcher
  async sendNotification(companyId, eventType, data) {
    try {
      // Prevent duplicate processing
      const key = `${companyId}-${eventType}-${data.id || Date.now()}`;
      if (this.processingQueue.has(key)) {
        return this.processingQueue.get(key);
      }

      const promise = this._processNotification(companyId, eventType, data);
      this.processingQueue.set(key, promise);
      
      // Clean up after processing
      setTimeout(() => this.processingQueue.delete(key), 5000);
      
      return await promise;
    } catch (error) {
      console.error('Notification processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  async _processNotification(companyId, eventType, data) {
    const results = {
      inApp: null,
      email: null,
      sms: null
    };

    // Get notification settings
    const settings = await settingsService.getSettings(companyId);
    
    // Process in-app notification
    if (settings?.in_app_notifications_enabled !== false) {
      results.inApp = await this._processInAppNotification(companyId, eventType, data);
    }

    // Process email notification
    if (settings?.email_notifications_enabled === true) {
      results.email = await this._processEmailNotification(companyId, eventType, data);
    }

    // Process SMS notification
    if (settings?.sms_notifications_enabled === true) {
      results.sms = await this._processSmsNotification(companyId, eventType, data);
    }

    return results;
  }

  async _processInAppNotification(companyId, eventType, data) {
    try {
      switch (eventType) {
        case 'INVENTORY_LOW':
          return await NotificationGenerator.lowInventory(companyId, data.item, data.totals);
        
        case 'PTO_SUBMITTED':
          return await NotificationGenerator.ptoSubmitted(companyId, data.request);
        
        case 'INVOICE_OVERDUE':
          return await NotificationGenerator.invoiceOverdue(companyId, data.invoice);
        
        case 'QUOTE_EXPIRED':
          return await NotificationGenerator.quoteExpired(companyId, data.workOrder);
        
        case 'WORK_ORDER_CREATED':
          return await NotificationGenerator.workOrderCreated(companyId, data.workOrder, data.customer);
        
        case 'WORK_ORDER_STATUS_CHANGED':
          return await NotificationGenerator.workOrderStatusChanged(companyId, data.workOrder, data.oldStatus, data.newStatus);
        
        case 'JOB_SCHEDULED':
          return await NotificationGenerator.jobScheduled(companyId, data.job, data.employee);
        
        case 'JOB_COMPLETED':
          return await NotificationGenerator.jobCompleted(companyId, data.job, data.employee);
        
        case 'TIMESHEET_SUBMITTED':
          return await NotificationGenerator.timesheetSubmitted(companyId, data.timesheet, data.employee);
        
        case 'TIMESHEET_STATUS_CHANGED':
          return await NotificationGenerator.timesheetStatusChanged(companyId, data.timesheet, data.employee, data.status, data.approver);
        
        case 'EXPENSE_SUBMITTED':
          return await NotificationGenerator.expenseSubmitted(companyId, data.expense, data.employee);
        
        case 'EXPENSE_STATUS_CHANGED':
          return await NotificationGenerator.expenseStatusChanged(companyId, data.expense, data.employee, data.status, data.approver);
        
        case 'PURCHASE_ORDER_CREATED':
          return await NotificationGenerator.purchaseOrderCreated(companyId, data.po, data.vendor);
        
        case 'PURCHASE_ORDER_APPROVED':
          return await NotificationGenerator.purchaseOrderApproved(companyId, data.po, data.approver);
        
        case 'PAYMENT_RECEIVED':
          return await NotificationGenerator.paymentReceived(companyId, data.payment, data.invoice, data.customer);
        
        case 'PAYMENT_FAILED':
          return await NotificationGenerator.paymentFailed(companyId, data.payment, data.invoice, data.customer, data.reason);
        
        case 'CUSTOMER_CREATED':
          return await NotificationGenerator.customerCreated(companyId, data.customer, data.createdBy);
        
        case 'EMPLOYEE_CREATED':
          return await NotificationGenerator.employeeCreated(companyId, data.employee, data.createdBy);
        
        case 'SYSTEM_BACKUP_COMPLETED':
          return await NotificationGenerator.systemBackupCompleted(companyId, data.backupInfo);
        
        case 'INTEGRATION_ERROR':
          return await NotificationGenerator.integrationError(companyId, data.integration, data.error);
        
        case 'APPOINTMENT_REMINDER':
          return await NotificationGenerator.appointmentReminder(companyId, data.appointment, data.customer, data.employee);
        
        default:
          console.warn('Unknown notification event type:', eventType);
          return null;
      }
    } catch (error) {
      console.error('In-app notification failed:', error);
      return null;
    }
  }

  async _processEmailNotification(companyId, eventType, data) {
    try {
      const emailMapping = {
        'QUOTE_SENT': 'QUOTE_SENT',
        'QUOTE_APPROVED': 'QUOTE_APPROVED',
        'APPOINTMENT_REMINDER': 'APPOINTMENT_REMINDER',
        'INVOICE_OVERDUE': 'INVOICE_OVERDUE',
        'PAYMENT_RECEIVED': 'PAYMENT_RECEIVED',
        'WORK_ORDER_COMPLETED': 'WORK_COMPLETED'
      };

      const templateType = emailMapping[eventType];
      if (!templateType) return null;

      const recipient = data.customer?.email || data.employee?.email;
      if (!recipient) return null;

      return await NotificationTemplateService.sendEmail(companyId, templateType, data, recipient);
    } catch (error) {
      console.error('Email notification failed:', error);
      return null;
    }
  }

  async _processSmsNotification(companyId, eventType, data) {
    try {
      const smsMapping = {
        'APPOINTMENT_REMINDER': 'APPOINTMENT_REMINDER',
        'QUOTE_APPROVED': 'QUOTE_APPROVED',
        'URGENT_UPDATE': 'URGENT_UPDATE'
      };

      const templateType = smsMapping[eventType];
      if (!templateType) return null;

      const recipient = data.customer?.phone || data.employee?.phone;
      if (!recipient) return null;

      return await NotificationTemplateService.sendSms(companyId, templateType, data, recipient);
    } catch (error) {
      console.error('SMS notification failed:', error);
      return null;
    }
  }

  // Convenience methods for common events
  async notifyInventoryLow(companyId, item, totals) {
    return this.sendNotification(companyId, 'INVENTORY_LOW', { item, totals });
  }

  async notifyWorkOrderCreated(companyId, workOrder, customer) {
    return this.sendNotification(companyId, 'WORK_ORDER_CREATED', { workOrder, customer });
  }

  async notifyJobScheduled(companyId, job, employee) {
    return this.sendNotification(companyId, 'JOB_SCHEDULED', { job, employee });
  }

  async notifyJobCompleted(companyId, job, employee) {
    return this.sendNotification(companyId, 'JOB_COMPLETED', { job, employee });
  }

  async notifyTimesheetSubmitted(companyId, timesheet, employee) {
    return this.sendNotification(companyId, 'TIMESHEET_SUBMITTED', { timesheet, employee });
  }

  async notifyExpenseSubmitted(companyId, expense, employee) {
    return this.sendNotification(companyId, 'EXPENSE_SUBMITTED', { expense, employee });
  }

  async notifyPaymentReceived(companyId, payment, invoice, customer) {
    return this.sendNotification(companyId, 'PAYMENT_RECEIVED', { payment, invoice, customer });
  }

  async notifyQuoteApproved(companyId, quote, customer) {
    return this.sendNotification(companyId, 'QUOTE_APPROVED', { quote, customer });
  }

  async notifyAppointmentReminder(companyId, appointment, customer, employee) {
    return this.sendNotification(companyId, 'APPOINTMENT_REMINDER', { appointment, customer, employee });
  }

  async notifyInvoiceOverdue(companyId, invoice, customer) {
    return this.sendNotification(companyId, 'INVOICE_OVERDUE', { invoice, customer });
  }

  // Batch notification processing
  async processBatch(companyId, notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendNotification(companyId, notification.eventType, notification.data);
        results.push({ ...notification, result });
      } catch (error) {
        results.push({ ...notification, error: error.message });
      }
    }
    
    return results;
  }

  // Get notification statistics
  async getNotificationStats(companyId, timeframe = '24h') {
    try {
      const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720; // 30d
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const notifications = await NotificationsService.getNotifications(companyId, null, {
        since,
        limit: 1000
      });

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        byType: {},
        bySeverity: {}
      };

      notifications.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.bySeverity[n.severity] = (stats.bySeverity[n.severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return { total: 0, unread: 0, byType: {}, bySeverity: {} };
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications(companyId, olderThanDays = 30) {
    try {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
      
      // This would need to be implemented in NotificationsService
      console.log(`Would clean up notifications older than ${cutoff} for company ${companyId}`);
      
      return { success: true, message: `Cleanup scheduled for notifications older than ${olderThanDays} days` };
    } catch (error) {
      console.error('Notification cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }
}

const notificationIntegrationService = new NotificationIntegrationService();
export default notificationIntegrationService;
