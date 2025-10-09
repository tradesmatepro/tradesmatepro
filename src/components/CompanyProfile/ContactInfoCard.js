import React, { useState } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ContactInfoCard = ({ data, setData, errors, formatPhoneNumber }) => {
  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneChange = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Limit to 10 digits
    if (cleaned.length <= 10) {
      handleInputChange('phone_number', cleaned);
    }
  };

  const displayPhone = formatPhoneNumber(data.phone_number);

  const getCompletionCount = () => {
    let count = 0;
    if (data.name) count++;
    if (data.phone_number) count++;
    if (data.email) count++;
    if (data.website) count++;
    return count;
  };

  const completionCount = getCompletionCount();

  return (
    <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>

      {/* Header */}
      <div className="relative px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Business Contact</h3>
              <p className="text-blue-100">How customers can reach you</p>
            </div>
          </div>

          {/* Completion Badge */}
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {completionCount}/4 Complete
            </div>
            {completionCount === 4 && (
              <div className="p-2 bg-green-500 rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <StarIcon className="w-4 h-4 mr-2 text-yellow-500" />
              Company Name *
            </label>
            <div className="relative group/input">
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : focusedField === 'name'
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                placeholder="Enter your company name"
              />
              <BuildingOfficeIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
                focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'
              }`} />
              {data.name && (
                <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
              )}
            </div>
            {errors.name && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <PhoneIcon className="w-4 h-4 mr-2 text-green-500" />
              Phone Number *
            </label>
            <div className="relative group/input">
              <input
                type="tel"
                value={displayPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  errors.phone_number
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : focusedField === 'phone'
                    ? 'border-green-500 bg-green-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-green-300 bg-white'
                } focus:outline-none focus:ring-4 focus:ring-green-500/20`}
                placeholder="(555) 123-4567"
              />
              <PhoneIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
                focusedField === 'phone' ? 'text-green-500' : 'text-gray-400'
              }`} />
              {data.phone_number && (
                <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
              )}
            </div>
            {errors.phone_number && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                {errors.phone_number}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <EnvelopeIcon className="w-4 h-4 mr-2 text-purple-500" />
              Email Address *
            </label>
            <div className="relative group/input">
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : focusedField === 'email'
                    ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                placeholder="company@example.com"
              />
              <EnvelopeIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
                focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'
              }`} />
              {data.email && (
                <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <GlobeAltIcon className="w-4 h-4 mr-2 text-cyan-500" />
              Website
            </label>
            <div className="relative group/input">
              <input
                type="url"
                value={data.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                onFocus={() => setFocusedField('website')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  errors.website
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : focusedField === 'website'
                    ? 'border-cyan-500 bg-cyan-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-cyan-300 bg-white'
                } focus:outline-none focus:ring-4 focus:ring-cyan-500/20`}
                placeholder="https://www.yourcompany.com"
              />
              <GlobeAltIcon className={`absolute left-4 top-4 h-6 w-6 transition-colors ${
                focusedField === 'website' ? 'text-cyan-500' : 'text-gray-400'
              }`} />
              {data.website && (
                <CheckCircleIcon className="absolute right-4 top-4 h-6 w-6 text-green-500" />
              )}
            </div>
            {errors.website && (
              <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                {errors.website}
              </p>
            )}
            <p className="mt-3 text-sm text-gray-600 flex items-center">
              <SparklesIcon className="w-4 h-4 mr-2 text-yellow-500" />
              Include the full URL (e.g., https://www.example.com)
            </p>
          </div>
        </div>

        {/* Enhanced Contact Preview */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
          <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Live Contact Preview
          </h4>
          <p className="text-sm text-blue-800 mb-4">
            This is how your contact information will appear on quotes, invoices, and customer communications.
          </p>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.name && (
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">{data.name}</span>
                </div>
              )}
              {data.phone_number && (
                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">{displayPhone}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">{data.email}</span>
                </div>
              )}
              {data.website && (
                <div className="flex items-center space-x-3 p-2 bg-cyan-50 rounded-lg">
                  <GlobeAltIcon className="w-5 h-5 text-cyan-600" />
                  <span className="font-medium text-cyan-900">{data.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
