/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from 'react';
import { CustomerContext } from '../contexts/CustomerContext';
import TagSelector from '../components/Common/TagSelector';
import { createMarketplaceRequest, getCompaniesByTags } from '../services/MarketplaceService';
import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  TagIcon,
  BoltIcon,
  ComputerDesktopIcon,
  HomeIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Define arrays outside component to avoid re-creation on each render
const pricingPreferences = [
  { value: 'FLAT', label: 'Flat Rate', description: 'Fixed price for the job' },
  { value: 'HOURLY', label: 'Hourly Rate', description: 'Pay by the hour' },
  { value: 'NEGOTIABLE', label: 'Negotiable', description: 'Open to offers' }
];

const serviceModes = [
  { value: 'ONSITE', label: 'On-site', description: 'Service at my location', icon: HomeIcon },
  { value: 'REMOTE', label: 'Remote', description: 'Service can be done remotely', icon: ComputerDesktopIcon },
  { value: 'HYBRID', label: 'Hybrid', description: 'Combination of on-site and remote', icon: BoltIcon }
];

const requestTypes = [
  { value: 'STANDARD', label: 'Standard', description: 'Normal priority service' },
  { value: 'EMERGENCY', label: 'Emergency', description: 'Urgent service needed', icon: ExclamationTriangleIcon }
];

const RequestService = () => {
  const { customer, supabase } = useContext(CustomerContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceTags, setServiceTags] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selected_tags: [], // Array of tag objects with id and name
    request_type: 'STANDARD', // STANDARD or EMERGENCY
    service_mode: 'ONSITE', // ONSITE, REMOTE, HYBRID
    pricing_preference: 'NEGOTIABLE', // FLAT, HOURLY, NEGOTIABLE
    budget: '',
    flat_rate: '',
    hourly_rate: '',
    start_time: '',
    end_time: '',
    max_responses: 5,
    unlimited_responses: false,
    requires_inspection: false,
    auto_booking: false,
    location_address: customer?.street_address || '',
    location_city: customer?.city || '',
    location_state: customer?.state || '',
    location_postal_code: customer?.zip_code || ''
  });

  const [photos, setPhotos] = useState([]);
  const [matchingContractors, setMatchingContractors] = useState([]);
  const [loadingContractors, setLoadingContractors] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (formData.selected_tags.length === 0) {
      showToast('error', 'Please select at least one service tag');
      return;
    }

    if (!formData.title.trim()) {
      showToast('error', 'Please enter a service title');
      return;
    }

    if (!formData.description.trim()) {
      showToast('error', 'Please enter a service description');
      return;
    }

    // Validate pricing fields
    if (formData.pricing_preference === 'FLAT' && (!formData.flat_rate || parseFloat(formData.flat_rate) <= 0)) {
      showToast('error', 'Please enter a valid flat rate amount');
      return;
    }

    if (formData.pricing_preference === 'HOURLY' && (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0)) {
      showToast('error', 'Please enter a valid hourly rate');
      return;
    }

    setLoading(true);

    try {
      console.log('Customer Portal - Submitting marketplace request with tags:', formData.selected_tags);

      // Prepare request data (align with DB columns)
      const requestData = {
        customer_id: customer.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        request_type: (formData.request_type || '').toUpperCase(),
        service_mode: formData.service_mode,
        pricing_preference: formData.pricing_preference,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        flat_rate: formData.pricing_preference === 'FLAT' ? parseFloat(formData.flat_rate) : null,
        hourly_rate: formData.pricing_preference === 'HOURLY' ? parseFloat(formData.hourly_rate) : null,
        max_responses: formData.unlimited_responses ? null : formData.max_responses,
        requires_inspection: formData.requires_inspection,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        status: 'available',
        // location_* are not columns on marketplace_requests; omit to avoid 400s
      };

      // Extract tag names from selected tags
      const tagNames = formData.selected_tags.map(tag => tag.name);

      // Create marketplace request with tags using the service
      const request = await createMarketplaceRequest(requestData, tagNames);

      console.log('Marketplace request created successfully:', request);
      showToast('success', 'Service request submitted successfully!');

      // Redirect to My Requests after success
      setTimeout(() => {
        window.location.href = '/my-requests';
      }, 1500);

    } catch (error) {
      console.error('Failed to submit service request - Full error JSON:', JSON.stringify(error, null, 2));

      // Log to error_logs for debugging
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            context: 'Customer Portal - Create Marketplace Request',
            formData: formData
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      showToast('error', `Failed to submit request: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Toast notification function
  const showToast = (type, message) => {
    // Simple toast implementation - you can replace with a proper toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 4000);
  };

  const handleTagsChange = (newTags) => {
    setFormData({
      ...formData,
      selected_tags: newTags
    });

    // Load matching contractors when tags change
    if (newTags.length > 0) {
      loadMatchingContractors(newTags.map(tag => tag.name));
    } else {
      setMatchingContractors([]);
    }
  };

  const loadMatchingContractors = async (tagNames) => {
    try {
      setLoadingContractors(true);
      const contractors = await getCompaniesByTags(tagNames, 5);
      setMatchingContractors(contractors);
    } catch (error) {
      console.error('Error loading matching contractors:', error);
      setMatchingContractors([]);
    } finally {
      setLoadingContractors(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => [...prev, {
          file,
          url: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your service request has been submitted successfully. Local contractors will be notified and you'll receive responses soon.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Request Service</h1>
            <p className="text-gray-600 mt-1">
              Tell us what you need help with and we'll connect you with qualified contractors in your area.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Fix leaky kitchen faucet"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide more details about what needs to be done..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Service Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <TagIcon className="w-4 h-4 inline mr-1" />
                Service Tags *
              </label>

              <TagSelector
                selectedTags={formData.selected_tags}
                onTagsChange={handleTagsChange}
                placeholder="Search for services like plumbing, web design, fishing charter..."
              />

              {formData.selected_tags.length === 0 && (
                <p className="text-sm text-red-600 mt-1">Please select at least one service tag</p>
              )}
            </div>

            {/* Matching Contractors Preview */}
            {formData.selected_tags.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">
                    Contractors Available for Your Services
                  </h3>
                </div>

                {loadingContractors ? (
                  <div className="flex items-center text-sm text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Finding contractors...
                  </div>
                ) : matchingContractors.length > 0 ? (
                  <div className="space-y-2">
                    {matchingContractors.slice(0, 3).map((contractor) => (
                      <div key={contractor.id} className="flex items-center justify-between bg-white rounded p-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            {contractor.logo_url ? (
                              <img src={contractor.logo_url} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contractor.name}</div>
                            <div className="flex items-center text-xs text-gray-500">
                              <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                              {contractor.rating ? `${contractor.rating}/5` : 'New'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {matchingContractors.length > 3 && (
                      <p className="text-xs text-blue-600">
                        +{matchingContractors.length - 3} more contractors available
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">
                    No contractors found for these services. Your request will still be posted for all contractors to see.
                  </p>
                )}
              </div>
            )}

            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                Request Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requestTypes.map((type) => (
                  <label key={type.value} className="relative">
                    <input
                      type="radio"
                      name="request_type"
                      value={type.value}
                      checked={formData.request_type === type.value}
                      onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.request_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900 flex items-center">
                        {type.icon && <type.icon className="w-4 h-4 mr-1" />}
                        {type.label}
                      </div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Service Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {serviceModes.map((mode) => (
                  <label key={mode.value} className="relative">
                    <input
                      type="radio"
                      name="service_mode"
                      value={mode.value}
                      checked={formData.service_mode === mode.value}
                      onChange={(e) => setFormData({ ...formData, service_mode: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.service_mode === mode.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900 flex items-center">
                        <mode.icon className="w-4 h-4 mr-1" />
                        {mode.label}
                      </div>
                      <div className="text-sm text-gray-600">{mode.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location - Only show for onsite/hybrid services */}
            {formData.service_mode !== 'REMOTE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Service Location
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    value={formData.location_address}
                    onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={formData.location_city}
                      onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      placeholder="City"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.location_state}
                      onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                      placeholder="State"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.location_postal_code}
                      onChange={(e) => setFormData({ ...formData, location_postal_code: e.target.value })}
                      placeholder="ZIP Code"
                      required={formData.service_mode !== 'REMOTE'}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                Pricing Preference
              </label>
              <div className="space-y-3">
                {pricingPreferences.map((type) => (
                  <label key={type.value} className="relative">
                    <input
                      type="radio"
                      name="pricing_preference"
                      value={type.value}
                      checked={formData.pricing_preference === type.value}
                      onChange={(e) => setFormData({ ...formData, pricing_preference: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.pricing_preference === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Flat rate input */}
              {formData.pricing_preference === 'FLAT' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flat Rate Amount
                  </label>
                  <input
                    type="number"
                    value={formData.flat_rate}
                    onChange={(e) => setFormData({ ...formData, flat_rate: e.target.value })}
                    placeholder="Enter flat rate amount"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Hourly rate input */}
              {formData.pricing_preference === 'HOURLY' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Hourly Rate
                  </label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    placeholder="Max rate per hour"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                Budget (Optional)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Enter your budget for this service"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps contractors provide more accurate quotes
              </p>
            </div>

            {/* Preferred Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Preferred Schedule (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Response Limits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Response Preferences
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.unlimited_responses}
                    onChange={(e) => setFormData({
                      ...formData,
                      unlimited_responses: e.target.checked,
                      max_responses: e.target.checked ? null : 5
                    })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow unlimited responses</span>
                </label>

                {!formData.unlimited_responses && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Maximum responses: {formData.max_responses}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.max_responses}
                      onChange={(e) => setFormData({ ...formData, max_responses: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.requires_inspection}
                    onChange={(e) => setFormData({ ...formData, requires_inspection: e.target.checked })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Requires inspection first</span>
                    <p className="text-xs text-gray-500">Contractor must inspect before providing final quote</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.allow_auto_booking}
                    onChange={(e) => setFormData({ ...formData, allow_auto_booking: e.target.checked })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Allow auto-booking</span>
                    <p className="text-xs text-gray-500">Contractors can book automatically if they meet your criteria</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting Request...' : 'Submit Service Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestService;
