import React from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import {
  CurrencyDollarIcon,
  BellIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  BoltIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Base tile component for consistent styling
const BaseTile = ({ title, description, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary-100 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

// Disabled tile component for when integration is off
const DisabledTile = ({ title, description, icon: Icon, integrationName, onEnable }) => (
  <BaseTile 
    title={title} 
    description={description} 
    icon={Icon}
    className="opacity-60 border-dashed"
  >
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-gray-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700">Integration Required</h4>
          <p className="text-sm text-gray-600 mt-1">
            Enable {integrationName} integration in Settings to use this feature.
          </p>
          <button
            onClick={onEnable}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Enable Integration →
          </button>
        </div>
      </div>
    </div>
  </BaseTile>
);

// QuickBooks Expenses Tile
export const ExpensesTile = () => {
  const { shouldShowExpensesTile } = useIntegrations();

  const handleEnableQuickBooks = () => {
    // Navigate to settings integrations tab
    window.location.href = '/settings?tab=integrations';
  };

  if (!shouldShowExpensesTile()) {
    return (
      <DisabledTile
        title="Expenses"
        description="Track and sync business expenses"
        icon={CurrencyDollarIcon}
        integrationName="QuickBooks"
        onEnable={handleEnableQuickBooks}
      />
    );
  }

  return (
    <BaseTile
      title="Expenses"
      description="Track and sync business expenses"
      icon={CurrencyDollarIcon}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">This Month</span>
          <span className="text-lg font-bold text-gray-900">$0.00</span>
        </div>
        <div className="text-sm text-gray-500 mb-3">
          No expenses tracked yet. Start adding expenses to see your spending.
        </div>
        <div className="flex gap-2">
          <button className="flex-1 btn-primary text-sm py-2">
            Add Expense
          </button>
          <button className="flex-1 btn-secondary text-sm py-2">
            Sync Ledger
          </button>
        </div>
      </div>
    </BaseTile>
  );
};

// SMS Notification Settings Tile
export const NotificationSettingsTile = () => {
  const { shouldShowNotificationSettings } = useIntegrations();

  const handleEnableSms = () => {
    window.location.href = '/settings?tab=integrations';
  };

  if (!shouldShowNotificationSettings()) {
    return (
      <DisabledTile
        title="Notification Settings"
        description="Manage SMS and email notifications"
        icon={BellIcon}
        integrationName="SMS"
        onEnable={handleEnableSms}
      />
    );
  }

  return (
    <BaseTile
      title="Notification Settings"
      description="Manage SMS and email notifications"
      icon={BellIcon}
    >
      <div className="space-y-3">
        <div className="text-sm text-gray-500 mb-3">
          No notifications configured yet. Set up SMS and email templates to start communicating with customers.
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">SMS Reminders</span>
          <div className="w-10 h-6 bg-gray-300 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Email Updates</span>
          <div className="w-10 h-6 bg-gray-300 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <button className="w-full btn-secondary text-sm py-2 mt-3">
          Configure Templates
        </button>
      </div>
    </BaseTile>
  );
};

// Calendar Sync Component (for Schedule page)
export const CalendarSyncButton = () => {
  const { shouldShowCalendarSync } = useIntegrations();

  const handleEnableCalendar = () => {
    window.location.href = '/settings?tab=integrations';
  };

  if (!shouldShowCalendarSync()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <span className="text-sm text-gray-600">Calendar sync unavailable</span>
            <button
              onClick={handleEnableCalendar}
              className="ml-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Enable Integration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
      <CalendarIcon className="w-4 h-4" />
      Sync Calendar
    </button>
  );
};

// Document Backup Tile
export const DocumentBackupTile = () => {
  const { shouldShowDocumentBackup } = useIntegrations();

  const handleEnableCloudStorage = () => {
    window.location.href = '/settings?tab=integrations';
  };

  if (!shouldShowDocumentBackup()) {
    return (
      <DisabledTile
        title="Document Backup"
        description="Automatic cloud backup for photos and files"
        icon={CloudArrowUpIcon}
        integrationName="Cloud Storage"
        onEnable={handleEnableCloudStorage}
      />
    );
  }

  return (
    <BaseTile
      title="Document Backup"
      description="Automatic cloud backup for photos and files"
      icon={CloudArrowUpIcon}
    >
      <div className="space-y-3">
        <div className="text-sm text-gray-500 mb-3">
          No backups configured yet. Enable automatic backup to protect your job photos and documents.
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Last Backup</span>
          <span className="text-sm text-gray-600">Never</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-600">Photos</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-600">Documents</div>
          </div>
        </div>
        <button className="w-full btn-secondary text-sm py-2">
          Setup Backup
        </button>
      </div>
    </BaseTile>
  );
};

// CRM Leads Tile
export const CrmLeadsTile = () => {
  const { shouldShowCrmLeads } = useIntegrations();

  const handleEnableCrm = () => {
    window.location.href = '/settings?tab=integrations';
  };

  if (!shouldShowCrmLeads()) {
    return (
      <DisabledTile
        title="CRM / Leads"
        description="Manage leads and customer relationships"
        icon={UserGroupIcon}
        integrationName="CRM"
        onEnable={handleEnableCrm}
      />
    );
  }

  return (
    <BaseTile
      title="CRM / Leads"
      description="Manage leads and customer relationships"
      icon={UserGroupIcon}
    >
      <div className="space-y-3">
        <div className="text-sm text-gray-500 mb-3">
          No leads tracked yet. Start managing your sales pipeline to track potential customers.
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-600">New</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-600">Qualified</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">0</div>
            <div className="text-gray-600">Converted</div>
          </div>
        </div>
        <button className="w-full btn-primary text-sm py-2">
          Setup CRM
        </button>
      </div>
    </BaseTile>
  );
};

// Automation Rules Tile
export const AutomationRulesTile = () => {
  const { shouldShowAutomationRules } = useIntegrations();

  const handleEnableZapier = () => {
    window.location.href = '/settings?tab=integrations';
  };

  if (!shouldShowAutomationRules()) {
    return (
      <DisabledTile
        title="Automation Rules"
        description="Workflow automation and triggers"
        icon={BoltIcon}
        integrationName="Zapier"
        onEnable={handleEnableZapier}
      />
    );
  }

  return (
    <BaseTile
      title="Automation Rules"
      description="Workflow automation and triggers"
      icon={BoltIcon}
    >
      <div className="space-y-3">
        <div className="text-sm text-gray-500 mb-3">
          No automation rules configured yet. Create workflows to save time on repetitive tasks.
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Active Rules</span>
          <span className="text-lg font-bold text-gray-900">0</span>
        </div>
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            No automation rules set up
          </div>
        </div>
        <button className="w-full btn-secondary text-sm py-2">
          <CogIcon className="w-4 h-4 inline mr-2" />
          Create Rules
        </button>
      </div>
    </BaseTile>
  );
};
