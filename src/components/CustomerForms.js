import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  XMarkIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

// Supabase configuration
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';



// SECURITY: Service key removed - use Edge Functions instead

// NOTE: SUPABASE_ANON_KEY_HARD is unused; using import from env above.

export const CustomerForm = ({
  isEdit = false,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useUser();
  const [technicians, setTechnicians] = useState([]);

  const loadTechnicians = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?company_id=eq.${user.company_id}&active=eq.true&select=id,full_name,role`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setTechnicians(users);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  }, [user?.company_id]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  return (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Contact Information
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Customer full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="customer@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.street_address}
                onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="CA"
                  maxLength="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="12345"
                  maxLength="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <select
                value={formData.preferred_contact_method}
                onChange={(e) => setFormData({...formData, preferred_contact_method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="text">Text Message</option>
              </select>
            </div>
          </div>

          {/* Preferences & Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-5 h-5" />
              Service Preferences
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Technician
              </label>
              <select
                value={formData.preferred_technician}
                onChange={(e) => setFormData({...formData, preferred_technician: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">No preference</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.full_name} ({tech.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Service Time
              </label>
              <select
                value={formData.preferred_service_time}
                onChange={(e) => setFormData({...formData, preferred_service_time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Rating (1-5)
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lifetime Revenue ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.lifetime_revenue}
                  onChange={(e) => setFormData({...formData, lifetime_revenue: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Jobs
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_jobs}
                  onChange={(e) => setFormData({...formData, total_jobs: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Service Date
              </label>
              <input
                type="date"
                value={formData.last_service_date}
                onChange={(e) => setFormData({...formData, last_service_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <textarea
            value={formData.special_instructions}
            onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Any special notes, access instructions, or customer preferences..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
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
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Customer' : 'Create Customer')}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export const CustomerDetailsModal = ({ customer, onClose }) => {
  const { user } = useUser();
  const [technicians, setTechnicians] = useState([]);

  const loadTechnicians = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?company_id=eq.${user.company_id}&active=eq.true&select=id,full_name,role`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setTechnicians(users);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  }, [user?.company_id]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  const getTechnicianName = (techId) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? `${tech.full_name} (${tech.role})` : 'Unknown Technician';
  };

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Customer Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
              <UserGroupIcon className="w-5 h-5" />
              Contact Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{customer.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Full Name</div>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{customer.email}</div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{customer.phone}</div>
                    <div className="text-sm text-gray-500">Phone</div>
                  </div>
                </div>
              )}

              {(customer.street_address || customer.city || customer.state || customer.zip_code) && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {customer.street_address && <div>{customer.street_address}</div>}
                      {(customer.city || customer.state || customer.zip_code) && (
                        <div>
                          {customer.city && customer.city}
                          {customer.city && customer.state && ', '}
                          {customer.state && customer.state}
                          {customer.zip_code && ` ${customer.zip_code}`}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Address</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-medium capitalize">{customer.preferred_contact_method || 'Phone'}</div>
                  <div className="text-sm text-gray-500">Preferred Contact</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
              <WrenchScrewdriverIcon className="w-5 h-5" />
              Service Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-medium">{customer.rating || 0}/5 Stars</div>
                  <div className="text-sm text-gray-500">Customer Rating</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">${(customer.lifetime_revenue || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Lifetime Revenue</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">{customer.total_jobs || 0} Jobs</div>
                  <div className="text-sm text-gray-500">Total Jobs Completed</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="font-medium">
                    {customer.last_service_date
                      ? new Date(customer.last_service_date).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-500">Last Service Date</div>
                </div>
              </div>

              {customer.preferred_technician && (
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="font-medium">{getTechnicianName(customer.preferred_technician)}</div>
                    <div className="text-sm text-gray-500">Preferred Technician</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium capitalize">{customer.preferred_service_time || 'Anytime'}</div>
                  <div className="text-sm text-gray-500">Preferred Service Time</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${
                    customer.status === 'active' ? 'bg-green-500' :
                    customer.status === 'inactive' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></div>
                </div>
                <div>
                  <div className="font-medium capitalize">{customer.status || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {customer.special_instructions && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3 border-b pb-2">
              Special Instructions
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{customer.special_instructions}</p>
            </div>
          </div>
        )}

        {/* Future Sections - Placeholders */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Service History</h5>
            <p className="text-sm text-blue-700">Job history will be displayed here when Jobs database is implemented</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">Communication Logs</h5>
            <p className="text-sm text-green-700">Call logs and notes will be displayed here</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
