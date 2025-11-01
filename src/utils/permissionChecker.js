/**
 * Permission Checker - 3-Tier Permission System
 * 
 * Hierarchy:
 * 1. Individual employee_permissions (force enable/disable)
 * 2. Company module_permissions (company-wide settings)
 * 3. Role defaults from EMPLOYEE_MODULES
 * 
 * Special Cases:
 * - APP_OWNER: Sees all modules including "Coming Soon" features
 * - OWNER/ADMIN: Always have full access regardless of settings
 */

import { EMPLOYEE_MODULES, getDefaultPermissions } from './employeePermissions';
import { isAppOwner } from './betaFilter';

/**
 * Check if a user has access to a specific module
 * @param {Object} user - User object with role, company_id, etc.
 * @param {string} moduleKey - Module key from EMPLOYEE_MODULES (e.g., 'quotes', 'invoices')
 * @param {Object} employeePermissions - Individual permissions from employee_permissions table
 * @param {Object} companyPermissions - Company-wide permissions from companies.module_permissions
 * @returns {boolean} - True if user has access to the module
 */
export const hasModuleAccess = (user, moduleKey, employeePermissions = {}, companyPermissions = {}) => {
  if (!user) return false;
  
  // APP_OWNER sees everything
  if (isAppOwner(user)) return true;
  
  // OWNER and ADMIN always have full access
  const role = (user.role || '').toLowerCase();
  if (role.includes('owner') || role.includes('admin')) return true;
  
  // Check individual employee permission (force enable/disable)
  if (employeePermissions[moduleKey] !== null && employeePermissions[moduleKey] !== undefined) {
    return employeePermissions[moduleKey] === true;
  }
  
  // Check company-wide permission
  if (companyPermissions[moduleKey] !== null && companyPermissions[moduleKey] !== undefined) {
    return companyPermissions[moduleKey] === true;
  }
  
  // Fall back to role defaults
  const roleDefaults = getDefaultPermissions(role);
  return roleDefaults[moduleKey] === true;
};

/**
 * Filter navigation items based on user permissions
 * @param {Array} navItems - Navigation items array
 * @param {Object} user - User object
 * @param {Object} employeePermissions - Individual permissions
 * @param {Object} companyPermissions - Company permissions
 * @returns {Array} - Filtered navigation items
 */
export const filterNavByPermissions = (navItems, user, employeePermissions = {}, companyPermissions = {}) => {
  if (!user) return [];
  
  // APP_OWNER sees everything (including "Coming Soon" features)
  if (isAppOwner(user)) return navItems;
  
  return navItems.filter(item => {
    // If item has a moduleKey, check permissions
    if (item.moduleKey) {
      return hasModuleAccess(user, item.moduleKey, employeePermissions, companyPermissions);
    }
    
    // If no moduleKey, show by default (e.g., Dashboard)
    return true;
  }).map(item => {
    // Recursively filter children
    if (item.children && Array.isArray(item.children)) {
      return {
        ...item,
        children: filterNavByPermissions(item.children, user, employeePermissions, companyPermissions)
      };
    }
    return item;
  });
};

/**
 * Get all accessible modules for a user
 * @param {Object} user - User object
 * @param {Object} employeePermissions - Individual permissions
 * @param {Object} companyPermissions - Company permissions
 * @returns {Array} - Array of accessible module keys
 */
export const getAccessibleModules = (user, employeePermissions = {}, companyPermissions = {}) => {
  if (!user) return [];
  
  const accessibleModules = [];
  
  Object.keys(EMPLOYEE_MODULES).forEach(moduleKey => {
    const key = EMPLOYEE_MODULES[moduleKey].key;
    if (hasModuleAccess(user, key, employeePermissions, companyPermissions)) {
      accessibleModules.push(key);
    }
  });
  
  return accessibleModules;
};

/**
 * Load employee permissions from database via RPC
 * @param {string} userId - User ID
 * @param {string} companyId - Company ID
 * @param {Function} supaFetch - Supabase fetch function
 * @returns {Object} - Employee permissions object
 */
export const loadEmployeePermissions = async (userId, companyId, supaFetch) => {
  try {
    // ✅ FIX: Query employee_permissions table
    const response = await supaFetch(
      `rpc/get_employee_permissions`,
      { method: 'POST', body: { p_user_id: userId, p_company_id: companyId } },
      companyId
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0];
      }
    }
  } catch (error) {
    console.error('Error loading employee permissions:', error);
  }

  return {};
};

/**
 * Load company module permissions from database
 * @param {string} companyId - Company ID
 * @param {Function} supaFetch - Supabase fetch function
 * @returns {Object} - Company module permissions object
 */
export const loadCompanyPermissions = async (companyId, supaFetch) => {
  try {
    const response = await supaFetch(
      `companies?id=eq.${companyId}&select=module_permissions`,
      { method: 'GET' },
      companyId
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0 && data[0].module_permissions) {
        return data[0].module_permissions;
      }
    }
  } catch (error) {
    console.error('Error loading company permissions:', error);
  }
  
  return {};
};

