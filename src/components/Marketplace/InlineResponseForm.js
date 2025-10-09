import React, { useState, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../../utils/supaFetch';
import { useUser } from '../../contexts/UserContext';
import SmartAvailabilityPicker from './SmartAvailabilityPicker';
import { RESPONSE_TYPE_OPTIONS, FORM_TO_DB_STATUS } from '../../constants/marketplaceEnums';
import { submitMarketplaceResponse } from '../../services/MarketplaceService';

const InlineResponseForm = ({ request, roles, onResponseSubmitted }) => {
  const { user } = useUser();
  const [selectedRole, setSelectedRole] = useState('');
  const [responseType, setResponseType] = useState('interested');
  const [quantityFulfilled, setQuantityFulfilled] = useState(1);
  const [pricingType, setPricingType] = useState('negotiable');
  const [proposedAmount, setProposedAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('hours');
  const [proposedStartTime, setProposedStartTime] = useState('');
  const [proposedEndTime, setProposedEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Auto-select first available role
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      const availableRole = roles.find(role => 
        (role.quantity_fulfilled || 0) < (role.quantity_required || 1)
      );
      if (availableRole) {
        setSelectedRole(availableRole.role_id || availableRole.id);
      }
    }
  }, [roles, selectedRole]);

  // Update max quantity when role changes
  useEffect(() => {
    if (selectedRole) {
      const role = roles.find(r => (r.role_id || r.id) === selectedRole);
      if (role) {
        const maxAvailable = (role.quantity_required || 1) - (role.quantity_fulfilled || 0);
        setQuantityFulfilled(Math.min(quantityFulfilled, maxAvailable));
      }
    }
  }, [selectedRole, roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!isSimpleRequest && !selectedRole) {
        throw new Error('Please select a role to respond to');
      }

      if (responseType === 'offer' && pricingType !== 'negotiable' && !proposedAmount) {
        throw new Error('Please enter a proposed amount for your offer');
      }

      // Phase 2: Use service layer only - no direct database calls
      if (isSimpleRequest) {
        const responseData = {
          request_id: request.id,
          company_id: user.company_id,
          role_id: null, // Simple requests don't have roles
          response_status: FORM_TO_DB_STATUS[responseType],
          proposed_rate: (responseType === 'offer' && proposedAmount) ? parseFloat(proposedAmount) : null,
          duration_hours: duration ? parseFloat(duration) : null,
          proposed_start: proposedStartTime || null,
          proposed_end: proposedEndTime || null,
          message: message.trim() || null
        };

        console.log('🚀 Submitting simple request response via service:', responseData);


        setSuccess(true);
        setSelectedRole('');
        setQuantityFulfilled(1);
        setResponseType('interested');
        setMessage('');
        setProposedAmount('');
        setProposedStartTime('');
        setProposedEndTime('');

        // Notify parent component
        onResponseSubmitted?.(result);
        return;
      }

      // Phase 2: Multi-role requests also use service layer only
      const responseData = {
        request_id: request.id,
        company_id: user.company_id,
        role_id: selectedRole,
        response_status: FORM_TO_DB_STATUS[responseType],
        proposed_rate: (responseType === 'offer' && proposedAmount) ? parseFloat(proposedAmount) : null,
        duration_hours: duration ? parseFloat(duration) : null,
        proposed_start: proposedStartTime || null,
        proposed_end: proposedEndTime || null,
        message: message.trim() || null
      };

      console.log('🚀 Submitting multi-role response via service:', responseData);

      const result = await submitMarketplaceResponse(responseData);

      setSuccess(true);
      onResponseSubmitted?.(result);

      // Reset form
      setResponseType('interested');
      setQuantityFulfilled(1);
      setPricingType('negotiable');
      setProposedAmount('');
      setDuration('');
      setMessage('');
      setProposedStartTime('');
      setProposedEndTime('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Error submitting response:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableRoles = () => {
    return roles.filter(role =>
      (role.quantity_fulfilled || 0) < (role.quantity_required || 1)
    );
  };

  const getMaxQuantityForRole = (roleId) => {
    const role = roles.find(r => (r.role_id || r.id) === roleId);
    if (!role) return 1;
    return (role.quantity_required || 1) - (role.quantity_fulfilled || 0);
  };

  const availableRoles = getAvailableRoles();
  const isSimpleRequest = !roles || roles.length === 0;

  // For simple requests (no roles), check if max_responses is reached
  if (isSimpleRequest) {
    const responseCount = request.response_count || 0;
    const maxResponses = request.max_responses;

    if (maxResponses && responseCount >= maxResponses) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Full</h3>
          <p className="text-gray-600">This request has reached its maximum number of responses ({maxResponses}).</p>
        </div>
      );
    }
  } else if (availableRoles.length === 0) {
    // For multi-role requests, check if all roles are filled
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Request Fully Staffed</h3>
        <p className="text-gray-600">All roles for this request have been filled.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Response</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">Response submitted successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection - Only show for multi-role requests */}
        {!isSimpleRequest && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a role...</option>
              {availableRoles.map((role) => (
                <option key={role.role_id || role.id} value={role.role_id || role.id}>
                  {role.category || role.service_categories?.name || 'Unknown Role'}
                  ({(role.quantity_required || 1) - (role.quantity_fulfilled || 0)} spots available)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity - Show for multi-role requests with selected role, or always for simple requests */}
        {(isSimpleRequest || selectedRole) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Workers *
            </label>
            <input
              type="number"
              min="1"
              max={isSimpleRequest ? 10 : getMaxQuantityForRole(selectedRole)}
              value={quantityFulfilled}
              onChange={(e) => setQuantityFulfilled(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {!isSimpleRequest && (
              <p className="text-xs text-gray-600 mt-1">
                Maximum available: {getMaxQuantityForRole(selectedRole)}
              </p>
            )}
          </div>
        )}

        {/* Response Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RESPONSE_TYPE_OPTIONS.map((type) => (
              <label key={type.value} className="relative">
                <input
                  type="radio"
                  name="responseType"
                  value={type.value}
                  checked={responseType === type.value}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  responseType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600">{type.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing (only for offers) */}
        {responseType === 'offer' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type *
              </label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="negotiable">Negotiable</option>
                <option value="flat">Flat Rate</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            {pricingType !== 'negotiable' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Amount ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={pricingType === 'hourly' ? 'Per hour rate' : 'Total project cost'}
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Duration Estimate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Duration"
            />
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>

        {/* Smart Scheduling */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Proposed Schedule
          </label>
          <SmartAvailabilityPicker
            request={request}
            onAvailabilitySelect={(availability) => {
              setProposedStartTime(availability.availableStart);
              setProposedEndTime(availability.availableEnd);
            }}
          />
        </div>

        {/* Optional Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional details or questions..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Submit Response
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineResponseForm;
