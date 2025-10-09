import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const EditRequestModal = ({ request, onSubmit, onClose }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trade_tags: [],
    pricing_type: 'negotiable',
    budget: '',
    hourly_rate_limit: '',
    request_type: 'standard',
    service_mode: 'onsite',
    max_responses: 5,
    unlimited_responses: false,
    requires_inspection: false,
    start_time: '',
    end_time: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Populate form with existing request data
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        trade_tags: request.trade_tags || [],
        pricing_type: request.pricing_type || 'negotiable',
        budget: request.budget ? request.budget.toString() : '',
        hourly_rate_limit: request.hourly_rate_limit ? request.hourly_rate_limit.toString() : '',
        request_type: request.request_type || 'standard',
        service_mode: request.service_mode || 'onsite',
        max_responses: request.max_responses || 5,
        unlimited_responses: !request.max_responses,
        requires_inspection: request.requires_inspection || false,
        start_time: request.start_time ? new Date(request.start_time).toISOString().slice(0, 16) : '',
        end_time: request.end_time ? new Date(request.end_time).toISOString().slice(0, 16) : ''
      });
    }
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    // Validate pricing fields
    if (formData.pricing_type === 'flat_rate' && (!formData.budget || parseFloat(formData.budget) <= 0)) {
      alert('Please enter a valid budget amount');
      return;
    }

    if (formData.pricing_type === 'hourly_rate' && (!formData.hourly_rate_limit || parseFloat(formData.hourly_rate_limit) <= 0)) {
      alert('Please enter a valid hourly rate limit');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        pricing_type: formData.pricing_type,
        budget: formData.pricing_type === 'flat_rate' ? parseFloat(formData.budget) : null,
        hourly_rate_limit: formData.pricing_type === 'hourly_rate' ? parseFloat(formData.hourly_rate_limit) : null,
        request_type: formData.request_type,
        service_mode: formData.service_mode,
        max_responses: formData.unlimited_responses ? null : formData.max_responses,
        requires_inspection: formData.requires_inspection,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        updated_at: new Date().toISOString()
      };

      const response = await supaFetch(`marketplace_requests?id=eq.${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }, user.company_id);

      if (response.ok) {
        console.log('Request updated successfully');
        onSubmit();
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${request.title}"? This action cannot be undone and will remove all associated responses.`)) {
      return;
    }

    setDeleting(true);

    try {
      // Delete the marketplace request
      const response = await supaFetch(`marketplace_requests?id=eq.${request.id}`, {
        method: 'DELETE'
      }, user.company_id);

      if (response.ok) {
        console.log('Request deleted successfully');
        onSubmit(); // Refresh the parent component
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        throw new Error('Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Request
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Brief description of the work needed"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Detailed description of the work, materials, timeline, etc."
              required
            />
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pricing Type
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="pricing-negotiable"
                  name="pricing-type"
                  type="radio"
                  value="negotiable"
                  checked={formData.pricing_type === 'negotiable'}
                  onChange={(e) => handleInputChange('pricing_type', e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="pricing-negotiable" className="ml-3 block text-sm font-medium text-gray-700">
                  Negotiable - Let contractors propose pricing
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="pricing-flat"
                  name="pricing-type"
                  type="radio"
                  value="flat_rate"
                  checked={formData.pricing_type === 'flat_rate'}
                  onChange={(e) => handleInputChange('pricing_type', e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="pricing-flat" className="ml-3 block text-sm font-medium text-gray-700">
                  Fixed Budget
                </label>
              </div>

              {formData.pricing_type === 'flat_rate' && (
                <div className="ml-7">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-32 shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="pricing-hourly"
                  name="pricing-type"
                  type="radio"
                  value="hourly_rate"
                  checked={formData.pricing_type === 'hourly_rate'}
                  onChange={(e) => handleInputChange('pricing_type', e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="pricing-hourly" className="ml-3 block text-sm font-medium text-gray-700">
                  Hourly Rate Limit
                </label>
              </div>

              {formData.pricing_type === 'hourly_rate' && (
                <div className="ml-7">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate_limit}
                    onChange={(e) => handleInputChange('hourly_rate_limit', e.target.value)}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-32 shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Request Type
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="type-standard"
                  name="request-type"
                  type="radio"
                  value="standard"
                  checked={formData.request_type === 'standard'}
                  onChange={(e) => handleInputChange('request_type', e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="type-standard" className="ml-3 block text-sm font-medium text-gray-700">
                  Standard Request
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="type-emergency"
                  name="request-type"
                  type="radio"
                  value="emergency"
                  checked={formData.request_type === 'emergency'}
                  onChange={(e) => handleInputChange('request_type', e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="type-emergency" className="ml-3 block text-sm font-medium text-gray-700">
                  Emergency Request
                  <span className="text-xs text-gray-500 block">Higher priority, may include emergency fees</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Delete Button - Left Side */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete Request'}
            </button>

            {/* Cancel & Update Buttons - Right Side */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequestModal;
