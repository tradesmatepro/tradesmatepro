import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  SparklesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const BasicInfoCard = ({ data, setData, errors }) => {
  const [taglineCharCount, setTaglineCharCount] = useState(data.tagline?.length || 0);
  const maxTaglineLength = 100;

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'tagline') {
      setTaglineCharCount(value.length);
    }
  };

  const taglineExamples = [
    "Professional plumbing services you can trust",
    "Expert electrical solutions for your home",
    "Quality HVAC services since 1995",
    "Your local handyman for all repairs",
    "Reliable roofing contractors",
    "Professional landscaping & maintenance"
  ];

  const getRandomExample = () => {
    return taglineExamples[Math.floor(Math.random() * taglineExamples.length)];
  };

  const insertExample = () => {
    const example = getRandomExample();
    handleInputChange('tagline', example);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <p className="text-sm text-gray-600">Your company name and tagline</p>
          </div>
          {data.name && data.tagline && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
              <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                This appears on all documents
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-lg font-medium ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                }`}
                placeholder="Enter your company name"
              />
              <BuildingOfficeIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Company Tagline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Company Tagline
                <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                  <InformationCircleIcon className="w-3 h-3 mr-1" />
                  Describes what you do
                </span>
              </label>
              <span className={`text-xs ${taglineCharCount > maxTaglineLength ? 'text-red-500' : 'text-gray-500'}`}>
                {taglineCharCount}/{maxTaglineLength}
              </span>
            </div>
            
            <div className="relative">
              <textarea
                value={data.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                maxLength={maxTaglineLength}
                rows={2}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                  errors.tagline ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                }`}
                placeholder="A brief description of your services..."
              />
              <SparklesIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            
            {errors.tagline && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.tagline}
              </p>
            )}

            {/* Tagline Helper */}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={insertExample}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <LightBulbIcon className="w-3 h-3 mr-1" />
                Get inspiration
              </button>
              <p className="text-xs text-gray-500">
                Keep it short and memorable
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Live Preview
          </h4>
          
          <div className="space-y-3">
            {/* Business Card Style */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {data.name || 'Your Company Name'}
                </h3>
                <p className="text-gray-600 italic">
                  {data.tagline || 'Your compelling tagline will appear here'}
                </p>
              </div>
            </div>

            {/* Quote Header Style */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {data.name || 'Your Company Name'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.tagline || 'Your tagline'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use your legal business name for official documents</li>
            <li>• Keep your tagline under 10 words for maximum impact</li>
            <li>• Focus on what makes you unique or trustworthy</li>
            <li>• Avoid jargon - use language your customers understand</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoCard;
