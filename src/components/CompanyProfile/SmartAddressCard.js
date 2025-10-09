import React, { useState, useRef, useEffect } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { formatAddressSafe } from '../../utils/formatAddress';

const SmartAddressCard = ({ data, setData, errors, suggestions, showSuggestions, setShowSuggestions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Mock Google Places suggestions
  const mockSuggestions = [
    {
      description: "123 Main Street, Anytown, CA 90210, USA",
      place_id: "mock_1",
      structured_formatting: {
        main_text: "123 Main Street",
        secondary_text: "Anytown, CA 90210, USA"
      }
    },
    {
      description: "456 Business Ave, Commerce City, CA 90211, USA", 
      place_id: "mock_2",
      structured_formatting: {
        main_text: "456 Business Ave",
        secondary_text: "Commerce City, CA 90211, USA"
      }
    },
    {
      description: "789 Industrial Blvd, Enterprise, CA 90212, USA",
      place_id: "mock_3", 
      structured_formatting: {
        main_text: "789 Industrial Blvd",
        secondary_text: "Enterprise, CA 90212, USA"
      }
    }
  ];

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressSearch = (query) => {
    setSearchQuery(query);
    
    if (query.length > 3) {
      setIsSearching(true);
      // Simulate API delay
      setTimeout(() => {
        setIsSearching(false);
        setShowSuggestions(true);
      }, 500);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    // Parse the suggestion and populate fields
    const parts = suggestion.description.split(', ');
    const streetAddress = parts[0] || '';
    const city = parts[1] || '';
    const stateZip = parts[2] || '';
    const [state, zipCode] = stateZip.split(' ');

    setData(prev => ({
      ...prev,
      street_address: streetAddress,
      city: city,
      state: state || '',
      postal_code: zipCode || ''
    }));

    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
  };

  const formatAddress = () => formatAddressSafe(data) || 'No address provided';

  const isAddressComplete = data.street_address && data.city && data.state && data.postal_code;

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPinIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Smart Address</h3>
            <p className="text-sm text-gray-600">Your business location with map preview</p>
          </div>
          {isAddressComplete && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Address Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Address
                <span className="ml-2 inline-flex items-center text-xs text-green-600">
                  <InformationCircleIcon className="w-3 h-3 mr-1" />
                  Start typing to search
                </span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Type your business address..."
                />
              </div>

              {/* Address Suggestions */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {mockSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-600">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Address Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={data.street_address}
                  onChange={(e) => handleInputChange('street_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={data.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={data.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="12345"
                  maxLength="10"
                />
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Preview
            </label>
            
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-200 relative overflow-hidden">
              {isAddressComplete ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPinIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Address Located</p>
                  <p className="text-xs text-gray-600 px-4">{formatAddress()}</p>
                  
                  {/* Mock map overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-20"></div>
                  <div className="absolute top-4 right-4">
                    <GlobeAltIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <MapPinIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Enter address to see map preview</p>
                </div>
              )}
            </div>

            {/* Address Summary */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-1">Current Address</h4>
              <p className="text-sm text-green-800">{formatAddress()}</p>
            </div>
          </div>
        </div>

        {/* Address Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📍 Address Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use your primary business location for service area calculations</li>
            <li>• This address appears on invoices and official documents</li>
            <li>• Customers may use this for directions to your business</li>
            <li>• Accurate addresses help with local search visibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartAddressCard;
