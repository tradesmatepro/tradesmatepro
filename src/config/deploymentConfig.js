/**
 * Deployment Configuration - Defines which modules are enabled for each deployment
 * Supports: beta, staging, production, enterprise
 */

export const DEPLOYMENT_CONFIGS = {
  // ============================================
  // DEVELOPMENT DEPLOYMENT (Local testing - everything enabled)
  // ============================================
  development: {
    name: 'Development',
    description: 'Local development: ALL features enabled for testing',
    modules: {
      // All features enabled for local testing
      dashboard: true,
      jobs: true,
      quotes: true,
      invoices: true,
      customers: true,
      employees: true,
      settings: true,
      documents: true,
      customer_portal: true,
      tools: true,
      marketplace: true,
      inventory: true,
      purchase_orders: true,
      vendors: true,
      payroll: true,
      timesheets: true,
      expenses: true,
      reports: true,
      messages: true,
      automation: true
    }
  },

  // ============================================
  // BETA DEPLOYMENT (Selective launch)
  // ============================================
  beta: {
    name: 'Beta Launch',
    description: 'Selective beta launch: Dashboard, Work (Jobs/Calendar/Documents), Sales (Customers/Quotes/Invoices/Portal), Team (Employees), Account (Settings)',
    modules: {
      // Dashboard Section
      dashboard: true,

      // Work Section
      jobs: true,
      documents: true,

      // Sales Section
      customers: true,
      quotes: true,
      invoices: true,
      customer_portal: true,

      // Team Section
      employees: true,

      // Account Section
      settings: true,

      // Operations Section (Coming Soon)
      tools: false,

      // Enterprise modules (disabled)
      marketplace: false,
      inventory: false,
      purchase_orders: false,
      vendors: false,
      payroll: false,
      timesheets: false,
      expenses: false,
      reports: false,
      messages: false,
      automation: false
    }
  },

  // ============================================
  // STAGING DEPLOYMENT (Pre-production testing)
  // ============================================
  staging: {
    name: 'Staging',
    description: 'Staging environment with all features for testing',
    modules: {
      // All modules enabled for testing
      dashboard: true,
      jobs: true,
      quotes: true,
      invoices: true,
      customers: true,
      employees: true,
      settings: true,
      documents: true,
      customer_portal: true,
      tools: true,
      marketplace: true,
      inventory: true,
      purchase_orders: true,
      vendors: true,
      payroll: true,
      timesheets: true,
      expenses: true,
      reports: true,
      messages: true,
      automation: true
    }
  },

  // ============================================
  // PRODUCTION DEPLOYMENT (Full release)
  // ============================================
  production: {
    name: 'Production',
    description: 'Production with all stable features',
    modules: {
      // Core
      dashboard: true,
      jobs: true,
      quotes: true,
      invoices: true,
      customers: true,
      employees: true,
      settings: true,

      // Stable features
      documents: true,
      customer_portal: true,
      tools: true,
      marketplace: true,
      inventory: true,
      purchase_orders: true,
      vendors: true,

      // Mature features
      payroll: true,
      timesheets: true,
      expenses: true,
      reports: true,
      messages: true,
      automation: true
    }
  },

  // ============================================
  // ENTERPRISE DEPLOYMENT (Full feature set)
  // ============================================
  enterprise: {
    name: 'Enterprise',
    description: 'Enterprise deployment with all features',
    modules: {
      // All features enabled
      dashboard: true,
      jobs: true,
      quotes: true,
      invoices: true,
      customers: true,
      employees: true,
      settings: true,
      documents: true,
      customer_portal: true,
      tools: true,
      marketplace: true,
      inventory: true,
      purchase_orders: true,
      vendors: true,
      payroll: true,
      timesheets: true,
      expenses: true,
      reports: true,
      messages: true,
      automation: true
    }
  }
};

/**
 * Get deployment config
 */
export const getDeploymentConfig = (deploymentType = 'beta') => {
  return DEPLOYMENT_CONFIGS[deploymentType] || DEPLOYMENT_CONFIGS.beta;
};

/**
 * Get current deployment type from environment
 * Defaults to 'development' for local testing (all features enabled)
 * Set REACT_APP_DEPLOYMENT_TYPE=beta for beta launch
 */
export const getCurrentDeploymentType = () => {
  // If explicitly set in environment, use that
  if (process.env.REACT_APP_DEPLOYMENT_TYPE) {
    return process.env.REACT_APP_DEPLOYMENT_TYPE;
  }

  // Default to development locally (all features), beta on Vercel
  // Vercel will have REACT_APP_DEPLOYMENT_TYPE=beta set
  return 'development';
};

/**
 * Get current deployment config
 */
export const getCurrentDeploymentConfig = () => {
  const deploymentType = getCurrentDeploymentType();
  return getDeploymentConfig(deploymentType);
};

