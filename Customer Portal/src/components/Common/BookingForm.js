import React, { useState, useEffect } from 'react';
import { XMarkIcon, BoltIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCustomer } from '../../contexts/CustomerContext';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../utils/env';
import TagSelector from './TagSelector';

// Create authenticated supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BookingForm = ({ 
  mode = 'customer', // 'customer' or 'contractor'
  onSubmit, 
  onClose,
  initialData = {}
}) => {
  const { customer } = useCustomer();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selected_tags: [], // Array of tag objects with id and name
    pricing_preference: 'NEGOTIABLE', // FLAT, HOURLY, NEGOTIABLE
    flat_rate: '',
    hourly_rate: '',
    request_type: 'STANDARD',
    service_mode: 'ONSITE', // ONSITE, REMOTE, HYBRID
    max_responses: 5,
    unlimited_responses: false,
    requires_inspection: false,
    preferred_time_option: 'specific', // Default to "Pick Dates"
    start_time: '',
    end_time: '',
    auto_booking: false,
    // Customer info fields (only for customer mode)
    customer_name: mode === 'contractor' ? '' : (customer?.name || ''),
    customer_email: mode === 'contractor' ? '' : (customer?.email || ''),
    customer_phone: mode === 'contractor' ? '' : (customer?.phone || ''),
    location_address: customer?.street_address || '',
    location_city: customer?.city || '',
    location_state: customer?.state || '',
    location_postal_code: customer?.zip_code || '',
    ...initialData
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

    if (formData.selected_tags.length === 0) {
      alert('Please select at least one service tag');
      return;
    }

    // Validate pricing fields
    if (formData.pricing_preference === 'FLAT' && (!formData.flat_rate || parseFloat(formData.flat_rate) <= 0)) {
      alert('Please enter a valid flat rate amount');
      return;
    }

    if (formData.pricing_preference === 'HOURLY' && (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0)) {
      alert('Please enter a valid hourly rate');
      return;
    }

    // Validate time preference
    if (formData.preferred_time_option === 'specific' && !formData.start_time) {
      alert('Please select a preferred start time when choosing "Pick Dates"');
      return;
    }

    // Validate customer info for customer mode
    if (mode === 'customer') {
      if (!formData.customer_name.trim()) {
        alert('Please enter your name');
        return;
      }
      if (!formData.customer_email.trim()) {
        alert('Please enter your email');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Prepare request data - using ACTUAL schema from latest.json
      const requestData = {
        customer_id: customer?.customer_id || customer?.id || null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        request_type: (formData.request_type || 'STANDARD').toUpperCase(), // request_type_enum
        service_mode: (formData.service_mode || 'onsite').toLowerCase(), // text field
        pricing_type: 'negotiable', // text field, use default
        pricing_preference: (formData.pricing_preference || 'NEGOTIABLE').toUpperCase(), // pricing_preference_enum
        budget: formData.pricing_preference === 'FLAT' ? parseFloat(formData.flat_rate) : null,
        flat_rate: formData.pricing_preference === 'FLAT' ? parseFloat(formData.flat_rate) : null,
        hourly_rate: formData.pricing_preference === 'HOURLY' ? parseFloat(formData.hourly_rate) : null,
        hourly_rate_limit: formData.pricing_preference === 'HOURLY' ? parseFloat(formData.hourly_rate) : null,
        max_responses: formData.unlimited_responses ? null : formData.max_responses,
        requires_inspection: formData.requires_inspection || false,
        preferred_time_option: formData.preferred_time_option || 'anytime', // MISSING FIELD - this is why smart calendar wasn't working!
        start_time: formData.preferred_time_option === 'specific' ? (formData.start_time || null) : null,
        end_time: formData.preferred_time_option === 'specific' ? (formData.end_time || null) : null
        // Note: Using ACTUAL schema from latest.json - both pricing_type AND pricing_preference exist
        // Note: customer_id from Customer Portal context
      };

      // Create the marketplace request using direct Supabase insert
      const { data: newRequest, error: requestError } = await supabase
        .from('marketplace_requests')
        .insert([requestData])
        .select()
        .single();

      if (requestError) {
        console.error('Request creation error:', requestError);
        throw new Error(requestError.message || 'Failed to create request');
      }

      console.log('Request created successfully:', newRequest);
      const newRequestId = newRequest.id;

      // Link the selected tags to the request
      if (formData.selected_tags.length > 0) {
        const tagLinks = formData.selected_tags.map(tag => ({
          request_id: newRequestId,
          tag_id: tag.id
        }));

        const { error: tagError } = await supabase
          .from('request_tags')
          .insert(tagLinks);

        if (tagError) {
          console.error('Tag linking error:', tagError);
          // Don't throw here as the request was created successfully
        }
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(newRequest);
      }

      // Close the form
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('BookingForm submission error:', error);
      alert(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'contractor' ? 'Request Service from Another Provider' : 'Request Service'}
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Service Details
          </h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Service Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Brief description of what you need"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Provide detailed information about the service you need..."
              required
            />
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Request Type *
            </label>
            <div className="space-y-3">
              {[
                { value: 'STANDARD', label: 'Standard Request', description: 'Normal priority service request' },
                { value: 'EMERGENCY', label: 'Emergency Request', description: 'Urgent service needed immediately' }
              ].map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="request_type"
                    value={option.value}
                    checked={formData.request_type === option.value}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Service Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Categories *
            </label>
            <TagSelector
              selectedTags={formData.selected_tags}
              onTagsChange={(tags) => setFormData(prev => ({ ...prev, selected_tags: tags }))}
              placeholder="Select service categories..."
            />
          </div>
        </div>

        {/* Customer Information - Only show for customer mode */}
        {mode === 'customer' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        )}

        {/* Timing and Workflow */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <ClockIcon className="h-5 w-5 inline mr-2" />
            Timing & Workflow
          </h4>

          {/* Time Preference Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              When would you like this service?
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-4">
              {[
                { value: 'anytime', label: 'Anytime', icon: '📅' },
                { value: 'soonest', label: 'Soonest Available', icon: '⚡' },
                { value: 'this_week', label: 'This Week', icon: '📆' },
                { value: 'weekend_only', label: 'Weekend Only', icon: '🏖️' },
                { value: 'specific', label: 'Pick Dates', icon: '🎯' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, preferred_time_option: option.value }))}
                  className={`p-3 text-center border rounded-lg transition-all ${
                    formData.preferred_time_option === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Specific Date/Time Picker - Only show when "Pick Dates" is selected */}
          {formData.preferred_time_option === 'specific' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                  Preferred Start *
                </label>
                <input
                  type="datetime-local"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required={formData.preferred_time_option === 'specific'}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                  Preferred End (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          {/* Time Preference Descriptions */}
          {formData.preferred_time_option && formData.preferred_time_option !== 'specific' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                {formData.preferred_time_option === 'anytime' && (
                  <p>📅 <strong>Anytime:</strong> Contractors can schedule during their normal business hours at their convenience.</p>
                )}
                {formData.preferred_time_option === 'soonest' && (
                  <p>⚡ <strong>Soonest Available:</strong> Contractors will offer their earliest available time slot.</p>
                )}
                {formData.preferred_time_option === 'this_week' && (
                  <p>📆 <strong>This Week:</strong> Service will be scheduled within the next 7 days.</p>
                )}
                {formData.preferred_time_option === 'weekend_only' && (
                  <p>🏖️ <strong>Weekend Only:</strong> Service will be scheduled on Saturday or Sunday only.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Preferences */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <CurrencyDollarIcon className="h-5 w-5 inline mr-2" />
            Pricing Preferences
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to handle pricing?
            </label>
            <div className="space-y-3">
              {[
                { value: 'NEGOTIABLE', label: 'Negotiable', description: 'Open to contractor proposals' },
                { value: 'FLAT', label: 'Flat Rate', description: 'Fixed price for the entire job' },
                { value: 'HOURLY', label: 'Hourly Rate', description: 'Pay by the hour worked' }
              ].map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="pricing_preference"
                    value={option.value}
                    checked={formData.pricing_preference === option.value}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Flat Rate Input */}
          {formData.pricing_preference === 'FLAT' && (
            <div>
              <label htmlFor="flat_rate" className="block text-sm font-medium text-gray-700">
                Maximum Budget *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="flat_rate"
                  name="flat_rate"
                  value={formData.flat_rate}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Hourly Rate Input */}
          {formData.pricing_preference === 'HOURLY' && (
            <div>
              <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">
                Maximum Hourly Rate *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="hourly_rate"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">/hr</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Service Location */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            <MapPinIcon className="h-5 w-5 inline mr-2" />
            Service Location
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="location_address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                id="location_address"
                name="location_address"
                value={formData.location_address}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label htmlFor="location_city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="location_city"
                name="location_city"
                value={formData.location_city}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="location_state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="location_state"
                name="location_state"
                value={formData.location_state}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="CA"
              />
            </div>

            <div>
              <label htmlFor="location_postal_code" className="block text-sm font-medium text-gray-700">
                Zip Code *
              </label>
              <input
                type="text"
                id="location_postal_code"
                name="location_postal_code"
                value={formData.location_postal_code}
                onChange={handleChange}
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
