import React, { useState } from 'react';
import {
  PlusCircleIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ServiceRequests = () => {
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    preferredDate: '',
    emergency: false
  });

  const serviceTypes = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'General Repair',
    'Maintenance',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit service request
    console.log('Service request:', formData);
    setShowNewRequestForm(false);
    setFormData({
      title: '',
      description: '',
      serviceType: '',
      preferredDate: '',
      emergency: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Service</h1>
          <p className="text-gray-600">Get help from your service provider</p>
        </div>

        <button
          onClick={() => setShowNewRequestForm(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          New Request
        </button>
      </div>

      {/* New Request Form */}
      {showNewRequestForm && (
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">New Service Request</h3>
            <button
              onClick={() => setShowNewRequestForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">What do you need help with? *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Brief description of service needed"
                required
                disabled
              />
            </div>

            <div>
              <label className="form-label">Service Type *</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled
              >
                <option value="">Select service type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="form-input"
                placeholder="Please describe what you need done"
                required
                disabled
              />
            </div>

            <div>
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                className="form-input"
                disabled
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="emergency"
                checked={formData.emergency}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled
              />
              <label className="ml-2 block text-sm text-gray-900">
                This is urgent/emergency
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewRequestForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary opacity-50 cursor-not-allowed"
                disabled
              >
                Submit Request (Coming Soon)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Requests */}
      <div className="card-modern">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <PlusCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-500 mb-4">
              Your service requests will appear here
            </p>
            <button
              onClick={() => setShowNewRequestForm(true)}
              className="btn-primary"
            >
              Create Request
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <PlusCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">1. Request</h4>
            <p className="text-sm text-gray-600">Tell us what you need</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">2. Schedule</h4>
            <p className="text-sm text-gray-600">Get a quote and book service</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">3. Complete</h4>
            <p className="text-sm text-gray-600">Service done, pay invoice</p>
          </div>
        </div>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-red-900">Emergency Services</h4>
            <p className="text-sm text-red-700 mt-1">
              For urgent repairs, please call your service provider directly at the number
              provided in your welcome email.
            </p>
          </div>
        </div>
      </div>

      {/* Future: SMB Network Marketplace */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <PlusCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Coming Soon: SMB Network</h4>
            <p className="text-sm text-blue-700 mt-1">
              Soon you'll be able to request services from any business in our network -
              like Angie's List, but better and built right into our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
