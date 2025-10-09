import { supaFetch } from './supaFetch';
import { DEFAULT_PTO_CATEGORIES, DEFAULT_PTO_POLICY } from './ptoUtils';

/**
 * PTO System Setup Utilities
 * Functions to initialize PTO system for companies
 */

/**
 * Initialize PTO system for a company
 */
export const initializePTOSystem = async (companyId) => {
  try {
    console.log(`Initializing PTO system for company ${companyId}...`);
    
    // 1. Create default PTO categories
    const categories = await createDefaultCategories(companyId);
    console.log(`Created ${categories.length} PTO categories`);
    
    // 2. Create default PTO policy
    const policy = await createDefaultPolicy(companyId);
    console.log(`Created default PTO policy: ${policy.name}`);
    
    // 3. Assign policy to all active employees
    const assignments = await assignPolicyToEmployees(companyId, policy.id);
    console.log(`Assigned policy to ${assignments.length} employees`);
    
    // 4. Create initial PTO balances (optional - can be done via accrual)
    // const balances = await createInitialBalances(companyId);
    // console.log(`Created initial balances for ${balances.length} employees`);
    
    return {
      success: true,
      categories: categories.length,
      policy: policy.name,
      assignments: assignments.length
    };
    
  } catch (error) {
    console.error('Error initializing PTO system:', error);
    throw error;
  }
};

/**
 * Create default PTO categories for a company
 */
export const createDefaultCategories = async (companyId) => {
  const createdCategories = [];
  
  for (const categoryData of DEFAULT_PTO_CATEGORIES) {
    try {
      // Check if category already exists
      const existingRes = await supaFetch(
        `pto_categories?company_id=eq.${companyId}&code=eq.${categoryData.code}`,
        { method: 'GET' },
        companyId
      );
      
      if (existingRes.ok) {
        const existing = await existingRes.json();
        if (existing.length > 0) {
          console.log(`Category ${categoryData.code} already exists, skipping...`);
          createdCategories.push(existing[0]);
          continue;
        }
      }
      
      // Create new category
      const createRes = await supaFetch(
        'pto_categories',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...categoryData,
            company_id: companyId
          })
        },
        companyId
      );
      
      if (createRes.ok) {
        try {
          const responseText = await createRes.text();
          if (responseText) {
            const newCategory = JSON.parse(responseText);
            createdCategories.push(Array.isArray(newCategory) ? newCategory[0] : newCategory);
            console.log(`Created PTO category: ${categoryData.name}`);
          } else {
            // Empty response but successful - category was created
            console.log(`Created PTO category: ${categoryData.name} (empty response)`);
            createdCategories.push({ ...categoryData, company_id: companyId });
          }
        } catch (jsonError) {
          console.log(`Created PTO category: ${categoryData.name} (JSON parse error, but creation successful)`);
          createdCategories.push({ ...categoryData, company_id: companyId });
        }
      } else if (createRes.status === 409) {
        // Conflict - category already exists, which is fine
        console.log(`Category ${categoryData.name} already exists (409 conflict)`);
        createdCategories.push({ ...categoryData, company_id: companyId });
      } else {
        console.error(`Failed to create category ${categoryData.name}: ${createRes.status} ${createRes.statusText}`);
      }

    } catch (error) {
      console.error(`Error creating category ${categoryData.name}:`, error);
    }
  }
  
  return createdCategories;
};

/**
 * Create default PTO policy for a company
 */
export const createDefaultPolicy = async (companyId) => {
  try {
    // Check if default policy already exists
    const existingRes = await supaFetch(
      `pto_policies?company_id=eq.${companyId}&name=eq.${DEFAULT_PTO_POLICY.name}`,
      { method: 'GET' },
      companyId
    );
    
    if (existingRes.ok) {
      const existing = await existingRes.json();
      if (existing.length > 0) {
        console.log('Default PTO policy already exists');
        return existing[0];
      }
    }
    
    // Create new policy using existing schema structure
    const policyData = {
      company_id: companyId,
      name: DEFAULT_PTO_POLICY.name,
      vacation_hours_per_period: 3.08, // ~2 weeks vacation per year (biweekly)
      sick_hours_per_period: 1.54,     // ~1 week sick per year (biweekly)
      accrual_period: 'biweekly',
      max_vacation_hours: 160,          // 20 days max
      max_sick_hours: 80,               // 10 days max
      carryover_vacation_hours: 40,     // 5 days carryover
      carryover_sick_hours: 80          // All sick carries over
    };

    const createRes = await supaFetch(
      'pto_policies',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      },
      companyId
    );

    if (createRes.ok) {
      try {
        const responseText = await createRes.text();
        if (responseText) {
          const newPolicy = JSON.parse(responseText);
          console.log(`Created default PTO policy: ${DEFAULT_PTO_POLICY.name}`);
          return Array.isArray(newPolicy) ? newPolicy[0] : newPolicy;
        } else {
          // Empty response but successful
          console.log(`Created default PTO policy: ${DEFAULT_PTO_POLICY.name} (empty response)`);
          return { ...policyData, id: 'temp-id' };
        }
      } catch (jsonError) {
        console.log(`Created default PTO policy: ${DEFAULT_PTO_POLICY.name} (JSON parse error, but creation successful)`);
        return { ...policyData, id: 'temp-id' };
      }
    } else {
      const errorText = await createRes.text();
      console.error(`Failed to create policy: ${createRes.status} ${createRes.statusText}`, errorText);
      throw new Error(`Failed to create default PTO policy: ${createRes.status} ${errorText}`);
    }
    
  } catch (error) {
    console.error('Error creating default PTO policy:', error);
    throw error;
  }
};

/**
 * Assign PTO policy to all active employees
 */
export const assignPolicyToEmployees = async (companyId, policyId) => {
  try {
    // Get all active employees
    const employeesRes = await supaFetch(
      'users?active=eq.true&select=id,full_name,hire_date',
      { method: 'GET' },
      companyId
    );
    
    if (!employeesRes.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = await employeesRes.json();
    const assignments = [];
    
    for (const employee of employees) {
      try {
        // Check if employee already has a policy assignment
        const existingRes = await supaFetch(
          `employee_pto_policies?employee_id=eq.${employee.id}&end_date=is.null`,
          { method: 'GET' },
          companyId
        );
        
        if (existingRes.ok) {
          const existing = await existingRes.json();
          if (existing.length > 0) {
            console.log(`Employee ${employee.full_name} already has a PTO policy assigned`);
            assignments.push(existing[0]);
            continue;
          }
        }
        
        // Create policy assignment
        const assignRes = await supaFetch(
          'employee_pto_policies',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: employee.id,
              policy_id: policyId,
              effective_date: employee.hire_date || new Date().toISOString().split('T')[0],
              notes: 'Initial policy assignment'
            })
          },
          companyId
        );
        
        if (assignRes.ok) {
          const assignment = await assignRes.json();
          assignments.push(assignment[0]);
          console.log(`Assigned PTO policy to ${employee.full_name}`);
        }
        
      } catch (error) {
        console.error(`Error assigning policy to ${employee.full_name}:`, error);
      }
    }
    
    return assignments;
    
  } catch (error) {
    console.error('Error assigning policies to employees:', error);
    throw error;
  }
};

/**
 * Create initial PTO balances for employees (optional)
 * This gives employees some starting balance instead of waiting for accruals
 */
export const createInitialBalances = async (companyId, initialHours = { VAC: 40, SICK: 40, PERS: 16 }) => {
  try {
    // Get all active employees with policy assignments
    const employeesRes = await supaFetch(
      'users?active=eq.true&select=id,full_name',
      { method: 'GET' },
      companyId
    );
    
    if (!employeesRes.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = await employeesRes.json();
    const balances = [];
    
    for (const employee of employees) {
      for (const [categoryCode, hours] of Object.entries(initialHours)) {
        try {
          // Check if balance already exists
          const existingRes = await supaFetch(
            `pto_ledger?employee_id=eq.${employee.id}&category_code=eq.${categoryCode}&entry_type=eq.ADJUSTMENT&description=like.*Initial balance*`,
            { method: 'GET' },
            companyId
          );
          
          if (existingRes.ok) {
            const existing = await existingRes.json();
            if (existing.length > 0) {
              console.log(`Initial balance already exists for ${employee.full_name} - ${categoryCode}`);
              continue;
            }
          }
          
          // Create initial balance entry
          const balanceRes = await supaFetch(
            'pto_ledger',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                employee_id: employee.id,
                company_id: companyId,
                category_code: categoryCode,
                entry_type: 'ADJUSTMENT',
                hours: hours,
                effective_date: new Date().toISOString().split('T')[0],
                balance_after: hours,
                description: 'Initial balance - system setup'
              })
            },
            companyId
          );
          
          if (balanceRes.ok) {
            const balance = await balanceRes.json();
            balances.push(balance[0]);
            console.log(`Created initial balance for ${employee.full_name} - ${categoryCode}: ${hours} hours`);
          }
          
        } catch (error) {
          console.error(`Error creating initial balance for ${employee.full_name} - ${categoryCode}:`, error);
        }
      }
    }
    
    return balances;
    
  } catch (error) {
    console.error('Error creating initial balances:', error);
    throw error;
  }
};

/**
 * Check if PTO system is initialized for a company
 */
export const isPTOSystemInitialized = async (companyId) => {
  try {
    // Check for categories
    const categoriesRes = await supaFetch(
      `pto_categories?company_id=eq.${companyId}&limit=1`,
      { method: 'GET' },
      companyId
    );
    
    const hasCategories = categoriesRes.ok && (await categoriesRes.json()).length > 0;
    
    // Check for policies
    const policiesRes = await supaFetch(
      `pto_policies?company_id=eq.${companyId}&limit=1`,
      { method: 'GET' },
      companyId
    );
    
    const hasPolicies = policiesRes.ok && (await policiesRes.json()).length > 0;
    
    return hasCategories && hasPolicies;
    
  } catch (error) {
    console.error('Error checking PTO system initialization:', error);
    return false;
  }
};

/**
 * Auto-initialize PTO system if not already done
 */
export const autoInitializePTO = async (companyId) => {
  try {
    const isInitialized = await isPTOSystemInitialized(companyId);
    
    if (!isInitialized) {
      console.log('PTO system not initialized, setting up...');
      const result = await initializePTOSystem(companyId);
      console.log('PTO system initialized successfully:', result);
      return result;
    } else {
      console.log('PTO system already initialized');
      return { success: true, alreadyInitialized: true };
    }
    
  } catch (error) {
    console.error('Error auto-initializing PTO system:', error);
    throw error;
  }
};
