import React from 'react';
import {
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const OnboardingWelcome = ({ onStartOnboarding, onSkip }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <RocketLaunchIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to TradeMate Pro!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlike ServiceTitan or Jobber, we won't overwhelm you with complexity. 
            Get your field service business running in minutes, not months.
          </p>
        </div>

        {/* Comparison with competitors */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Why TradeMate Pro is Different
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ServiceTitan */}
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-red-600 font-medium mb-2">ServiceTitan</div>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Weeks to months setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>$300+ per user/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Overwhelming complexity</span>
                </div>
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Poor support during setup</span>
                </div>
              </div>
            </div>

            {/* Jobber */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-yellow-600 font-medium mb-2">Jobber</div>
              <div className="space-y-2 text-sm text-yellow-700">
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Limited customization</span>
                </div>
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Basic reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Expensive add-ons</span>
                </div>
                <div className="flex items-center gap-2">
                  <XMarkIcon className="w-4 h-4" />
                  <span>Slow feature updates</span>
                </div>
              </div>
            </div>

            {/* TradeMate Pro */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-green-600 font-medium mb-2">TradeMate Pro</div>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>5-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Better value pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Simple yet powerful</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Live chat support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup options */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Choose Your Setup Experience
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Start */}
            <div className="border-2 border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                 onClick={() => onStartOnboarding('quick')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Quick Start</h3>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>~2 minutes</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Perfect for getting started immediately. Just the essentials: company info, 
                one service, and you're ready to create your first quote.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Company basics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>One service setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Sample quote created</span>
                </div>
              </div>
            </div>

            {/* Complete Setup */}
            <div className="border-2 border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors cursor-pointer"
                 onClick={() => onStartOnboarding('complete')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Complete Setup</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>~5 minutes</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Full configuration with team setup, business preferences, financial settings, 
                and more. Still faster than any competitor.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>All 6 setup steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Team member invites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Full business configuration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features highlight */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            What Makes Our Setup Special
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Auto-Save Progress</h3>
              <p className="text-sm text-gray-600">
                Never lose your setup progress. We automatically save every 30 seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Live Help Available</h3>
              <p className="text-sm text-gray-600">
                Get stuck? Chat with our team instantly. No waiting for callbacks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Sample Data Included</h3>
              <p className="text-sm text-gray-600">
                See how everything works with pre-loaded sample customers and quotes.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="text-center">
          <div className="space-y-4">
            <div>
              <button
                onClick={() => onStartOnboarding('quick')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                <RocketLaunchIcon className="w-6 h-6" />
                Start Quick Setup (2 min)
              </button>
            </div>
            
            <div>
              <button
                onClick={() => onStartOnboarding('complete')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Complete Setup (5 min)
              </button>
            </div>
            
            <div>
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip setup for now
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            💡 You can always complete the full setup later from Settings
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
