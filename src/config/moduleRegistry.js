/**
 * Module Registry - Defines all available features/modules in TradeMate Pro
 * Each module can be enabled/disabled via feature flags
 * Supports beta vs enterprise deployments
 *
 * BETA LAUNCH CONFIGURATION:
 * - Dashboard Section: Dashboard
 * - Work Section: Jobs (Active/Closed/Calendar), Documents
 * - Sales Section: Customers, Quotes, Invoices, Customer Portal
 * - Team Section: Employees
 * - Operations Section: (Tools - coming soon)
 * - Account Section: Settings
 */

export const MODULE_REGISTRY = {
  // ============================================
  // DASHBOARD SECTION
  // ============================================
  DASHBOARD: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with KPIs and overview',
    category: 'beta',
    required: false,
    pages: ['dashboard'],
    dependencies: [],
    betaReady: true,
    section: 'Dashboard'
  },

  // ============================================
  // WORK SECTION
  // ============================================
  JOBS: {
    id: 'jobs',
    name: 'Jobs Management',
    description: 'Active jobs, completed jobs, calendar scheduling',
    category: 'beta',
    required: false,
    pages: ['jobs', 'calendar'],
    dependencies: [],
    betaReady: true,
    section: 'Work'
  },

  DOCUMENTS: {
    id: 'documents',
    name: 'Documents',
    description: 'Document management and templates',
    category: 'beta',
    required: false,
    pages: ['documents'],
    dependencies: [],
    betaReady: true,
    section: 'Work'
  },

  // ============================================
  // SALES SECTION
  // ============================================
  CUSTOMERS: {
    id: 'customers',
    name: 'Customer Management',
    description: 'Manage customer database and profiles',
    category: 'beta',
    required: false,
    pages: ['customers'],
    dependencies: [],
    betaReady: true,
    section: 'Sales'
  },

  QUOTES: {
    id: 'quotes',
    name: 'Quotes & Estimates',
    description: 'Create, send, and manage quotes',
    category: 'beta',
    required: false,
    pages: ['quotes'],
    dependencies: [],
    betaReady: true,
    section: 'Sales'
  },

  INVOICES: {
    id: 'invoices',
    name: 'Invoices & Payments',
    description: 'Create, send, and track invoices',
    category: 'beta',
    required: false,
    pages: ['invoices'],
    dependencies: ['quotes'],
    betaReady: true,
    section: 'Sales'
  },

  CUSTOMER_PORTAL: {
    id: 'customer_portal',
    name: 'Customer Portal',
    description: 'Customer-facing portal for quotes and invoices',
    category: 'beta',
    required: false,
    pages: ['customer-portal', 'portal-quote'],
    dependencies: ['quotes', 'invoices'],
    betaReady: true,
    section: 'Sales'
  },

  // ============================================
  // TEAM SECTION
  // ============================================
  EMPLOYEES: {
    id: 'employees',
    name: 'Employee Management',
    description: 'Manage employees, roles, and scheduling',
    category: 'beta',
    required: false,
    pages: ['employees'],
    dependencies: [],
    betaReady: true,
    section: 'Team'
  },

  // ============================================
  // ACCOUNT SECTION
  // ============================================
  SETTINGS: {
    id: 'settings',
    name: 'Settings',
    description: 'Company settings, rates, appearance',
    category: 'beta',
    required: false,
    pages: ['settings'],
    dependencies: [],
    betaReady: true,
    section: 'Account'
  },

  // ============================================
  // OPERATIONS SECTION (Coming Soon)
  // ============================================
  TOOLS: {
    id: 'tools',
    name: 'Tools & Utilities',
    description: 'Developer tools, utilities, and advanced features',
    category: 'enterprise',
    required: false,
    pages: ['tools', 'devtools'],
    dependencies: [],
    betaReady: false,
    section: 'Operations'
  },

  // ============================================
  // ENTERPRISE MODULES (Post-beta)
  // ============================================
  MARKETPLACE: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Subcontractor marketplace and job posting',
    category: 'enterprise',
    required: false,
    pages: ['marketplace', 'booking'],
    dependencies: ['jobs', 'customers'],
    betaReady: false,
    section: 'Enterprise'
  },

  INVENTORY: {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Track inventory, materials, and equipment',
    category: 'enterprise',
    required: false,
    pages: ['inventory'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  },

  PURCHASE_ORDERS: {
    id: 'purchase_orders',
    name: 'Purchase Orders',
    description: 'Create and manage purchase orders',
    category: 'enterprise',
    required: false,
    pages: ['purchase-orders'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  },

  VENDORS: {
    id: 'vendors',
    name: 'Vendor Management',
    description: 'Manage vendors and supplier relationships',
    category: 'enterprise',
    required: false,
    pages: ['vendors'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  },

  PAYROLL: {
    id: 'payroll',
    name: 'Payroll',
    description: 'Employee payroll and compensation',
    category: 'enterprise',
    required: false,
    pages: ['payroll'],
    dependencies: ['employees'],
    betaReady: false,
    section: 'Enterprise'
  },

  TIMESHEETS: {
    id: 'timesheets',
    name: 'Timesheets',
    description: 'Employee time tracking and timesheets',
    category: 'enterprise',
    required: false,
    pages: ['timesheets'],
    dependencies: ['employees'],
    betaReady: false,
    section: 'Enterprise'
  },

  EXPENSES: {
    id: 'expenses',
    name: 'Expenses',
    description: 'Track and manage business expenses',
    category: 'enterprise',
    required: false,
    pages: ['expenses'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  },

  REPORTS: {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Advanced reporting and business intelligence',
    category: 'enterprise',
    required: false,
    pages: ['reports', 'advanced-reports'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  },

  MESSAGES: {
    id: 'messages',
    name: 'Messaging',
    description: 'Internal and customer messaging',
    category: 'enterprise',
    required: false,
    pages: ['messages'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  },

  AUTOMATION: {
    id: 'automation',
    name: 'Automation',
    description: 'Workflow automation and rules',
    category: 'enterprise',
    required: false,
    pages: ['automation'],
    dependencies: [],
    betaReady: false,
    section: 'Enterprise'
  }
};

/**
 * Get all modules for a specific deployment type
 */
export const getModulesForDeployment = (deploymentType = 'beta') => {
  if (deploymentType === 'beta') {
    return Object.values(MODULE_REGISTRY).filter(m => m.required || m.betaReady);
  }
  if (deploymentType === 'enterprise') {
    return Object.values(MODULE_REGISTRY);
  }
  return Object.values(MODULE_REGISTRY).filter(m => m.required);
};

/**
 * Get module by ID
 */
export const getModule = (moduleId) => {
  return MODULE_REGISTRY[Object.keys(MODULE_REGISTRY).find(key => MODULE_REGISTRY[key].id === moduleId)];
};

/**
 * Get all pages for enabled modules
 */
export const getEnabledPages = (enabledModules) => {
  return enabledModules.reduce((pages, module) => [...pages, ...module.pages], []);
};

