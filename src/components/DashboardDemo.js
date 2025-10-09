import React from 'react';
import {
  ExpensesTile,
  NotificationSettingsTile,
  DocumentBackupTile,
  CrmLeadsTile,
  AutomationRulesTile,
  CalendarSyncButton
} from './ConditionalTiles';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Static tiles that are always shown
const StaticTile = ({ title, description, icon: Icon, children, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

const DashboardDemo = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center gap-3">
          <CalendarSyncButton />
        </div>
      </div>

      {/* Integration Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Integration Demo Active</h4>
            <p className="text-sm text-blue-800 mt-1">
              This dashboard demonstrates dynamic tile visibility based on integration settings. 
              Go to <strong>Settings → Integration Controls</strong> to toggle features on/off and see tiles appear/disappear.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StaticTile
          title="Total Revenue"
          description="This month"
          icon={ChartBarIcon}
          color="green"
        >
          <div className="text-2xl font-bold text-gray-900">$24,580</div>
          <div className="text-sm text-green-600 mt-1">+12% from last month</div>
        </StaticTile>

        <StaticTile
          title="Active Jobs"
          description="In progress"
          icon={ClockIcon}
          color="blue"
        >
          <div className="text-2xl font-bold text-gray-900">18</div>
          <div className="text-sm text-blue-600 mt-1">3 scheduled today</div>
        </StaticTile>

        <StaticTile
          title="Completed Jobs"
          description="This month"
          icon={CheckCircleIcon}
          color="green"
        >
          <div className="text-2xl font-bold text-gray-900">47</div>
          <div className="text-sm text-green-600 mt-1">95% completion rate</div>
        </StaticTile>

        <StaticTile
          title="Pending Quotes"
          description="Awaiting response"
          icon={ExclamationTriangleIcon}
          color="yellow"
        >
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-yellow-600 mt-1">Average: 3 days</div>
        </StaticTile>
      </div>

      {/* Dynamic Integration Tiles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* These tiles show/hide based on integration settings */}
          <ExpensesTile />
          <NotificationSettingsTile />
          <DocumentBackupTile />
          <CrmLeadsTile />
          <AutomationRulesTile />
          
          {/* Always visible tile for comparison */}
          <StaticTile
            title="Reports"
            description="Business analytics and insights"
            icon={ChartBarIcon}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Monthly Report</span>
                <span className="text-sm text-gray-600">Ready</span>
              </div>
              <button className="w-full btn-primary text-sm py-2">
                View Reports
              </button>
            </div>
          </StaticTile>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Test Integration Toggles</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
            <div>Go to <strong>Settings → Integration Controls</strong></div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
            <div>Toggle any integration on/off (e.g., QuickBooks, SMS, CRM)</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
            <div>Return to Dashboard to see tiles appear/disappear instantly</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
            <div>Disabled tiles show "Integration Required" with enable links</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;
