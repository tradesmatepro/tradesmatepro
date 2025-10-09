import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  fetchCompanyUsersWithPermissions, 
  updateUserPermissions,
  getPermissionCategories 
} from '../services/permissionService';
import { canManagePermissions, getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';

const PermissionManager = ({ isOpen, onClose, targetUserId }) => {
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
      const companyUsers = await fetchCompanyUsersWithPermissions(user.company_id);
      setUsers(companyUsers);
      
      if (companyUsers.length > 0 && !selectedUser) {
        setSelectedUser(companyUsers[0]);
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

  const handlePermissionChange = (permissionKey, value) => {
    if (!selectedUser) return;

    setSelectedUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: value
      }
    }));
  };

  const savePermissions = async () => {
    if (!selectedUser || !canManage) return;

    setSaving(true);
    try {
      const success = await updateUserPermissions(
        selectedUser.id,
        selectedUser.company_id || user.company_id,
        selectedUser.permissions,
        user.id
      );

      if (success) {
        showAlert('success', 'Permissions updated successfully');
        await loadUsers(); // Reload to get fresh data
      } else {
        showAlert('error', 'Failed to update permissions');
      }
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
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* User List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Manage Permissions</h3>
              <p className="text-sm text-gray-600">Select a user to edit their permissions</p>
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

            <div className="flex-1 overflow-y-auto p-4">
              {selectedUser ? (
                <div className="space-y-6">
                  {getPermissionCategories().map(category => (
                    <div key={category.name} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">{category.name}</h5>
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.permissions.map(permission => (
                          <label key={permission.key} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedUser.permissions?.[permission.key] || false}
                              onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {permission.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  Select a user to manage their permissions
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
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Close
                </button>
                {selectedUser && (
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Permissions'}
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

export default PermissionManager;
