// PTO Service - FINAL SCHEMA COMPLIANT
// Works with: pto_current_balances, pto_ledger, employee_time_off, pto_policies
import { supaFetch } from '../utils/supaFetch';

// Constants matching FINAL schema
export const ACCRUAL_TYPES = {
  VACATION: 'vacation',
  SICK: 'sick',
  PERSONAL: 'personal',
  BEREAVEMENT: 'bereavement',
  OTHER: 'other'
};

export const PTO_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED', 
  DENIED: 'DENIED',
  CANCELLED: 'CANCELLED'
};

export const ACCRUAL_PERIODS = {
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly'
};

export const CATEGORY_CODES = {
  VAC: 'VAC',
  SICK: 'SICK',
  PERS: 'PERS',
  OTHER: 'OTHER'
};

class PTOServiceFinal {
  // =====================================================
  // POLICY MANAGEMENT
  // =====================================================
  
  static async getPolicies() {
    try {
      const response = await fetch('/api/pto/policies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PTO policies');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching PTO policies:', error);
      throw error;
    }
  }
  
  static async createPolicy(policyData) {
    try {
      const response = await fetch('/api/pto/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(policyData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create PTO policy');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating PTO policy:', error);
      throw error;
    }
  }
  
  // =====================================================
  // BALANCE MANAGEMENT - Uses pto_current_balances
  // =====================================================
  
  static async getEmployeeBalance(employeeId) {
    try {
      const response = await fetch(`/api/pto/balances/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PTO balance');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching PTO balance:', error);
      throw error;
    }
  }
  
  // =====================================================
  // REQUEST MANAGEMENT - Uses employee_time_off
  // =====================================================
  
  static async createRequest(requestData) {
    try {
      const response = await fetch('/api/pto/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create PTO request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating PTO request:', error);
      throw error;
    }
  }
  
  static async approveRequest(requestId, approvalData = {}) {
    try {
      const response = await fetch(`/api/pto/approve/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(approvalData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve PTO request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving PTO request:', error);
      throw error;
    }
  }
  
  static async denyRequest(requestId, reason) {
    try {
      const response = await fetch(`/api/pto/deny/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deny PTO request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error denying PTO request:', error);
      throw error;
    }
  }
  
  // =====================================================
  // HISTORY - Uses pto_ledger
  // =====================================================
  
  static async getEmployeeHistory(employeeId) {
    try {
      const response = await fetch(`/api/pto/history/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PTO history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching PTO history:', error);
      throw error;
    }
  }
  
  // =====================================================
  // ACCRUAL MANAGEMENT
  // =====================================================
  
  static async processAccrual(employeeId = null) {
    try {
      const response = await fetch('/api/pto/accrue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employee_id: employeeId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process PTO accrual');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error processing PTO accrual:', error);
      throw error;
    }
  }
  
  // =====================================================
  // UTILITY METHODS
  // =====================================================
  
  static calculateBusinessDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return businessDays;
  }
  
  static calculateHoursFromDays(days, hoursPerDay = 8) {
    return days * hoursPerDay;
  }
  
  static formatBalance(hours) {
    if (hours === null || hours === undefined) return '0.0';
    return parseFloat(hours).toFixed(1);
  }
  
  static getStatusColor(status) {
    const colors = {
      'PENDING': 'yellow',
      'APPROVED': 'green',
      'DENIED': 'red',
      'CANCELLED': 'gray'
    };
    return colors[status] || 'gray';
  }
  
  static getStatusLabel(status) {
    const labels = {
      'PENDING': 'Pending',
      'APPROVED': 'Approved',
      'DENIED': 'Denied',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }
  
  static getAccrualTypeLabel(type) {
    const labels = {
      'vacation': 'Vacation',
      'sick': 'Sick Leave',
      'personal': 'Personal',
      'bereavement': 'Bereavement',
      'other': 'Other'
    };
    return labels[type] || type;
  }
  
  static getCategoryCode(accrualType) {
    const mapping = {
      'vacation': 'VAC',
      'sick': 'SICK',
      'personal': 'PERS',
      'bereavement': 'OTHER',
      'other': 'OTHER'
    };
    return mapping[accrualType] || 'OTHER';
  }
  
  static validateRequestData(data) {
    const errors = [];
    
    if (!data.starts_at) errors.push('Start date is required');
    if (!data.ends_at) errors.push('End date is required');
    if (!data.hours_requested || data.hours_requested <= 0) errors.push('Hours requested must be greater than 0');
    if (!data.accrual_type) errors.push('PTO type is required');
    
    if (data.starts_at && data.ends_at) {
      const start = new Date(data.starts_at);
      const end = new Date(data.ends_at);
      if (start > end) errors.push('Start date must be before end date');
      if (start < new Date().setHours(0, 0, 0, 0)) errors.push('Start date cannot be in the past');
    }
    
    return errors;
  }
}

export default PTOServiceFinal;
