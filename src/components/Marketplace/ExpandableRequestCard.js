import React, { useState, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../../utils/supaFetch';
import { useUser } from '../../contexts/UserContext';
import InlineResponseForm from './InlineResponseForm';

const ExpandableRequestCard = ({ request, onResponseSubmitted }) => {
  const { user } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load roles when card is expanded
  useEffect(() => {
    if (isExpanded && request.id) {
      loadRequestRoles();
    }
  }, [isExpanded, request.id]);

  const loadRequestRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try RPC function first, but handle 404 gracefully
      let rolesData = [];

      try {
        const response = await supaFetch(
          `rpc/get_request_with_roles`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_request_id: request.id })
          },
          user.company_id
        );

        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles || []);
          return;
        } else if (response.status === 404) {
          console.warn('RPC function get_request_with_roles not found, using fallback method');
        } else {
          throw new Error(`RPC call failed: ${response.status}`);
        }
      } catch (rpcError) {
        console.warn('RPC function call failed, using fallback method:', rpcError.message);
      }

      // Fallback to basic role loading with enhanced data
      const rolesResponse = await supaFetch(
        `marketplace_request_roles?request_id=eq.${request.id}&select=*,service_categories(name,description)`,
        { method: 'GET' },
        user.company_id
      );

      if (rolesResponse.ok) {
        const basicRoles = await rolesResponse.json();

        // Enhance roles with response data
        const enhancedRoles = await Promise.all(
          basicRoles.map(async (role) => {
            try {
              const responsesResponse = await supaFetch(
                `marketplace_responses?role_id=eq.${role.id}&select=*`,
                { method: 'GET' },
                user.company_id
              );

              const responses = responsesResponse.ok ? await responsesResponse.json() : [];

              return {
                ...role,
                responses: responses,
                quantity_fulfilled: responses.reduce((sum, resp) =>
                  sum + (resp.quantity_fulfilled || 0), 0
                )
              };
            } catch (error) {
              console.warn(`Failed to load responses for role ${role.id}:`, error);
              return {
                ...role,
                responses: [],
                quantity_fulfilled: 0
              };
            }
          })
        );

        setRoles(enhancedRoles);
      } else {
        throw new Error('Failed to load request roles');
      }
    } catch (err) {
      console.error('Error loading request roles:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimePreference = (preference) => {
    const preferences = {
      'anytime': '📅 Anytime',
      'soonest': '⚡ ASAP',
      'this_week': '📆 This Week',
      'weekend_only': '🏖️ Weekends Only',
      'specific': '🎯 Specific Dates'
    };
    return preferences[preference] || preference;
  };

  const getProgressColor = (fulfilled, required) => {
    const percentage = (fulfilled / required) * 100;
    if (percentage >= 100) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
      {/* Compact Card Header - Always Visible */}
      <div 
        className="p-6 cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {request.title}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Request Type Badge */}
                {request.request_type === 'EMERGENCY' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    🚨 Emergency
                  </span>
                )}
                
                {/* Expand/Collapse Icon */}
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Compact Summary Row */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {/* Location */}
              {(request.location_city || request.postal_code) && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>
                    {request.location_city && request.postal_code 
                      ? `${request.location_city}, ${request.postal_code}`
                      : request.location_city || request.postal_code
                    }
                  </span>
                </div>
              )}

              {/* Budget */}
              {request.budget && (
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  <span>{formatCurrency(request.budget)}</span>
                </div>
              )}

              {/* Time Preference */}
              {request.preferred_time_option && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{formatTimePreference(request.preferred_time_option)}</span>
                </div>
              )}

              {/* Response Count */}
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                <span>{request.response_count || 0}/{request.max_responses || 'unlimited'} responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details - Only Visible When Expanded */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-6">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading request details...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Full Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Service Mode</h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {request.service_mode === 'onsite' ? '🏠 On-site' : 
                     request.service_mode === 'remote' ? '💻 Remote' : '🔄 Hybrid'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fulfillment Mode</h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    {request.fulfillment_mode === 'match_all' ? '🎯 Match All Roles' : '🔀 Match Any Role'}
                  </span>
                </div>
              </div>

              {/* Roles and Progress */}
              {roles.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Required Roles</h4>
                  <div className="space-y-3">
                    {roles.map((role, index) => (
                      <div key={role.role_id || index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                              {role.category || role.service_categories?.name || 'Unknown Role'}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(role.quantity_fulfilled || 0, role.quantity_required || 1)}`}>
                              {role.quantity_fulfilled || 0}/{role.quantity_required || 1} filled
                            </span>
                          </div>
                          {(role.quantity_fulfilled || 0) >= (role.quantity_required || 1) && (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(((role.quantity_fulfilled || 0) / (role.quantity_required || 1)) * 100, 100)}%`
                            }}
                          ></div>
                        </div>

                        {/* Existing Responses for this Role */}
                        {role.responses && role.responses.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Current Responses:</p>
                            <div className="space-y-1">
                              {role.responses.map((response, respIndex) => (
                                <div key={response.response_id || respIndex} className="text-xs text-gray-700 bg-white rounded px-2 py-1">
                                  Company {response.company_id?.slice(0, 8)}... - {response.quantity_fulfilled} workers ({response.response_type})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Request Type</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">General Service Request</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Open for responses
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      This is a standard service request. Contractors can submit responses with their availability and pricing.
                    </p>
                  </div>
                </div>
              )}

              {/* Inline Response Form */}
              <div className="border-t border-gray-200 pt-6">
                <InlineResponseForm 
                  request={request}
                  roles={roles}
                  onResponseSubmitted={(response) => {
                    onResponseSubmitted?.(response);
                    loadRequestRoles(); // Refresh roles to show updated progress
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandableRequestCard;
