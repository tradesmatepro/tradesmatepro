import React from 'react';
import {
  ShareIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const SocialLinksCard = ({ data, setData, errors }) => {
  const handleInputChange = (platform, value) => {
    setData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const formatUrl = (platform, value) => {
    if (!value) return '';
    
    // Remove existing platform URLs and clean the input
    const cleanValue = value
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/^(facebook|instagram|linkedin|twitter)\.com\//, '')
      .replace(/^@/, '');

    if (!cleanValue) return '';

    // Return the full URL
    switch (platform) {
      case 'facebook':
        return `https://facebook.com/${cleanValue}`;
      case 'instagram':
        return `https://instagram.com/${cleanValue}`;
      case 'linkedin':
        return `https://linkedin.com/company/${cleanValue}`;
      case 'twitter':
        return `https://twitter.com/${cleanValue}`;
      default:
        return cleanValue;
    }
  };

  const getDisplayValue = (platform, url) => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
      
      switch (platform) {
        case 'facebook':
          return pathname.replace('company/', '');
        case 'instagram':
          return `@${pathname}`;
        case 'linkedin':
          return pathname.replace('company/', '');
        case 'twitter':
          return `@${pathname}`;
        default:
          return pathname;
      }
    } catch {
      return url;
    }
  };

  const handleUrlChange = (platform, value) => {
    const formattedUrl = formatUrl(platform, value);
    handleInputChange(platform, formattedUrl);
  };

  const openSocialLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const socialPlatforms = [
    {
      key: 'facebook',
      name: 'Facebook',
      icon: '📘',
      placeholder: 'your-business-name',
      color: 'blue',
      description: 'Business page for customer engagement'
    },
    {
      key: 'instagram',
      name: 'Instagram',
      icon: '📷',
      placeholder: 'yourbusiness',
      color: 'pink',
      description: 'Visual content and behind-the-scenes'
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      placeholder: 'your-company',
      color: 'blue',
      description: 'Professional networking and B2B'
    },
    {
      key: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      placeholder: 'yourbusiness',
      color: 'blue',
      description: 'Updates and customer service'
    }
  ];

  const getCompletedCount = () => {
    return Object.values(data.social_links || {}).filter(link => link && link.trim()).length;
  };

  const completedCount = getCompletedCount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <ShareIcon className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
            <p className="text-sm text-gray-600">Connect your social media profiles</p>
          </div>
          {completedCount > 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">{completedCount} of 4</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform) => {
            const url = data.social_links?.[platform.key] || '';
            const hasUrl = url && url.trim();
            
            return (
              <div key={platform.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                    <span className="ml-2 inline-flex items-center text-xs text-gray-500">
                      <InformationCircleIcon className="w-3 h-3 mr-1" />
                      {platform.description}
                    </span>
                  </span>
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    value={getDisplayValue(platform.key, url)}
                    onChange={(e) => handleUrlChange(platform.key, e.target.value)}
                    className="w-full pl-3 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    placeholder={platform.placeholder}
                  />
                  
                  {hasUrl && (
                    <button
                      onClick={() => openSocialLink(url)}
                      className="absolute right-3 top-3.5 text-pink-600 hover:text-pink-800 transition-colors"
                      title={`Open ${platform.name} profile`}
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {hasUrl && (
                  <p className="mt-1 text-xs text-gray-500 truncate">
                    {url}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Social Media Preview */}
        {completedCount > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <h4 className="text-sm font-medium text-pink-900 mb-3">Social Media Preview</h4>
            <div className="flex flex-wrap gap-3">
              {socialPlatforms.map((platform) => {
                const url = data.social_links?.[platform.key];
                if (!url) return null;
                
                return (
                  <button
                    key={platform.key}
                    onClick={() => openSocialLink(url)}
                    className="inline-flex items-center px-3 py-2 bg-white border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors group"
                  >
                    <span className="mr-2">{platform.icon}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getDisplayValue(platform.key, url)}
                    </span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-2 text-gray-400 group-hover:text-pink-600" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Media Benefits */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📱 Social Media Benefits</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Builds trust through social proof and reviews</li>
            <li>• Showcases your work with photos and videos</li>
            <li>• Helps customers connect and follow your business</li>
            <li>• Improves local search and online visibility</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use consistent branding across all platforms</li>
            <li>• Post regularly to keep your audience engaged</li>
            <li>• Share before/after photos of your work</li>
            <li>• Respond promptly to comments and messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksCard;
