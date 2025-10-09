// Production PTO Service - Complete PTO system implementation
import { supaFetch } from '../utils/supaFetch';

// Updated constants to match new schema
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

class PTOServiceProduction {
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
  
  static async updatePolicy(policyId, policyData) {
    try {
      const response = await fetch(`/api/pto/policies/${policyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(policyData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update PTO policy');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating PTO policy:', error);
      throw error;
    }
  }
  
  // =====================================================
  // BALANCE MANAGEMENT
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
  
  static async getAllBalances() {
    try {
      const response = await fetch('/api/pto/balances', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PTO balances');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching PTO balances:', error);
      throw error;
    }
  }
  
  static async updateBalance(employeeId, balanceData) {
    try {
      const response = await fetch(`/api/pto/balances/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(balanceData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update PTO balance');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating PTO balance:', error);
      throw error;
    }
  }
  
  // =====================================================
  // REQUEST MANAGEMENT
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
  
  static async getRequests(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await fetch(`/api/pto/requests?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PTO requests');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching PTO requests:', error);
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
  
  static validateRequestData(data) {
    const errors = [];
    
    if (!data.start_date) errors.push('Start date is required');
    if (!data.end_date) errors.push('End date is required');
    if (!data.hours_requested || data.hours_requested <= 0) errors.push('Hours requested must be greater than 0');
    if (!data.accrual_type) errors.push('PTO type is required');
    
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (start > end) errors.push('Start date must be before end date');
      if (start < new Date().setHours(0, 0, 0, 0)) errors.push('Start date cannot be in the past');
    }
    
    return errors;
  }
}

export default PTOServiceProduction;
