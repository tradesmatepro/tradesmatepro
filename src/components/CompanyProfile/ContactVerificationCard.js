import React, { useState } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ContactVerificationCard = ({ data, setData, errors, verificationStatus, setVerificationStatus }) => {
  const [verificationCodes, setVerificationCodes] = useState({
    email: '',
    phone: ''
  });
  const [verificationSteps, setVerificationSteps] = useState({
    email: 'idle', // idle, sending, sent, verifying, verified, failed
    phone: 'idle'
  });

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handlePhoneChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      handleInputChange('phone_number', cleaned);
    }
  };

  const sendVerificationCode = async (type) => {
    setVerificationSteps(prev => ({ ...prev, [type]: 'sending' }));
    
    // Simulate API call
    setTimeout(() => {
      setVerificationSteps(prev => ({ ...prev, [type]: 'sent' }));
    }, 1500);
  };

  const verifyCode = async (type) => {
    setVerificationSteps(prev => ({ ...prev, [type]: 'verifying' }));
    
    // Simulate verification
    setTimeout(() => {
      // Mock verification success
      if (verificationCodes[type] === '123456') {
        setVerificationStatus(prev => ({ ...prev, [type]: true }));
        setVerificationSteps(prev => ({ ...prev, [type]: 'verified' }));
      } else {
        setVerificationSteps(prev => ({ ...prev, [type]: 'failed' }));
        setTimeout(() => {
          setVerificationSteps(prev => ({ ...prev, [type]: 'sent' }));
        }, 2000);
      }
    }, 1000);
  };

  const handleCodeChange = (type, value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCodes(prev => ({ ...prev, [type]: cleaned }));
    
    // Auto-verify when 6 digits entered
    if (cleaned.length === 6) {
      verifyCode(type);
    }
  };

  const getStepButton = (type, contactValue) => {
    const step = verificationSteps[type];
    const isVerified = verificationStatus[type];
    
    if (isVerified) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Verified</span>
        </div>
      );
    }

    if (!contactValue) {
      return (
        <button
          disabled
          className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
        >
          Enter {type}
        </button>
      );
    }

    switch (step) {
      case 'idle':
        return (
          <button
            onClick={() => sendVerificationCode(type)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Verify {type}
          </button>
        );
      case 'sending':
        return (
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
          >
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Sending...
            </div>
          </button>
        );
      case 'sent':
      case 'verifying':
      case 'failed':
        return null; // Show code input instead
      default:
        return null;
    }
  };

  const getCodeInput = (type) => {
    const step = verificationSteps[type];
    const isVerified = verificationStatus[type];
    
    if (isVerified || !['sent', 'verifying', 'failed'].includes(step)) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Enter verification code
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={verificationCodes[type]}
            onChange={(e) => handleCodeChange(type, e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono ${
              step === 'failed' ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="123456"
            maxLength="6"
          />
          {step === 'verifying' && (
            <div className="flex items-center px-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {step === 'failed' && (
          <p className="text-sm text-red-600">Invalid code. Please try again.</p>
        )}
        <p className="text-xs text-gray-500">
          Check your {type} for a 6-digit verification code
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Contact Verification</h3>
            <p className="text-sm text-gray-600">Verify your contact details for trust badges</p>
          </div>
          {verificationStatus.email && verificationStatus.phone && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">All Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Email Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
              <span className="ml-2 inline-flex items-center text-xs text-orange-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                Used for customer communications
              </span>
            </label>
            
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder="company@example.com"
                />
                <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                {verificationStatus.email && (
                  <CheckCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                )}
              </div>
              {getStepButton('email', data.email)}
            </div>
            
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.email}
              </p>
            )}
            
            {getCodeInput('email')}
          </div>

          {/* Phone Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
              <span className="ml-2 inline-flex items-center text-xs text-orange-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                Primary contact number
              </span>
            </label>
            
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="tel"
                  value={formatPhoneNumber(data.phone_number)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.phone_number ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                  }`}
                  placeholder="(555) 123-4567"
                />
                <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                {verificationStatus.phone && (
                  <CheckCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />
                )}
              </div>
              {getStepButton('phone', data.phone_number)}
            </div>
            
            {errors.phone_number && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.phone_number}
              </p>
            )}
            
            {getCodeInput('phone')}
          </div>
        </div>

        {/* Verification Benefits */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            Verification Benefits
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• ✅ Green verified badges on your public profile</li>
            <li>• 📈 Increased customer trust and credibility</li>
            <li>• 🔒 Secure communication channels</li>
            <li>• 🎯 Better visibility in search results</li>
          </ul>
        </div>

        {/* Demo Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo:</strong> Use code <code className="bg-blue-200 px-1 rounded">123456</code> to verify
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactVerificationCard;
