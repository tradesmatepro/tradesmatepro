import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const WebsitePreviewCard = ({ data, setData, errors }) => {
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const formatUrl = (url) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const handleUrlChange = (value) => {
    const formattedUrl = formatUrl(value);
    handleInputChange('website', formattedUrl);
    
    const isValid = validateUrl(formattedUrl);
    setIsValidUrl(isValid);
    
    if (isValid) {
      // Simulate loading thumbnail
      setIsLoading(true);
      setThumbnailError(false);
      setTimeout(() => {
        setIsLoading(false);
        // Randomly simulate success/failure for demo
        setThumbnailError(Math.random() > 0.7);
      }, 1500);
    }
  };

  const getDomainName = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  const getThumbnailUrl = (url) => {
    // In a real implementation, you would use a service like:
    // - https://api.thumbnail.ws/
    // - https://www.googleapis.com/pagespeedonline/v5/runPagespeed
    // - https://htmlcsstoimage.com/
    
    // For demo purposes, we'll use a placeholder
    const domain = getDomainName(url);
    return `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent(domain)}`;
  };

  const openWebsite = () => {
    if (isValidUrl && data.website) {
      window.open(data.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <GlobeAltIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Website</h3>
            <p className="text-sm text-gray-600">Your business website with live preview</p>
          </div>
          {isValidUrl && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Valid URL</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Website URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
              <span className="ml-2 inline-flex items-center text-xs text-cyan-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                Include https:// for best results
              </span>
            </label>
            
            <div className="relative">
              <input
                type="url"
                value={data.website}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                  errors.website ? 'border-red-300 focus:border-red-500' : 
                  isValidUrl ? 'border-green-300 focus:border-green-500' :
                  'border-gray-300 focus:border-transparent'
                }`}
                placeholder="https://www.yourcompany.com"
              />
              <GlobeAltIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              
              {isValidUrl && (
                <button
                  onClick={openWebsite}
                  className="absolute right-3 top-3.5 text-cyan-600 hover:text-cyan-800 transition-colors"
                  title="Open website"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {errors.website && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.website}
              </p>
            )}

            {/* URL Status */}
            <div className="mt-3">
              {data.website && !isValidUrl && (
                <div className="flex items-center text-yellow-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  <span>URL will be formatted as: {formatUrl(data.website)}</span>
                </div>
              )}
              
              {isValidUrl && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  <span>Valid website URL</span>
                </div>
              )}
            </div>

            {/* Website Info */}
            {isValidUrl && (
              <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                <h4 className="text-sm font-medium text-cyan-900 mb-2">Website Info</h4>
                <div className="text-sm text-cyan-800 space-y-1">
                  <div><strong>Domain:</strong> {getDomainName(data.website)}</div>
                  <div><strong>Protocol:</strong> {data.website.startsWith('https://') ? 'HTTPS (Secure)' : 'HTTP'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Website Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Live Preview
            </label>
            
            <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
              {isValidUrl ? (
                <div className="relative">
                  {isLoading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading preview...</p>
                      </div>
                    </div>
                  ) : thumbnailError ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Preview not available</p>
                        <p className="text-xs">Website may not support previews</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={getThumbnailUrl(data.website)}
                        alt="Website preview"
                        className="w-full h-48 object-cover"
                        onError={() => setThumbnailError(true)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <button
                          onClick={openWebsite}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100"
                        >
                          Visit Website
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Browser Frame */}
                  <div className="bg-gray-200 px-3 py-2 border-b border-gray-300">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-2 py-1">
                        <p className="text-xs text-gray-600 truncate">{data.website}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <GlobeAltIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Enter a valid website URL</p>
                    <p className="text-xs">to see live preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Website Benefits */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">🌐 Website Benefits</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Appears on your public profile and business cards</li>
            <li>• Helps customers learn more about your services</li>
            <li>• Improves your professional credibility</li>
            <li>• Can be linked from quotes and invoices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebsitePreviewCard;
