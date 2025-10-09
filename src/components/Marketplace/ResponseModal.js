import React, { useState, useEffect } from 'react';
import { XMarkIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import SmartAvailabilityPicker from './SmartAvailabilityPicker';

// Updated ResponseModal - Fixed enum mapping
const ResponseModal = ({ request, onSubmit, onClose }) => {
  const { user } = useUser();
  const [responseType, setResponseType] = useState('INTERESTED'); // INTERESTED, OFFERED
  const [counterOffer, setCounterOffer] = useState('');
  const [availableStart, setAvailableStart] = useState('');
  const [availableEnd, setAvailableEnd] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [companyEmergencyFee, setCompanyEmergencyFee] = useState(null);
  const [useSmartScheduling, setUseSmartScheduling] = useState(true);
  const [estimatedDuration, setEstimatedDuration] = useState(120); // Default 2 hours

  useEffect(() => {
    // Load company's emergency fee if this is an emergency request
    if ((request.request_type || '').toUpperCase() === 'EMERGENCY') {
      loadCompanyEmergencyFee();
    }
  }, [request]);

  const loadCompanyEmergencyFee = async () => {
    try {
      const response = await supaFetch(
        `companies?id=eq.${user.company_id}&select=emergency_fee`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const companies = await response.json();
        if (companies[0]) {
          setCompanyEmergencyFee(companies[0].emergency_fee);
        }
      }
    } catch (error) {
      console.error('Error loading company emergency fee:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const responseData = {
      responseType: responseType,
      proposedRate: responseType === 'OFFERED' ? parseFloat(counterOffer) : null,
      availableStart: availableStart || null,
      availableEnd: availableEnd || null,
      message: message.trim() || null
    };

    const success = await onSubmit(responseData);
    setSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  const handleSmartAvailabilitySelect = (availability) => {
    setAvailableStart(availability.availableStart);
    setAvailableEnd(availability.availableEnd);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 w-full max-w-3xl shadow-2xl rounded-2xl bg-white border-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎯 Submit Response
            </h3>
            <p className="text-lg text-gray-600 font-medium">"{request.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Request Summary - Enhanced to match RequestDetailsModal */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">{request.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{request.description}</p>
            </div>

            {/* Pricing Display - Fixed to use pricing_preference enum */}
            <div className="text-right ml-4">
              {request.pricing_preference === 'FLAT' && (request.budget || request.flat_rate) && (
                <>
                  <div className="text-xs text-gray-500">Flat Rate</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(request.budget || request.flat_rate)}
                  </div>
                </>
              )}
              {request.pricing_preference === 'HOURLY' && (request.hourly_rate_limit || request.hourly_rate) && (
                <>
                  <div className="text-xs text-gray-500">Max Rate</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(request.hourly_rate_limit || request.hourly_rate)}/hr
                  </div>
                </>
              )}
              {(request.pricing_preference === 'NEGOTIABLE' || !request.pricing_preference) && (
                <>
                  <div className="text-xs text-gray-500">Pricing</div>
                  <div className="text-lg font-semibold text-blue-600">
                    Negotiable
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              {request.trade_tag || 'General'}
            </span>

            {request.request_type === 'emergency' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                <BoltIcon className="h-3 w-3 mr-1" />
                ⚡ EMERGENCY
              </span>
            )}

            {request.service_mode && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {request.service_mode === 'onsite' ? '🏠 On-site' :
                 request.service_mode === 'remote' ? '💻 Remote' :
                 request.service_mode === 'hybrid' ? '🔄 Hybrid' : 'On-site'}
              </span>
            )}

            {/* Customer Time Preference */}
            {request.preferred_time_option && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                <ClockIcon className="h-3 w-3 mr-1" />
                {request.preferred_time_option === 'anytime' && '📅 Anytime'}
                {request.preferred_time_option === 'soonest' && '⚡ ASAP'}
                {request.preferred_time_option === 'this_week' && '📆 This Week'}
                {request.preferred_time_option === 'weekend_only' && '🏖️ Weekends Only'}
                {request.preferred_time_option === 'specific' && '🎯 Specific Dates'}
              </span>
            )}

            {/* Show specific dates if customer selected them */}
            {request.preferred_time_option === 'specific' && request.start_time && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                📅 {new Date(request.start_time).toLocaleDateString()}
                {request.start_time && ` at ${new Date(request.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
              </span>
            )}

            <span className="text-gray-500">
              Responses: {request.response_count}/{request.max_responses}
            </span>
          </div>
        </div>

        {/* Emergency Fee Notice */}
        {request.request_type === 'emergency' && companyEmergencyFee && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <BoltIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Emergency Call-out Fee</p>
                <p className="text-yellow-700 mt-1">
                  Your company charges <strong>{formatCurrency(companyEmergencyFee)}</strong> for emergency jobs.
                  This fee will be added to your response automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Response Type */}
          <div>
            <label className="text-base font-medium text-gray-900">Response Type</label>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  id="interested"
                  name="response-type"
                  type="radio"
                  value="INTERESTED"
                  checked={responseType === 'INTERESTED'}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="interested" className="ml-3 block text-sm font-medium text-gray-700">
                  I'm Interested
                  <span className="block text-xs text-gray-500">Show interest without committing to a price</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="offered"
                  name="response-type"
                  type="radio"
                  value="OFFERED"
                  checked={responseType === 'OFFERED'}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                />
                <label htmlFor="offered" className="ml-3 block text-sm font-medium text-gray-700">
                  Submit Offer
                  <span className="block text-xs text-gray-500">Provide a specific price quote</span>
                </label>
              </div>
            </div>
          </div>

          {/* Proposed Rate Amount */}
          {responseType === 'OFFERED' && (
            <div>
              <label htmlFor="counter-offer" className="block text-sm font-medium text-gray-700">
                Proposed Rate
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="counter-offer"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                  required={responseType === 'OFFERED'}
                />
              </div>
            </div>
          )}

          {/* Availability - Smart Calendar Integration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseSmartScheduling(!useSmartScheduling)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    useSmartScheduling ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      useSmartScheduling ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Smart Scheduling</span>
              </div>
            </div>

            {useSmartScheduling ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estimated Duration (minutes)
                    </label>
                    <select
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(parseInt(e.target.value))}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      <option value={240}>4 hours</option>
                      <option value={480}>Full day</option>
                    </select>
                  </div>
                </div>

                {/* Customer Time Preference Info */}
                {request.preferred_time_option && request.preferred_time_option !== 'anytime' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <strong>Customer's Time Preference:</strong>
                      {request.preferred_time_option === 'soonest' && (
                        <span> ⚡ They want the soonest available appointment.</span>
                      )}
                      {request.preferred_time_option === 'this_week' && (
                        <span> 📆 They prefer scheduling within this week.</span>
                      )}
                      {request.preferred_time_option === 'weekend_only' && (
                        <span> 🏖️ They can only meet on weekends (Saturday/Sunday).</span>
                      )}
                      {request.preferred_time_option === 'specific' && (
                        <span> 🎯 They have specific dates/times in mind.</span>
                      )}
                    </div>
                  </div>
                )}

                <SmartAvailabilityPicker
                  request={request}
                  selectedStart={availableStart}
                  selectedEnd={availableEnd}
                  onAvailabilitySelect={handleSmartAvailabilitySelect}
                  estimatedDuration={estimatedDuration}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="available-start" className="block text-sm font-medium text-gray-700">
                    Available Start
                  </label>
                  <input
                    type="datetime-local"
                    id="available-start"
                    value={availableStart}
                    onChange={(e) => setAvailableStart(e.target.value)}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="available-end" className="block text-sm font-medium text-gray-700">
                    Available End
                  </label>
                  <input
                    type="datetime-local"
                    id="available-end"
                    value={availableEnd}
                    onChange={(e) => setAvailableEnd(e.target.value)}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Add any additional details about your response..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResponseModal;
