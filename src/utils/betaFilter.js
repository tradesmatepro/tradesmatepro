/**
 * TradeMate Pro - Beta Feature Filter
 * 
 * Purpose: Hide "Coming Soon" features from regular users during beta launch
 * 
 * Rules:
 * - app_owner sees EVERYTHING (including Coming Soon features)
 * - Everyone else only sees production-ready features (no Coming Soon badges)
 * 
 * This allows the app owner to test and develop features while keeping
 * the production UI clean for beta testers and customers.
 */

/**
 * Check if user is the app owner
 * @param {Object} user - User object from UserContext
 * @returns {boolean} - True if user is app_owner
 */
export const isAppOwner = (user) => {
  if (!user) {
    return false;
  }

  // In development mode, OWNER and ADMIN roles see everything (all features available for testing)
  if (process.env.NODE_ENV === 'development') {
    const role = (user.role || '').toLowerCase();
    if (role === 'owner' || role === 'admin' || role === 'app_owner') {
      return true;
    }
  }

  // Check for APP_OWNER role (database enum value - uppercase)
  if (user.role === 'APP_OWNER') {
    return true;
  }
  if (user.role?.toLowerCase() === 'app_owner') {
    return true;
  }

  // Check for owner role with special flag (if you have one)
  if (user.role?.toLowerCase() === 'owner' && user.is_app_owner === true) {
    return true;
  }

  // Check by email (fallback - replace with your actual email)
  // if (user.email === 'your-email@example.com') {
  //   return true;
  // }

  return false;
};

// Track if we've already logged the filter status for this session
let hasLoggedFilterStatus = false;

/**
 * Filter navigation items to hide "Coming Soon" features from non-owners
 * @param {Array} items - Navigation items array
 * @param {Object} user - User object from UserContext
 * @param {boolean} isTopLevel - Internal flag to track if this is the top-level call
 * @returns {Array} - Filtered navigation items
 */
export const filterBetaFeatures = (items, user, isTopLevel = true) => {
  if (!items || !Array.isArray(items)) return [];

  const isOwner = isAppOwner(user);

  // Only log once per session at the top level
  if (isTopLevel && !hasLoggedFilterStatus) {
    if (isOwner) {
      console.log('[Beta Filter] ✅ APP_OWNER - Showing all features including "Coming Soon"');
    } else {
      console.log('[Beta Filter] 🔒 Regular user - Hiding "Coming Soon" features', {
        role: user?.role,
        email: user?.email
      });
    }
    hasLoggedFilterStatus = true;
  }

  // App owner sees everything
  if (isOwner) {
    return items;
  }

  // Track hidden items for summary (only at top level)
  const hiddenItems = [];

  // Filter out items with "Coming Soon" badge
  const filtered = items.filter(item => {
    // Remove items with "Coming Soon" badge
    if (item.badge === 'Coming Soon') {
      if (isTopLevel) {
        hiddenItems.push(item.name);
      }
      return false;
    }

    // Recursively filter children if they exist (for nested items)
    if (item.children && Array.isArray(item.children)) {
      item.children = filterBetaFeatures(item.children, user, false);

      // If all children are filtered out, hide the parent too
      if (item.children.length === 0) {
        return false;
      }
    }

    // Recursively filter items if they exist (for groups)
    if (item.items && Array.isArray(item.items)) {
      item.items = filterBetaFeatures(item.items, user, false);

      // If all items are filtered out, hide the parent group too
      if (item.items.length === 0) {
        if (isTopLevel) {
          hiddenItems.push(`${item.name} (empty group)`);
        }
        return false;
      }
    }

    return true;
  });

  // Log summary at top level only
  if (isTopLevel && hiddenItems.length > 0 && !isOwner) {
    console.log(`[Beta Filter] 🚫 Hidden ${hiddenItems.length} features:`, hiddenItems.join(', '));
  }

  return filtered;
};

/**
 * Check if a specific feature should be visible to the user
 * @param {string} featureName - Name of the feature
 * @param {Object} user - User object from UserContext
 * @returns {boolean} - True if feature should be visible
 */
export const shouldShowFeature = (featureName, user) => {
  // App owner sees everything
  if (isAppOwner(user)) {
    return true;
  }
  
  // List of features that are "Coming Soon" (hidden from non-owners)
  const comingSoonFeatures = [
    'Marketplace',
    'Purchase Orders',
    'Vendors',
    'Reports',
    'Payroll',
    'Timesheets',
    'Developer Tools',
    'Mobile App',
    'GPS Tracking',
    'Marketing Automation',
    'AI Estimating'
  ];
  
  // Hide if feature is in coming soon list
  if (comingSoonFeatures.includes(featureName)) {
    return false;
  }
  
  return true;
};

/**
 * Get badge text for a feature (app owner sees "Coming Soon", others see nothing)
 * @param {string} originalBadge - Original badge text
 * @param {Object} user - User object from UserContext
 * @returns {string|undefined} - Badge text or undefined
 */
export const getBadgeForUser = (originalBadge, user) => {
  // App owner sees all badges
  if (isAppOwner(user)) {
    return originalBadge;
  }
  
  // Hide "Coming Soon" badges from non-owners
  if (originalBadge === 'Coming Soon') {
    return undefined;
  }
  
  // Show other badges (like "Beta", "New", etc.)
  return originalBadge;
};

/**
 * Filter sidebar sections to remove empty sections after filtering
 * @param {Array} sections - Sidebar sections array
 * @param {Object} user - User object from UserContext
 * @returns {Array} - Filtered sections
 */
export const filterSidebarSections = (sections, user) => {
  if (!sections || !Array.isArray(sections)) return [];
  
  return sections
    .map(section => ({
      ...section,
      items: filterBetaFeatures(section.items || [], user)
    }))
    .filter(section => {
      // Keep sections that have items
      if (section.items && section.items.length > 0) {
        return true;
      }
      
      // Keep sections without items if they're special (like dividers)
      if (!section.items) {
        return true;
      }
      
      return false;
    });
};

/**
 * Reset the logging flag (useful for debugging or testing)
 * Call this in browser console: resetBetaFilterLogging()
 */
export const resetBetaFilterLogging = () => {
  hasLoggedFilterStatus = false;
  console.log('[Beta Filter] 🔄 Logging reset - will log on next filter call');
};

/**
 * Check if user should see beta/development features
 * @param {Object} user - User object from UserContext
 * @returns {boolean} - True if user should see beta features
 */
export const canSeeBetaFeatures = (user) => {
  return isAppOwner(user);
};

/**
 * Get user-friendly role display name
 * @param {Object} user - User object from UserContext
 * @returns {string} - Display name for user's role
 */
export const getUserRoleDisplay = (user) => {
  if (!user) return 'Guest';
  
  if (isAppOwner(user)) {
    return 'App Owner';
  }
  
  const roleMap = {
    'owner': 'Owner',
    'admin': 'Administrator',
    'manager': 'Manager',
    'dispatcher': 'Dispatcher',
    'supervisor': 'Supervisor',
    'lead_technician': 'Lead Technician',
    'technician': 'Technician',
    'apprentice': 'Apprentice',
    'helper': 'Helper',
    'accountant': 'Accountant',
    'sales_rep': 'Sales Representative',
    'customer_service': 'Customer Service'
  };
  
  return roleMap[user.role?.toLowerCase()] || user.role || 'User';
};

/**
 * Log beta filter activity (for debugging)
 * @param {string} action - Action being performed
 * @param {Object} user - User object
 * @param {any} data - Additional data
 */
export const logBetaFilter = (action, user, data = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Beta Filter] ${action}`, {
      isAppOwner: isAppOwner(user),
      userRole: user?.role,
      userEmail: user?.email,
      ...data
    });
  }
};

