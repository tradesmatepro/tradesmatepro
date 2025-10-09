// TradeMate Pro - Unified Employee Permission System
// Used by both Invite Employee and Add Employee forms

export const EMPLOYEE_MODULES = {
  // Core Modules (Default for all employees)
  DASHBOARD: {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'View dashboard and analytics',
    category: 'Core',
    defaultEnabled: true
  },
  CALENDAR: {
    key: 'calendar',
    label: 'Calendar',
    description: 'View and manage schedule',
    category: 'Core',
    defaultEnabled: true
  },
  JOBS: {
    key: 'jobs',
    label: 'Jobs',
    description: 'View and manage jobs',
    category: 'Core',
    defaultEnabled: true
  },
  DOCUMENTS: {
    key: 'documents',
    label: 'Documents',
    description: 'Access documents and files',
    category: 'Core',
    defaultEnabled: true
  },

  // Sales & Customer Management
  CUSTOMERS: {
    key: 'customers',
    label: 'Customers',
    description: 'View and manage customer information',
    category: 'Sales',
    defaultEnabled: false
  },
  QUOTES: {
    key: 'quotes',
    label: 'Quotes',
    description: 'Create and manage quotes',
    category: 'Sales',
    defaultEnabled: false
  },
  INVOICES: {
    key: 'invoices',
    label: 'Invoices',
    description: 'View and manage invoices',
    category: 'Sales',
    defaultEnabled: false
  },
  INCOMING_REQUESTS: {
    key: 'incoming_requests',
    label: 'Incoming Requests',
    description: 'Manage incoming service requests',
    category: 'Sales',
    defaultEnabled: false
  },

  // HR & Team Management
  EMPLOYEES: {
    key: 'employees',
    label: 'Employees',
    description: 'Manage employee accounts',
    category: 'HR',
    defaultEnabled: false
  },
  TIMESHEETS: {
    key: 'timesheets',
    label: 'Timesheets',
    description: 'Track time and attendance',
    category: 'HR',
    defaultEnabled: true
  },
  PAYROLL: {
    key: 'payroll',
    label: 'Payroll',
    description: 'Access payroll information',
    category: 'HR',
    defaultEnabled: false
  },

  // Finance
  EXPENSES: {
    key: 'expenses',
    label: 'Expenses',
    description: 'Track and manage expenses',
    category: 'Finance',
    defaultEnabled: false
  },
  PURCHASE_ORDERS: {
    key: 'purchase_orders',
    label: 'Purchase Orders',
    description: 'Create and manage purchase orders',
    category: 'Finance',
    defaultEnabled: false
  },
  VENDORS: {
    key: 'vendors',
    label: 'Vendors',
    description: 'Manage vendor relationships',
    category: 'Finance',
    defaultEnabled: false
  },

  // Operations
  TOOLS: {
    key: 'tools',
    label: 'Tools',
    description: 'Access tools and utilities',
    category: 'Operations',
    defaultEnabled: true
  },
  INVENTORY: {
    key: 'inventory',
    label: 'Inventory',
    description: 'Manage inventory and stock',
    category: 'Operations',
    defaultEnabled: false
  },
  MARKETPLACE: {
    key: 'marketplace',
    label: 'Marketplace',
    description: 'Access contractor marketplace',
    category: 'Operations',
    defaultEnabled: false
  },

  // Admin
  REPORTS: {
    key: 'reports',
    label: 'Reports',
    description: 'View business reports and analytics',
    category: 'Admin',
    defaultEnabled: false
  },
  SETTINGS: {
    key: 'settings',
    label: 'Settings',
    description: 'Access company settings',
    category: 'Admin',
    defaultEnabled: false
  }
};

/**
 * Get default permissions based on role
 * @param {string} role - User role (owner, admin, manager, technician, etc.)
 * @returns {Object} - Permissions object with module keys and boolean values
 */
export const getDefaultPermissions = (role) => {
  const permissions = {};
  
  // Start with default values for each module
  Object.values(EMPLOYEE_MODULES).forEach(module => {
    permissions[module.key] = module.defaultEnabled;
  });

  // Role-based overrides
  const normalizedRole = role?.toLowerCase();

  // Owner, Admin, Manager - Full access to everything
  if (['owner', 'admin', 'manager'].includes(normalizedRole)) {
    Object.keys(permissions).forEach(key => {
      permissions[key] = true;
    });
  }
  
  // Supervisor - Most things except settings
  else if (normalizedRole === 'supervisor') {
    Object.keys(permissions).forEach(key => {
      permissions[key] = key !== 'settings'; // Everything except settings
    });
  }
  
  // Dispatcher - Core + Sales + Scheduling
  else if (normalizedRole === 'dispatcher') {
    permissions.dashboard = true;
    permissions.calendar = true;
    permissions.jobs = true;
    permissions.customers = true;
    permissions.quotes = true;
    permissions.incoming_requests = true;
    permissions.documents = true;
    permissions.timesheets = true;
    permissions.tools = true;
  }
  
  // Lead Technician - Core + Some Sales
  else if (normalizedRole === 'lead_technician') {
    permissions.dashboard = true;
    permissions.calendar = true;
    permissions.jobs = true;
    permissions.customers = true;
    permissions.quotes = true;
    permissions.documents = true;
    permissions.timesheets = true;
    permissions.expenses = true;
    permissions.tools = true;
    permissions.inventory = true;
  }
  
  // Accountant - Finance focused
  else if (normalizedRole === 'accountant') {
    permissions.dashboard = true;
    permissions.invoices = true;
    permissions.expenses = true;
    permissions.purchase_orders = true;
    permissions.vendors = true;
    permissions.payroll = true;
    permissions.reports = true;
    permissions.documents = true;
  }
  
  // Sales Rep - Sales focused
  else if (normalizedRole === 'sales_rep') {
    permissions.dashboard = true;
    permissions.customers = true;
    permissions.quotes = true;
    permissions.incoming_requests = true;
    permissions.documents = true;
    permissions.tools = true;
  }
  
  // Customer Service - Customer focused
  else if (normalizedRole === 'customer_service') {
    permissions.dashboard = true;
    permissions.customers = true;
    permissions.quotes = true;
    permissions.jobs = true;
    permissions.incoming_requests = true;
    permissions.documents = true;
    permissions.tools = true;
  }
  
  // Technician, Apprentice, Helper - Core only (use defaults)
  // Already set by defaultEnabled values above

  return permissions;
};

/**
 * Get modules grouped by category for UI display
 * @returns {Object} - Object with category names as keys and arrays of modules as values
 */
export const getModulesByCategory = () => {
  const categories = {
    Core: [],
    Sales: [],
    HR: [],
    Finance: [],
    Operations: [],
    Admin: []
  };

  Object.values(EMPLOYEE_MODULES).forEach(module => {
    if (categories[module.category]) {
      categories[module.category].push(module);
    }
  });

  return categories;
};

/**
 * Get category display information
 * @returns {Object} - Category metadata for UI
 */
export const getCategoryInfo = () => {
  return {
    Core: {
      label: 'Core Modules',
      description: 'Essential features for all employees',
      icon: '🎯'
    },
    Sales: {
      label: 'Sales & Customers',
      description: 'Customer management and sales tools',
      icon: '💼'
    },
    HR: {
      label: 'HR & Team',
      description: 'Employee and team management',
      icon: '👥'
    },
    Finance: {
      label: 'Finance',
      description: 'Financial management and accounting',
      icon: '💰'
    },
    Operations: {
      label: 'Operations',
      description: 'Tools and operational features',
      icon: '⚙️'
    },
    Admin: {
      label: 'Administration',
      description: 'Reports and company settings',
      icon: '🔧'
    }
  };
};

/**
 * Generate a secure temporary password
 * @returns {string} - Temporary password
 */
export const generateTempPassword = () => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'; // Removed l, o
  const numbers = '23456789'; // Removed 0, 1
  const special = '!@#$%';
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill rest with random characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

