// Plan and tier utilities for TradeMate Pro
// Supports: free_trial, free, pro, pro+, enterprise

export const TIERS = {
  FREE_TRIAL: 'free_trial',
  FREE: 'free',
  PRO: 'pro',
  PRO_PLUS: 'pro+',
  ENTERPRISE: 'enterprise'
};

export const TIER_CONFIGS = {
  [TIERS.FREE_TRIAL]: {
    name: 'Free Trial',
    features: ['all'], // Full access during trial
    limits: {
      quotes: 50,
      customers: 100,
      storage_mb: 500,
      users: 5
    },
    trial_days: 14,
    badge_color: 'bg-purple-100 text-purple-800'
  },
  [TIERS.FREE]: {
    name: 'Free',
    features: ['customers', 'quotes_basic'],
    limits: {
      quotes: 10,
      customers: 25,
      storage_mb: 100,
      users: 2
    },
    badge_color: 'bg-gray-100 text-gray-800'
  },
  [TIERS.PRO]: {
    name: 'Pro',
    features: ['customers', 'quotes', 'jobs', 'scheduling_basic'],
    limits: {
      quotes: 100,
      customers: 500,
      storage_mb: 2000,
      users: 10
    },
    badge_color: 'bg-blue-100 text-blue-800'
  },
  [TIERS.PRO_PLUS]: {
    name: 'Pro+',
    features: ['customers', 'quotes', 'jobs', 'scheduling', 'invoicing', 'reports_basic'],
    limits: {
      quotes: 500,
      customers: 2000,
      storage_mb: 10000,
      users: 25
    },
    badge_color: 'bg-green-100 text-green-800'
  },
  [TIERS.ENTERPRISE]: {
    name: 'Enterprise',
    features: ['all'],
    limits: {
      quotes: -1, // unlimited
      customers: -1,
      storage_mb: -1,
      users: -1
    },
    badge_color: 'bg-yellow-100 text-yellow-800'
  }
};

export const getTierConfig = (tier) => {
  return TIER_CONFIGS[tier] || TIER_CONFIGS[TIERS.FREE];
};

export const hasFeature = (userTier, feature) => {
  const config = getTierConfig(userTier);
  return config.features.includes('all') || config.features.includes(feature);
};

export const isWithinLimit = (userTier, limitType, currentUsage) => {
  const config = getTierConfig(userTier);
  const limit = config.limits[limitType];
  return limit === -1 || currentUsage < limit;
};

export const isTrialExpired = (user) => {
  if (user.tier !== TIERS.FREE_TRIAL) return false;
  
  try {
    const notes = typeof user.notes === 'string' ? JSON.parse(user.notes) : user.notes;
    if (!notes || !notes.trial_end) return false;
    
    return new Date() > new Date(notes.trial_end);
  } catch (error) {
    console.error('Error checking trial expiry:', error);
    return false;
  }
};

export const getTrialDaysRemaining = (user) => {
  if (user.tier !== TIERS.FREE_TRIAL) return 0;
  
  try {
    const notes = typeof user.notes === 'string' ? JSON.parse(user.notes) : user.notes;
    if (!notes || !notes.trial_end) return 0;
    
    const endDate = new Date(notes.trial_end);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error calculating trial days:', error);
    return 0;
  }
};

export const shouldShowUpgradeCTA = (userTier, feature) => {
  return !hasFeature(userTier, feature) && userTier !== TIERS.ENTERPRISE;
};

export const getUpgradeMessage = (userTier, feature) => {
  const tierName = getTierConfig(userTier).name;
  return `${feature} is not available in ${tierName}. Upgrade to unlock this feature.`;
};

export const autoDowngradeTrialUsers = async (users) => {
  // This would be called by a scheduled job
  const expiredTrialUsers = users.filter(user => 
    user.tier === TIERS.FREE_TRIAL && isTrialExpired(user)
  );
  
  // In a real implementation, you'd update these users to 'free' tier
  console.log(`Found ${expiredTrialUsers.length} expired trial users to downgrade`);
  return expiredTrialUsers;
};

// Feature gates for UI components
export const FEATURE_GATES = {
  ADVANCED_SCHEDULING: 'scheduling',
  BULK_ACTIONS: 'quotes',
  CUSTOM_REPORTS: 'reports_advanced',
  API_ACCESS: 'api',
  WHITE_LABEL: 'white_label',
  PRIORITY_SUPPORT: 'priority_support'
};

export const canAccessModule = (userTier, module) => {
  const moduleFeatureMap = {
    CUSTOMERS: 'customers',
    QUOTES: 'quotes',
    JOBS: 'jobs',
    SCHEDULING: 'scheduling',
    INVOICING: 'invoicing',
    REPORTS: 'reports_basic',
    EMPLOYEES: 'employees',
    SETTINGS: 'settings'
  };
  
  const feature = moduleFeatureMap[module];
  return feature ? hasFeature(userTier, feature) : false;
};
