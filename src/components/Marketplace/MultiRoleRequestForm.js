import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../../utils/supaFetch';
import { useUser } from '../../contexts/UserContext';

const MultiRoleRequestForm = ({ onRequestCreated, onCancel }) => {
  const { user } = useUser();
  const [serviceCategories, setServiceCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fulfillment_mode: 'match_any',
    pricing_type: 'negotiable',
    service_mode: 'onsite',
    budget: '',
    start_time: '',
    end_time: '',
    preferred_time_option: 'anytime',
    max_responses: 10,
    postal_code: '',
    location_address: '',
    location_city: '',
    location_state: ''
  });
  const [roles, setRoles] = useState([
    { category_id: '', quantity_required: 1 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadServiceCategories();
  }, []);

  const loadServiceCategories = async () => {
    try {
      const response = await supaFetch(
        'service_categories?select=id,name,description&order=name',
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const categories = await response.json();
        setServiceCategories(categories);
      } else {
        console.error('Failed to load service categories');
      }
    } catch (err) {
      console.error('Error loading service categories:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (index, field, value) => {
    setRoles(prev => prev.map((role, i) => 
      i === index ? { ...role, [field]: value } : role
    ));
  };

  const addRole = () => {
    setRoles(prev => [...prev, { category_id: '', quantity_required: 1 }]);
  };

  const removeRole = (index) => {
    if (roles.length > 1) {
      setRoles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (roles.some(role => !role.category_id)) {
        throw new Error('Please select a service category for all roles');
      }
      if (roles.some(role => !role.quantity_required || role.quantity_required < 1)) {
        throw new Error('Quantity required must be at least 1 for all roles');
      }

      // Prepare request data
      const requestData = {
        p_customer_id: user.id, // Assuming customer context
        p_company_id: user.company_id,
        p_title: formData.title.trim(),
        p_description: formData.description.trim(),
        p_fulfillment_mode: formData.fulfillment_mode,
        p_pricing_type: formData.pricing_type,
        p_service_mode: formData.service_mode,
        p_budget: formData.budget ? parseFloat(formData.budget) : null,
        p_start_time: formData.start_time || null,
        p_end_time: formData.end_time || null,
        p_max_responses: parseInt(formData.max_responses) || 10,
        p_roles: JSON.stringify(roles.map(role => ({
          category_id: role.category_id,
          quantity_required: parseInt(role.quantity_required)
        })))
      };

      // Add location fields if provided
      if (formData.postal_code) requestData.p_postal_code = formData.postal_code;
      if (formData.location_address) requestData.p_location_address = formData.location_address;
      if (formData.location_city) requestData.p_location_city = formData.location_city;
      if (formData.location_state) requestData.p_location_state = formData.location_state;
      if (formData.preferred_time_option) requestData.p_preferred_time_option = formData.preferred_time_option;

      console.log('🚀 Creating multi-role request:', requestData);

      // Try to use the RPC function from todo.md
      const response = await supaFetch(
        'rpc/create_request_with_roles',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        },
        user.company_id
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Multi-role request created successfully:', result);
        
        setSuccess(true);
        onRequestCreated?.(result);
        
        // Reset form after short delay
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            fulfillment_mode: 'match_any',
            pricing_type: 'negotiable',
            service_mode: 'onsite',
            budget: '',
            start_time: '',
            end_time: '',
            preferred_time_option: 'anytime',
            max_responses: 10,
            postal_code: '',
            location_address: '',
            location_city: '',
            location_state: ''
          });
          setRoles([{ category_id: '', quantity_required: 1 }]);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create request');
      }
    } catch (err) {
      console.error('❌ Error creating multi-role request:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Multi-Role Service Request</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">Multi-role request created successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kitchen Remodel - Need Multiple Trades"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the work needed in detail..."
              required
            />
          </div>
        </div>

        {/* Service Roles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Required Service Roles *
            </label>
            <button
              type="button"
              onClick={addRole}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Role
            </button>
          </div>

          <div className="space-y-3">
            {roles.map((role, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <select
                    value={role.category_id}
                    onChange={(e) => handleRoleChange(index, 'category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select service category...</option>
                    {serviceCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={role.quantity_required}
                    onChange={(e) => handleRoleChange(index, 'quantity_required', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty"
                    required
                  />
                </div>

                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fulfillment Mode *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="relative">
              <input
                type="radio"
                name="fulfillment_mode"
                value="match_any"
                checked={formData.fulfillment_mode === 'match_any'}
                onChange={(e) => handleInputChange('fulfillment_mode', e.target.value)}
                className="sr-only"
              />
              <div className={`p-3 rounded-lg border-2 cursor-pointer ${
                formData.fulfillment_mode === 'match_any'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="font-medium">🔀 Match Any Role</div>
                <div className="text-sm text-gray-600">Multiple companies can respond to different roles</div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                name="fulfillment_mode"
                value="match_all"
                checked={formData.fulfillment_mode === 'match_all'}
                onChange={(e) => handleInputChange('fulfillment_mode', e.target.value)}
                className="sr-only"
              />
              <div className={`p-3 rounded-lg border-2 cursor-pointer ${
                formData.fulfillment_mode === 'match_all'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="font-medium">🎯 Match All Roles</div>
                <div className="text-sm text-gray-600">One company must handle all roles</div>
              </div>
            </label>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Mode
            </label>
            <select
              value={formData.service_mode}
              onChange={(e) => handleInputChange('service_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="onsite">🏠 On-site</option>
              <option value="remote">💻 Remote</option>
              <option value="hybrid">🔄 Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pricing Type
            </label>
            <select
              value={formData.pricing_type}
              onChange={(e) => handleInputChange('pricing_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="negotiable">Negotiable</option>
              <option value="flat_rate">Flat Rate</option>
              <option value="hourly_rate">Hourly Rate</option>
            </select>
          </div>
        </div>

        {/* Budget and Timing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City, State
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.location_city}
                onChange={(e) => handleInputChange('location_city', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
              <input
                type="text"
                value={formData.location_state}
                onChange={(e) => handleInputChange('location_state', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ST"
                maxLength="2"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Multi-Role Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiRoleRequestForm;
