import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyService } from '../services/CompanyService';

const CreateCompany = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerRole: 'owner', // Default to owner
    tempPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, tempPassword: password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      setLoading(false);
      return;
    }

    if (!formData.ownerFirstName.trim() || !formData.ownerLastName.trim()) {
      setError('Owner first and last name are required');
      setLoading(false);
      return;
    }

    if (!formData.ownerEmail.trim()) {
      setError('Owner email is required');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.tempPassword.trim()) {
      setError('Temporary password is required');
      setLoading(false);
      return;
    }

    if (formData.tempPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.tempPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Starting company creation with data:', formData);
      
      const result = await CompanyService.createCompanyWithOwner(formData);
      
      console.log('✅ Company creation completed:', result);
      
      setSuccess({
        company: result.company,
        profile: result.profile,
        email: formData.ownerEmail,
        password: formData.tempPassword
      });

      // Reset form
      setFormData({
        companyName: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerRole: 'OWNER',
        tempPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('❌ Company creation failed:', error);
      setError(error.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                Company Created Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>{success.company.name}</strong> has been set up with an owner user account.</p>
              </div>
              
              <div className="mt-4 bg-white border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Owner Login Details:</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Name:</strong> {success.profile.full_name}</p>
                  <p><strong>Email:</strong> {success.email}</p>
                  <p><strong>Temporary Password:</strong> <code className="bg-green-100 px-2 py-1 rounded">{success.password}</code></p>
                  <p><strong>Role:</strong> {success.profile.role}</p>
                  <p><strong>Login URL:</strong> <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">http://localhost:3000</a></p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setSuccess(null)}
                  className="bg-green-100 px-4 py-2 rounded-md text-sm font-medium text-green-800 hover:bg-green-200"
                >
                  Create Another Company
                </button>
                <button
                  onClick={() => navigate('/companies')}
                  className="bg-white px-4 py-2 rounded-md text-sm font-medium text-green-800 border border-green-200 hover:bg-green-50"
                >
                  View All Companies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Company</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new customer company with their first owner account
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Company Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic details about the customer company
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Smith Plumbing LLC"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Owner Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Details for the company owner account
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="ownerFirstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="ownerFirstName"
                    id="ownerFirstName"
                    required
                    value={formData.ownerFirstName}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="ownerLastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="ownerLastName"
                    id="ownerLastName"
                    required
                    value={formData.ownerLastName}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    id="ownerEmail"
                    required
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    placeholder="(541) 705-0524"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    US phone numbers will be automatically formatted
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="ownerRole" className="block text-sm font-medium text-gray-700">
                    User Role *
                  </label>
                  <select
                    name="ownerRole"
                    id="ownerRole"
                    required
                    value={formData.ownerRole}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="lead_technician">Lead Technician</option>
                    <option value="technician">Technician</option>
                    <option value="apprentice">Apprentice</option>
                    <option value="helper">Helper</option>
                    <option value="accountant">Accountant</option>
                    <option value="sales_rep">Sales Rep</option>
                    <option value="customer_service">Customer Service</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose the appropriate role for this user. Owner has full access, while other roles have specific permissions based on their responsibilities.
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="tempPassword" className="block text-sm font-medium text-gray-700">
                    Temporary Password *
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="password"
                      name="tempPassword"
                      id="tempPassword"
                      required
                      value={formData.tempPassword}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Enter password (min 6 chars)"
                    />
                    <button
                      type="button"
                      onClick={generateTempPassword}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Confirm password"
                  />
                </div>

                <div className="col-span-6">
                  <p className="text-sm text-gray-500">
                    The owner will use this password for their first login and should change it immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/companies')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Company...
              </>
            ) : (
              'Create Company'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompany;
