/**
 * Company utilities for ensuring company_name is included in all database operations
 * This helps with troubleshooting and data integrity in multi-tenant applications
 */

/**
 * Adds company information to a data object for database operations
 * @param {Object} data - The data object to enhance
 * @param {Object} user - The current user object with company info
 * @returns {Object} Enhanced data object with company_id and company_name
 */
export const addCompanyInfo = (data, user) => {
  if (!user || !user.company_id) {
    console.warn('addCompanyInfo: User or company_id missing', { user });
    return data;
  }

  return {
    ...data,
    company_id: user.company_id,
    company_name: user.company_name || 'Unknown Company'
  };
};

/**
 * Adds company information and timestamps to a data object for database operations
 * @param {Object} data - The data object to enhance
 * @param {Object} user - The current user object with company info
 * @param {boolean} isUpdate - Whether this is an update operation (adds updated_at)
 * @returns {Object} Enhanced data object with company info and timestamps
 */
export const addCompanyInfoWithTimestamps = (data, user, isUpdate = false) => {
  const enhancedData = addCompanyInfo(data, user);
  
  const now = new Date().toISOString();
  
  if (isUpdate) {
    enhancedData.updated_at = now;
  } else {
    enhancedData.created_at = now;
    enhancedData.updated_at = now;
  }
  
  return enhancedData;
};

/**
 * Creates a filter object for querying records by company
 * @param {Object} user - The current user object with company info
 * @returns {Object} Filter object for database queries
 */
export const createCompanyFilter = (user) => {
  if (!user || !user.company_id) {
    console.warn('createCompanyFilter: User or company_id missing', { user });
    return {};
  }

  return {
    company_id: user.company_id
  };
};

/**
 * Validates that a record belongs to the current user's company
 * @param {Object} record - The record to validate
 * @param {Object} user - The current user object with company info
 * @returns {boolean} True if record belongs to user's company
 */
export const validateCompanyAccess = (record, user) => {
  if (!user || !user.company_id) {
    console.warn('validateCompanyAccess: User or company_id missing', { user });
    return false;
  }

  if (!record || !record.company_id) {
    console.warn('validateCompanyAccess: Record or company_id missing', { record });
    return false;
  }

  return record.company_id === user.company_id;
};

/**
 * Logs database operations with company context for troubleshooting
 * @param {string} operation - The operation being performed (create, update, delete, etc.)
 * @param {string} table - The table being operated on
 * @param {Object} data - The data being operated on
 * @param {Object} user - The current user object with company info
 */
export const logCompanyOperation = (operation, table, data, user) => {
  const logData = {
    operation,
    table,
    company_id: user?.company_id,
    company_name: user?.company_name,
    user_id: user?.id,
    user_email: user?.email,
    timestamp: new Date().toISOString(),
    data_keys: data ? Object.keys(data) : []
  };

  console.log(`[${operation.toUpperCase()}] ${table}:`, logData);
};

/**
 * Common database operation wrapper that ensures company info is included
 * @param {string} operation - The operation type (create, update)
 * @param {string} table - The table name
 * @param {Object} data - The data to operate on
 * @param {Object} user - The current user object
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Enhanced data ready for database operation
 */
export const prepareCompanyData = (operation, table, data, user, isUpdate = false) => {
  // Log the operation for troubleshooting
  logCompanyOperation(operation, table, data, user);
  
  // Add company info and timestamps
  const enhancedData = addCompanyInfoWithTimestamps(data, user, isUpdate);
  
  // Validate company access if this is an update
  if (isUpdate && data.id) {
    // Note: This would require fetching the existing record to validate
    // For now, we'll just ensure company_id is consistent
    if (data.company_id && data.company_id !== user.company_id) {
      throw new Error(`Access denied: Record belongs to different company`);
    }
  }
  
  return enhancedData;
};

/**
 * Tables that should include company information
 * This list helps ensure we don't miss any tables when implementing company_name
 */
export const COMPANY_TABLES = [
  'users',
  'user_permissions',
  'customers',
  'work_orders', // Unified table for quotes/jobs
  'work_order_items', // Unified items table
  'invoices',
  'payments',
  'expenses',
  'attachments',
  'job_photos',
  'messages',
  'schedule_events',
  'pending_schedule_requests',
  'service_contracts',
  'technician_locations',
  'customer_reviews',
  'integration_tokens',
  'settings'
];

/**
 * Validates that a table should include company information
 * @param {string} tableName - The table name to validate
 * @returns {boolean} True if table should include company info
 */
export const shouldIncludeCompanyInfo = (tableName) => {
  return COMPANY_TABLES.includes(tableName);
};
