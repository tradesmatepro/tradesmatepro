/**
 * Load Google Places API dynamically
 * Only loads if REACT_APP_GOOGLE_PLACES_API_KEY is set in .env
 */

let googlePlacesPromise = null;

export const loadGooglePlaces = () => {
  // Return existing promise if already loading/loaded
  if (googlePlacesPromise) {
    return googlePlacesPromise;
  }

  // Check if API key is configured
  const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Google Places API key not configured. Set REACT_APP_GOOGLE_PLACES_API_KEY in .env');
    return Promise.resolve(false);
  }

  // Check if already loaded
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log('✅ Google Places API already loaded');
    return Promise.resolve(true);
  }

  // Load the script
  googlePlacesPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Places API loaded successfully');
      resolve(true);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Google Places API:', error);
      reject(error);
    };

    document.head.appendChild(script);
  });

  return googlePlacesPromise;
};

export default loadGooglePlaces;

