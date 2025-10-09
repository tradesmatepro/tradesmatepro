// Customer Portal - Request Service Page
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RequestService = () => {
  const { user } = useUser();
  const [serviceTags, setServiceTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    service_tag_id: '',
    description: '',
    emergency: false,
    customer_budget: '',
    customer_location: '',
    customer_phone: '',
    customer_email: '',
    preferred_time: ''
  });

  useEffect(() => {
    loadServiceTags();
  }, []);

  const loadServiceTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/service-tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServiceTags(data);
      }
    } catch (error) {
      console.error('Error loading service tags:', error);
      setError('Failed to load service types. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.service_tag_id || !formData.description) {
      setError('Please select a service type and provide a description.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const requestData = {
        customer_id: user.id,
        service_tag_id: formData.service_tag_id,
        description: formData.description,
        emergency: formData.emergency,
        customer_budget: formData.customer_budget ? parseFloat(formData.customer_budget) : null,
        customer_location: formData.customer_location,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        preferred_time: formData.preferred_time
      };
      
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        setSuccess(true);
        setFormData({
          service_tag_id: '',
          description: '',
          emergency: false,
          customer_budget: '',
          customer_location: '',
          customer_phone: '',
          customer_email: '',
          preferred_time: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit service request');
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      setError('Failed to submit service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Request Submitted!</h2>
          <p className="text-green-800 mb-4">
            Your service request has been sent to qualified contractors in your area.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Contractors will review your request</li>
              <li>• You'll receive notifications when contractors respond</li>
              <li>• The first contractor to accept will be assigned to your job</li>
              <li>• You can view the status in your request history</li>
            </ul>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setSuccess(false)}
              className="inline-flex items-center px-4 py-2 border border-green-600 rounded-md text-sm font-medium text-green-600 bg-white hover:bg-green-50"
            >
              Submit Another Request
            </button>
            <button
              onClick={() => window.location.href = '/customer/requests'}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              View My Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <WrenchScrewdriverIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Request Service</h1>
        <p className="mt-2 text-gray-600">
          Tell us what you need and we'll connect you with qualified contractors
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Service Type */}
        <div>
          <label htmlFor="service_tag_id" className="block text-sm font-medium text-gray-700 mb-2">
            Service Type *
          </label>
          <select
            id="service_tag_id"
            name="service_tag_id"
            value={formData.service_tag_id}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select the type of service you need...</option>
            {serviceTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name} {tag.description && `- ${tag.description}`}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please describe the work you need done, any specific issues, and any relevant details..."
          />
        </div>

        {/* Emergency Toggle */}
        <div className="flex items-center">
          <input
            id="emergency"
            name="emergency"
            type="checkbox"
            checked={formData.emergency}
            onChange={handleInputChange}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="emergency" className="ml-2 block text-sm text-gray-900">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
              This is an emergency (requires immediate attention)
            </span>
          </label>
        </div>

        {formData.emergency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Emergency Service:</strong> Contractors may charge additional emergency fees for immediate response.
              You'll see any applicable fees before confirming the service.
            </p>
          </div>
        )}

        {/* Budget */}
        <div>
          <label htmlFor="customer_budget" className="block text-sm font-medium text-gray-700 mb-2">
            <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
            Budget (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="customer_budget"
              name="customer_budget"
              value={formData.customer_budget}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optional: Let contractors know your budget range
          </p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="customer_location" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            Service Location
          </label>
          <input
            type="text"
            id="customer_location"
            name="customer_location"
            value={formData.customer_location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Address or area where service is needed"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Preferred Time */}
        <div>
          <label htmlFor="preferred_time" className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Preferred Time (Optional)
          </label>
          <input
            type="text"
            id="preferred_time"
            name="preferred_time"
            value={formData.preferred_time}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Tomorrow morning, This weekend, ASAP"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Request...
              </>
            ) : (
              'Submit Service Request'
            )}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Submit your service request with details</li>
          <li>Qualified contractors in your area will be notified</li>
          <li>The first contractor to accept will be assigned to your job</li>
          <li>You'll receive updates and can communicate directly with your contractor</li>
        </ol>
      </div>
    </div>
  );
};

export default RequestService;
