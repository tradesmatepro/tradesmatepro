import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getAvailableRoles } from '../utils/roleUtils';
import { getDefaultPermissions, EMPLOYEE_MODULES } from '../utils/employeePermissions';

const EmployeeInviteModal = ({ isOpen, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'technician'
  });

  // ✅ NEW: Use unified module structure with role-based defaults
  const [permissions, setPermissions] = useState(() =>
    getDefaultPermissions('technician')
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({ ...prev, role: newRole }));
    // ✅ Auto-update permissions based on role
    setPermissions(getDefaultPermissions(newRole));
  };

  const handlePermissionToggle = (moduleKey) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Pass form data to parent (permissions are for display only, not stored in DB)
      await onInvite({
        ...formData,
        permissions: permissions // For display/logging only - actual permissions are role-based
      });

      // Reset form
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        role: 'technician'
      });
      setPermissions(getDefaultPermissions('technician'));
      onClose();
    } catch (error) {
      console.error('Invite error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* ✅ NEW: Modern full-screen design matching Add Employee */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div>
              <h3 className="text-xl font-semibold">Invite Employee</h3>
              <p className="text-primary-100 text-sm">Send email invite with module access</p>
            </div>
            <button
              onClick={onClose}
              className="text-primary-100 hover:text-white p-2 rounded-full hover:bg-primary-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              {/* Top Half - Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="employee@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {getAvailableRoles().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Permissions will be automatically set based on role (you can customize them below)
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Half - Module Access */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Module Access
                </h4>

                {/* ✅ NEW: Organized by category */}
                <div className="space-y-6">
                  {Object.entries({
                    Core: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Core'),
                    Sales: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Sales'),
                    HR: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'HR'),
                    Finance: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Finance'),
                    Operations: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Operations'),
                    Admin: Object.values(EMPLOYEE_MODULES).filter(m => m.category === 'Admin')
                  }).map(([category, modules]) => (
                    <div key={category}>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">{category}</h5>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {modules.map(module => (
                          <div key={module.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissions[module.key] || false}
                                onChange={() => handlePermissionToggle(module.key)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{module.label}</div>
                              <div className="text-xs text-gray-500">{module.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg">
              <div className="text-sm text-gray-600">
                📧 Employee will receive an email invite to set their password
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending Invite...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInviteModal;
