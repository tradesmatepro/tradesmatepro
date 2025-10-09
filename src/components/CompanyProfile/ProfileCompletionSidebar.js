import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ProfileCompletionSidebar = ({ completionData, companyData }) => {
  const getCompletionColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 70) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getCompletionMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Your profile is nearly complete.';
    if (percentage >= 70) return 'Good progress! A few more details to go.';
    if (percentage >= 50) return 'You\'re halfway there! Keep going.';
    return 'Let\'s get started on your profile.';
  };

  const getCompletionIcon = (percentage) => {
    if (percentage >= 90) return <TrophyIcon className="w-5 h-5" />;
    if (percentage >= 70) return <StarIcon className="w-5 h-5" />;
    return <ExclamationTriangleIcon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionData.percentage / 100)}`}
                  className={getCompletionColor(completionData.percentage)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getCompletionColor(completionData.percentage)}`}>
                  {completionData.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Completion Message */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center space-x-2 ${getCompletionColor(completionData.percentage)} mb-2`}>
              {getCompletionIcon(completionData.percentage)}
              <span className="font-medium">
                {completionData.percentage >= 90 ? 'Nearly Complete!' :
                 completionData.percentage >= 70 ? 'Good Progress!' :
                 completionData.percentage >= 50 ? 'Halfway There!' :
                 'Getting Started'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {getCompletionMessage(completionData.percentage)}
            </p>
          </div>

          {/* Completed Fields */}
          {completionData.completedFields.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Completed ({completionData.completedFields.length})
              </h4>
              <div className="space-y-2">
                {completionData.completedFields.slice(0, 5).map((field, index) => (
                  <div key={index} className="flex items-center text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    {field}
                  </div>
                ))}
                {completionData.completedFields.length > 5 && (
                  <div className="text-sm text-gray-500">
                    +{completionData.completedFields.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Missing Fields */}
          {completionData.missingFields.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-2" />
                Missing ({completionData.missingFields.length})
              </h4>
              <div className="space-y-2">
                {completionData.missingFields.slice(0, 3).map((field, index) => (
                  <div key={index} className="flex items-center text-sm text-yellow-700">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                    {field}
                  </div>
                ))}
                {completionData.missingFields.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{completionData.missingFields.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Card */}
      {completionData.suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Suggestions</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {completionData.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <LightBulbIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Benefits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Profile Benefits</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Professional appearance on quotes and invoices</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Improved customer trust and credibility</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Better search visibility and local presence</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Streamlined business operations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionSidebar;
