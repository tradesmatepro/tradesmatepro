// PTO Helper Utilities - Common utility functions for PTO system
import PTOServiceProduction from '../services/PTOServiceProduction';

/**
 * Calculate the number of business days between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Number of business days
 */
export const calculateBusinessDays = (startDate, endDate) => {
  return PTOServiceProduction.calculateBusinessDays(startDate, endDate);
};

/**
 * Convert days to hours based on standard work day
 * @param {number} days - Number of days
 * @param {number} hoursPerDay - Hours per work day (default: 8)
 * @returns {number} Total hours
 */
export const daysToHours = (days, hoursPerDay = 8) => {
  return PTOServiceProduction.calculateHoursFromDays(days, hoursPerDay);
};

/**
 * Convert hours to days based on standard work day
 * @param {number} hours - Number of hours
 * @param {number} hoursPerDay - Hours per work day (default: 8)
 * @returns {number} Number of days
 */
export const hoursToDays = (hours, hoursPerDay = 8) => {
  return hours / hoursPerDay;
};

/**
 * Format PTO balance for display
 * @param {number} hours - Hours to format
 * @returns {string} Formatted hours string
 */
export const formatBalance = (hours) => {
  return PTOServiceProduction.formatBalance(hours);
};

/**
 * Get status color class for PTO request status
 * @param {string} status - PTO request status
 * @returns {string} CSS color class
 */
export const getStatusColor = (status) => {
  return PTOServiceProduction.getStatusColor(status);
};

/**
 * Get human-readable status label
 * @param {string} status - PTO request status
 * @returns {string} Human-readable status
 */
export const getStatusLabel = (status) => {
  return PTOServiceProduction.getStatusLabel(status);
};

/**
 * Get human-readable accrual type label
 * @param {string} type - Accrual type
 * @returns {string} Human-readable type
 */
export const getAccrualTypeLabel = (type) => {
  return PTOServiceProduction.getAccrualTypeLabel(type);
};

/**
 * Validate PTO request data
 * @param {Object} requestData - Request data to validate
 * @returns {string[]} Array of validation errors
 */
export const validatePTORequest = (requestData) => {
  return PTOServiceProduction.validateRequestData(requestData);
};

/**
 * Check if employee has sufficient balance for request
 * @param {Object} balance - Employee balance object
 * @param {string} accrualType - Type of PTO being requested
 * @param {number} hoursRequested - Hours being requested
 * @returns {boolean} True if sufficient balance
 */
export const hasSufficientBalance = (balance, accrualType, hoursRequested) => {
  if (!balance) return false;
  
  const availableBalance = accrualType === 'vacation' 
    ? balance.vacation_balance 
    : balance.sick_balance;
    
  return (availableBalance || 0) >= hoursRequested;
};

/**
 * Calculate annual accrual hours based on period and rate
 * @param {number} hoursPerPeriod - Hours accrued per period
 * @param {string} accrualPeriod - Accrual period ('weekly', 'biweekly', 'monthly')
 * @returns {number} Annual accrual hours
 */
export const calculateAnnualAccrual = (hoursPerPeriod, accrualPeriod) => {
  const periodsPerYear = {
    'weekly': 52,
    'biweekly': 26,
    'monthly': 12
  };
  
  return hoursPerPeriod * (periodsPerYear[accrualPeriod] || 26);
};

/**
 * Get the next accrual date based on policy
 * @param {Date} lastAccrual - Last accrual date
 * @param {string} accrualPeriod - Accrual period
 * @returns {Date} Next accrual date
 */
export const getNextAccrualDate = (lastAccrual, accrualPeriod) => {
  const date = new Date(lastAccrual);
  
  switch (accrualPeriod) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      date.setDate(date.getDate() + 14); // Default to biweekly
  }
  
  return date;
};

/**
 * Check if a date falls on a weekend
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if weekend
 */
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Get the percentage of balance used
 * @param {number} currentBalance - Current balance
 * @param {number} maxBalance - Maximum balance
 * @returns {number} Percentage used (0-100)
 */
export const getBalancePercentage = (currentBalance, maxBalance) => {
  if (!maxBalance || maxBalance === 0) return 0;
  return Math.min((currentBalance / maxBalance) * 100, 100);
};

/**
 * Check if balance is near maximum (90% or higher)
 * @param {number} currentBalance - Current balance
 * @param {number} maxBalance - Maximum balance
 * @returns {boolean} True if near maximum
 */
export const isBalanceNearMax = (currentBalance, maxBalance) => {
  return getBalancePercentage(currentBalance, maxBalance) >= 90;
};

/**
 * Check if balance is low (less than 10 hours)
 * @param {number} currentBalance - Current balance
 * @returns {boolean} True if balance is low
 */
export const isBalanceLow = (currentBalance) => {
  return (currentBalance || 0) < 10;
};

/**
 * Format date range for display
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
};

/**
 * Get time until next accrual
 * @param {Date} nextAccrualDate - Next accrual date
 * @returns {string} Human-readable time until next accrual
 */
export const getTimeUntilNextAccrual = (nextAccrualDate) => {
  const now = new Date();
  const next = new Date(nextAccrualDate);
  const diffTime = next - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 'Due now';
  } else if (diffDays === 1) {
    return '1 day';
  } else if (diffDays < 7) {
    return `${diffDays} days`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
};

/**
 * Sort PTO requests by priority (pending first, then by date)
 * @param {Array} requests - Array of PTO requests
 * @returns {Array} Sorted requests
 */
export const sortRequestsByPriority = (requests) => {
  return requests.sort((a, b) => {
    // Pending requests first
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
    
    // Then by start date (earliest first)
    return new Date(a.starts_at) - new Date(b.starts_at);
  });
};

/**
 * Group requests by status
 * @param {Array} requests - Array of PTO requests
 * @returns {Object} Requests grouped by status
 */
export const groupRequestsByStatus = (requests) => {
  return requests.reduce((groups, request) => {
    const status = request.status || 'UNKNOWN';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(request);
    return groups;
  }, {});
};

/**
 * Calculate total PTO hours for a time period
 * @param {Array} requests - Array of approved PTO requests
 * @param {string|Date} startDate - Period start date
 * @param {string|Date} endDate - Period end date
 * @returns {number} Total hours
 */
export const calculatePTOHoursForPeriod = (requests, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return requests
    .filter(request => {
      const requestStart = new Date(request.starts_at);
      const requestEnd = new Date(request.ends_at);
      return request.status === 'APPROVED' && 
             requestStart >= start && 
             requestEnd <= end;
    })
    .reduce((total, request) => total + (request.hours_approved || 0), 0);
};
