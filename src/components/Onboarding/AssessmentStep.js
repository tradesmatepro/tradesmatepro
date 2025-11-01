import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AssessmentStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [assessment, setAssessment] = useState({
    has_customers: false,
    has_employees: false,
    has_services: false,
    has_banking: false,
    has_existing_data: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Load existing assessment if any
  useEffect(() => {
    loadAssessment();
  }, [user?.company_id]);

  const loadAssessment = async () => {
    if (!user?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('onboarding_assessment')
        .eq('company_id', user.company_id)
        .single();

      if (data?.onboarding_assessment) {
        setAssessment(data.onboarding_assessment);
      }
    } catch (error) {
      console.log('No existing assessment found, using defaults');
    }
  };

  const handleToggle = (field) => {
    setAssessment(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrors([]);

      if (!user?.company_id) {
        setErrors(['No company ID found']);
        return;
      }

      // Save assessment to database
      const { error } = await supabase
        .from('company_settings')
        .update({
          onboarding_assessment: assessment,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', user.company_id);

      if (error) {
        console.error('Error saving assessment:', error);
        setErrors(['Failed to save assessment']);
        return;
      }

      // Validate and complete
      onValidationChange?.({ valid: true, errors: [], warnings: [] });
      onComplete?.(assessment);

    } catch (error) {
      console.error('Error in assessment:', error);
      setErrors(['An error occurred while saving']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Get You Started</h2>
        <p className="text-gray-600">
          Tell us what you have ready, and we'll customize your setup. You can always add more later!
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <ul className="mt-2 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Questions */}
      <div className="space-y-4">
        {/* Question 1: Customers */}
        <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={assessment.has_customers}
            onChange={() => handleToggle('has_customers')}
            className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Do you have customers ready to quote?</div>
            <p className="text-sm text-gray-600 mt-1">
              If yes, we'll help you add your first customer so you can create quotes right away.
            </p>
          </div>
          {assessment.has_customers && (
            <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          )}
        </label>

        {/* Question 2: Employees */}
        <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={assessment.has_employees}
            onChange={() => handleToggle('has_employees')}
            className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Do you have employees or technicians?</div>
            <p className="text-sm text-gray-600 mt-1">
              If yes, we'll set them up for scheduling and job assignments.
            </p>
          </div>
          {assessment.has_employees && (
            <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          )}
        </label>

        {/* Question 3: Services */}
        <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={assessment.has_services}
            onChange={() => handleToggle('has_services')}
            className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Do you have services or rates defined?</div>
            <p className="text-sm text-gray-600 mt-1">
              If yes, we'll configure your pricing and service offerings.
            </p>
          </div>
          {assessment.has_services && (
            <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          )}
        </label>

        {/* Question 4: Banking */}
        <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={assessment.has_banking}
            onChange={() => handleToggle('has_banking')}
            className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Do you have banking info for payments?</div>
            <p className="text-sm text-gray-600 mt-1">
              If yes, we'll set up payment methods and collection options.
            </p>
          </div>
          {assessment.has_banking && (
            <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          )}
        </label>

        {/* Question 5: Existing Data */}
        <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={assessment.has_existing_data}
            onChange={() => handleToggle('has_existing_data')}
            className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Do you have existing data to import?</div>
            <p className="text-sm text-gray-600 mt-1">
              If yes, we can help you import customers, jobs, or other data from your previous system.
            </p>
          </div>
          {assessment.has_existing_data && (
            <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          )}
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> You can always add or change these later in Settings. This just helps us customize your setup experience.
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentStep;

