import React from 'react';
import {
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
  BoltIcon,
  TagIcon,
  ComputerDesktopIcon,
  HomeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RequestDetailsModal = ({ request, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getServiceModeIcon = (mode) => {
    switch (mode) {
      case 'onsite': return HomeIcon;
      case 'remote': return ComputerDesktopIcon;
      case 'hybrid': return CheckCircleIcon;
      default: return HomeIcon;
    }
  };

  const getServiceModeText = (mode) => {
    switch (mode) {
      case 'onsite': return 'On-site Service';
      case 'remote': return 'Remote Service';
      case 'hybrid': return 'Hybrid Service';
      default: return 'On-site Service';
    }
  };

  const getPricingTypeText = (type) => {
    switch (type) {
      // Handle enum values (UPPERCASE)
      case 'FLAT': return 'Flat Rate';
      case 'HOURLY': return 'Hourly Rate';
      case 'NEGOTIABLE': return 'Negotiable';
      // Handle legacy text values (lowercase with underscores) for backward compatibility
      case 'flat_rate': return 'Flat Rate';
      case 'hourly_rate': return 'Hourly Rate';
      case 'negotiable': return 'Negotiable';
      default: return 'Negotiable';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Request Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {request.title}
                </h2>
                
                <div className="flex items-center space-x-4 mb-4">
                  {request.request_type === 'emergency' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
                      <BoltIcon className="h-4 w-4 mr-1" />
                      ⚡ EMERGENCY
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <TagIcon className="h-4 w-4 mr-1" />
                    {request.trade_tag || 'General'}
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Posted {getTimeAgo(request.created_at)}
                  </span>
                </div>
              </div>
              
              {/* Pricing Display - Fixed to use pricing_preference enum */}
              <div className="text-right ml-6">
                <div className="text-sm text-gray-500 mb-1">
                  {getPricingTypeText(request.pricing_preference)}
                </div>
                {request.pricing_preference === 'FLAT' && (request.budget || request.flat_rate) && (
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(request.budget || request.flat_rate)}
                  </div>
                )}
                {request.pricing_preference === 'HOURLY' && (request.hourly_rate_limit || request.hourly_rate) && (
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(request.hourly_rate_limit || request.hourly_rate)}/hr
                  </div>
                )}
                {(request.pricing_preference === 'NEGOTIABLE' || !request.pricing_preference) && (
                  <div className="text-xl font-semibold text-blue-600">
                    Negotiable
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
            <p className="text-gray-700 leading-relaxed">
              {request.description || 'No description provided.'}
            </p>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Service Details</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  {(() => {
                    const IconComponent = getServiceModeIcon(request.service_mode);
                    return <IconComponent className="h-5 w-5 text-gray-400 mr-3" />;
                  })()}
                  <span className="text-gray-700">{getServiceModeText(request.service_mode)}</span>
                </div>
                
                {request.requires_inspection && (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Inspection Required</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Response Info</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Responses Received:</span>
                  <span className="font-medium">{request.response_count}/{request.max_responses}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(request.response_count / request.max_responses) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Location (if provided) */}
          {(request.location_address || request.location_city) && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Location</h4>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div className="text-gray-700">
                  {request.location_address && (
                    <div>{request.location_address}</div>
                  )}
                  {request.location_city && (
                    <div>
                      {request.location_city}
                      {request.location_state && `, ${request.location_state}`}
                      {request.location_postal_code && ` ${request.location_postal_code}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Info (if available) */}
          {request.customers && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Customer</h4>
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">{request.customers.name}</span>
              </div>
            </div>
          )}

          {/* Timing */}
          {request.start_time && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Preferred Timing</h4>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">
                  {new Date(request.start_time).toLocaleDateString()} 
                  {request.end_time && ` - ${new Date(request.end_time).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
