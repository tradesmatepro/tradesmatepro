import { supaFetch } from '../utils/supaFetch';

/**
 * PTO Accrual Service
 * Handles automatic PTO accrual calculations and processing
 */
class PTOAccrualService {
  constructor(companyId) {
    this.companyId = companyId;
  }

  /**
   * Calculate accrual for an employee based on their policy
   */
  async calculateAccrual(employeeId, policyId, accrualDate = new Date()) {
    try {
      // Get the policy details
      const policyRes = await supaFetch(
        `pto_policies?id=eq.${policyId}&select=*`,
        { method: 'GET' },
        this.companyId
      );
      
      if (!policyRes.ok) {
        throw new Error('Failed to fetch PTO policy');
      }
      
      const policies = await policyRes.json();
      if (policies.length === 0) {
        throw new Error('PTO policy not found');
      }
      
      const policy = policies[0];
      const accrualRates = policy.accrual_rates || {};
      
      // Calculate accrual for each category
      const accruals = [];
      for (const [categoryCode, rate] of Object.entries(accrualRates)) {
        if (rate > 0) {
          accruals.push({
            categoryCode,
            hours: Number(rate),
            effectiveDate: accrualDate.toISOString().split('T')[0]
          });
        }
      }
      
      return accruals;
    } catch (error) {
      console.error('Error calculating accrual:', error);
      throw error;
    }
  }

  /**
   * Process accrual for a single employee
   */
  async processEmployeeAccrual(employeeId, accrualDate = new Date()) {
    try {
      // Get the employee's current policy
      const policyRes = await supaFetch(
        `employee_pto_policies?employee_id=eq.${employeeId}&end_date=is.null&select=*,pto_policies(*)`,
        { method: 'GET' },
        this.companyId
      );
      
      if (!policyRes.ok) {
        console.warn(`No active PTO policy found for employee ${employeeId}`);
        return [];
      }
      
      const policies = await policyRes.json();
      if (policies.length === 0) {
        console.warn(`No active PTO policy found for employee ${employeeId}`);
        return [];
      }
      
      const employeePolicy = policies[0];
      const policy = employeePolicy.pto_policies;
      
      // Check if employee is eligible (based on hire date + eligibility days)
      const employeeRes = await supaFetch(
        `users?id=eq.${employeeId}&select=hire_date`,
        { method: 'GET' },
        this.companyId
      );
      
      if (employeeRes.ok) {
        const employees = await employeeRes.json();
        if (employees.length > 0 && employees[0].hire_date) {
          const hireDate = new Date(employees[0].hire_date);
          const eligibilityDate = new Date(hireDate);
          eligibilityDate.setDate(eligibilityDate.getDate() + (policy.eligibility_days || 0));
          
          if (accrualDate < eligibilityDate) {
            console.log(`Employee ${employeeId} not yet eligible for PTO accrual`);
            return [];
          }
        }
      }
      
      // Calculate accruals
      const accruals = await this.calculateAccrual(employeeId, policy.id, accrualDate);
      
      // Process each accrual
      const processedAccruals = [];
      for (const accrual of accruals) {
        // Check if accrual already exists for this date
        const existingRes = await supaFetch(
          `pto_ledger?employee_id=eq.${employeeId}&category_code=eq.${accrual.categoryCode}&effective_date=eq.${accrual.effectiveDate}&entry_type=eq.ACCRUAL`,
          { method: 'GET' },
          this.companyId
        );
        
        if (existingRes.ok) {
          const existing = await existingRes.json();
          if (existing.length > 0) {
            console.log(`Accrual already exists for employee ${employeeId}, category ${accrual.categoryCode}, date ${accrual.effectiveDate}`);
            continue;
          }
        }
        
        // Get current balance
        const currentBalance = await this.getCurrentBalance(employeeId, accrual.categoryCode, accrualDate);
        
        // Check max balance limits
        const maxBalances = policy.max_balances || {};
        const maxBalance = maxBalances[accrual.categoryCode];
        
        let accrualHours = accrual.hours;
        if (maxBalance && currentBalance + accrualHours > maxBalance) {
          accrualHours = Math.max(0, maxBalance - currentBalance);
          if (accrualHours === 0) {
            console.log(`Employee ${employeeId} has reached max balance for ${accrual.categoryCode}`);
            continue;
          }
        }
        
        // Create ledger entry
        const ledgerRes = await supaFetch(
          'pto_ledger',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: employeeId,
              company_id: this.companyId,
              category_code: accrual.categoryCode,
              entry_type: 'ACCRUAL',
              hours: accrualHours,
              effective_date: accrual.effectiveDate,
              balance_after: currentBalance + accrualHours,
              description: `Automatic accrual - ${policy.accrual_frequency}`,
              policy_id: policy.id
            })
          },
          this.companyId
        );
        
        if (ledgerRes.ok) {
          processedAccruals.push({
            employeeId,
            categoryCode: accrual.categoryCode,
            hours: accrualHours,
            newBalance: currentBalance + accrualHours
          });
        }
      }
      
      return processedAccruals;
    } catch (error) {
      console.error(`Error processing accrual for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get current PTO balance for an employee/category
   */
  async getCurrentBalance(employeeId, categoryCode, asOfDate = new Date()) {
    try {
      const balanceRes = await supaFetch(
        `pto_current_balances?employee_id=eq.${employeeId}&category_code=eq.${categoryCode}`,
        { method: 'GET' },
        this.companyId
      );
      
      if (balanceRes.ok) {
        const balances = await balanceRes.json();
        if (balances.length > 0) {
          return Number(balances[0].current_balance || 0);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting current balance:', error);
      return 0;
    }
  }

  /**
   * Process accruals for all employees
   */
  async processAllAccruals(accrualDate = new Date()) {
    try {
      // Get all active employees
      const employeesRes = await supaFetch(
        'users?active=eq.true&select=id,full_name',
        { method: 'GET' },
        this.companyId
      );
      
      if (!employeesRes.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const employees = await employeesRes.json();
      const results = [];
      
      for (const employee of employees) {
        try {
          const accruals = await this.processEmployeeAccrual(employee.id, accrualDate);
          if (accruals.length > 0) {
            results.push({
              employeeId: employee.id,
              employeeName: employee.full_name,
              accruals
            });
          }
        } catch (error) {
          console.error(`Failed to process accrual for ${employee.full_name}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error processing all accruals:', error);
      throw error;
    }
  }

  /**
   * Check if accrual should run based on frequency
   */
  static shouldRunAccrual(frequency, lastRunDate, currentDate = new Date()) {
    if (!lastRunDate) return true;
    
    const last = new Date(lastRunDate);
    const current = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        const weeksDiff = Math.floor((current - last) / (7 * 24 * 60 * 60 * 1000));
        return weeksDiff >= 1;
        
      case 'biweekly':
        const biweeksDiff = Math.floor((current - last) / (14 * 24 * 60 * 60 * 1000));
        return biweeksDiff >= 1;
        
      case 'monthly':
        return current.getMonth() !== last.getMonth() || current.getFullYear() !== last.getFullYear();
        
      case 'annually':
        return current.getFullYear() !== last.getFullYear();
        
      default:
        return false;
    }
  }
}

export default PTOAccrualService;
