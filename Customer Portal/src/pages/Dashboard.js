import React, { useState } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import PasswordSetup from '../components/PasswordSetup';
import {
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  PlusCircleIcon,
  LockClosedIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { customer } = useCustomer();
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showPasswordBanner, setShowPasswordBanner] = useState(true);
  return (
    <div className="space-y-6">
      {/* Password Setup Banner */}
      {customer?.needs_password_setup && showPasswordBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <LockClosedIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Secure Your Account
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Set up a password to secure your account and enable faster login in the future.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setShowPasswordSetup(true)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Set Up Password
                </button>
                <button
                  onClick={() => setShowPasswordBanner(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowPasswordBanner(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{customer?.name ? `, ${customer.name}` : ''}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your services</p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Jobs</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center mb-4">
            <div className="bg-primary-600 p-3 rounded-lg">
              <PlusCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Need Something Done?</h3>
              <p className="text-sm text-gray-600">Request service from your provider</p>
            </div>
          </div>
          <a href="/requests" className="btn-primary w-full text-center">
            Request Service
          </a>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600">Chat with your service provider</p>
            </div>
          </div>
          <a href="/messages" className="btn-secondary w-full text-center">
            View Messages
          </a>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="card-modern">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Services</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming services</h3>
            <p className="text-gray-500 mb-4">Your scheduled services will appear here</p>
            <a href="/requests" className="btn-primary">
              Schedule Service
            </a>
          </div>
        </div>
      </div>

      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <PasswordSetup
          onComplete={() => {
            setShowPasswordSetup(false);
            setShowPasswordBanner(false);
          }}
          onSkip={() => {
            setShowPasswordSetup(false);
            setShowPasswordBanner(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
