// TradeMate Pro Simplified Permission System
// Works with JSON permissions structure in users.permissions column

import {
  HomeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  FolderIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  CloudArrowUpIcon,
  BoltIcon,
  DocumentCheckIcon,
  ArchiveBoxIcon,
  // Coming Soon Feature Icons
  DevicePhoneMobileIcon,
  MapPinIcon,
  EnvelopeIcon,
  // Marketplace Icon
  ShoppingBagIcon,
  CpuChipIcon,
  ComputerDesktopIcon,
  PresentationChartLineIcon,
  CreditCardIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

export const MODULES = {
  DASHBOARD: 'dashboard',
  CALENDAR: 'calendar',
  QUOTES: 'quotes',
  JOBS: 'jobs',
  INVOICES: 'invoices',
  CUSTOMERS: 'customers',
  DOCUMENTS: 'documents',
  SETTINGS: 'settings',
  EMPLOYEES: 'employees',
  TIMESHEETS: 'timesheets',
  PAYROLL: 'payroll',
  REPORTS: 'reports',
  TOOLS: 'tools',
  EXPENSES: 'expenses',
  PURCHASE_ORDERS: 'purchase_orders',
  VENDORS: 'vendors',
  INVENTORY: 'inventory',
  // Service Request System
  INCOMING_REQUESTS: 'incoming_requests',
  LEADS: 'leads',
  MARKETPLACE: 'marketplace',
  // Coming Soon Features
  MOBILE_APP: 'mobile_app',
  GPS_TRACKING: 'gps_tracking',
  MARKETING_AUTOMATION: 'marketing_automation',
  AI_ESTIMATING: 'ai_estimating',
  ENHANCED_CUSTOMER_PORTAL: 'enhanced_customer_portal',
  BUSINESS_INTELLIGENCE: 'business_intelligence',
  PAYMENT_PROCESSING: 'payment_processing',
  ADVANCED_SCHEDULING: 'advanced_scheduling'
};

export const MODULE_LABELS = {
  [MODULES.DASHBOARD]: 'Dashboard',
  [MODULES.CALENDAR]: 'Calendar',
  [MODULES.QUOTES]: 'Quotes',
  [MODULES.JOBS]: 'Jobs',
  [MODULES.INVOICES]: 'Invoices',
  [MODULES.CUSTOMERS]: 'Customers',
  [MODULES.DOCUMENTS]: 'Documents',
  [MODULES.SETTINGS]: 'Settings',
  [MODULES.EMPLOYEES]: 'Employees',
  [MODULES.TIMESHEETS]: 'Timesheets',
  [MODULES.PAYROLL]: 'Payroll',
  [MODULES.REPORTS]: 'Reports',
  [MODULES.TOOLS]: 'Tools',
  [MODULES.EXPENSES]: 'Expenses',
  [MODULES.PURCHASE_ORDERS]: 'Purchase Orders',
  [MODULES.VENDORS]: 'Vendors',
  [MODULES.INVENTORY]: 'Inventory',
  // Service Request System
  [MODULES.INCOMING_REQUESTS]: 'Incoming Requests',
  [MODULES.MARKETPLACE]: 'Marketplace',
  // Coming Soon Features
  [MODULES.MOBILE_APP]: 'Mobile Field App',
  [MODULES.GPS_TRACKING]: 'GPS & Routing',
  [MODULES.MARKETING_AUTOMATION]: 'Marketing Automation',
  [MODULES.AI_ESTIMATING]: 'AI Estimating',
  [MODULES.ENHANCED_CUSTOMER_PORTAL]: 'Customer Portal 2.0',
  [MODULES.BUSINESS_INTELLIGENCE]: 'Business Intelligence',
  [MODULES.PAYMENT_PROCESSING]: 'Payment Processing',
  [MODULES.ADVANCED_SCHEDULING]: 'Smart Scheduling'
};

export const MODULE_DESCRIPTIONS = {
  [MODULES.DASHBOARD]: 'View main dashboard and analytics',
  [MODULES.CALENDAR]: 'View schedule calendar and manage time',
  [MODULES.QUOTES]: 'Create and manage quotes',
  [MODULES.JOBS]: 'Complete job management from creation to completion',
  [MODULES.INVOICES]: 'Create and manage invoices',
  [MODULES.CUSTOMERS]: 'Manage customer information',
  [MODULES.DOCUMENTS]: 'Access document library',
  [MODULES.SETTINGS]: 'Access company settings',
  [MODULES.EMPLOYEES]: 'Manage team members',
  [MODULES.TIMESHEETS]: 'Track employee time and attendance',
  [MODULES.PAYROLL]: 'Manage employee payroll and compensation',
  [MODULES.REPORTS]: 'View reports and analytics',
  [MODULES.TOOLS]: 'Access calculators and trade tools',
  [MODULES.EXPENSES]: 'Track business expenses and receipts',
  [MODULES.PURCHASE_ORDERS]: 'Create and manage purchase orders to vendors',
  [MODULES.VENDORS]: 'Manage vendor and supplier relationships',
  [MODULES.INVENTORY]: 'Manage inventory items, stock levels, and movements',
  // Service Request System
  [MODULES.INCOMING_REQUESTS]: 'View and respond to customer service requests',
  [MODULES.MARKETPLACE]: 'Browse and respond to marketplace service requests',
  // Coming Soon Features
  [MODULES.MOBILE_APP]: 'Native mobile app for field technicians',
  [MODULES.GPS_TRACKING]: 'Real-time GPS tracking and route optimization',
  [MODULES.MARKETING_AUTOMATION]: 'Automated marketing campaigns and follow-ups',
  [MODULES.AI_ESTIMATING]: 'AI-powered estimating from photos',
  [MODULES.ENHANCED_CUSTOMER_PORTAL]: 'Self-service customer portal with payments',
  [MODULES.BUSINESS_INTELLIGENCE]: 'Advanced analytics and reporting dashboards',
  [MODULES.PAYMENT_PROCESSING]: 'Integrated payment processing with lowest rates',
  [MODULES.ADVANCED_SCHEDULING]: 'AI-powered scheduling and dispatch optimization'
};

/**
 * Check if user has access to a specific module
 * @param {Object} user - User object with permissions property
 * @param {string} module - Module to check (from MODULES constant)
 * @returns {boolean} - True if user has access
 */
export const hasModuleAccess = (user, module) => {
  if (!user || !user.permissions) {
    return false;
  }
  
  // Owners always have full access
  if (user.role === 'OWNER') {
    return true;
  }
  
  // Check specific permission
  return user.permissions[module] === true;
};

/**
 * Check if user can manage permissions (owner or admin with employee access)
 * @param {Object} user - User object
 * @returns {boolean} - True if user can manage permissions
 */
export const canManagePermissions = (user) => {
  if (!user) return false;
  
  // Owners can always manage permissions
  if (user.role === 'OWNER') {
    return true;
  }

  // Admins can manage permissions if they have employee access
  if (user.role === 'ADMIN' && hasModuleAccess(user, MODULES.EMPLOYEES)) {
    return true;
  }
  
  return false;
};

/**
 * Get default permissions for a role
 * @param {string} role - User role (owner/admin/employee)
 * @returns {Object} - Default permissions object
 */
export const getDefaultPermissions = (role) => {
  switch (role) {
    case 'OWNER':
      return {
        [MODULES.DASHBOARD]: true,
        [MODULES.MARKETPLACE]: true,
        [MODULES.CALENDAR]: true,
        [MODULES.QUOTES]: true,
        [MODULES.JOBS]: true,
        [MODULES.INVOICES]: true,
        [MODULES.CUSTOMERS]: true,
        [MODULES.DOCUMENTS]: true,
        [MODULES.SETTINGS]: true,
        [MODULES.EMPLOYEES]: true,
        [MODULES.TIMESHEETS]: true,
        [MODULES.PAYROLL]: true,
        [MODULES.REPORTS]: true,
        [MODULES.TOOLS]: true,
        [MODULES.EXPENSES]: true,
        [MODULES.PURCHASE_ORDERS]: true,
        [MODULES.VENDORS]: true,
        [MODULES.INVENTORY]: true,
        [MODULES.INCOMING_REQUESTS]: true,
        [MODULES.LEADS]: true
      };
    case 'ADMIN':
      return {
        [MODULES.DASHBOARD]: true,
        [MODULES.MARKETPLACE]: true,
        [MODULES.CALENDAR]: true,
        [MODULES.QUOTES]: true,
        [MODULES.JOBS]: true,
        [MODULES.INVOICES]: true,
        [MODULES.CUSTOMERS]: true,
        [MODULES.DOCUMENTS]: true,
        [MODULES.SETTINGS]: false,
        [MODULES.EMPLOYEES]: true,
        [MODULES.TIMESHEETS]: true,
        [MODULES.PAYROLL]: true,
        [MODULES.REPORTS]: true,
        [MODULES.TOOLS]: true,
        [MODULES.EXPENSES]: true,
        [MODULES.PURCHASE_ORDERS]: true,
        [MODULES.VENDORS]: true,
        [MODULES.INVENTORY]: true,
        [MODULES.INCOMING_REQUESTS]: true,
        [MODULES.LEADS]: true
      };
    case 'EMPLOYEE':
    default:
      return {
        [MODULES.DASHBOARD]: true,
        [MODULES.MARKETPLACE]: true, // Employees can browse marketplace
        [MODULES.CALENDAR]: true,
        [MODULES.QUOTES]: false,
        [MODULES.JOBS]: true,
        [MODULES.INVOICES]: false,
        [MODULES.CUSTOMERS]: true, // Changed to true for read-only access
        [MODULES.DOCUMENTS]: true,
        [MODULES.SETTINGS]: false,
        [MODULES.EMPLOYEES]: false,
        [MODULES.TIMESHEETS]: true,
        [MODULES.PAYROLL]: false,
        [MODULES.REPORTS]: false,
        [MODULES.TOOLS]: true,
        [MODULES.EXPENSES]: false, // Changed to false for employees
        [MODULES.PURCHASE_ORDERS]: false,
        [MODULES.VENDORS]: false,
        [MODULES.INVENTORY]: true, // Employees can view inventory
        [MODULES.INCOMING_REQUESTS]: false, // Only admins can manage incoming requests
        [MODULES.LEADS]: false // Only admins can manage leads
      };
  }
};

/**
 * Get navigation items based on user permissions - New Grouped Structure
 * @param {Object} user - User object with permissions
 * @param {Object} integrations - Integration settings (optional)
 * @returns {Array} - Array of navigation groups user can access
 */
export const getPermittedNavigation = (user, integrations = {}) => {
  const navigation = [];

  // Dashboard - Always first
  if (hasModuleAccess(user, MODULES.DASHBOARD)) {
    navigation.push({
      name: MODULE_LABELS[MODULES.DASHBOARD],
      href: '/dashboard',
      icon: HomeIcon,
      module: MODULES.DASHBOARD,
      type: 'single'
    });
  }

  // Marketplace - Second priority as single item
  if (hasModuleAccess(user, MODULES.MARKETPLACE)) {
    navigation.push({
      name: MODULE_LABELS[MODULES.MARKETPLACE],
      href: '/marketplace',
      icon: ShoppingBagIcon,
      module: MODULES.MARKETPLACE,
      type: 'single'
    });
  }

  // Work Section - Jobs, Calendar, Documents
  const workItems = [];
  if (hasModuleAccess(user, MODULES.JOBS)) {
    workItems.push({
      name: 'Active Jobs',
      href: '/jobs',
      icon: BriefcaseIcon,
      module: MODULES.JOBS
    });
    workItems.push({
      name: 'Closed Jobs',
      href: '/jobs/history',
      icon: FolderIcon,
      module: MODULES.JOBS
    });
  }
  if (hasModuleAccess(user, MODULES.CALENDAR)) {
    workItems.push({
      name: MODULE_LABELS[MODULES.CALENDAR],
      href: '/calendar',
      icon: CalendarDaysIcon,
      module: MODULES.CALENDAR
    });
  }
  if (hasModuleAccess(user, MODULES.DOCUMENTS)) {
    workItems.push({
      name: MODULE_LABELS[MODULES.DOCUMENTS],
      href: '/documents',
      icon: FolderIcon,
      module: MODULES.DOCUMENTS
    });
  }

  if (workItems.length > 0) {
    navigation.push({
      name: 'Work',
      icon: BriefcaseIcon,
      type: 'group',
      items: workItems
    });
  }

  // Sales Section - Customer Dashboard, Customers, Quotes, Invoices (for Owner/Admin)
  const salesItems = [];

  // Customer Dashboard - unified customer management
  if (hasModuleAccess(user, MODULES.CUSTOMERS)) {
    salesItems.push({
      name: 'Customer Dashboard',
      href: '/customer-dashboard',
      icon: ChartBarIcon,
      module: MODULES.CUSTOMERS
    });
  }

  if (hasModuleAccess(user, MODULES.CUSTOMERS)) {
    salesItems.push({
      name: MODULE_LABELS[MODULES.CUSTOMERS],
      href: '/customers',
      icon: UserGroupIcon,
      module: MODULES.CUSTOMERS
    });
  }
  if (hasModuleAccess(user, MODULES.QUOTES)) {
    salesItems.push({
      name: MODULE_LABELS[MODULES.QUOTES],
      href: '/quotes',
      icon: DocumentTextIcon,
      module: MODULES.QUOTES
    });
  }
  if (hasModuleAccess(user, MODULES.INVOICES)) {
    salesItems.push({
      name: MODULE_LABELS[MODULES.INVOICES],
      href: '/invoices',
      icon: CurrencyDollarIcon,
      module: MODULES.INVOICES
    });
  }

  // Add Incoming Requests (Leads) to Sales section
  if (hasModuleAccess(user, MODULES.INCOMING_REQUESTS)) {
    salesItems.push({
      name: MODULE_LABELS[MODULES.INCOMING_REQUESTS],
      href: '/incoming-requests',
      icon: InboxIcon,
      module: MODULES.INCOMING_REQUESTS
    });
  }

  if (salesItems.length > 0) {
    navigation.push({
      name: 'Sales',
      icon: CurrencyDollarIcon,
      type: 'group',
      items: salesItems
    });
  }

  // For employees - show Customers as read-only single item if they have access
  if (user?.role === 'EMPLOYEE' && hasModuleAccess(user, MODULES.CUSTOMERS)) {
    navigation.push({
      name: MODULE_LABELS[MODULES.CUSTOMERS],
      href: '/customers',
      icon: UserGroupIcon,
      module: MODULES.CUSTOMERS,
      type: 'single',
      badge: 'Read-only'
    });
  }

  // Finance Section - Expenses, Reports, Payroll (Owner/Admin only)
  const financeItems = [];
  if (hasModuleAccess(user, MODULES.EXPENSES)) {
    financeItems.push({
      name: MODULE_LABELS[MODULES.EXPENSES],
      href: '/expenses',
      icon: BanknotesIcon,
      module: MODULES.EXPENSES
    });
  }
  if (hasModuleAccess(user, MODULES.PURCHASE_ORDERS)) {
    financeItems.push({
      name: MODULE_LABELS[MODULES.PURCHASE_ORDERS],
      href: '/purchase-orders',
      icon: DocumentCheckIcon,
      module: MODULES.PURCHASE_ORDERS
    });
  }
  if (hasModuleAccess(user, MODULES.VENDORS)) {
    financeItems.push({
      name: MODULE_LABELS[MODULES.VENDORS],
      href: '/vendors',
      icon: BuildingOfficeIcon,
      module: MODULES.VENDORS
    });
  }
  if (hasModuleAccess(user, MODULES.REPORTS)) {
    financeItems.push({
      name: MODULE_LABELS[MODULES.REPORTS],
      href: '/reports',
      icon: ChartBarIcon,
      module: MODULES.REPORTS
    });
  }
  if (hasModuleAccess(user, MODULES.PAYROLL)) {
    financeItems.push({
      name: MODULE_LABELS[MODULES.PAYROLL],
      href: '/payroll',
      icon: BanknotesIcon,
      module: MODULES.PAYROLL
    });
  }

  // Add integration items to Finance section
  if (integrations.enableQuickbooks) {
    financeItems.push({
      name: 'QuickBooks',
      href: '/expenses',
      icon: ChartBarIcon,
      badge: 'Integration'
    });
  }

  if (financeItems.length > 0) {
    navigation.push({
      name: 'Finance',
      icon: ChartBarIcon,
      type: 'group',
      items: financeItems
    });
  }

  // Team Section - Employees, Timesheets (Owner/Admin only)
  const teamItems = [];
  if (hasModuleAccess(user, MODULES.EMPLOYEES)) {
    teamItems.push({
      name: MODULE_LABELS[MODULES.EMPLOYEES],
      href: '/employees',
      icon: UsersIcon,
      module: MODULES.EMPLOYEES
    });
  }
  if (hasModuleAccess(user, MODULES.TIMESHEETS) && user?.role !== 'employee') {
    teamItems.push({
      name: MODULE_LABELS[MODULES.TIMESHEETS],
      href: '/timesheets',
      icon: ClockIcon,
      module: MODULES.TIMESHEETS
    });
  }

  if (teamItems.length > 0) {
    navigation.push({
      name: 'Team',
      icon: UsersIcon,
      type: 'group',
      items: teamItems
    });
  }

  // For employees - split into My Time and My Time Off
  if (user?.role === 'employee' && hasModuleAccess(user, MODULES.TIMESHEETS)) {
    navigation.push({
      name: 'My Time',
      href: '/my/time',
      icon: ClockIcon,
      module: MODULES.TIMESHEETS,
      type: 'single'
    });
    navigation.push({
      name: 'My Time Off',
      href: '/my/time-off',
      icon: CalendarDaysIcon,
      module: MODULES.TIMESHEETS,
      type: 'single'
    });
  }

  // Admin approvals are accessible from Admin Dashboard quick actions to reduce sidebar clutter

  // Operations Section - Tools, Inventory, Messages, Integrations
  const operationsItems = [];
  if (hasModuleAccess(user, MODULES.TOOLS)) {
    operationsItems.push({
      name: MODULE_LABELS[MODULES.TOOLS],
      href: '/tools',
      icon: WrenchScrewdriverIcon,
      module: MODULES.TOOLS
    });
  }

  if (hasModuleAccess(user, MODULES.INVENTORY)) {
    operationsItems.push({
      name: MODULE_LABELS[MODULES.INVENTORY],
      href: '/operations/inventory',
      icon: ArchiveBoxIcon,
      module: MODULES.INVENTORY
    });
  }

  // Add integration items to Operations
  if (integrations.enableSms) {
    operationsItems.push({
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      badge: 'SMS'
    });
  }

  if (integrations.enableCloudStorage) {
    operationsItems.push({
      name: 'Cloud Storage',
      href: '/storage',
      icon: CloudArrowUpIcon,
      badge: 'Storage'
    });
  }

  if (integrations.enableCrm) {
    operationsItems.push({
      name: 'CRM',
      href: '/crm',
      icon: UserGroupIcon,
      badge: 'CRM'
    });
  }

  if (integrations.enableZapier) {
    operationsItems.push({
      name: 'Automation',
      href: '/automation',
      icon: BoltIcon,
      badge: 'Zapier'
    });
  }

  // Incoming Requests moved to Sales section as "Leads"

  // Messages - team communication (temporarily disabled until table is created)
  operationsItems.push({
    name: 'Messages',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    module: 'MESSAGES',
    badge: 'Beta'
  });

  if (operationsItems.length > 0) {
    navigation.push({
      name: 'Operations',
      icon: WrenchScrewdriverIcon,
      type: 'group',
      items: operationsItems
    });
  }

  // Coming Soon Section - Future Features (Owner/Admin only)
  const comingSoonItems = [];
  if (user?.role === 'owner' || user?.role === 'admin') {
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.MOBILE_APP],
      href: '/coming-soon/mobile-app',
      icon: DevicePhoneMobileIcon,
      badge: 'Coming Soon'
    });
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.GPS_TRACKING],
      href: '/coming-soon/gps-tracking',
      icon: MapPinIcon,
      badge: 'Coming Soon'
    });
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.MARKETING_AUTOMATION],
      href: '/coming-soon/marketing-automation',
      icon: EnvelopeIcon,
      badge: 'Coming Soon'
    });
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.AI_ESTIMATING],
      href: '/coming-soon/ai-estimating',
      icon: CpuChipIcon,
      badge: 'Coming Soon'
    });
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.ENHANCED_CUSTOMER_PORTAL],
      href: '/coming-soon/customer-portal',
      icon: ComputerDesktopIcon,
      badge: 'Coming Soon'
    });
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.BUSINESS_INTELLIGENCE],
      href: '/coming-soon/business-intelligence',
      icon: PresentationChartLineIcon,
      badge: 'Coming Soon'
    });
    comingSoonItems.push({
      name: MODULE_LABELS[MODULES.PAYMENT_PROCESSING],
      href: '/coming-soon/payment-processing',
      icon: CreditCardIcon,
      badge: 'Coming Soon'
    });
    // Removed ADVANCED_SCHEDULING - already implemented and industry-leading
  }

  if (comingSoonItems.length > 0) {
    navigation.push({
      name: 'Coming Soon',
      icon: BoltIcon,
      type: 'group',
      items: comingSoonItems
    });
  }

  // Account Section - Settings, Profile, Sign Out (temporary placement)
  const accountItems = [];

  if (hasModuleAccess(user, MODULES.SETTINGS)) {
    accountItems.push({
      name: MODULE_LABELS[MODULES.SETTINGS],
      href: '/settings',
      icon: CogIcon,
      module: MODULES.SETTINGS
    });
  }

  // Developer Tools - Beta only (always show for now)
  accountItems.push({
    name: '🛠️ Developer Tools',
    href: '/developer-tools',
    icon: CogIcon,
    badge: 'Beta'
  });

  // 'My Profile' link is surfaced in My Dashboard and user menu; keep sidebar Account minimal

  accountItems.push({
    name: 'Sign Out',
    href: '#',
    icon: ArrowRightOnRectangleIcon,
    isLogout: true
  });

  if (accountItems.length > 0) {
    navigation.push({
      name: 'Account',
      icon: UserIcon,
      type: 'group',
      items: accountItems
    });
  }

  // All navigation items are now properly grouped above - no loose items needed

  return navigation;
};

/**
 * Get all available modules for permission management
 * @returns {Array} - Array of module objects
 */
export const getAllModules = () => {
  return Object.values(MODULES).map(module => ({
    key: module,
    label: MODULE_LABELS[module],
    description: MODULE_DESCRIPTIONS[module]
  }));
};

/**
 * Validate permissions object
 * @param {Object} permissions - Permissions object to validate
 * @returns {Object} - Validated permissions object
 */
export const validatePermissions = (permissions) => {
  const validated = {};
  
  Object.values(MODULES).forEach(module => {
    validated[module] = permissions[module] === true;
  });
  
  return validated;
};

/**
 * Check if user is in same company as target user
 * @param {Object} currentUser - Current user
 * @param {Object} targetUser - Target user
 * @returns {boolean} - True if same company
 */
export const isSameCompany = (currentUser, targetUser) => {
  return currentUser?.company_id === targetUser?.company_id;
};

/**
 * Check if user can edit target user's permissions
 * @param {Object} currentUser - Current user
 * @param {Object} targetUser - Target user
 * @returns {boolean} - True if can edit
 */
export const canEditUserPermissions = (currentUser, targetUser) => {
  // Must be able to manage permissions
  if (!canManagePermissions(currentUser)) {
    return false;
  }
  
  // Must be same company
  if (!isSameCompany(currentUser, targetUser)) {
    return false;
  }
  
  // Cannot edit owner permissions
  if (targetUser?.role === 'owner') {
    return false;
  }
  
  // Cannot edit your own permissions unless you're owner
  if (currentUser?.id === targetUser?.id && currentUser?.role !== 'owner') {
    return false;
  }
  
  return true;
};
