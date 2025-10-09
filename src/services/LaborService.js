import { supaFetch } from '../utils/supaFetch';

class LaborService {
  // Load labor rows for a work order
  async loadWorkOrderLabor(workOrderId, companyId) {
    try {
      const response = await supaFetch(
        `work_order_labor?work_order_id=eq.${workOrderId}&select=*,employees(full_name,base_rate,overtime_rate)&order=work_date.asc,created_at.asc`,
        { method: 'GET' },
        companyId
      );

      if (response.ok) {
        const data = await response.json();
        return data || [];
      } else {
        console.error('Failed to load work order labor:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error loading work order labor:', error);
      return [];
    }
  }

  // Save labor rows for a work order
  async saveWorkOrderLabor(workOrderId, laborRows, companyId) {
    try {
      console.log('💼 Saving labor rows for work order:', workOrderId, laborRows);

      // Separate new rows from existing rows
      const newRows = laborRows.filter(row => !row.id);
      const existingRows = laborRows.filter(row => row.id);

      // Get current labor rows from database to find deleted ones
      const currentRows = await this.loadWorkOrderLabor(workOrderId, companyId);
      const currentRowIds = currentRows.map(row => row.id);
      const updatedRowIds = existingRows.map(row => row.id);
      const deletedRowIds = currentRowIds.filter(id => !updatedRowIds.includes(id));

      // Delete removed rows
      for (const deletedId of deletedRowIds) {
        console.log('🗑️ Deleting labor row:', deletedId);
        await supaFetch(
          `work_order_labor?id=eq.${deletedId}`,
          { method: 'DELETE' },
          companyId
        );
      }

      // Update existing rows
      for (const row of existingRows) {
        console.log('📝 Updating labor row:', row.id);
        const updateData = {
          employee_id: row.employee_id || null,
          work_date: row.work_date,
          hours: row.hours || 0,
          rate: row.rate || null,
          overtime_hours: row.overtime_hours || 0,
          overtime_rate: row.overtime_rate || null,
          note: row.note || ''
        };

        await supaFetch(
          `work_order_labor?id=eq.${row.id}`,
          {
            method: 'PATCH',
            body: updateData,
            headers: { 'Prefer': 'return=representation' }
          },
          companyId
        );
      }

      // Insert new rows
      for (const row of newRows) {
        console.log('➕ Creating new labor row');
        const insertData = {
          work_order_id: workOrderId,
          employee_id: row.employee_id || null,
          work_date: row.work_date,
          hours: row.hours || 0,
          rate: row.rate || null,
          overtime_hours: row.overtime_hours || 0,
          overtime_rate: row.overtime_rate || null,
          note: row.note || ''
        };

        await supaFetch(
          'work_order_labor',
          {
            method: 'POST',
            body: insertData,
            headers: { 'Prefer': 'return=representation' }
          },
          companyId
        );
      }

      console.log('✅ Labor rows saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving work order labor:', error);
      return false;
    }
  }

  // Load employees for dropdown
  async loadEmployees(companyId) {
    try {
      // ✅ INDUSTRY STANDARD: Query employees table, join with users table
      // employees.user_id → users.id (for name, role, status)
      // users table has first_name, last_name, name columns

      const response = await supaFetch(
        'employees?select=id,user_id,job_title,hourly_rate,overtime_rate,users(id,first_name,last_name,name,role,status)&order=created_at.desc',
        { method: 'GET' },
        companyId
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Loaded employees:', data);
        // Transform data to include full_name at top level for backward compatibility
        const transformedData = data
          .filter(emp => emp.users) // Only include if user data exists
          .map(emp => {
            const full_name = emp.users.name ||
              `${emp.users.first_name || ''} ${emp.users.last_name || ''}`.trim() ||
              emp.job_title || 'Unknown Employee';

            return {
              ...emp,
              full_name,
              hourly_rate: emp.hourly_rate || 0,
              overtime_rate: emp.overtime_rate || (emp.hourly_rate * 1.5) || 0
            };
          });
        return transformedData || [];
      } else {
        console.error('Failed to load employees:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  }

  // Check if work order has legacy labor data that needs migration
  checkLegacyLaborData(workOrder) {
    // Check if work order has old labor fields but no new labor rows
    const hasLegacyData = (
      (workOrder.estimated_hours && workOrder.estimated_hours > 0) ||
      (workOrder.labor_rate && workOrder.labor_rate > 0)
    );

    if (hasLegacyData) {
      return {
        estimated_hours: workOrder.estimated_hours || 0,
        labor_rate: workOrder.labor_rate || 0,
        created_at: workOrder.created_at
      };
    }

    return null;
  }

  // Calculate labor totals from labor rows
  calculateLaborTotals(laborRows, employees = []) {
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalLaborCost = 0;

    for (const row of laborRows) {
      const employee = employees.find(e => e.id === row.employee_id);
      
      const regularRate = row.rate || employee?.base_rate || 0;
      const overtimeRate = row.overtime_rate || employee?.overtime_rate || (regularRate * 1.5);
      
      const regularHours = row.hours || 0;
      const overtimeHours = row.overtime_hours || 0;
      
      totalRegularHours += regularHours;
      totalOvertimeHours += overtimeHours;
      totalLaborCost += (regularHours * regularRate) + (overtimeHours * overtimeRate);
    }

    return {
      totalRegularHours,
      totalOvertimeHours,
      totalHours: totalRegularHours + totalOvertimeHours,
      totalLaborCost
    };
  }

  // Validate labor row data
  validateLaborRow(row) {
    const errors = [];

    if (!row.work_date) {
      errors.push('Work date is required');
    }

    if ((row.hours || 0) < 0) {
      errors.push('Hours must be 0 or greater');
    }

    if ((row.overtime_hours || 0) < 0) {
      errors.push('Overtime hours must be 0 or greater');
    }

    if (row.rate !== null && row.rate < 0) {
      errors.push('Rate must be 0 or greater');
    }

    if (row.overtime_rate !== null && row.overtime_rate < 0) {
      errors.push('Overtime rate must be 0 or greater');
    }

    // If no employee is selected, rate must be provided
    if (!row.employee_id && !row.rate && (row.hours || 0) > 0) {
      errors.push('Rate is required when no employee is selected');
    }

    return errors;
  }

  // Validate all labor rows
  validateAllLaborRows(laborRows) {
    const allErrors = [];
    
    laborRows.forEach((row, index) => {
      const rowErrors = this.validateLaborRow(row);
      if (rowErrors.length > 0) {
        allErrors.push({
          rowIndex: index,
          errors: rowErrors
        });
      }
    });

    return allErrors;
  }
}

// Export singleton instance
const laborService = new LaborService();
export default laborService;
