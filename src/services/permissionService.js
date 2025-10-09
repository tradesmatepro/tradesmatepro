// TradeMate Pro Permission Service
// Handles fetching and managing user permissions from Supabase

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

/**
 * Fetch user permissions from Supabase
 * @param {string} userId - User ID
 * @param {string} companyId - Company ID
 * @returns {Object|null} - User permissions object or null if not found
 */
export const fetchUserPermissions = async (userId, companyId) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_permissions?user_id=eq.${userId}&company_id=eq.${companyId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch permissions: ${response.statusText}`);
    }

    const permissions = await response.json();
    return permissions.length > 0 ? permissions[0] : null;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return null;
  }
};

/**
 * Update user permissions in Supabase
 * @param {string} userId - User ID
 * @param {string} companyId - Company ID
 * @param {Object} permissions - Permissions object to update
 * @param {string} updatedBy - ID of user making the update
 * @returns {boolean} - Success status
 */
export const updateUserPermissions = async (userId, companyId, permissions, updatedBy) => {
  try {
    const updateData = {
      ...permissions,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_permissions?user_id=eq.${userId}&company_id=eq.${companyId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update permissions: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return false;
  }
};

/**
 * Create default permissions for a new user
 * @param {string} userId - User ID
 * @param {string} companyId - Company ID
 * @param {string} role - User role (owner/admin/employee)
 * @param {string} createdBy - ID of user creating the permissions
 * @returns {boolean} - Success status
 */
export const createUserPermissions = async (userId, companyId, role, createdBy) => {
  try {
    // Call the database function to set default permissions
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/set_default_permissions_for_role`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_company_id: companyId,
          p_role: role
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create permissions: ${response.statusText}`);
    }

    // Update the created_by field
    if (createdBy) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/user_permissions?user_id=eq.${userId}&company_id=eq.${companyId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            created_by: createdBy,
            updated_by: createdBy
          })
        }
      );
    }

    return true;
  } catch (error) {
    console.error('Error creating user permissions:', error);
    return false;
  }
};

/**
 * Fetch all users and their permissions for a company (for permission management)
 * @param {string} companyId - Company ID
 * @returns {Array} - Array of users with their permissions
 */
export const fetchCompanyUsersWithPermissions = async (companyId) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?company_id=eq.${companyId}&select=id,email,full_name,role,status,created_at,user_permissions(*)`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch company users: ${response.statusText}`);
    }

    const users = await response.json();
    
    // Transform the data to include permissions as a flat object
    return users.map(user => ({
      ...user,
      permissions: user.user_permissions?.[0] || null
    }));
  } catch (error) {
    console.error('Error fetching company users with permissions:', error);
    return [];
  }
};

/**
 * Get permission categories for UI organization
 * @returns {Array} - Array of permission categories
 */
export const getPermissionCategories = () => {
  return [
    {
      name: 'Core Features',
      description: 'Basic app functionality',
      permissions: [
        { key: 'can_view_dashboard', label: 'View Dashboard', description: 'Access to main dashboard' },
        { key: 'can_view_jobs', label: 'View Jobs', description: 'See job listings' },
        { key: 'can_create_jobs', label: 'Create Jobs', description: 'Create new jobs' },
        { key: 'can_edit_jobs', label: 'Edit Jobs', description: 'Modify existing jobs' },
        { key: 'can_delete_jobs', label: 'Delete Jobs', description: 'Remove jobs' },
        { key: 'can_view_scheduling', label: 'View Schedule', description: 'Access scheduling calendar' },
        { key: 'can_edit_scheduling', label: 'Edit Schedule', description: 'Modify schedules' },
        { key: 'can_view_documents', label: 'View Documents', description: 'Access document library' },
        { key: 'can_edit_documents', label: 'Edit Documents', description: 'Modify documents' },
        { key: 'can_upload_documents', label: 'Upload Documents', description: 'Add new documents' }
      ]
    },
    {
      name: 'Customer Management',
      description: 'Customer and client features',
      permissions: [
        { key: 'can_view_customers', label: 'View Customers', description: 'See customer list' },
        { key: 'can_create_customers', label: 'Create Customers', description: 'Add new customers' },
        { key: 'can_edit_customers', label: 'Edit Customers', description: 'Modify customer info' },
        { key: 'can_delete_customers', label: 'Delete Customers', description: 'Remove customers' }
      ]
    },
    {
      name: 'Sales & Billing',
      description: 'Quotes, invoices, and financial features',
      permissions: [
        { key: 'can_view_quotes', label: 'View Quotes', description: 'See quote listings' },
        { key: 'can_create_quotes', label: 'Create Quotes', description: 'Generate new quotes' },
        { key: 'can_edit_quotes', label: 'Edit Quotes', description: 'Modify quotes' },
        { key: 'can_delete_quotes', label: 'Delete Quotes', description: 'Remove quotes' },
        { key: 'can_view_invoices', label: 'View Invoices', description: 'See invoice listings' },
        { key: 'can_create_invoices', label: 'Create Invoices', description: 'Generate invoices' },
        { key: 'can_edit_invoices', label: 'Edit Invoices', description: 'Modify invoices' },
        { key: 'can_delete_invoices', label: 'Delete Invoices', description: 'Remove invoices' }
      ]
    },
    {
      name: 'Team Management',
      description: 'Employee and team features',
      permissions: [
        { key: 'can_view_employees', label: 'View Employees', description: 'See team member list' },
        { key: 'can_manage_employees', label: 'Manage Employees', description: 'Add, edit, remove team members' },
        { key: 'can_view_reports', label: 'View Reports', description: 'Access reporting dashboard' },
        { key: 'can_generate_reports', label: 'Generate Reports', description: 'Create custom reports' }
      ]
    },
    {
      name: 'Administration',
      description: 'Company settings and advanced features',
      permissions: [
        { key: 'can_access_settings', label: 'Access Settings', description: 'View company settings' },
        { key: 'can_edit_company_settings', label: 'Edit Company Settings', description: 'Modify company configuration' },
        { key: 'can_manage_integrations', label: 'Manage Integrations', description: 'Configure third-party integrations' },
        { key: 'can_view_billing', label: 'View Billing', description: 'Access billing information' },
        { key: 'can_edit_billing', label: 'Edit Billing', description: 'Modify billing settings' },
        { key: 'can_manage_permissions', label: 'Manage Permissions', description: 'Control user access levels' }
      ]
    },
    {
      name: 'Integrations',
      description: 'Third-party service access',
      permissions: [
        { key: 'can_access_expenses', label: 'Access Expenses', description: 'QuickBooks expense tracking' },
        { key: 'can_access_notifications', label: 'Access Notifications', description: 'SMS and email notifications' },
        { key: 'can_access_storage', label: 'Access Cloud Storage', description: 'Cloud file storage' },
        { key: 'can_access_crm', label: 'Access CRM', description: 'Customer relationship management' },
        { key: 'can_access_automation', label: 'Access Automation', description: 'Zapier workflow automation' }
      ]
    }
  ];
};
