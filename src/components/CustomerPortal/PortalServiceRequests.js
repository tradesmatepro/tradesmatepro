// Portal Service Requests - Marketplace-style service request system
import React, { useState, useEffect } from 'react';
import { useCustomerPortal } from '../../contexts/CustomerPortalContext';
import CustomerPortalService from '../../services/CustomerPortalService';
import {
  PlusCircleIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PortalServiceRequests = ({ onRefresh }) => {
  const { customer, sessionToken } = useCustomerPortal();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadServiceRequests();
  }, [customer]);

  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      // Load service requests using the portal service
      const requests = await CustomerPortalService.getServiceRequests(sessionToken);
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const CreateServiceRequestForm = () => {
    const [formData, setFormData] = useState({
      category: '',
      title: '',
      description: '',
      urgency: 'normal',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_code: '',
      preferred_date: '',
      preferred_time_start: '',
      preferred_time_end: '',
      budget_range: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const categories = [
      'Plumbing',
      'Electrical',
      'HVAC',
      'General Repair',
      'Appliance Repair',
      'Roofing',
      'Flooring',
      'Painting',
      'Landscaping',
      'Other'
    ];

    const urgencyLevels = [
      { value: 'low', label: 'Low - Within a week', color: 'text-green-600' },
      { value: 'normal', label: 'Normal - Within 2-3 days', color: 'text-blue-600' },
      { value: 'high', label: 'High - Within 24 hours', color: 'text-yellow-600' },
      { value: 'emergency', label: 'Emergency - ASAP', color: 'text-red-600' }
    ];

    const budgetRanges = [
      'Under $100',
      '$100 - $500',
      '$500 - $1,000',
      '$1,000 - $2,500',
      '$2,500 - $5,000',
      'Over $5,000',
      'Not sure'
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        await CustomerPortalService.createServiceRequest(formData, sessionToken);

        setShowCreateForm(false);
        loadServiceRequests();
        onRefresh();
      } catch (error) {
        console.error('Error creating service request:', error);
        alert('Failed to create service request. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Request Service</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
            <div className="space-y-6">
              {/* Category and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency *
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of what you need"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the problem or service needed in detail..."
                  required
                />
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Location</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.address_line_1}
                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Street address *"
                    required
                  />
                  <input
                    type="text"
                    value={formData.address_line_2}
                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apartment, suite, etc."
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City *"
                      required
                    />
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="State *"
                      required
                    />
                    <input
                      type="text"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ZIP Code *"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Timing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Timing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <input
                    type="time"
                    value={formData.preferred_time_start}
                    onChange={(e) => setFormData({ ...formData, preferred_time_start: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="time"
                    value={formData.preferred_time_end}
                    onChange={(e) => setFormData({ ...formData, preferred_time_end: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Leave blank if you're flexible with timing
                </p>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (Optional)
                </label>
                <select
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range...</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: { color: 'bg-green-100 text-green-800', label: 'Low Priority' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      high: { color: 'bg-yellow-100 text-yellow-800', label: 'High Priority' },
      emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency' }
    };
    
    const badge = badges[urgency] || badges.normal;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {urgency === 'emergency' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-blue-100 text-blue-800', label: 'Open' },
      claimed: { color: 'bg-yellow-100 text-yellow-800', label: 'Claimed' },
      scheduled: { color: 'bg-purple-100 text-purple-800', label: 'Scheduled' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    
    const badge = badges[status] || badges.open;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {status === 'completed' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Request Service
        </button>
      </div>

      {serviceRequests.length === 0 ? (
        <div className="text-center py-12">
          <PlusCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No service requests yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first service request to get started.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Request Service
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {serviceRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-600">{request.category}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(request.status)}
                  {getUrgencyBadge(request.urgency)}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{request.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {request.address_line_1}, {request.city}, {request.state} {request.zip_code}
                </div>
                {request.preferred_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Preferred: {new Date(request.preferred_date).toLocaleDateString()}
                    {request.preferred_time_start && ` at ${request.preferred_time_start}`}
                  </div>
                )}
                {request.budget_range && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Budget: {request.budget_range}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {new Date(request.requested_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                  {request.status !== 'cancelled' && request.status !== 'completed' && (
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Service Request Modal */}
      {showCreateForm && <CreateServiceRequestForm />}
    </div>
  );
};

export default PortalServiceRequests;
