import React from 'react';
import PageHeader from '../components/Common/PageHeader';
import { useIntegrations } from '../contexts/IntegrationsContext';
import {
  BoltIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const Automation = () => {
  const { isZapierEnabled } = useIntegrations();

  if (!isZapierEnabled()) {
    return (
      <div className="p-6">
        <PageHeader
          title="Automation"
          subtitle="Workflow automation and triggers with Zapier"
        />
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900">Zapier Integration Required</h3>
              <p className="text-yellow-800 mt-2">
                This page requires Zapier integration to be enabled. Enable it in Settings to access workflow automation features.
              </p>
              <button
                onClick={() => window.location.href = '/settings?tab=toggles&highlight=zapier'}
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Enable Zapier Integration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Automation"
        subtitle="Workflow automation and triggers with Zapier"
      />

      {/* Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BoltIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Rules</h3>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <PlayIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Runs Today</h3>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
              <p className="text-2xl font-bold text-gray-900">98%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CogIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Time Saved</h3>
              <p className="text-2xl font-bold text-gray-900">12h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Create Rule
        </button>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
          <BoltIcon className="w-4 h-4" />
          Browse Templates
        </button>
      </div>

      {/* Active Automation Rules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Automation Rules</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Quote → Invoice Automation</h4>
                  <p className="text-sm text-gray-500">When quote is accepted, create invoice in QuickBooks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Active</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Customer Follow-up Emails</h4>
                  <p className="text-sm text-gray-500">Send follow-up email 3 days after job completion</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Active</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Lead Notification</h4>
                  <p className="text-sm text-gray-500">Send Slack notification when new lead is created</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Active</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Calendar Sync</h4>
                  <p className="text-sm text-gray-500">Create Google Calendar event when job is scheduled</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Active</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Photo Backup</h4>
                  <p className="text-sm text-gray-500">Upload job photos to Google Drive automatically</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Active</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Payment Reminders</h4>
                  <p className="text-sm text-gray-500">Send SMS reminder for overdue invoices</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-600 font-medium">Paused</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Automation Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Quote → Invoice automation triggered</p>
                <p className="text-sm text-gray-500">Created invoice INV-2024-015 for Smith Kitchen project</p>
              </div>
              <span className="text-sm text-gray-500">5 min ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <PlayIcon className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Follow-up email sent</p>
                <p className="text-sm text-gray-500">Sent to Sarah Johnson for completed bathroom renovation</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
              <BoltIcon className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Calendar event created</p>
                <p className="text-sm text-gray-500">Added HVAC installation to Google Calendar for tomorrow</p>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Zapier Integration Active - 6 automation rules running, 1000+ app connections available
          </span>
        </div>
      </div>
    </div>
  );
};

export default Automation;
