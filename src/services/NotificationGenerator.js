import NotificationsService from './NotificationsService';
import settingsService from './SettingsService';

// Basic in-memory cache for settings to avoid extra calls on bursts
const settingsCache = new Map(); // companyId -> { data, ts }
const getSettings = async (companyId) => {
  const cached = settingsCache.get(companyId);
  if (cached && Date.now() - cached.ts < 60_000) return cached.data;
  try {
    // Use unified SettingsService instead of direct table access
    const unifiedSettings = await settingsService.getSettings(companyId);
    const notificationSettings = {
      email_notifications: unifiedSettings?.email_notifications,
      sms_notifications: unifiedSettings?.sms_notifications,
      push_notifications: unifiedSettings?.push_notifications,
      notification_frequency: unifiedSettings?.notification_frequency,
    };
    settingsCache.set(companyId, { data: notificationSettings, ts: Date.now() });
    return notificationSettings;
  } catch { return null; }
};

const NotificationGenerator = {
  // Inventory: low stock alert
  async lowInventory(companyId, item, totals) {
    const available = Number(totals.total_available || 0);
    const severity = available <= Number(item.reorder_point || 0) ? 'WARNING' : 'INFO';
    const title = available <= 0 ? 'Out of Stock' : (severity === 'WARNING' ? 'Low Inventory' : 'Inventory Update');
    const message = `${item.name || item.item_name} available: ${available} (reorder ${item.reorder_point || 0})`;

    // Respect settings
    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;
    if (settings && settings.in_app_inventory_alerts === false) return null;

    // De-dupe within 24h per item
    const exists = await NotificationsService.hasRecent(companyId, { type: 'INVENTORY', related_id: item.id || item.item_id });
    if (exists) return null;
    return NotificationsService.createNotification(companyId, {
      type: 'INVENTORY',
      related_id: item.id || item.item_id,
      title,
      message,
      severity,
      is_read: false
    });
  },

  // PTO: new request submitted
  async ptoSubmitted(companyId, request) {
    const title = 'PTO Request Submitted';
    const message = `Employee ${request.employee_id} requested ${request.hours_requested} hours (${request.category_code}).`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;
    if (settings && settings.in_app_pto_events === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'PTO',
      related_id: request.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Invoices: overdue
  async invoiceOverdue(companyId, invoice) {
    const title = 'Invoice Overdue';
    const message = `Invoice ${invoice.invoice_number || invoice.id} is overdue (due ${invoice.due_date}).`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;
    if (settings && settings.in_app_invoice_overdue === false) return null;

    const exists = await NotificationsService.hasRecent(companyId, { type: 'INVOICE_OVERDUE', related_id: invoice.id });
    if (exists) return null;
    return NotificationsService.createNotification(companyId, {
      type: 'INVOICE_OVERDUE',
      related_id: invoice.id,
      title,
      message,
      severity: 'CRITICAL',
      is_read: false
    });
  },

  // Quotes: expired
  async quoteExpired(companyId, workOrder) {
    const title = 'Quote Expired';
    const message = `Quote ${workOrder.quote_number || workOrder.id} expired on ${workOrder.quote_expires_date}.`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;
    if (settings && settings.in_app_quote_expiration === false) return null;

    const exists = await NotificationsService.hasRecent(companyId, { type: 'QUOTE', related_id: workOrder.id });
    if (exists) return null;
    return NotificationsService.createNotification(companyId, {
      type: 'QUOTE',
      related_id: workOrder.id,
      title,
      message,
      severity: 'WARNING',
      is_read: false
    });
  },

  // Work Orders: new work order created
  async workOrderCreated(companyId, workOrder, customer) {
    const title = 'New Work Order Created';
    const customerName = customer?.name || customer?.company_name || 'Unknown Customer';
    const message = `Work order #${workOrder.id} created for ${customerName}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'WORK_ORDER',
      related_id: workOrder.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Work Orders: status changed
  async workOrderStatusChanged(companyId, workOrder, oldStatus, newStatus) {
    const title = 'Work Order Status Updated';
    const message = `Work order #${workOrder.id} changed from ${oldStatus} to ${newStatus}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    const severity = newStatus === 'COMPLETED' ? 'INFO' : newStatus === 'CANCELLED' ? 'WARNING' : 'INFO';

    return NotificationsService.createNotification(companyId, {
      type: 'WORK_ORDER',
      related_id: workOrder.id,
      title,
      message,
      severity,
      is_read: false
    });
  },

  // Jobs: scheduled
  async jobScheduled(companyId, job, employee) {
    const title = 'Job Scheduled';
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Unknown Employee';
    const message = `Job #${job.id} scheduled for ${employeeName} on ${job.scheduled_date}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'JOB',
      related_id: job.id,
      title,
      message,
      severity: 'INFO',
      is_read: false,
      user_id: employee?.id // Notify specific employee
    });
  },

  // Jobs: completed
  async jobCompleted(companyId, job, employee) {
    const title = 'Job Completed';
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Unknown Employee';
    const message = `Job #${job.id} completed by ${employeeName}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'JOB',
      related_id: job.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Timesheets: submitted for approval
  async timesheetSubmitted(companyId, timesheet, employee) {
    const title = 'Timesheet Submitted';
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Unknown Employee';
    const message = `${employeeName} submitted timesheet for ${timesheet.work_date} (${timesheet.total_hours} hours)`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'TIMESHEET',
      related_id: timesheet.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Timesheets: approved/rejected
  async timesheetStatusChanged(companyId, timesheet, employee, status, approver) {
    const title = `Timesheet ${status}`;
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Unknown Employee';
    const approverName = approver?.name || approver?.first_name + ' ' + approver?.last_name || 'Manager';
    const message = `${employeeName}'s timesheet for ${timesheet.work_date} was ${status.toLowerCase()} by ${approverName}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    const severity = status === 'REJECTED' ? 'WARNING' : 'INFO';

    return NotificationsService.createNotification(companyId, {
      type: 'TIMESHEET',
      related_id: timesheet.id,
      title,
      message,
      severity,
      is_read: false,
      user_id: employee?.id // Notify the employee
    });
  },

  // Expenses: submitted
  async expenseSubmitted(companyId, expense, employee) {
    const title = 'Expense Submitted';
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Unknown Employee';
    const message = `${employeeName} submitted expense: $${expense.amount} for ${expense.description}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'EXPENSE',
      related_id: expense.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Expenses: approved/rejected
  async expenseStatusChanged(companyId, expense, employee, status, approver) {
    const title = `Expense ${status}`;
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Unknown Employee';
    const approverName = approver?.name || approver?.first_name + ' ' + approver?.last_name || 'Manager';
    const message = `${employeeName}'s expense ($${expense.amount}) was ${status.toLowerCase()} by ${approverName}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    const severity = status === 'REJECTED' ? 'WARNING' : 'INFO';

    return NotificationsService.createNotification(companyId, {
      type: 'EXPENSE',
      related_id: expense.id,
      title,
      message,
      severity,
      is_read: false,
      user_id: employee?.id // Notify the employee
    });
  },

  // Purchase Orders: created
  async purchaseOrderCreated(companyId, po, vendor) {
    const title = 'Purchase Order Created';
    const vendorName = vendor?.name || 'Unknown Vendor';
    const message = `PO #${po.po_number} created for ${vendorName} - $${po.total_amount}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'PURCHASE_ORDER',
      related_id: po.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Purchase Orders: approved
  async purchaseOrderApproved(companyId, po, approver) {
    const title = 'Purchase Order Approved';
    const approverName = approver?.name || approver?.first_name + ' ' + approver?.last_name || 'Manager';
    const message = `PO #${po.po_number} approved by ${approverName} - $${po.total_amount}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'PURCHASE_ORDER',
      related_id: po.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Payments: received
  async paymentReceived(companyId, payment, invoice, customer) {
    const title = 'Payment Received';
    const customerName = customer?.name || customer?.company_name || 'Unknown Customer';
    const message = `Payment of $${payment.amount} received from ${customerName} for invoice #${invoice.invoice_number}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'PAYMENT',
      related_id: payment.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Payments: failed
  async paymentFailed(companyId, payment, invoice, customer, reason) {
    const title = 'Payment Failed';
    const customerName = customer?.name || customer?.company_name || 'Unknown Customer';
    const message = `Payment of $${payment.amount} from ${customerName} failed: ${reason}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'PAYMENT',
      related_id: payment.id,
      title,
      message,
      severity: 'CRITICAL',
      is_read: false
    });
  },

  // Customers: new customer added
  async customerCreated(companyId, customer, createdBy) {
    const title = 'New Customer Added';
    const customerName = customer?.name || customer?.company_name || 'Unknown Customer';
    const creatorName = createdBy?.name || createdBy?.first_name + ' ' + createdBy?.last_name || 'Team Member';
    const message = `${customerName} added by ${creatorName}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'CUSTOMER',
      related_id: customer.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // Employees: new employee added
  async employeeCreated(companyId, employee, createdBy) {
    const title = 'New Employee Added';
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'New Employee';
    const creatorName = createdBy?.name || createdBy?.first_name + ' ' + createdBy?.last_name || 'Admin';
    const message = `${employeeName} added to the team by ${creatorName}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'EMPLOYEE',
      related_id: employee.id,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // System: backup completed
  async systemBackupCompleted(companyId, backupInfo) {
    const title = 'System Backup Completed';
    const message = `Database backup completed successfully. Size: ${backupInfo.size || 'Unknown'}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'SYSTEM',
      related_id: null,
      title,
      message,
      severity: 'INFO',
      is_read: false
    });
  },

  // System: integration error
  async integrationError(companyId, integration, error) {
    const title = 'Integration Error';
    const message = `${integration} integration failed: ${error.message || 'Unknown error'}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'SYSTEM',
      related_id: null,
      title,
      message,
      severity: 'CRITICAL',
      is_read: false
    });
  },

  // Schedule: appointment reminder
  async appointmentReminder(companyId, appointment, customer, employee) {
    const title = 'Appointment Reminder';
    const customerName = customer?.name || customer?.company_name || 'Unknown Customer';
    const employeeName = employee?.name || employee?.first_name + ' ' + employee?.last_name || 'Team Member';
    const message = `Upcoming appointment with ${customerName} assigned to ${employeeName} at ${appointment.scheduled_time}`;

    const settings = await getSettings(companyId);
    if (settings && settings.in_app_notifications_enabled === false) return null;

    return NotificationsService.createNotification(companyId, {
      type: 'SCHEDULE',
      related_id: appointment.id,
      title,
      message,
      severity: 'INFO',
      is_read: false,
      user_id: employee?.id // Notify specific employee
    });
  }
};

export default NotificationGenerator;
