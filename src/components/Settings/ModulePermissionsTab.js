import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import { EMPLOYEE_MODULES } from '../../utils/employeePermissions';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Sanitize data to convert empty strings to null (database constraint requirement)
const sanitizeData = (data) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

/**
 * Module Permissions Settings Tab
 * 
 * Allows company OWNERS to control which modules are available to their employees.
 * This is SEPARATE from the beta filter (which hides "Coming Soon" features from non-APP_OWNERs).
 * 
 * Database: Stores in `companies` table as JSONB column `module_permissions`
 * Example: { "quotes": true, "invoices": false, "reports": true }
 */
export default function ModulePermissionsTab() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadPermissions();
  }, [user?.company_id]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await supaFetch(
        `companies?id=eq.${user.company_id}&select=module_permissions`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        if (data[0]?.module_permissions) {
          setPermissions(data[0].module_permissions);
        } else {
          // Initialize with defaults from EMPLOYEE_MODULES
          const defaults = {};
          Object.values(EMPLOYEE_MODULES).forEach(module => {
            defaults[module.key] = module.defaultEnabled;
          });
          setPermissions(defaults);
        }
      }
    } catch (error) {
      console.error('Error loading module permissions:', error);
      showAlert('error', 'Failed to load module permissions');
    } finally {
      setLoading(false);
    }
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const payload = { module_permissions: permissions };

      const response = await supaFetch(
        `companies?id=eq.${user.company_id}`,
        {
          method: 'PATCH',
          body: sanitizeData(payload)
        },
        user.company_id
      );

      if (response.ok) {
        showAlert('success', 'Module permissions saved successfully');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving module permissions:', error);
      showAlert('error', 'Failed to save module permissions');
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleKey) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  // Group modules by category
  const modulesByCategory = {};
  Object.values(EMPLOYEE_MODULES).forEach(module => {
    if (!modulesByCategory[module.category]) {
      modulesByCategory[module.category] = [];
    }
    modulesByCategory[module.category].push(module);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`rounded-md p-4 ${alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Module Access Control</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Control which modules your employees can access. Owners and Admins always have full access.</p>
              <p className="mt-1">These settings apply to employees with roles: Technician, Dispatcher, Manager, Supervisor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Categories */}
      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <div key={category} className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{category} Modules</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {modules.map(module => (
              <div key={module.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">{module.label}</h4>
                    {module.defaultEnabled && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                </div>
                <button
                  onClick={() => toggleModule(module.key)}
                  className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    permissions[module.key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      permissions[module.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={loadPermissions}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={savePermissions}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-2">How it works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enabled modules appear in the sidebar for employees</li>
          <li>Disabled modules are hidden from employees but still accessible to owners/admins</li>
          <li>Changes take effect immediately after saving</li>
          <li>Employees will need to refresh their browser to see changes</li>
        </ul>
      </div>
    </div>
  );
}

