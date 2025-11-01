import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const GooglePlacesAutocomplete = ({ onPlaceSelected, focusedField, setFocusedField }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  // Check if Google Places API is available
  useEffect(() => {
    const checkGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleLoaded(true);
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Create a dummy div for PlacesService (required by Google API)
        const dummyDiv = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
        
        console.log('✅ Google Places API loaded successfully');
      } else {
        setIsGoogleLoaded(false);
        setError('Google Places API not loaded. Using manual entry only.');
        console.warn('⚠️ Google Places API not available. Add REACT_APP_GOOGLE_PLACES_API_KEY to .env');
      }
    };

    // Check immediately
    checkGooglePlaces();

    // Also check after a delay in case script is still loading
    const timer = setTimeout(checkGooglePlaces, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddressSearch = (query) => {
    setSearchQuery(query);

    if (!isGoogleLoaded) {
      setShowSuggestions(false);
      return;
    }

    if (query.length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Call Google Places Autocomplete API
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        types: ['address'],
        componentRestrictions: { country: 'us' }
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setSuggestions([]);
          setShowSuggestions(false);
        } else {
          console.error('Google Places API error:', status);
          setError('Failed to fetch address suggestions');
        }
      }
    );
  };

  const selectSuggestion = (suggestion) => {
    if (!placesService.current) {
      console.error('PlacesService not initialized');
      return;
    }

    // Get place details
    placesService.current.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ['address_components', 'formatted_address']
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Parse address components
          const addressComponents = place.address_components;
          const parsedAddress = {
            street_address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'United States'
          };

          addressComponents.forEach(component => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              parsedAddress.street_address = component.long_name;
            }
            if (types.includes('route')) {
              parsedAddress.street_address += (parsedAddress.street_address ? ' ' : '') + component.long_name;
            }
            if (types.includes('locality')) {
              parsedAddress.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              parsedAddress.state = component.long_name;
            }
            if (types.includes('postal_code')) {
              parsedAddress.postal_code = component.long_name;
            }
            if (types.includes('country')) {
              parsedAddress.country = component.long_name;
            }
          });

          // Call parent callback with parsed address
          onPlaceSelected(parsedAddress);
          setSearchQuery(place.formatted_address);
          setShowSuggestions(false);
        } else {
          console.error('Failed to get place details:', status);
          setError('Failed to get address details');
        }
      }
    );
  };

  return (
    <div className="relative">
      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
        <MagnifyingGlassIcon className="w-6 h-6 mr-3 text-green-500" />
        Search Address
        {!isGoogleLoaded && (
          <span className="ml-3 text-xs font-normal text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            Manual Entry Only
          </span>
        )}
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
          disabled={!isGoogleLoaded}
          className={`w-full pl-12 pr-4 py-4 border-3 rounded-2xl text-xl font-medium transition-all duration-300 ${
            !isGoogleLoaded
              ? 'bg-gray-100 cursor-not-allowed opacity-60'
              : focusedField === 'search'
              ? 'border-green-500 bg-green-50 shadow-2xl transform scale-[1.02]'
              : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg'
          } focus:outline-none focus:ring-4 focus:ring-green-500/20`}
          placeholder={isGoogleLoaded ? "Start typing your business address..." : "Google Places API not configured"}
        />
        <MagnifyingGlassIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
          focusedField === 'search' ? 'text-green-500' : 'text-gray-400'
        }`} />
      </div>

      {/* Address Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-green-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
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

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Setup Instructions */}
      {!isGoogleLoaded && (
        <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">To enable address autocomplete:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Get a Google Places API key from Google Cloud Console</li>
                <li>Add <code className="bg-blue-100 px-2 py-0.5 rounded">REACT_APP_GOOGLE_PLACES_API_KEY</code> to your .env file</li>
                <li>Restart the development server</li>
              </ol>
              <p className="mt-3 text-xs text-blue-600">
                For now, you can enter addresses manually using the fields below.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;

