import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import { CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import SettingsDatabasePanel from '../components/SettingsDatabasePanel';
import { CompanySettingsTab, RateSettingsTab, BusinessSettingsTab, DocumentSettingsTab, IntegrationsTab, Alert, AppearanceSettingsTab } from '../components/SettingsUI';
import SchedulingSettingsTab from '../components/SchedulingSettingsTab';
import NotificationsSettingsTab from '../components/NotificationsSettingsTab';
import SecuritySettingsTab from '../components/SecuritySettingsTab';
import RatesPricingTab from '../components/RatesPricingTab';
import InvoicingSettingsTab from '../components/InvoicingSettingsTab';
import CompanyProfileSettingsTab from '../components/CompanyProfileSettingsTab';
import DocumentTemplatesTab from '../components/DocumentTemplatesTab';
import ServiceTags from './Settings/ServiceTags';
import ApprovalsSettingsTab from '../components/Settings/ApprovalsSettingsTab';
import RateCards from './Settings/RateCards';
import MarketplaceSettings from '../components/Settings/MarketplaceSettings';
import QuoteAcceptanceSettingsTab from '../components/Settings/QuoteAcceptanceSettingsTab';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  LinkIcon,
  CalendarDaysIcon,
  ServerStackIcon,
  CogIcon,
  TagIcon,
  ShoppingBagIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

// Enhanced Coming Soon Card Component
const ComingSoonCard = ({ title, badge, tier }) => {
  const getFeatureInfo = (title, tier) => {
    const features = {
      'Customer Portal': {
        icon: '',
        description: 'Customer portal functionality is coming soon.'
      },
      'Data & Storage': {
        icon: '',
        description: 'Advanced data management features are coming soon.'
      },
      'AI & Automation': {
        icon: '',
        description: 'AI and automation features are coming soon.'
      },
      'Audit Logs': {
        icon: '',
        description: 'Audit logging functionality is coming soon.'
      }
    };

    return features[title] || {
      icon: '',
      description: 'This feature is coming soon.'
    };
  };

  const featureInfo = getFeatureInfo(title, tier);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">{featureInfo.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          {badge && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              tier === 'pro' ? 'bg-purple-100 text-purple-800' :
              tier === 'enterprise' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {badge}
            </span>
          )}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {featureInfo.description}
          </p>
        </div>

        {/* Removed fake benefits list */}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">In Development</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Overview Component
const SettingsOverview = ({ onNavigate }) => {
  const quickActions = [
    { id: 'company', name: 'Update Company Info', icon: BuildingOfficeIcon, description: 'Company name, address, and branding' },
    { id: 'rates', name: 'Manage Rates', icon: CurrencyDollarIcon, description: 'Employee hourly rates and pricing' },
    { id: 'invoicing', name: 'Invoice Settings', icon: DocumentTextIcon, description: 'Invoice templates and terms' },
    { id: 'security', name: 'Security Settings', icon: ShieldCheckIcon, description: 'Access control and permissions' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Configuration</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Customize your TradeMate Pro experience. Configure company settings, manage user permissions,
          and integrate with your favorite tools.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <div key={action.id} onClick={() => onNavigate(action.id)} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 rounded-lg p-3 group-hover:bg-blue-100 transition-colors">
                  <action.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{action.name}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Categories Overview */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Settings Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Company & Business', count: 3, icon: BuildingOfficeIcon, color: 'blue' },
            { name: 'Operations', count: 3, icon: CogIcon, color: 'green' },
            { name: 'System & Security', count: 3, icon: ShieldCheckIcon, color: 'red' },
            { name: 'Advanced Features', count: 4, icon: ServerStackIcon, color: 'purple' }
          ].map((category) => (
            <div key={category.name} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className={`w-12 h-12 bg-${category.color}-50 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <category.icon className={`w-6 h-6 text-${category.color}-600`} />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{category.name}</h4>
              <p className="text-sm text-gray-500">{category.count} settings</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h4 className="font-medium text-green-900">System Status: All Good</h4>
            <p className="text-sm text-green-700">All systems are operational and settings are properly configured.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ FIX: Auto-scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Handle URL parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const {
    loading,
    alert,
    companySettings,
    rateSettings,
    businessSettings,
    documentSettings,
    setCompanySettings,
    setRateSettings,
    setBusinessSettings,
    setDocumentSettings,
    saveSettings,
    invoicingSettings,
    setInvoicingSettings
  } = SettingsDatabasePanel();

  // Organized settings categories for better UX
  const settingsCategories = [
    {
      name: 'Overview',
      tabs: [
        { id: 'overview', name: 'Settings Overview', icon: CogIcon, description: 'Quick access to common settings' }
      ]
    },
    {
      name: 'Company & Business',
      tabs: [
        { id: 'company', name: 'Company Profile', icon: BuildingOfficeIcon, description: 'Basic company information and branding' },
        { id: 'business', name: 'Business Settings', icon: UserGroupIcon, description: 'Operational preferences and policies' },
        { id: 'service-tags', name: 'Service Tags', icon: TagIcon, description: 'Define what services your company provides' },
        { id: 'rate-cards', name: 'Rate Cards', icon: CurrencyDollarIcon, description: 'Service pricing and rate book management' },
        { id: 'rates', name: 'Rates & Pricing', icon: CurrencyDollarIcon, description: 'Employee rates and pricing structure' }
      ]
    },
    {
      name: 'Operations',
      tabs: [
        { id: 'scheduling', name: 'Smart Scheduling', icon: CalendarDaysIcon, description: 'Automated scheduling preferences' },
        { id: 'marketplace', name: 'Marketplace Settings', icon: ShoppingBagIcon, description: 'Emergency jobs and auto-accept rules' },
        { id: 'quote-acceptance', name: 'Quote Acceptance', icon: CheckCircleIcon, description: 'Signature, deposits, scheduling workflow' },
        { id: 'invoicing', name: 'Invoicing', icon: CurrencyDollarIcon, description: 'Invoice templates and billing settings' },
        { id: 'documents', name: 'Document Templates', icon: DocumentTextIcon, description: 'Customize document templates' },
        { id: 'approvals', name: 'Org & Approvals', icon: UserGroupIcon, description: 'Org tree, amount thresholds, escalation' }
      ]
    },
    {
      name: 'System & Security',
      tabs: [
        { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon, description: 'Light or dark theme' },
        { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Email and system notification preferences' },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon, description: 'Access control and security settings' },
        { id: 'integrations', name: 'Integrations', icon: LinkIcon, description: 'Third-party service connections' }
      ]
    },
    {
      name: 'Advanced Features',
      tabs: [
        { id: 'customer-portal', name: 'Customer Portal', icon: UserGroupIcon, badge: 'Coming Soon', description: 'Client self-service portal' },
        { id: 'data-storage', name: 'Data & Storage', icon: ServerStackIcon, badge: 'Coming Soon', description: 'Data management and backup' },
        { id: 'ai-automation', name: 'AI & Automation', icon: CogIcon, badge: 'Pro', tier: 'pro', description: 'Intelligent automation features' },
        { id: 'audit-logs', name: 'Audit Logs', icon: DocumentTextIcon, badge: 'Enterprise', tier: 'enterprise', description: 'System activity tracking' }
      ]
    }
  ];

  // Flatten tabs for backward compatibility
  const tabs = settingsCategories.flatMap(category => category.tabs);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SettingsOverview onNavigate={setActiveTab} />;
      case 'company':
        return <CompanyProfileSettingsTab />;
      case 'rates':
        return <RatesPricingTab />;
      case 'business':
        return <BusinessSettingsTab />;
      case 'service-tags':
        return <ServiceTags />;
      case 'rate-cards':
        return <RateCards />;
      case 'scheduling':
        return <SchedulingSettingsTab />;
      case 'marketplace':
        return <MarketplaceSettings />;
      case 'quote-acceptance':
        return <QuoteAcceptanceSettingsTab />;
      case 'invoicing':
        return <InvoicingSettingsTab />;
      case 'documents':
        return <DocumentTemplatesTab />;
      case 'approvals':
        return <ApprovalsSettingsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'notifications':
        return <NotificationsSettingsTab />;
      case 'security':
        return <SecuritySettingsTab />;
      case 'appearance':
        return <AppearanceSettingsTab />;
      case 'customer-portal':
      case 'data-storage':
        return <ComingSoonCard title={tabs.find(t => t.id === activeTab)?.name} badge={tabs.find(t => t.id === activeTab)?.badge} />;
      case 'ai-automation':
        return <ComingSoonCard title="AI & Automation" badge="Pro Feature" tier="pro" />;
      case 'audit-logs':
        return <ComingSoonCard title="Audit Logs" badge="Enterprise Feature" tier="enterprise" />;
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">Settings section coming soon</div>
            <div className="text-sm text-gray-400">This feature will be implemented in a future update</div>
          </div>
        );
    }
  };

  const totalSettings = settingsCategories.reduce((sum, cat) => sum + cat.tabs.length, 0);
  const configuredSettings = settingsCategories.reduce((sum, cat) =>
    sum + cat.tabs.filter(tab => tab.id === 'company' || tab.id === 'users' || tab.id === 'notifications').length, 0);

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="System Settings"
        subtitle="Configure and customize your TradeMate Pro experience"
        icon={CogIcon}
        gradient="gray"
        stats={[
          { label: 'Settings', value: totalSettings },
          { label: 'Configured', value: configuredSettings },
          { label: 'Categories', value: settingsCategories.length }
        ]}
        actions={[]}
      />

      {/* Settings Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Total Settings"
          value={totalSettings}
          icon={CogIcon}
          gradient="indigo"
          onClick={() => setActiveTab('company')}
          trend={[45, 52, 48, 61, 55, 67, totalSettings]}
        />

        <ModernStatCard
          title="Configured"
          value={configuredSettings}
          icon={CheckCircleIcon}
          gradient="green"
          change="+5"
          changeType="increase"
          onClick={() => setActiveTab('company')}
          trend={[25, 28, 32, 35, 38, 42, configuredSettings]}
        />

        <ModernStatCard
          title="Security Level"
          value="High"
          icon={ShieldCheckIcon}
          gradient="blue"
          onClick={() => setActiveTab('security')}
          trend={[95, 96, 97, 98, 97, 98, 98]}
        />

        <ModernStatCard
          title="System Health"
          value="98%"
          icon={ChartBarIcon}
          gradient="purple"
          change="+2%"
          changeType="increase"
          onClick={() => setActiveTab('database')}
          trend={[92, 94, 96, 95, 97, 98, 98]}
        />
      </div>

      {/* Alert */}
      <Alert alert={alert} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Enhanced Settings Navigation */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Settings Categories</h3>
            </div>
            <nav className="p-2">
              {settingsCategories.map((category, categoryIndex) => (
                <div key={category.name} className={categoryIndex > 0 ? 'mt-6' : ''}>
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {category.name}
                    </h4>
                  </div>
                  <div className="space-y-1">
                    {category.tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-start justify-between px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <tab.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{tab.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {tab.description}
                            </div>
                          </div>
                        </div>
                        {tab.badge && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                            tab.tier === 'pro'
                              ? 'bg-purple-100 text-purple-700'
                              : tab.tier === 'enterprise'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Enhanced Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Content Header with Breadcrumb */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span>Settings</span>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">
                      {tabs.find(tab => tab.id === activeTab)?.name || 'Unknown'}
                    </span>
                  </nav>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name || 'Settings'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {tabs.find(tab => tab.id === activeTab)?.description || 'Configure your system settings'}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  {/* Show save button for implemented tabs that need it */}
                  {['company', 'business', 'rates', 'invoicing'].includes(activeTab) && (
                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <ShieldCheckIcon className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
