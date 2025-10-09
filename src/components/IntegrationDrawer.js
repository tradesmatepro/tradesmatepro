import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import IntegrationService from '../services/IntegrationService';
import GoogleCalendarService from '../services/GoogleCalendarService';

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const IntegrationDrawer = ({ isOpen, onClose, integration, onSave }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen && integration) {
      loadExistingTokens();
    }
  }, [isOpen, integration]);

  const loadExistingTokens = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/integration_tokens?company_id=eq.${user.company_id}&provider=eq.${integration.id}`,
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
        if (tokens.length > 0) {
          const token = tokens[0];
          setFormData({
            access_token: token.access_token || '',
            refresh_token: token.refresh_token || '',
            ...token.extra || {}
          });
        }
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare token data based on integration type
      let tokenData = {};

      switch (integration.id) {
        case 'stripe':
          tokenData = {
            access_token: formData.access_token,
            refresh_token: formData.refresh_token,
            extra: {
              stripe_user_id: formData.stripe_user_id,
              publishable_key: formData.publishable_key
            }
          };
          break;
        case 'twilio':
          tokenData = {
            access_token: formData.account_sid,
            extra: {
              auth_token: formData.auth_token,
              phone_number: formData.phone_number
            }
          };
          break;
        case 'google_calendar':
          tokenData = {
            access_token: formData.access_token,
            refresh_token: formData.refresh_token,
            extra: {
              calendar_id: formData.calendar_id
            }
          };
          break;
        case 'smtp':
          tokenData = {
            extra: {
              host: formData.host,
              port: formData.port,
              username: formData.username,
              password: formData.password,
              secure: formData.secure || false
            }
          };
          break;
        default:
          tokenData = { extra: formData };
      }

      await IntegrationService.saveTokens(user.company_id, integration.id, tokenData);

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      let result;
      if (integration.id === 'google_calendar') {
        result = await GoogleCalendarService.testConnection(user.company_id);
      } else {
        result = await IntegrationService.testConnection(integration.id, formData);
      }
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleOAuthFlow = (provider) => {
    if (provider === 'google') {
      GoogleCalendarService.initiateOAuth(user.company_id);
    } else {
      IntegrationService.initiateOAuthFlow(provider, user.company_id);
    }
  };

  const renderConfigurationForm = () => {
    if (!integration) return null;

    switch (integration.id) {
      case 'smtp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                name="host"
                value={formData.host || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  name="port"
                  value={formData.port || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="587"
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="secure"
                  checked={formData.secure || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, secure: e.target.checked }))}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Use SSL/TLS</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email password or app password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sender Email
              </label>
              <input
                type="email"
                name="sender_email"
                value={formData.sender_email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="noreply@yourcompany.com"
              />
            </div>

            {/* Test Email Section */}
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="test_email"
                  value={formData.test_email || ''}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test@example.com"
                />
                <button
                  onClick={async () => {
                    if (!formData.test_email) {
                      alert('Please enter a test email address');
                      return;
                    }
                    setTesting(true);
                    try {
                      const result = await IntegrationService.sendTestEmail(user.company_id, formData, formData.test_email);
                      setTestResult(result);
                    } catch (error) {
                      setTestResult({ success: false, message: error.message });
                    } finally {
                      setTesting(false);
                    }
                  }}
                  disabled={testing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'stripe':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Connect Integration
              </label>

              {!formData.status || formData.status === 'pending' ? (
                <div>
                  <button
                    onClick={async () => {
                      // Show placeholder dialog
                      alert('This will redirect to Stripe Connect for secure per-business payment setup.\n\nStripe Connect allows each business to have their own payment processing account while you maintain platform control.');

                      // Create pending integration
                      await IntegrationService.createPendingIntegration(user.company_id, 'stripe', {
                        initiated_at: new Date().toISOString()
                      });

                      setFormData({ ...formData, status: 'pending' });
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Connect with Stripe
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    This will redirect to Stripe Connect for secure per-business payment setup.
                  </p>

                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900">What is Stripe Connect?</h4>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Each business gets their own Stripe account</li>
                      <li>• Secure OAuth authorization process</li>
                      <li>• Platform fees and revenue sharing</li>
                      <li>• Compliance and liability protection</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-700">⏳ Stripe Connect setup pending</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    OAuth integration will be implemented in the next phase
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'twilio':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account SID
              </label>
              <input
                type="text"
                name="account_sid"
                value={formData.account_sid || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auth Token
              </label>
              <input
                type="password"
                name="auth_token"
                value={formData.auth_token || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Twilio Auth Token"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            {/* Test SMS Section */}
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  name="test_phone"
                  value={formData.test_phone || ''}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
                <button
                  onClick={async () => {
                    if (!formData.test_phone) {
                      alert('Please enter a test phone number');
                      return;
                    }
                    setTesting(true);
                    try {
                      const result = await IntegrationService.sendTestSMS(user.company_id, formData, formData.test_phone);
                      setTestResult(result);
                    } catch (error) {
                      setTestResult({ success: false, message: error.message });
                    } finally {
                      setTesting(false);
                    }
                  }}
                  disabled={testing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? 'Sending...' : 'Send Test'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Test message: "Hello from TradeMate Pro! Your SMS integration is working."
              </p>
            </div>
          </div>
        );

      case 'google_calendar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Calendar Integration
              </label>

              {!formData.access_token ? (
                <div>
                  <button
                    onClick={() => handleOAuthFlow('google')}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Connect with Google
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Authorize access to your Google Calendar for scheduling
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-700">✓ Connected to Google Calendar</p>
                    <p className="text-xs text-green-600 mt-1">
                      Expires: {formData.expires_at ? new Date(formData.expires_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      setTesting(true);
                      try {
                        const result = await GoogleCalendarService.createTestEvent(user.company_id);
                        setTestResult(result);
                        if (result.success && result.eventUrl) {
                          setTimeout(() => {
                            window.open(result.eventUrl, '_blank');
                          }, 1000);
                        }
                      } catch (error) {
                        setTestResult({ success: false, message: error.message });
                      } finally {
                        setTesting(false);
                      }
                    }}
                    disabled={testing}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {testing ? 'Creating Test Event...' : 'Create Test Event'}
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to disconnect Google Calendar?')) {
                        await GoogleCalendarService.disconnect(user.company_id);
                        setFormData({});
                        onSave();
                      }
                    }}
                    className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'smtp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                name="host"
                value={formData.host || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="number"
                name="port"
                value={formData.port || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email password or app password"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="secure"
                checked={formData.secure || false}
                onChange={(e) => setFormData(prev => ({ ...prev, secure: e.target.checked }))}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Use SSL/TLS</label>
            </div>
          </div>
        );

      case 'quickbooks':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QuickBooks Online Integration
              </label>

              {!formData.status || formData.status === 'pending' ? (
                <div>
                  <button
                    onClick={async () => {
                      // Show placeholder dialog
                      alert('This will eventually redirect to QuickBooks OAuth for secure accounting integration.\n\nFeatures will include:\n• Customer sync\n• Invoice creation\n• Payment tracking\n• Expense management');

                      // Create pending integration
                      await IntegrationService.createPendingIntegration(user.company_id, 'quickbooks', {
                        initiated_at: new Date().toISOString()
                      });

                      setFormData({ ...formData, status: 'pending' });
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Connect to QuickBooks
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Secure OAuth integration with QuickBooks Online
                  </p>

                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <h4 className="text-sm font-medium text-green-900">QuickBooks Integration Features</h4>
                    <ul className="text-xs text-green-800 mt-1 space-y-1">
                      <li>• Automatic customer sync</li>
                      <li>• Invoice creation and tracking</li>
                      <li>• Payment status updates</li>
                      <li>• Expense categorization</li>
                      <li>• Financial reporting</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-700">⏳ QuickBooks OAuth setup pending</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Full accounting integration coming in next release
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'zapier':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zapier Webhook Integration
              </label>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`https://api.trademate.com/webhook/zapier/${user.company_id}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://api.trademate.com/webhook/zapier/${user.company_id}`);
                        alert('Webhook URL copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use this URL in your Zapier webhook trigger
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900">Webhook Status</h4>
                  <div className="text-xs text-blue-800 mt-1 space-y-1">
                    <div>Last Triggered: <span className="font-mono">2024-01-15 14:30:22</span> (Mock)</div>
                    <div>Total Triggers: <span className="font-mono">47</span> (Mock)</div>
                    <div>Status: <span className="text-green-600 font-medium">Active</span></div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900">Available Triggers</h4>
                  <ul className="text-xs text-gray-700 mt-1 space-y-1">
                    <li>• New customer created</li>
                    <li>• Quote sent to customer</li>
                    <li>• Job completed</li>
                    <li>• Payment received</li>
                    <li>• Invoice generated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Configuration form for {integration.name} coming soon...</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{integration?.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {integration?.name}
                </h2>
                <p className="text-sm text-gray-500">Configure integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <p className="text-sm text-gray-600">{integration?.description}</p>
            </div>

            {renderConfigurationForm()}

            {/* Test Connection */}
            {(integration?.id === 'google_calendar' || integration?.id === 'quickbooks' || integration?.id === 'zapier') && (
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {testing ? 'Testing Connection...' : 'Test Connection'}
                </button>
                
                {testResult && (
                  <div className={`mt-3 p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="text-sm">{testResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDrawer;
