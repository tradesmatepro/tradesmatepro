import React from 'react';
import {
  EyeIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatAddressSafe } from '../../utils/formatAddress';

const PublicProfilePreview = ({ data, completionData, verificationStatus }) => {
  const getInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatAddress = () => {
    const full = formatAddressSafe(data);
    if (full) return full; // full address if available
    const parts = [];
    if (data.city) parts.push(data.city);
    if (data.state) parts.push(data.state);
    return parts.join(', ') || 'Location not specified';
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getSocialIcons = () => {
    const icons = [];
    if (data.social_links?.facebook) icons.push({ platform: 'Facebook', icon: '📘' });
    if (data.social_links?.instagram) icons.push({ platform: 'Instagram', icon: '📷' });
    if (data.social_links?.linkedin) icons.push({ platform: 'LinkedIn', icon: '💼' });
    if (data.social_links?.twitter) icons.push({ platform: 'Twitter', icon: '🐦' });
    return icons;
  };

  const getVerificationBadges = () => {
    const badges = [];
    if (verificationStatus.email) badges.push({ type: 'Email', icon: EnvelopeIcon });
    if (verificationStatus.phone) badges.push({ type: 'Phone', icon: PhoneIcon });
    if (data.license_numbers && data.license_numbers.length > 0) badges.push({ type: 'Licensed', icon: ShieldCheckIcon });
    return badges;
  };

  const socialIcons = getSocialIcons();
  const verificationBadges = getVerificationBadges();

  return (
    <div className="space-y-6 sticky top-6">
      {/* Public Profile Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <EyeIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Public Profile Preview</h3>
              <p className="text-sm text-gray-600">How customers see your business</p>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          {/* Company Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              {data.logo_url ? (
                <img
                  src={data.logo_url}
                  alt="Company Logo"
                  className="w-20 h-20 rounded-xl border-2 border-gray-200 bg-white object-contain"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {getInitials(data.name)}
                  </span>
                </div>
              )}
              
              {/* Verification Badge */}
              {verificationBadges.length > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {data.name || 'Your Company Name'}
            </h2>
            
            {data.tagline && (
              <p className="text-gray-600 italic mb-3">
                "{data.tagline}"
              </p>
            )}

            {/* Star Rating (Mock) */}
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-gray-600 ml-2">4.9 (127 reviews)</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact</h4>
            
            {data.phone_number && (
              <div className="flex items-center space-x-3 text-sm">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{formatPhoneNumber(data.phone_number)}</span>
                {verificationStatus.phone && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                )}
              </div>
            )}
            
            {data.email && (
              <div className="flex items-center space-x-3 text-sm">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{data.email}</span>
                {verificationStatus.email && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                )}
              </div>
            )}
            
            {data.website && (
              <div className="flex items-center space-x-3 text-sm">
                <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                <span className="text-blue-600 hover:text-blue-800 cursor-pointer truncate">
                  {data.website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
            
            {(data.city || data.state) && (
              <div className="flex items-center space-x-3 text-sm">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{formatAddress()}</span>
              </div>
            )}
          </div>

          {/* Verification Badges */}
          {verificationBadges.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Verified</h4>
              <div className="flex flex-wrap gap-2">
                {verificationBadges.map((badge, index) => {
                  const IconComponent = badge.icon;
                  return (
                    <div key={index} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <IconComponent className="w-3 h-3 mr-1" />
                      {badge.type}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Licenses */}
          {data.license_numbers && data.license_numbers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Licenses</h4>
              <div className="space-y-2">
                {data.license_numbers.slice(0, 3).map((license, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">
                      {typeof license === 'object' ? license.number : license}
                    </span>
                  </div>
                ))}
                {data.license_numbers.length > 3 && (
                  <p className="text-xs text-gray-500">+{data.license_numbers.length - 3} more licenses</p>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {socialIcons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Follow Us</h4>
              <div className="flex space-x-2">
                {socialIcons.map((social, index) => (
                  <div key={index} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                    <span className="text-sm">{social.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Areas (Mock) */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Service Areas</h4>
            <div className="flex flex-wrap gap-1">
              {['Downtown', 'Suburbs', 'Metro Area'].map((area, index) => (
                <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Get Free Quote
            </button>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors">
              View Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50">
          <h3 className="text-lg font-semibold text-gray-900">💡 Profile Tips</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3 text-sm text-gray-600">
            {completionData.percentage < 70 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  <strong>Add more details</strong> to reach 70% completion and boost customer trust.
                </p>
              </div>
            )}
            
            {!data.logo_url && (
              <div>• Upload a professional logo to stand out</div>
            )}
            
            {!verificationStatus.email && !verificationStatus.phone && (
              <div>• Verify your contact details for trust badges</div>
            )}
            
            {(!data.license_numbers || data.license_numbers.length === 0) && (
              <div>• Add licenses to build credibility</div>
            )}
            
            {!data.website && (
              <div>• Include your website for more leads</div>
            )}
            
            <div>• Complete profiles get 3x more customer inquiries</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePreview;
