// PTO/Time Off Service
import { supaFetch } from '../utils/supaFetch';

export const PTO_TYPES = {
  PTO: 'PTO',
  SICK: 'SICK', 
  VACATION: 'VACATION',
  PERSONAL: 'PERSONAL',
  HOLIDAY: 'HOLIDAY'
};

export const PTO_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED', 
  DENIED: 'DENIED',
  CANCELLED: 'CANCELLED'
};

class PTOService {
  
  // Get all PTO requests for company
  async getPTORequests(companyId, filters = {}) {
    try {
      let query = 'employee_time_off?select=*,employee:employees(name,email)';
      
      // Add filters
      if (filters.employeeId) {
        query += `&employee_id=eq.${filters.employeeId}`;
      }
      if (filters.status) {
        query += `&status=eq.${filters.status}`;
      }
      if (filters.startDate) {
        query += `&starts_at=gte.${filters.startDate}`;
      }
      if (filters.endDate) {
        query += `&ends_at=lte.${filters.endDate}`;
      }
      
      query += '&order=starts_at.desc';
      
      const response = await supaFetch(query, { method: 'GET' }, companyId);
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch PTO requests');
    } catch (error) {
      console.error('Error fetching PTO requests:', error);
      throw error;
    }
  }

  // Create new PTO request
  async createPTORequest(companyId, ptoData) {
    try {
      const response = await supaFetch('employee_time_off', {
        method: 'POST',
        body: {
          company_id: companyId,
          employee_id: ptoData.employeeId,
          kind: ptoData.kind || PTO_TYPES.PTO,
          starts_at: ptoData.startsAt,
          ends_at: ptoData.endsAt,
          reason: ptoData.reason || '',
          notes: ptoData.notes || '',
          requested_by: ptoData.requestedBy,
          status: PTO_STATUS.PENDING
        }
      }, companyId);

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to create PTO request');
    } catch (error) {
      console.error('Error creating PTO request:', error);
      throw error;
    }
  }

  // Update PTO request (approve/deny/cancel)
  async updatePTORequest(companyId, ptoId, updates) {
    try {
      const updateData = { ...updates };
      
      // Add approval tracking if status is being changed
      if (updates.status === PTO_STATUS.APPROVED || updates.status === PTO_STATUS.DENIED) {
        updateData.approved_at = new Date().toISOString();
        if (updates.approvedBy) {
          updateData.approved_by = updates.approvedBy;
        }
      }

      const response = await supaFetch(`employee_time_off?id=eq.${ptoId}`, {
        method: 'PATCH',
        body: updateData
      }, companyId);

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to update PTO request');
    } catch (error) {
      console.error('Error updating PTO request:', error);
      throw error;
    }
  }

  // Delete PTO request
  async deletePTORequest(companyId, ptoId) {
    try {
      const response = await supaFetch(`employee_time_off?id=eq.${ptoId}`, {
        method: 'DELETE'
      }, companyId);

      if (response.ok) {
        return true;
      }
      throw new Error('Failed to delete PTO request');
    } catch (error) {
      console.error('Error deleting PTO request:', error);
      throw error;
    }
  }

  // Check if employee has PTO conflict for given time range
  async checkPTOConflict(companyId, employeeId, startTime, endTime) {
    try {
      const response = await supaFetch(
        `rpc/pto_conflict?p_employee=${employeeId}&p_start=${startTime}&p_end=${endTime}`,
        { method: 'POST' },
        companyId
      );

      if (response.ok) {
        return await response.json();
      }
      return false;
    } catch (error) {
      console.error('Error checking PTO conflict:', error);
      return false;
    }
  }

  // Get employee PTO for date range (for calendar display)
  async getEmployeePTO(companyId, employeeId, startDate, endDate) {
    try {
      const response = await supaFetch(
        `rpc/get_employee_pto?p_employee=${employeeId}&p_start_date=${startDate}&p_end_date=${endDate}`,
        { method: 'POST' },
        companyId
      );

      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching employee PTO:', error);
      return [];
    }
  }

  // Get PTO summary for dashboard
  async getPTOSummary(companyId) {
    try {
      const response = await supaFetch(
        'employee_time_off?select=status,kind&status=neq.CANCELLED',
        { method: 'GET' },
        companyId
      );

      if (response.ok) {
        const data = await response.json();
        return {
          pending: data.filter(p => p.status === PTO_STATUS.PENDING).length,
          approved: data.filter(p => p.status === PTO_STATUS.APPROVED).length,
          denied: data.filter(p => p.status === PTO_STATUS.DENIED).length,
          total: data.length
        };
      }
      return { pending: 0, approved: 0, denied: 0, total: 0 };
    } catch (error) {
      console.error('Error fetching PTO summary:', error);
      return { pending: 0, approved: 0, denied: 0, total: 0 };
    }
  }

  // Get PTO balances using unified view (CONSOLIDATED APPROACH)
  async getPTOBalances(companyId, employeeId = null) {
    try {
      let query = 'pto_current_balances_v?select=*';

      if (employeeId) {
        query += `&employee_id=eq.${employeeId}`;
      }

      const response = await supaFetch(query, { method: 'GET' }, companyId);

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch PTO balances');
    } catch (error) {
      console.error('Error fetching PTO balances:', error);
      throw error;
    }
  }

  // Add PTO ledger entry (SINGLE SOURCE OF TRUTH)
  async addPTOLedgerEntry(companyId, ledgerData) {
    try {
      const response = await supaFetch('pto_ledger', {
        method: 'POST',
        body: {
          company_id: companyId,
          employee_id: ledgerData.employeeId,
          category_code: ledgerData.categoryCode || 'VAC',
          entry_type: ledgerData.entryType, // 'ACCRUAL', 'USAGE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'CARRYOVER', 'FORFEITURE'
          hours: ledgerData.hours,
          effective_date: ledgerData.effectiveDate || new Date().toISOString().split('T')[0],
          description: ledgerData.description || '',
          reference_id: ledgerData.referenceId, // Link to time_off request if applicable
          reference_type: ledgerData.referenceType || 'MANUAL',
          created_by: ledgerData.createdBy
        }
      }, companyId);

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to add PTO ledger entry');
    } catch (error) {
      console.error('Error adding PTO ledger entry:', error);
      throw error;
    }
  }

  // Get PTO categories for company
  async getPTOCategories(companyId) {
    try {
      const response = await supaFetch(
        'pto_categories?select=*&is_active=eq.true&order=name.asc',
        { method: 'GET' },
        companyId
      );

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch PTO categories');
    } catch (error) {
      console.error('Error fetching PTO categories:', error);
      throw error;
    }
  }
}

export default new PTOService();
