import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  hasModuleAccess,
  canManagePermissions,
  canEditUserPermissions,
  getAllModules,
  validatePermissions,
  MODULES
} from '../utils/simplePermissions';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';

// Supabase configuration
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
// SECURITY: Service key removed - use Edge Functions instead
// TODO: remove legacy hardcoded SUPABASE_* lines below; use env import only


const SimplePermissionManager = ({ isOpen, onClose, targetUserId }) => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Check if current user can manage permissions
  const canManage = canManagePermissions(user);

  useEffect(() => {
    if (isOpen && canManage) {
      loadUsers();
    }
  }, [isOpen, canManage]);

  useEffect(() => {
    if (targetUserId && users.length > 0) {
      const targetUser = users.find(u => u.id === targetUserId);
      if (targetUser) {
        setSelectedUser(targetUser);
      }
    }
  }, [targetUserId, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Use industry standard: query users table with profiles data joined
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_profiles?company_id=eq.${user.company_id}&select=user_id,email,full_name,role,settings,status,created_at`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const companyUsers = await response.json();
      // Map to expected format for compatibility
      const mappedUsers = companyUsers.map(user => ({
        ...user,
        id: user.user_id  // Use business user ID as primary
      }));
      setUsers(mappedUsers);

      if (mappedUsers.length > 0 && !selectedUser) {
        setSelectedUser(mappedUsers[0]);
      }
    } catch (error) {
      showAlert('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handlePermissionChange = (module, value) => {
    if (!selectedUser || !canEditUserPermissions(user, selectedUser)) return;

    setSelectedUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: value
      }
    }));
  };

  const savePermissions = async () => {
    if (!selectedUser || !canEditUserPermissions(user, selectedUser)) return;

    setSaving(true);
    try {
      const validatedPermissions = validatePermissions(selectedUser.permissions);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${selectedUser.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            permissions: validatedPermissions,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      showAlert('success', 'Permissions updated successfully');
      await loadUsers(); // Reload to get fresh data
    } catch (error) {
      showAlert('error', 'Error updating permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (!canManage) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to manage user permissions.
          </p>
          <button onClick={onClose} className="w-full btn-secondary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* User List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Manage Access</h3>
              <p className="text-sm text-gray-600">Control what each employee can access</p>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : (
                users.map(u => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-100 ${
                      selectedUser?.id === u.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Permission Editor */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              {selectedUser && (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">{selectedUser.full_name}</h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                    {getRoleDisplayName(selectedUser.role)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedUser ? (
                canEditUserPermissions(user, selectedUser) ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h5 className="font-semibold text-blue-900 mb-2">Module Access Control</h5>
                      <p className="text-sm text-blue-700">
                        Toggle access to different parts of the application. Changes take effect immediately after saving.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAllModules().map(module => (
                        <div key={module.key} className="bg-gray-50 rounded-lg p-4">
                          <label className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedUser.permissions?.[module.key] || false}
                              onChange={(e) => handlePermissionChange(module.key, e.target.checked)}
                              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              disabled={selectedUser.role === 'owner'}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {module.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {module.description}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {selectedUser.role === 'owner' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-700">
                          <strong>Note:</strong> Owner permissions cannot be modified. Owners always have full access to all modules.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">
                        You don't have permission to edit this user's access.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  Select a user to manage their access permissions
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {alert.show && (
                <div className={`mb-4 p-3 rounded-md ${
                  alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {alert.message}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="btn-secondary" disabled={saving}>
                  Close
                </button>
                {selectedUser && canEditUserPermissions(user, selectedUser) && (
                  <button
                    onClick={savePermissions}
                    disabled={saving || selectedUser.role === 'owner'}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePermissionManager;
