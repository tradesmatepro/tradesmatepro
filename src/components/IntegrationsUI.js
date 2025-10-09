import React, { useState, useEffect } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { useUser } from '../contexts/UserContext';
import IntegrationDrawer from './IntegrationDrawer';
import { FEATURES } from '../utils/features';
import GoogleCalendarService from '../services/GoogleCalendarService';
import {
  CurrencyDollarIcon,
  BellIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  MapIcon,
  DocumentTextIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Supabase configuration
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

// Integration data that matches our toggle system
const INTEGRATIONS = [
  {
    key: 'enableQuickbooks',
    id: 'quickbooks',
    name: 'QuickBooks Integration',
    description: 'Sync invoices, payments, and financial data with QuickBooks Online.',
    category: 'Accounting',
    icon: '💰',
    iconComponent: CurrencyDollarIcon,
    features: ['Invoice sync', 'Payment tracking', 'Expense management', 'Tax reporting'],
    dashboardFeatures: ['Expenses tile', 'Sync Ledger button', 'Financial reports']
  },
  {
    key: 'enableSms',
    id: 'twilio',
    name: 'SMS Notifications',
    description: 'Send SMS notifications to customers for appointments and updates.',
    category: 'Communication',
    icon: '📱',
    iconComponent: BellIcon,
    features: ['Appointment reminders', 'Job updates', 'Quote notifications', 'Payment reminders'],
    dashboardFeatures: ['Notification Settings tile', 'SMS templates', 'Customer communication']
  },
  {
    key: 'enableGoogleCalendar',
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync job schedules and appointments with Google Calendar.',
    category: 'Scheduling',
    icon: '📅',
    iconComponent: CalendarIcon,
    features: ['Calendar sync', 'Appointment scheduling', 'Team calendars', 'Reminder notifications'],
    dashboardFeatures: ['Sync Calendar button', 'Schedule integration', 'Team availability']
  },
  {
    key: 'enableCloudStorage',
    id: 'cloud_storage',
    name: 'Cloud Storage',
    description: 'Automatically backup job photos and documents to cloud storage.',
    category: 'Storage',
    icon: '☁️',
    iconComponent: CloudArrowUpIcon,
    features: ['Photo backup', 'Document storage', 'Team sharing', 'Version control'],
    dashboardFeatures: ['Document Backup tile', 'Photo gallery', 'File management']
  },
  {
    key: 'enableCrm',
    id: 'crm',
    name: 'CRM Integration',
    description: 'Manage leads, contacts, and customer relationships.',
    category: 'CRM',
    icon: '👥',
    iconComponent: UserGroupIcon,
    features: ['Lead management', 'Contact sync', 'Sales pipeline', 'Customer history'],
    dashboardFeatures: ['CRM / Leads tile', 'Customer insights', 'Sales tracking']
  },
  {
    key: 'enableZapier',
    id: 'zapier',
    name: 'Zapier Automation',
    description: 'Connect with 1000+ apps for workflow automation.',
    category: 'Automation',
    icon: '⚡',
    iconComponent: BoltIcon,
    features: ['Workflow automation', 'Custom triggers', 'Multi-app connections', 'Data sync'],
    dashboardFeatures: ['Automation Rules tile', 'Workflow builder', 'Integration hub']
  },
  {
    key: 'enableStripe',
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Accept direct invoice payments from your app with Stripe.',
    category: 'Payments',
    icon: '💳',
    iconComponent: CreditCardIcon,
    features: ['Direct invoice payments', 'Credit card processing', 'Payment tracking', 'Automated receipts'],
    dashboardFeatures: ['Payment status tiles', 'Revenue tracking', 'Payment history']
  },
  {
    key: 'enableSquare',
    id: 'square',
    name: 'Square Payments',
    description: 'Process payments and manage transactions with Square.',
    category: 'Payments',
    icon: '⬜',
    iconComponent: CreditCardIcon,
    features: ['Payment processing', 'Point of sale', 'Inventory sync', 'Transaction reports'],
    dashboardFeatures: ['Sales dashboard', 'Transaction tiles', 'Payment analytics']
  },
  {
    key: 'enableMailchimp',
    id: 'mailchimp',
    name: 'Mailchimp Marketing',
    description: 'Send follow-up campaigns and newsletters to customers.',
    category: 'Marketing',
    icon: '📧',
    iconComponent: EnvelopeIcon,
    features: ['Email campaigns', 'Customer segmentation', 'Automated follow-ups', 'Analytics'],
    dashboardFeatures: ['Campaign tiles', 'Subscriber tracking', 'Email performance']
  },
  {
    key: 'enableXero',
    id: 'xero',
    name: 'Xero Accounting',
    description: 'Alternative accounting integration for regions that prefer Xero over QuickBooks.',
    category: 'Accounting',
    icon: '📊',
    iconComponent: CurrencyDollarIcon,
    features: ['Invoice sync', 'Expense tracking', 'Financial reports', 'Tax management'],
    dashboardFeatures: ['Financial tiles', 'Expense tracking', 'Accounting reports']
  },
  {
    key: 'enableGoogleMaps',
    id: 'googlemaps',
    name: 'Google Maps Routing',
    description: 'Auto-route technicians to job sites with optimized directions.',
    category: 'Navigation',
    icon: '🗺️',
    iconComponent: MapIcon,
    features: ['Route optimization', 'Real-time traffic', 'Distance calculation', 'Location tracking'],
    dashboardFeatures: ['Route planning tiles', 'Map view', 'Travel time estimates']
  },
  {
    key: 'enableDocuSign',
    id: 'docusign',
    name: 'DocuSign E-signatures',
    description: 'Sign quotes and contracts digitally with DocuSign.',
    category: 'Documents',
    icon: '✍️',
    iconComponent: DocumentTextIcon,
    features: ['Digital signatures', 'Document templates', 'Signing workflows', 'Audit trails'],
    dashboardFeatures: ['Signature status tiles', 'Document tracking', 'Signing queue']
  },
  {
    key: 'enablePandaDoc',
    id: 'pandadoc',
    name: 'PandaDoc E-signatures',
    description: 'Alternative e-signature solution with document automation.',
    category: 'Documents',
    icon: '🐼',
    iconComponent: DocumentTextIcon,
    features: ['E-signatures', 'Document automation', 'Template library', 'Analytics'],
    dashboardFeatures: ['Document tiles', 'Signature tracking', 'Template management']
  },
  {
    key: 'enableClockify',
    id: 'clockify',
    name: 'Clockify Time Tracking',
    description: 'Track labor hours per job with detailed time reporting.',
    category: 'Time Tracking',
    icon: '⏰',
    iconComponent: ClockIcon,
    features: ['Time tracking', 'Project timers', 'Timesheet reports', 'Labor cost tracking'],
    dashboardFeatures: ['Time tracking tiles', 'Labor reports', 'Project timers']
  }
];

const CATEGORIES = ['All', 'Accounting', 'Communication', 'Scheduling', 'Storage', 'CRM', 'Automation', 'Payments', 'Marketing', 'Navigation', 'Documents', 'Time Tracking'];

export const IntegrationsTab = () => {
  const { integrations, updateIntegration } = useIntegrations();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});

  const filteredIntegrations = selectedCategory === 'All'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(integration => integration.category === selectedCategory);

  // Load connection status for all integrations
  useEffect(() => {
    loadConnectionStatus();
  }, [user?.company_id]);

  const loadConnectionStatus = async () => {
    if (!user?.company_id) return;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${user.company_id}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const tokens = await response.json();
        const status = {};

        tokens.forEach(token => {
          status[token.provider] = {
            connected: true,
            hasTokens: !!(token.access_token || token.extra),
            lastUpdated: token.created_at
          };
        });

        setConnectionStatus(status);
      }
    } catch (error) {
      console.error('Error loading connection status:', error);
    }
  };

  const handleToggle = (key) => {
    updateIntegration(key, !integrations[key]);
  };

  const handleTileClick = (integration) => {
    if (integrations[integration.key] && integration.id) {
      setSelectedIntegration(integration);
      setDrawerOpen(true);
    }
  };

  const handleDrawerSave = () => {
    loadConnectionStatus(); // Refresh connection status
    setDrawerOpen(false);
  };

  const getConnectionStatusBadge = (integration) => {
    if (!integrations[integration.key]) {
      return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Disabled</span>;
    }

    const status = connectionStatus[integration.id];
    if (!status) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Not Connected</span>;
    }

    if (status.connected && status.hasTokens) {
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Connected</span>;
    }

    return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Error</span>;
  };

  // Feature flag gate
  if (!FEATURES.INTEGRATIONS) {
    return <div className="p-4 text-gray-600">Integrations are disabled.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <BoltIcon className="w-5 h-5" />
          Integrations
        </h3>
        <p className="text-gray-600 mb-6">
          Enable integrations to unlock powerful features in your dashboard. Toggle any integration on/off to control which tools appear in your navigation and dashboard.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.key}
            className={`bg-white border border-gray-200 rounded-lg p-6 transition-all ${
              integrations[integration.key] && integration.id
                ? 'cursor-pointer hover:border-blue-300 hover:shadow-md'
                : ''
            }`}
            onClick={() => handleTileClick(integration)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <span className="text-2xl">{integration.icon || '🔧'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{integration.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        integrations[integration.key]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {integrations[integration.key] ? 'Enabled' : 'Disabled'}
                      </span>
                      {integrations[integration.key] && getConnectionStatusBadge(integration)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{integration.description}</p>

                  {integrations[integration.key] && integration.id && (
                    <p className="text-xs text-blue-600 font-medium">
                      Click to configure →
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Features:</h5>
                      <ul className="text-gray-600 space-y-1">
                        {integration.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Dashboard Elements:</h5>
                      <ul className="text-gray-600 space-y-1">
                        {integration.dashboardFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integrations[integration.key]}
                    onChange={() => handleToggle(integration.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Dynamic Dashboard</h4>
            <p className="text-sm text-blue-800 mt-1">
              Enabling integrations will show new tiles and menu items in your dashboard and navigation. 
              Disabling them will hide the corresponding functionality to keep your interface clean and focused.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Configuration Drawer */}
      <IntegrationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        integration={selectedIntegration}
        onSave={handleDrawerSave}
      />
    </div>
  );
};
