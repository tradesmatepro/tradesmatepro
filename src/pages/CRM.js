import React from 'react';
import PageHeader from '../components/Common/PageHeader';
import { useIntegrations } from '../contexts/IntegrationsContext';
import {
  UserGroupIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const CRM = () => {
  const { isCrmEnabled } = useIntegrations();

  if (!isCrmEnabled()) {
    return (
      <div className="p-6">
        <PageHeader
          title="CRM"
          subtitle="Manage leads, contacts, and customer relationships"
        />
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900">CRM Integration Required</h3>
              <p className="text-yellow-800 mt-2">
                This page requires CRM integration to be enabled. Enable it in Settings to access lead management and customer relationship features.
              </p>
              <button
                onClick={() => window.location.href = '/settings?tab=toggles&highlight=crm'}
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Enable CRM Integration
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
        title="CRM"
        subtitle="Manage leads, contacts, and customer relationships"
      />

      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Qualified</h3>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Converted</h3>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-bold text-gray-900">42%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Add Lead
        </button>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
          <EyeIcon className="w-4 h-4" />
          View Pipeline
        </button>
      </div>

      {/* Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <h3 className="font-semibold text-yellow-800">New Leads (12)</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Sarah Wilson</h4>
              <p className="text-sm text-gray-600">Kitchen remodel inquiry</p>
              <p className="text-sm text-green-600 font-medium">Est. $15,000</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Mike Chen</h4>
              <p className="text-sm text-gray-600">Bathroom renovation</p>
              <p className="text-sm text-green-600 font-medium">Est. $8,500</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Lisa Rodriguez</h4>
              <p className="text-sm text-gray-600">HVAC replacement</p>
              <p className="text-sm text-green-600 font-medium">Est. $12,000</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="font-semibold text-blue-800">Qualified (8)</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">John Martinez</h4>
              <p className="text-sm text-gray-600">Deck construction</p>
              <p className="text-sm text-green-600 font-medium">Est. $22,000</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Emma Thompson</h4>
              <p className="text-sm text-gray-600">Electrical upgrade</p>
              <p className="text-sm text-green-600 font-medium">Est. $6,800</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">David Park</h4>
              <p className="text-sm text-gray-600">Plumbing repair</p>
              <p className="text-sm text-green-600 font-medium">Est. $3,200</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h3 className="font-semibold text-green-800">Converted (5)</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Robert Johnson</h4>
              <p className="text-sm text-gray-600">Roof replacement</p>
              <p className="text-sm text-green-600 font-medium">$18,500</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Maria Garcia</h4>
              <p className="text-sm text-gray-600">Flooring installation</p>
              <p className="text-sm text-green-600 font-medium">$9,200</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Tom Anderson</h4>
              <p className="text-sm text-gray-600">Painting project</p>
              <p className="text-sm text-green-600 font-medium">$4,800</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent CRM Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">New lead: Sarah Wilson</p>
                <p className="text-sm text-gray-500">Kitchen remodel inquiry from website form</p>
              </div>
              <span className="text-sm text-gray-500">10 min ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Lead qualified: Mike Chen</p>
                <p className="text-sm text-gray-500">Moved to qualified stage after phone call</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Lead converted: Robert Johnson</p>
                <p className="text-sm text-gray-500">Signed contract for roof replacement project</p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            CRM Integration Active - HubSpot connected, lead sync enabled
          </span>
        </div>
      </div>
    </div>
  );
};

export default CRM;
