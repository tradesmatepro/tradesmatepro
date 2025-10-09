/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from 'react';
import { CustomerContext } from '../../contexts/CustomerContext';
import TagSelector from './TagSelector';
import { createMarketplaceRequest, getCompaniesByTags } from '../../services/MarketplaceService';
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

const RequestServiceModal = ({ isOpen, onClose, onSuccess }) => {
  const { customer, supabase } = useContext(CustomerContext);
  const [loading, setLoading] = useState(false);
  const [serviceTags, setServiceTags] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_mode: 'ONSITE',
    request_type: 'STANDARD',
    pricing_model: 'NEGOTIABLE',
    budget: '',
    preferred_date: '',
    preferred_time: '',
    location: '',
    images: []
  });

  const [matchingContractors, setMatchingContractors] = useState([]);
  const [loadingContractors, setLoadingContractors] = useState(false);

  // Load matching contractors when tags change
  useEffect(() => {
    if (serviceTags.length > 0) {
      loadMatchingContractors();
    } else {
      setMatchingContractors([]);
    }
  }, [serviceTags]);

  const loadMatchingContractors = async () => {
    try {
      setLoadingContractors(true);
      const tagNames = serviceTags.map(tag => tag.name);
      const companies = await getCompaniesByTags(tagNames);
      setMatchingContractors(companies || []);
    } catch (error) {
      console.error('Error loading matching contractors:', error);
      setMatchingContractors([]);
    } finally {
      setLoadingContractors(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customer?.customer_id) {
      alert('Please log in to submit a request');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (serviceTags.length === 0) {
      alert('Please select at least one service tag');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        customer_id: customer.customer_id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        service_mode: formData.service_mode,
        request_type: formData.request_type,
        pricing_model: formData.pricing_model,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        preferred_date: formData.preferred_date || null,
        preferred_time: formData.preferred_time || null,
        location: formData.location.trim() || null,
        tags: serviceTags.map(tag => tag.name)
      };

      await createMarketplaceRequest(requestData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        service_mode: 'ONSITE',
        request_type: 'STANDARD',
        pricing_model: 'NEGOTIABLE',
        budget: '',
        preferred_date: '',
        preferred_time: '',
        location: '',
        images: []
      });
      setServiceTags([]);
      
      // Call success callback and close modal
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Service Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kitchen faucet repair"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what you need help with..."
              required
            />
          </div>

          {/* Service Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Tags *
            </label>
            <TagSelector
              selectedTags={serviceTags}
              onTagsChange={setServiceTags}
              placeholder="Select or create service tags..."
            />
          </div>

          {/* Service Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {serviceModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <label
                    key={mode.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.service_mode === mode.value
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service_mode"
                      value={mode.value}
                      checked={formData.service_mode === mode.value}
                      onChange={(e) => handleInputChange('service_mode', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mode.label}</div>
                        <div className="text-sm text-gray-500">{mode.description}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requestTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.request_type === type.value
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="request_type"
                    value={type.value}
                    checked={formData.request_type === type.value}
                    onChange={(e) => handleInputChange('request_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    {type.icon && <type.icon className="w-5 h-5 text-gray-400 mr-3" />}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pricing Preference
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pricingPreferences.map((pricing) => (
                <label
                  key={pricing.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.pricing_model === pricing.value
                      ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pricing_model"
                    value={pricing.value}
                    checked={formData.pricing_model === pricing.value}
                    onChange={(e) => handleInputChange('pricing_model', e.target.value)}
                    className="sr-only"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pricing.label}</div>
                    <div className="text-sm text-gray-500">{pricing.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          {formData.pricing_model === 'FLAT' && (
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Location */}
          {formData.service_mode !== 'REMOTE' && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Service Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service address"
                />
              </div>
            </div>
          )}

          {/* Preferred Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                id="preferred_date"
                value={formData.preferred_date}
                onChange={(e) => handleInputChange('preferred_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="preferred_time" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <input
                type="time"
                id="preferred_time"
                value={formData.preferred_time}
                onChange={(e) => handleInputChange('preferred_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestServiceModal;
