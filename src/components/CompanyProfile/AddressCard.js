import React, { useState, useRef } from 'react';
import { formatAddressSafe, splitAddressLines } from '../../utils/formatAddress';
import {
  MapPinIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  SparklesIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const AddressCard = ({ data, setData, errors }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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
      setShowSuggestions(true);
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

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const formatAddress = () => formatAddressSafe(data) || 'No address provided';

  const [streetLine, cityStateZip] = splitAddressLines(data);

  const isAddressComplete = data.street_address && data.city && data.state && data.postal_code;

  return (
    <div className="space-y-8">
      {/* Google Places Autocomplete */}
      <div className="relative">
        <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <MagnifyingGlassIcon className="w-6 h-6 mr-3 text-green-500" />
          Search Address
        </label>

        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleAddressSearch(e.target.value)}
            onFocus={() => setFocusedField('search')}
            onBlur={() => {
              setFocusedField(null);
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className={`w-full pl-12 pr-4 py-4 border-3 rounded-2xl text-xl font-medium transition-all duration-300 ${
              focusedField === 'search'
                ? 'border-green-500 bg-green-50 shadow-2xl transform scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg'
            } focus:outline-none focus:ring-4 focus:ring-green-500/20`}
            placeholder="Start typing your business address..."
          />
          <MagnifyingGlassIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
            focusedField === 'search' ? 'text-green-500' : 'text-gray-400'
          }`} />
        </div>

        {/* Address Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-20 w-full mt-2 bg-white border-2 border-green-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
            {mockSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-6 py-4 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="font-semibold text-gray-900">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Street Address */}
        <div className="lg:col-span-2">
          <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BuildingOfficeIcon className="w-6 h-6 mr-3 text-blue-500" />
            Street Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.street_address}
              onChange={(e) => handleInputChange('street_address', e.target.value)}
              onFocus={() => setFocusedField('street')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-12 pr-4 py-4 border-3 rounded-2xl text-xl font-medium transition-all duration-300 ${
                focusedField === 'street'
                ? 'border-blue-500 bg-blue-50 shadow-2xl'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
              placeholder="123 Main Street"
            />
            <BuildingOfficeIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
              focusedField === 'street' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            {data.street_address && (
              <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
            )}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
            <MapPinIcon className="w-6 h-6 mr-3 text-purple-500" />
            City
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onFocus={() => setFocusedField('city')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-4 border-3 rounded-2xl text-xl font-medium transition-all duration-300 ${
                focusedField === 'city'
                ? 'border-purple-500 bg-purple-50 shadow-2xl'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
              } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
              placeholder="City"
            />
            {data.city && (
              <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
            )}
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
            <GlobeAltIcon className="w-6 h-6 mr-3 text-cyan-500" />
            State
          </label>
          <div className="relative">
            <select
              value={data.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              onFocus={() => setFocusedField('state')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-4 border-3 rounded-2xl text-xl font-medium transition-all duration-300 ${
                focusedField === 'state'
                ? 'border-cyan-500 bg-cyan-50 shadow-2xl'
                : 'border-gray-200 bg-white hover:border-cyan-300 hover:shadow-lg'
              } focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {data.state && (
              <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* ZIP Code */}
      <div className="max-w-md">
        <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <MapPinIcon className="w-6 h-6 mr-3 text-orange-500" />
          ZIP Code
        </label>
        <div className="relative">
          <input
            type="text"
            value={data.postal_code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleInputChange('postal_code', value);
            }}
            onFocus={() => setFocusedField('zip')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-4 py-4 border-3 rounded-2xl text-xl font-medium transition-all duration-300 ${
              errors.postal_code
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : focusedField === 'zip'
                ? 'border-orange-500 bg-orange-50 shadow-2xl'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-lg'
            } focus:outline-none focus:ring-4 focus:ring-orange-500/20`}
            placeholder="12345"
          />
          {data.postal_code && (
            <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
          )}
        </div>
        {errors.postal_code && (
          <p className="mt-3 text-red-600 flex items-center bg-red-50 p-3 rounded-xl border border-red-200">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
            {errors.postal_code}
          </p>
        )}
      </div>

      {/* Map Preview */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-3xl p-8 border-3 border-green-200">
        <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
          <MapPinIcon className="w-6 h-6 mr-3" />
          Location Preview
        </h4>



        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-green-100">
          {/* Simple preview box (no map to avoid API cost and confusion) */}
          <div className="p-6">
            <div className="inline-block bg-white/90 rounded-xl p-4 shadow border border-gray-200">
              <p className="font-bold text-gray-900">{streetLine || 'No street address provided'}</p>
              {cityStateZip && (
                <p className="text-gray-700">{cityStateZip}</p>
              )}
            </div>
          </div>

          {/* Address Summary */}
          <div className="p-6 bg-white">
            <h5 className="font-bold text-gray-900 mb-2">Business Address</h5>
            <p className="text-gray-700 text-lg">{formatAddress()}</p>
            {isAddressComplete && (
              <div className="mt-4 flex items-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Address verified and ready for use</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
