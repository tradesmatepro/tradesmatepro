import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  RocketLaunchIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const GoLiveStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [sampleData, setSampleData] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);

  // Always valid - this is the final step
  useEffect(() => {
    onValidationChange?.({
      valid: true,
      errors: [],
      warnings: []
    });
  }, []);

  // Create sample data
  const createSampleData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Call the database function to create sample data
      const { data, error } = await supabase.rpc('seed_onboarding_sample_data', {
        p_company_id: user.company_id
      });

      if (error) throw error;

      setSampleData(data);
      setSetupComplete(true);

    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Failed to create sample data. You can create your first customer and quote manually.');
      setSetupComplete(true);
    } finally {
      setLoading(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = () => {
    onComplete?.({ sampleData, setupComplete: true });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <RocketLaunchIcon className="w-12 h-12 text-pink-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Go Live!</h2>
        <p className="text-gray-600">
          Congratulations! Your TradeMate Pro system is configured and ready to use. 
          Let's create some sample data to get you started.
        </p>
      </div>

      {!setupComplete ? (
        <>
          {/* Setup Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Company profile configured</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Services and pricing set up</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Team members added</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Business preferences configured</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Financial settings configured</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">Ready to create sample data</span>
              </div>
            </div>
          </div>

          {/* Sample Data Creation */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Sample Data</h3>
            <p className="text-gray-600 mb-6">
              We'll create a sample customer and quote to help you understand how the system works. 
              This demonstrates the complete workflow from customer creation to quote generation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <UserIcon className="w-6 h-6 text-pink-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Sample Customer</h4>
                  <p className="text-sm text-gray-600">
                    John Sample Customer<br />
                    123 Main Street, Anytown, CA<br />
                    (555) 123-4567
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DocumentTextIcon className="w-6 h-6 text-pink-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Sample Quote</h4>
                  <p className="text-sm text-gray-600">
                    Sample Service Quote<br />
                    Labor + Materials<br />
                    Total: $545.00 (including tax)
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={createSampleData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Sample Data...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Create Sample Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Prefer to Start Fresh?</h3>
            <p className="text-gray-600 mb-4">
              You can skip the sample data and start with a clean system. 
              You'll create your first real customer and quote when you're ready.
            </p>
            <button
              onClick={() => setSetupComplete(true)}
              className="text-pink-600 hover:text-pink-800 font-medium"
            >
              Skip Sample Data & Continue
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-medium text-green-900">Setup Complete!</h3>
                <p className="text-green-700">Your TradeMate Pro system is ready to use.</p>
              </div>
            </div>

            {sampleData && (
              <div className="mt-4 p-4 bg-white rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Sample Data Created:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Sample customer: John Sample Customer</li>
                  <li>✓ Sample quote: {sampleData.work_order_id ? 'Created successfully' : 'Ready to create'}</li>
                  <li>✓ System is fully functional</li>
                </ul>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium text-sm">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Explore Your Dashboard</h4>
                  <p className="text-sm text-gray-600">
                    Check out the main dashboard to see your work orders, calendar, and key metrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium text-sm">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Create Your First Real Customer</h4>
                  <p className="text-sm text-gray-600">
                    Add your first real customer and create a quote to see the full workflow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium text-sm">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Customize Your Settings</h4>
                  <p className="text-sm text-gray-600">
                    Fine-tune your company settings, add more services, or invite additional team members.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-medium text-sm">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Start Taking Jobs</h4>
                  <p className="text-sm text-gray-600">
                    Convert quotes to jobs, schedule work, and track your business growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white text-center">
            <RocketLaunchIcon className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-2">Welcome to TradeMate Pro!</h3>
            <p className="mb-4 opacity-90">
              You're now ready to manage your field service business like a pro. 
              We're excited to help you grow your business!
            </p>
            <p className="text-sm opacity-75">
              Need help? Check out our support resources or contact our team anytime.
            </p>
          </div>
        </>
      )}

      {/* Complete Button */}
      <div className="text-center mt-8">
        <button
          onClick={completeOnboarding}
          disabled={!setupComplete}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-md hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {setupComplete ? (
            <>
              <RocketLaunchIcon className="w-6 h-6" />
              Launch TradeMate Pro
              <ArrowRightIcon className="w-5 h-5" />
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6" />
              Complete Setup First
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoLiveStep;
