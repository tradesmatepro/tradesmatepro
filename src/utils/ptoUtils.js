/**
 * PTO Utility Functions
 * Helper functions for PTO calculations and formatting
 */

/**
 * Format hours into a human-readable string
 */
export const formatPTOHours = (hours) => {
  const h = Number(hours || 0);
  if (h === 0) return '0 hrs';
  if (h < 8) return `${h.toFixed(1)} hrs`;
  
  const days = Math.floor(h / 8);
  const remainingHours = h % 8;
  
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return `${days}d ${remainingHours.toFixed(1)}h`;
};

/**
 * Calculate business days between two dates
 */
export const calculateBusinessDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
  }
  
  return count;
};

/**
 * Calculate hours for a date range (business days * 8 hours)
 */
export const calculatePTOHours = (startDate, endDate) => {
  const businessDays = calculateBusinessDays(startDate, endDate);
  return businessDays * 8;
};

/**
 * Get PTO status color classes
 */
export const getPTOStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DENIED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get PTO category color (with fallback)
 */
export const getCategoryColor = (category, fallback = '#6B7280') => {
  return category?.color || fallback;
};

/**
 * Check if a date is in the past
 */
export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Check if a date is within advance notice period
 */
export const isWithinAdvanceNotice = (date, advanceNoticeDays) => {
  if (!advanceNoticeDays || advanceNoticeDays <= 0) return true;
  
  const today = new Date();
  const requiredNoticeDate = new Date();
  requiredNoticeDate.setDate(today.getDate() + advanceNoticeDays);
  
  const requestDate = new Date(date);
  return requestDate >= requiredNoticeDate;
};

/**
 * Validate PTO request data
 */
export const validatePTORequest = (requestData, category, availableBalance) => {
  const errors = {};
  
  // Required fields
  if (!requestData.category_code) {
    errors.category_code = 'PTO category is required';
  }
  
  if (!requestData.start_date) {
    errors.start_date = 'Start date is required';
  }
  
  if (!requestData.end_date) {
    errors.end_date = 'End date is required';
  }
  
  // Date validations
  if (requestData.start_date && requestData.end_date) {
    const startDate = new Date(requestData.start_date);
    const endDate = new Date(requestData.end_date);
    
    if (isDateInPast(requestData.start_date)) {
      errors.start_date = 'Start date cannot be in the past';
    }
    
    if (endDate < startDate) {
      errors.end_date = 'End date must be after start date';
    }
    
    // Check advance notice requirements
    if (category?.advance_notice_days > 0) {
      if (!isWithinAdvanceNotice(requestData.start_date, category.advance_notice_days)) {
        errors.start_date = `This category requires ${category.advance_notice_days} days advance notice`;
      }
    }
    
    // Check consecutive days limit
    if (category?.max_consecutive_days) {
      const requestDays = calculateBusinessDays(requestData.start_date, requestData.end_date);
      if (requestDays > category.max_consecutive_days) {
        errors.end_date = `Maximum ${category.max_consecutive_days} consecutive days allowed`;
      }
    }
  }
  
  // Hours validation
  const requestedHours = Number(requestData.hours_requested) || 0;
  if (requestedHours <= 0) {
    errors.hours_requested = 'Hours requested must be greater than 0';
  }
  
  // Balance validation
  if (requestedHours > availableBalance) {
    errors.hours_requested = `Insufficient balance. Available: ${formatPTOHours(availableBalance)}`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calculate PTO accrual for a period
 */
export const calculateAccrual = (policy, categoryCode, periods = 1) => {
  if (!policy?.accrual_rates || !policy.accrual_rates[categoryCode]) {
    return 0;
  }
  
  const rate = Number(policy.accrual_rates[categoryCode] || 0);
  return rate * periods;
};

/**
 * Check if balance is low (less than 1 day)
 */
export const isBalanceLow = (balance, threshold = 8) => {
  return Number(balance || 0) < threshold;
};

/**
 * Get next accrual date based on frequency
 */
export const getNextAccrualDate = (lastAccrualDate, frequency) => {
  if (!lastAccrualDate) return new Date();
  
  const lastDate = new Date(lastAccrualDate);
  const nextDate = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'annually':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      return new Date();
  }
  
  return nextDate;
};

/**
 * Format PTO request date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = start.toLocaleDateString();
  const endStr = end.toLocaleDateString();
  
  if (startStr === endStr) {
    return startStr;
  }
  
  return `${startStr} - ${endStr}`;
};

/**
 * Get PTO request summary
 */
export const getPTORequestSummary = (request, category) => {
  const dateRange = formatDateRange(request.start_date, request.end_date);
  const hours = formatPTOHours(request.hours_requested);
  const categoryName = category?.name || request.category_code;
  
  return {
    dateRange,
    hours,
    categoryName,
    status: request.status,
    reason: request.reason,
    isHistorical: request.is_historical || isDateInPast(request.end_date)
  };
};

/**
 * Default PTO categories for new companies
 */
export const DEFAULT_PTO_CATEGORIES = [
  {
    name: 'Vacation',
    code: 'VAC',
    color: '#10B981',
    requires_approval: true,
    advance_notice_days: 7
  },
  {
    name: 'Sick Leave',
    code: 'SICK',
    color: '#EF4444',
    requires_approval: false,
    advance_notice_days: 0
  },
  {
    name: 'Personal',
    code: 'PERS',
    color: '#8B5CF6',
    requires_approval: true,
    advance_notice_days: 3
  },
  {
    name: 'Bereavement',
    code: 'BEREAVE',
    color: '#6B7280',
    requires_approval: false,
    advance_notice_days: 0
  }
];

/**
 * Default PTO policy for new companies (matches existing schema)
 */
export const DEFAULT_PTO_POLICY = {
  name: 'Standard Full-time',
  description: 'Standard PTO policy for full-time employees',
  vacation_hours_per_period: 3.08,    // ~2 weeks vacation per year (biweekly)
  sick_hours_per_period: 1.54,        // ~1 week sick per year (biweekly)
  accrual_period: 'biweekly',
  max_vacation_hours: 160,             // 20 days max
  max_sick_hours: 80,                  // 10 days max
  carryover_vacation_hours: 40,        // 5 days carryover
  carryover_sick_hours: 80,            // All sick carries over
  eligibility_days: 90                 // 90 days before accrual starts
};
