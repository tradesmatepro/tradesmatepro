// TradeMate Pro Dynamic Permission System
// Combines role-based defaults with fine-grained user permissions

export const ROLES = {
  OWNER: 'OWNER',      // Original account creator - full access including billing
  ADMIN: 'ADMIN',      // Internal staff - full team/job access except billing
  EMPLOYEE: 'EMPLOYEE' // Field workers/techs - limited to jobs, scheduling, documents
};

// Permission keys that map to user_permissions table columns
export const PERMISSION_KEYS = {
  // Core Business Features
  VIEW_DASHBOARD: 'can_view_dashboard',
  VIEW_JOBS: 'can_view_jobs',
  CREATE_JOBS: 'can_create_jobs',
  EDIT_JOBS: 'can_edit_jobs',
  DELETE_JOBS: 'can_delete_jobs',
  VIEW_SCHEDULING: 'can_view_scheduling',
  EDIT_SCHEDULING: 'can_edit_scheduling',
  VIEW_DOCUMENTS: 'can_view_documents',
  EDIT_DOCUMENTS: 'can_edit_documents',
  UPLOAD_DOCUMENTS: 'can_upload_documents',

  // Admin Features
  VIEW_CUSTOMERS: 'can_view_customers',
  CREATE_CUSTOMERS: 'can_create_customers',
  EDIT_CUSTOMERS: 'can_edit_customers',
  DELETE_CUSTOMERS: 'can_delete_customers',
  VIEW_QUOTES: 'can_view_quotes',
  CREATE_QUOTES: 'can_create_quotes',
  EDIT_QUOTES: 'can_edit_quotes',
  DELETE_QUOTES: 'can_delete_quotes',
  VIEW_INVOICES: 'can_view_invoices',
  CREATE_INVOICES: 'can_create_invoices',
  EDIT_INVOICES: 'can_edit_invoices',
  DELETE_INVOICES: 'can_delete_invoices',
  VIEW_EMPLOYEES: 'can_view_employees',
  MANAGE_EMPLOYEES: 'can_manage_employees',
  VIEW_REPORTS: 'can_view_reports',
  GENERATE_REPORTS: 'can_generate_reports',

  // Owner/Admin Features
  ACCESS_SETTINGS: 'can_access_settings',
  EDIT_COMPANY_SETTINGS: 'can_edit_company_settings',
  MANAGE_INTEGRATIONS: 'can_manage_integrations',
  VIEW_BILLING: 'can_view_billing',
  EDIT_BILLING: 'can_edit_billing',
  MANAGE_PERMISSIONS: 'can_manage_permissions',

  // Integration Features
  ACCESS_EXPENSES: 'can_access_expenses',
  ACCESS_NOTIFICATIONS: 'can_access_notifications',
  ACCESS_STORAGE: 'can_access_storage',
  ACCESS_CRM: 'can_access_crm',
  ACCESS_AUTOMATION: 'can_access_automation'
};

export const PERMISSIONS = {
  // Core Business Operations
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_JOBS: 'view_jobs',
  EDIT_JOBS: 'edit_jobs',
  VIEW_SCHEDULING: 'view_scheduling',
  EDIT_SCHEDULING: 'edit_scheduling',
  VIEW_DOCUMENTS: 'view_documents',
  UPLOAD_DOCUMENTS: 'upload_documents',

  // Admin Operations (Owner + Admin only)
  VIEW_CUSTOMERS: 'view_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  VIEW_QUOTES: 'view_quotes',
  EDIT_QUOTES: 'edit_quotes',
  VIEW_INVOICES: 'view_invoices',
  EDIT_INVOICES: 'edit_invoices',
  VIEW_EMPLOYEES: 'view_employees',
  EDIT_EMPLOYEES: 'edit_employees',
  VIEW_REPORTS: 'view_reports',

  // Owner-Only Operations
  VIEW_BILLING: 'view_billing',
  EDIT_BILLING: 'edit_billing',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  EDIT_COMPANY_SETTINGS: 'edit_company_settings'
};

// Role permissions mapping - TradeMate Pro Universal Structure
const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    // Owner: Full access to everything including billing and integrations
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.EDIT_JOBS,
    PERMISSIONS.VIEW_SCHEDULING,
    PERMISSIONS.EDIT_SCHEDULING,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.EDIT_QUOTES,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.EDIT_EMPLOYEES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.EDIT_BILLING,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.EDIT_COMPANY_SETTINGS
  ],

  [ROLES.ADMIN]: [
    // Admin: Full team/job access except billing and integrations
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.EDIT_JOBS,
    PERMISSIONS.VIEW_SCHEDULING,
    PERMISSIONS.EDIT_SCHEDULING,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.EDIT_QUOTES,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.EDIT_EMPLOYEES,
    PERMISSIONS.VIEW_REPORTS
  ],

  [ROLES.EMPLOYEE]: [
    // Employee: Limited to jobs, scheduling, and documents only
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.EDIT_JOBS,
    PERMISSIONS.VIEW_SCHEDULING,
    PERMISSIONS.EDIT_SCHEDULING,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS
  ]
};

/**
 * Check if a user has a specific permission
 * Uses both role-based defaults and user-specific permissions
 * @param {Object} user - User object with role and permissions properties
 * @param {string} permissionKey - Permission key to check (from PERMISSION_KEYS)
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (user, permissionKey) => {
  if (!user) {
    return false;
  }

  // If user has specific permissions loaded, use those
  if (user.permissions && typeof user.permissions[permissionKey] === 'boolean') {
    return user.permissions[permissionKey];
  }

  // Fallback to role-based permissions for backward compatibility
  if (user.role) {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permissionKey);
  }

  return false;
};

/**
 * Check if user is owner
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is owner
 */
export const isOwner = (user) => {
  return user?.role === ROLES.OWNER;
};

/**
 * Check if user is admin or owner
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is admin or owner
 */
export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.OWNER;
};

/**
 * Check if user is employee only
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is employee
 */
export const isEmployee = (user) => {
  return user?.role === ROLES.EMPLOYEE;
};

/**
 * Check if user can access admin features (customers, quotes, invoices, employees)
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user can access admin features
 */
export const canAccessAdminFeatures = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can manage billing and integrations
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user can manage billing
 */
export const canManageBilling = (user) => {
  return hasPermission(user, PERMISSION_KEYS.EDIT_BILLING);
};

/**
 * Navigation permission helpers
 */
export const canViewCustomers = (user) => hasPermission(user, PERMISSION_KEYS.VIEW_CUSTOMERS);
export const canViewQuotes = (user) => hasPermission(user, PERMISSION_KEYS.VIEW_QUOTES);
export const canViewInvoices = (user) => hasPermission(user, PERMISSION_KEYS.VIEW_INVOICES);
export const canViewEmployees = (user) => hasPermission(user, PERMISSION_KEYS.VIEW_EMPLOYEES);
export const canAccessSettings = (user) => hasPermission(user, PERMISSION_KEYS.ACCESS_SETTINGS);
export const canManagePermissions = (user) => hasPermission(user, PERMISSION_KEYS.MANAGE_PERMISSIONS);

/**
 * Integration permission helpers
 */
export const canAccessExpenses = (user) => hasPermission(user, PERMISSION_KEYS.ACCESS_EXPENSES);
export const canAccessNotifications = (user) => hasPermission(user, PERMISSION_KEYS.ACCESS_NOTIFICATIONS);
export const canAccessStorage = (user) => hasPermission(user, PERMISSION_KEYS.ACCESS_STORAGE);
export const canAccessCRM = (user) => hasPermission(user, PERMISSION_KEYS.ACCESS_CRM);
export const canAccessAutomation = (user) => hasPermission(user, PERMISSION_KEYS.ACCESS_AUTOMATION);

/**
 * Get navigation items based on user permissions
 * @param {Object} user - User object with permissions
 * @returns {Array} - Array of navigation items user can access
 */
export const getPermittedNavigation = (user) => {
  const navigation = [];

  // Core items (always visible)
  if (hasPermission(user, PERMISSION_KEYS.VIEW_DASHBOARD)) {
    navigation.push({ name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' });
  }

  if (hasPermission(user, PERMISSION_KEYS.VIEW_JOBS)) {
    navigation.push({ name: 'Jobs', href: '/jobs', icon: 'BriefcaseIcon' });
  }

  if (hasPermission(user, PERMISSION_KEYS.VIEW_SCHEDULING)) {
    navigation.push({ name: 'Scheduling', href: '/scheduling', icon: 'CalendarDaysIcon' });
  }

  if (hasPermission(user, PERMISSION_KEYS.VIEW_DOCUMENTS)) {
    navigation.push({ name: 'Documents', href: '/documents', icon: 'FolderIcon' });
  }

  // Admin items (permission-based)
  if (canViewCustomers(user)) {
    navigation.push({ name: 'Customers', href: '/customers', icon: 'UserGroupIcon' });
  }

  if (canViewQuotes(user)) {
    navigation.push({ name: 'Quotes', href: '/quotes', icon: 'DocumentTextIcon' });
  }

  if (canViewInvoices(user)) {
    navigation.push({ name: 'Invoices', href: '/invoices', icon: 'CurrencyDollarIcon' });
  }

  if (canViewEmployees(user)) {
    navigation.push({ name: 'Employees', href: '/employees', icon: 'UsersIcon' });
  }

  if (hasPermission(user, PERMISSION_KEYS.VIEW_REPORTS)) {
    navigation.push({ name: 'Reports', href: '/reports', icon: 'ChartBarIcon' });
  }

  return navigation;
};

/**
 * Get user role display name
 * @param {string} role - Role string (case-insensitive)
 * @returns {string} - Formatted role name
 */
export const getRoleDisplayName = (role) => {
  // ✅ FIX: Handle both lowercase and uppercase roles from database
  const normalizedRole = role?.toUpperCase();

  switch (normalizedRole) {
    case ROLES.OWNER:
      return 'Owner';
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.EMPLOYEE:
      return 'Employee';
    case 'TECHNICIAN': // Industry standard role
      return 'Technician';
    case 'MANAGER': // Industry standard role
      return 'Manager';
    default:
      return 'Unknown';
  }
};

/**
 * Get role badge color
 * @param {string} role - Role string (case-insensitive)
 * @returns {string} - CSS classes for role badge
 */
export const getRoleBadgeColor = (role) => {
  // ✅ FIX: Handle both lowercase and uppercase roles from database
  const normalizedRole = role?.toUpperCase();

  switch (normalizedRole) {
    case ROLES.OWNER:
      return 'bg-indigo-100 text-indigo-800';
    case ROLES.ADMIN:
      return 'bg-purple-100 text-purple-800';
    case ROLES.EMPLOYEE:
      return 'bg-green-100 text-green-800';
    case 'TECHNICIAN': // Industry standard role
      return 'bg-blue-100 text-blue-800';
    case 'MANAGER': // Industry standard role
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get all available roles for dropdowns
 * ✅ INDUSTRY STANDARD: All 13 roles from user_role_enum
 * @returns {Array} - Array of role objects
 */
export const getAvailableRoles = () => {
  return [
    // Management Roles
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'supervisor', label: 'Supervisor' },

    // Field Technician Roles
    { value: 'lead_technician', label: 'Lead Technician' },
    { value: 'technician', label: 'Technician' },
    { value: 'apprentice', label: 'Apprentice' },
    { value: 'helper', label: 'Helper' },

    // Office Roles
    { value: 'accountant', label: 'Accountant' },
    { value: 'sales_rep', label: 'Sales Representative' },
    { value: 'customer_service', label: 'Customer Service' },

    // Portal Roles
    { value: 'customer_portal', label: 'Customer Portal' }
  ];
};
