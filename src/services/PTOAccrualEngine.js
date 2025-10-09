// PTO Accrual Engine - Works with FINAL schema (pto_current_balances, pto_ledger)
// Handles scheduled accruals, payroll integration, and balance management

import { supaFetch } from '../utils/supaFetch';

class PTOAccrualEngine {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.scheduledJobs = new Map();
  }

  // =====================================================
  // MAIN ACCRUAL PROCESSING
  // =====================================================

  async processAllAccruals(companyId = null) {
    if (this.isRunning) {
      console.log('Accrual engine already running, skipping...');
      return { success: false, message: 'Already running' };
    }

    try {
      this.isRunning = true;
      console.log('🚀 Starting PTO accrual processing...');

      // Get all active policies
      const policies = await this.getActivePolicies(companyId);
      const results = [];

      for (const policy of policies) {
        const policyResults = await this.processPolicyAccruals(policy);
        results.push(...policyResults);
      }

      this.lastRun = new Date();
      console.log(`✅ Accrual processing completed. Processed ${results.length} employees.`);

      return {
        success: true,
        processed_employees: results.length,
        results: results,
        timestamp: this.lastRun
      };
    } catch (error) {
      console.error('❌ Error in accrual processing:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    } finally {
      this.isRunning = false;
    }
  }

  async processEmployeeAccrual(employeeId, companyId) {
    try {
      console.log(`🔄 Processing accrual for employee: ${employeeId}`);

      // Get employee's policy
      const policy = await this.getEmployeePolicy(employeeId, companyId);
      if (!policy) {
        throw new Error('No active policy found for employee');
      }

      const result = await this.processEmployeeForPolicy(employeeId, policy);

      console.log(`✅ Employee accrual completed for: ${employeeId}`);
      return result;
    } catch (error) {
      console.error(`❌ Error processing employee accrual for ${employeeId}:`, error);
      throw error;
    }
  }

  // =====================================================
  // CORE ACCRUAL LOGIC - WORKS WITH FINAL SCHEMA
  // =====================================================

  async getActivePolicies(companyId = null) {
    try {
      let query = 'pto_policies?is_active=eq.true&select=*';
      if (companyId) {
        query += `&company_id=eq.${companyId}`;
      }

      const response = await supaFetch(query, { method: 'GET' }, companyId);
      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  }

  async getEmployeePolicy(employeeId, companyId) {
    try {
      // Get employee's company policy (assuming one active policy per company for now)
      const response = await supaFetch(
        `pto_policies?company_id=eq.${companyId}&is_active=eq.true&limit=1`,
        { method: 'GET' },
        companyId
      );

      if (!response.ok) {
        throw new Error('Failed to fetch employee policy');
      }

      const policies = await response.json();
      return policies[0] || null;
    } catch (error) {
      console.error('Error fetching employee policy:', error);
      throw error;
    }
  }

  async processPolicyAccruals(policy) {
    try {
      // Get all employees for this company
      const employeesResponse = await supaFetch(
        `employees?company_id=eq.${policy.company_id}&is_active=eq.true&select=id,name`,
        { method: 'GET' },
        policy.company_id
      );

      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees');
      }

      const employees = await employeesResponse.json();
      const results = [];

      for (const employee of employees) {
        try {
          const result = await this.processEmployeeForPolicy(employee.id, policy);
          results.push({
            employee_id: employee.id,
            employee_name: employee.name,
            ...result
          });
        } catch (error) {
          console.error(`Error processing accrual for employee ${employee.id}:`, error);
          results.push({
            employee_id: employee.id,
            employee_name: employee.name,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing policy accruals:', error);
      throw error;
    }
  }

  async processEmployeeForPolicy(employeeId, policy) {
    try {
      // Process vacation accrual
      const vacationResult = await this.processAccrualForCategory(
        employeeId,
        policy,
        'VAC',
        policy.vacation_hours_per_period,
        policy.max_vacation_hours
      );

      // Process sick accrual
      const sickResult = await this.processAccrualForCategory(
        employeeId,
        policy,
        'SICK',
        policy.sick_hours_per_period,
        policy.max_sick_hours
      );

      return {
        vacation_accrued: vacationResult.hours_accrued,
        sick_accrued: sickResult.hours_accrued,
        vacation_balance: vacationResult.new_balance,
        sick_balance: sickResult.new_balance
      };
    } catch (error) {
      console.error(`Error processing employee ${employeeId} for policy:`, error);
      throw error;
    }
  }

  async processAccrualForCategory(employeeId, policy, categoryCode, hoursPerPeriod, maxHours) {
    try {
      // Get current balance for this category
      const currentBalance = await this.getCurrentBalance(employeeId, categoryCode, policy.company_id);

      // Calculate new balance with max limit
      const accrualHours = parseFloat(hoursPerPeriod || 0);
      const currentHours = parseFloat(currentBalance.current_balance || 0);
      const maxAllowed = parseFloat(maxHours || 999999);

      const newBalance = Math.min(currentHours + accrualHours, maxAllowed);
      const actualAccrued = newBalance - currentHours;

      if (actualAccrued > 0) {
        // Update balance in pto_current_balances
        await this.updateCurrentBalance(employeeId, categoryCode, newBalance, policy.company_id);

        // Log to pto_ledger
        await this.logToLedger({
          employee_id: employeeId,
          policy_id: policy.id,
          entry_type: 'accrual',
          hours: actualAccrued,
          effective_date: new Date().toISOString().split('T')[0],
          notes: `Automatic ${policy.accrual_period} accrual`,
          company_id: policy.company_id,
          category_code: categoryCode,
          balance_after: newBalance,
          description: `${categoryCode} accrual: ${actualAccrued} hours`
        });
      }

      return {
        hours_accrued: actualAccrued,
        new_balance: newBalance,
        was_capped: actualAccrued < accrualHours
      };
    } catch (error) {
      console.error(`Error processing accrual for category ${categoryCode}:`, error);
      throw error;
    }
  }

  async getCurrentBalance(employeeId, categoryCode, companyId) {
    try {
      const response = await supaFetch(
        `pto_current_balances?employee_id=eq.${employeeId}&category_code=eq.${categoryCode}`,
        { method: 'GET' },
        companyId
      );

      if (!response.ok) {
        throw new Error('Failed to fetch current balance');
      }

      const balances = await response.json();
      return balances[0] || {
        employee_id: employeeId,
        category_code: categoryCode,
        current_balance: 0
      };
    } catch (error) {
      console.error('Error fetching current balance:', error);
      throw error;
    }
  }

  async updateCurrentBalance(employeeId, categoryCode, newBalance, companyId) {
    try {
      // Try to update existing record
      const updateResponse = await supaFetch(
        `pto_current_balances?employee_id=eq.${employeeId}&category_code=eq.${categoryCode}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_balance: newBalance,
            last_transaction_date: new Date().toISOString(),
            accrual_count: 'accrual_count + 1',
            updated_at: new Date().toISOString()
          })
        },
        companyId
      );

      if (!updateResponse.ok) {
        // If update failed, try to insert new record
        const insertResponse = await supaFetch(
          'pto_current_balances',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: employeeId,
              company_id: companyId,
              category_code: categoryCode,
              current_balance: newBalance,
              last_transaction_date: new Date().toISOString(),
              accrual_count: 1,
              usage_count: 0
            })
          },
          companyId
        );

        if (!insertResponse.ok) {
          throw new Error('Failed to create balance record');
        }
      }
    } catch (error) {
      console.error('Error updating current balance:', error);
      throw error;
    }
  }

  async logToLedger(ledgerEntry) {
    try {
      const response = await supaFetch(
        'pto_ledger',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...ledgerEntry,
            processed_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          })
        },
        ledgerEntry.company_id
      );

      if (!response.ok) {
        throw new Error('Failed to log to ledger');
      }
    } catch (error) {
      console.error('Error logging to ledger:', error);
      throw error;
    }
  }

  // =====================================================
  // MONITORING AND REPORTING
  // =====================================================

  getEngineStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      scheduledJobs: Array.from(this.scheduledJobs.values()).map(job => ({
        policyId: job.policyId,
        accrualPeriod: job.accrualPeriod,
        companyId: job.companyId,
        startedAt: job.startedAt
      }))
    };
  }

  async generateAccrualReport(companyId, startDate, endDate) {
    try {
      // This would query the pto_ledger for accrual entries in the date range
      const report = {
        company_id: companyId,
        period: { start: startDate, end: endDate },
        summary: {
          total_employees: 0,
          total_vacation_accrued: 0,
          total_sick_accrued: 0,
          total_hours_accrued: 0
        },
        details: []
      };

      // In a real implementation, this would query the database
      console.log('📊 Accrual report generated:', report);
      return report;
    } catch (error) {
      console.error('Error generating accrual report:', error);
      throw error;
    }
  }

  // =====================================================
  // MANUAL ADJUSTMENTS
  // =====================================================

  async adjustEmployeeBalance(employeeId, adjustmentData) {
    try {
      console.log(`🔧 Processing manual balance adjustment for employee: ${employeeId}`);
      
      const result = await PTOServiceProduction.updateBalance(employeeId, {
        ...adjustmentData,
        reason: adjustmentData.reason || 'Manual adjustment'
      });

      console.log(`✅ Balance adjustment completed for employee: ${employeeId}`);
      return result;
    } catch (error) {
      console.error(`❌ Error adjusting balance for employee ${employeeId}:`, error);
      throw error;
    }
  }

  // =====================================================
  // CLEANUP AND SHUTDOWN
  // =====================================================

  shutdown() {
    console.log('🛑 Shutting down PTO Accrual Engine...');
    
    // Clear all scheduled jobs
    for (const [jobKey, job] of this.scheduledJobs) {
      clearInterval(job.intervalId);
      console.log(`Cleared scheduled job: ${jobKey}`);
    }
    
    this.scheduledJobs.clear();
    this.isRunning = false;
    
    console.log('✅ PTO Accrual Engine shutdown complete');
  }
}

// Create singleton instance
const ptoAccrualEngine = new PTOAccrualEngine();

// Export both the class and singleton instance
export { PTOAccrualEngine };
export default ptoAccrualEngine;
