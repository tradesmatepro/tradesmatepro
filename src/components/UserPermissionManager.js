import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  XMarkIcon,
  CheckIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UserPermissionManager = ({ isOpen, onClose, targetUserId, onPermissionsUpdated }) => {
  const { user } = useUser();
  const [targetUser, setTargetUser] = useState(null);
  const [permissions, setPermissions] = useState({
    can_view_quotes: false,
    can_create_jobs: false,
    can_access_customers: false,
    can_edit_documents: false,
    can_manage_employees: false,
    can_access_settings: false,
    can_manage_permissions: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (isOpen && targetUserId) {
      loadUserAndPermissions();
    } else if (isOpen && !targetUserId) {
      // Creating new user permissions
      setTargetUser(null);
      setPermissions({
        can_view_quotes: false,
        can_create_jobs: false,
        can_access_customers: false,
        can_edit_documents: false,
        can_manage_employees: false,
        can_access_settings: false,
        can_manage_permissions: false
      });
    }
  }, [isOpen, targetUserId]);

  const loadUserAndPermissions = async () => {
    setLoading(true);
    try {
      // Load target user info
      const userResponse = await fetch(
        `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/profiles?id=eq.${targetUserId}&select=id,full_name,email,role`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
          }
        }
      );

      if (userResponse.ok) {
        const users = await userResponse.json();
        if (users.length > 0) {
          setTargetUser(users[0]);
        }
      }

      // Load existing permissions
      const permResponse = await fetch(
        `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/user_permissions?user_id=eq.${targetUserId}&company_id=eq.${user.company_id}`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
          }
        }
      );

      if (permResponse.ok) {
        const userPermissions = await permResponse.json();
        if (userPermissions.length > 0) {
          const perm = userPermissions[0];
          setPermissions({
            can_view_quotes: perm.can_view_quotes || false,
            can_create_jobs: perm.can_create_jobs || false,
            can_access_customers: perm.can_access_customers || false,
            can_edit_documents: perm.can_edit_documents || false,
            can_manage_employees: perm.can_manage_employees || false,
            can_access_settings: perm.can_access_settings || false,
            can_manage_permissions: perm.can_manage_permissions || false
          });
        }
      }
    } catch (error) {
      showAlert('error', 'Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handlePermissionToggle = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const savePermissions = async () => {
    if (!targetUserId) {
      showAlert('error', 'No user selected');
      return;
    }

    setSaving(true);
    try {
      // Check if permissions record exists
      const checkResponse = await fetch(
        `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/user_permissions?user_id=eq.${targetUserId}&company_id=eq.${user.company_id}`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
          }
        }
      );

      const existingPermissions = await checkResponse.json();
      const permissionData = {
        user_id: targetUserId,
        company_id: user.company_id,
        ...permissions,
        updated_at: new Date().toISOString()
      };

      let response;
      if (existingPermissions.length > 0) {
        // Update existing permissions
        response = await fetch(
          `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/user_permissions?user_id=eq.${targetUserId}&company_id=eq.${user.company_id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(permissionData)
          }
        );
      } else {
        // Create new permissions
        response = await fetch(
          `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/user_permissions`,
          {
            method: 'POST',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(permissionData)
          }
        );
      }

      if (response.ok) {
        showAlert('success', 'Permissions updated successfully');
        if (onPermissionsUpdated) {
          onPermissionsUpdated();
        }
        setTimeout(() => onClose(), 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save permissions');
      }
    } catch (error) {
      showAlert('error', `Failed to save permissions: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const permissionOptions = [
    { key: 'can_view_quotes', label: 'View Quotes', description: 'Can view and access quote information' },
    { key: 'can_create_jobs', label: 'Create Jobs', description: 'Can create and manage job entries' },
    { key: 'can_access_customers', label: 'Access Customers', description: 'Can view and manage customer information' },
    { key: 'can_edit_documents', label: 'Edit Documents', description: 'Can create and edit documents' },
    { key: 'can_manage_employees', label: 'Manage Employees', description: 'Can add, edit, and manage employee accounts' },
    { key: 'can_access_settings', label: 'Access Settings', description: 'Can access company settings and configuration' },
    { key: 'can_manage_permissions', label: 'Manage Permissions', description: 'Can modify other users\' permissions' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {targetUser ? 'Edit Permissions' : 'Set Permissions'}
              </h3>
              {targetUser && (
                <p className="text-sm text-gray-600">
                  {targetUser.full_name} ({targetUser.email})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {alert.show && (
                <div className={`p-3 rounded-md ${
                  alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {alert.message}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {permissionOptions.map(option => (
                  <div key={option.key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[option.key]}
                        onChange={() => handlePermissionToggle(option.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={savePermissions}
            disabled={saving || loading}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckIcon className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionManager;
