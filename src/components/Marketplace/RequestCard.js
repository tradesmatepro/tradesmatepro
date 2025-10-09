import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  BoltIcon,
  TagIcon,
  ComputerDesktopIcon,
  HomeIcon,
  CheckCircleIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ResponseModal from './ResponseModal';
import RequestDetailsModal from './RequestDetailsModal';
import AutoAcceptService from '../../services/AutoAcceptService';

const RequestCard = ({ request, userResponse, onSubmitResponse }) => {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [emergencyFees, setEmergencyFees] = useState([]);
  const [isAfterHours, setIsAfterHours] = useState(false);

  useEffect(() => {
    // Check if it's after hours
    setIsAfterHours(AutoAcceptService.isAfterHours());

    // Load emergency fees if this is an emergency request
    if ((request.request_type || '').toUpperCase() === 'EMERGENCY') {
      loadEmergencyFees();
    }
  }, [request]);

  const loadEmergencyFees = async () => {
    try {
      const companies = await AutoAcceptService.getEmergencyEligibleCompanies(request, 'system');
      setEmergencyFees(companies.filter(c => c.emergency_fee > 0));
    } catch (error) {
      console.error('Error loading emergency fees:', error);
    }
  };

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

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      booked: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSubmitResponse = async (responseData) => {
    const success = await onSubmitResponse(request.id, responseData);
    if (success) {
      setShowResponseModal(false);
    }
    return success;
  };

  // Get response status display info
  const getResponseStatusDisplay = () => {
    if (!userResponse) return null;

    const statusConfig = {
      'INTERESTED': {
        text: 'Response Sent - Interested',
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircleIcon
      },
      'OFFERED': {
        text: 'Counter Offer Sent',
        color: 'bg-yellow-100 text-yellow-800',
        icon: CurrencyDollarIcon
      },
      'REJECTED': {
        text: 'Declined',
        color: 'bg-gray-100 text-gray-800',
        icon: XMarkIcon
      },
      'ACCEPTED': {
        text: 'Accepted ✅',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon
      },
      'PENDING_QUOTE': {
        text: 'Pending Quote',
        color: 'bg-purple-100 text-purple-800',
        icon: ClockIcon
      }
    };

    return statusConfig[userResponse.response_status] || {
      text: 'Response Sent',
      color: 'bg-gray-100 text-gray-800',
      icon: CheckCircleIcon
    };
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {request.title}
              </h3>
              
              {request.request_type === 'emergency' && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse">
                  <BoltIcon className="h-3 w-3 mr-1" />
                  ⚡ EMERGENCY
                </span>
              )}

              {request.allow_auto_booking && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">
                  🤖 Auto-booking enabled
                </span>
              )}

              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(request.status)}`}>
                {request.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {getTimeAgo(request.created_at)}
              </div>
              
              {request.customers && (
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {request.customers.name}
                </div>
              )}
              
              <div className="flex items-center flex-wrap gap-2">
                {/* Service Tags */}
                {request.service_tags && request.service_tags.length > 0 ? (
                  request.service_tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))
                ) : request.trade_tag ? (
                  // Fallback for old single trade_tag format
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {request.trade_tag}
                  </span>
                ) : null}

                {/* Service Mode */}
                {request.service_mode && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {request.service_mode === 'remote' && <ComputerDesktopIcon className="h-3 w-3 mr-1" />}
                    {request.service_mode === 'onsite' && <HomeIcon className="h-3 w-3 mr-1" />}
                    {request.service_mode === 'hybrid' && <span className="mr-1">🔄</span>}
                    {request.service_mode === 'remote' ? 'Remote' :
                     request.service_mode === 'onsite' ? 'On-site' :
                     request.service_mode === 'hybrid' ? 'Hybrid' : request.service_mode}
                  </span>
                )}

                {/* Inspection Required */}
                {request.requires_inspection && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Inspection Required
                  </span>
                )}
              </div>

              {/* Location Information */}
              {(request.location_city || request.postal_code) && (
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>
                    {request.location_city && request.location_state
                      ? `${request.location_city}, ${request.location_state}`
                      : request.location_city || request.location_state || ''
                    }
                    {request.postal_code && ` ${request.postal_code}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Pricing Display with Modern Cards */}
          <div className="text-right">
            {request.pricing_preference === 'FLAT' && (request.budget || request.flat_rate) && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="text-xs font-medium text-green-600 uppercase tracking-wide">💰 Budget</div>
                <div className="text-xl font-bold text-green-700 mt-1">
                  {formatCurrency(request.budget || request.flat_rate)}
                </div>
              </div>
            )}
            {request.pricing_preference === 'HOURLY' && (request.hourly_rate_limit || request.hourly_rate) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">⏰ Max Rate</div>
                <div className="text-xl font-bold text-blue-700 mt-1">
                  {formatCurrency(request.hourly_rate_limit || request.hourly_rate)}/hr
                </div>
              </div>
            )}
            {(request.pricing_preference === 'NEGOTIABLE' || !request.pricing_preference) && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">🤝 Pricing</div>
                <div className="text-xl font-bold text-purple-700 mt-1">
                  Negotiable
                </div>
              </div>
            )}
            {/* Fallback for old budget format */}
            {!request.pricing_type && request.budget && (
              <>
                <div className="text-sm text-gray-500">Budget</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(request.budget)}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {request.description}
        </p>

        {/* Emergency Information */}
        {request.request_type === 'emergency' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <BoltIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-800 font-medium">Emergency Job - Call-out fees may apply</p>
                {isAfterHours && (
                  <p className="text-red-700 mt-1">
                    After-hours request - only contractors available nights/weekends will be notified
                  </p>
                )}
                {emergencyFees.length > 0 && (
                  <p className="text-red-700 mt-1">
                    Emergency fees range from ${Math.min(...emergencyFees.map(f => f.emergency_fee))} -
                    ${Math.max(...emergencyFees.map(f => f.emergency_fee))}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium">Responses:</span>
              <span className="ml-1">{request.response_count}/{request.max_responses}</span>
            </div>
            
            {request.start_time && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Preferred: {new Date(request.start_time).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Show different button states based on user response */}
            {userResponse ? (
              // User has already responded - show status and management options
              <div className="flex items-center space-x-3">
                {(() => {
                  const statusDisplay = getResponseStatusDisplay();
                  const IconComponent = statusDisplay.icon;
                  return (
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                      <IconComponent className="h-4 w-4 mr-2" />
                      {statusDisplay.text}
                    </div>
                  );
                })()}

                {/* Response management buttons */}
                {userResponse.response_status !== 'ACCEPTED' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowResponseModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      ✏️ Edit Response
                    </button>
                    <button
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-semibold text-red-700 bg-white hover:bg-red-50 hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      🗑️ Withdraw
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User hasn't responded yet - show enhanced submit button if available
              request.response_count < request.max_responses && request.status === 'available' && (
                <button
                  onClick={() => setShowResponseModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🚀 Submit Response
                </button>
              )
            )}

            <button
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Details
            </button>
          </div>
        </div>

        {/* Progress bar for response capacity */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Response Capacity</span>
            <span>{request.response_count}/{request.max_responses}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(request.response_count / request.max_responses) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {showResponseModal && (
        <ResponseModal
          request={request}
          onSubmit={handleSubmitResponse}
          onClose={() => setShowResponseModal(false)}
        />
      )}

      {showDetailsModal && (
        <RequestDetailsModal
          request={request}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
};

export default RequestCard;
