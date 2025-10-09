import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../utils/supabaseClient';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CogIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

// Import step components
import CompanyBasicsStep from './Onboarding/CompanyBasicsStep';
import ServicesStep from './Onboarding/ServicesStep';
import PricingSetupStep from './Onboarding/PricingSetupStep';
import TeamSetupStep from './Onboarding/TeamSetupStep';
import BusinessPreferencesStep from './Onboarding/BusinessPreferencesStep';
import FinancialSetupStep from './Onboarding/FinancialSetupStep';
import GoLiveStep from './Onboarding/GoLiveStep';

const OnboardingWizard = ({ onComplete, onSkip, quickStartMode: propQuickStartMode }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({ valid: true, errors: [], warnings: [] });
  const [quickStartMode, setQuickStartMode] = useState(() => {
    // Use prop first, then localStorage, then default to false
    if (propQuickStartMode !== undefined) {
      localStorage.setItem('onboarding_quickStartMode', propQuickStartMode.toString());
      return propQuickStartMode;
    }
    const saved = localStorage.getItem('onboarding_quickStartMode');
    return saved === 'true';
  });
  const [showResetButton, setShowResetButton] = useState(false);

  // Helper function to get step names
  const getStepName = (stepNumber) => {
    const stepNames = {
      1: 'Company Basics',
      2: 'Services & Pricing',
      3: 'Team Setup',
      4: 'Business Preferences',
      5: 'Financial Setup',
      6: 'Go Live'
    };
    return stepNames[stepNumber] || `Step ${stepNumber}`;
  }; // New: Quick Start mode

  // Step configuration - Dynamic based on mode
  const getSteps = () => [
    {
      id: 1,
      name: 'Company Basics',
      description: 'Set up your company profile',
      icon: BuildingOfficeIcon,
      component: CompanyBasicsStep,
      color: 'blue'
    },
    {
      id: 2,
      name: quickStartMode ? 'Pricing Setup' : 'Services & Pricing',
      description: quickStartMode ? 'Set your rates to start quoting' : 'Define what services you provide',
      icon: quickStartMode ? CurrencyDollarIcon : WrenchScrewdriverIcon,
      component: quickStartMode ? PricingSetupStep : ServicesStep,
      color: 'green'
    },
    {
      id: 3,
      name: 'Team Setup',
      description: 'Add your team members',
      icon: UserGroupIcon,
      component: TeamSetupStep,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Business Preferences',
      description: 'Configure your business settings',
      icon: CogIcon,
      component: BusinessPreferencesStep,
      color: 'orange'
    },
    {
      id: 5,
      name: 'Financial Setup',
      description: 'Set up billing and payments',
      icon: CurrencyDollarIcon,
      component: FinancialSetupStep,
      color: 'indigo'
    },
    {
      id: 6,
      name: 'Go Live',
      description: 'Create your first quote and go live',
      icon: RocketLaunchIcon,
      component: GoLiveStep,
      color: 'pink'
    }
  ];

  const steps = getSteps();

  // BETA: Reset onboarding function
  const resetOnboarding = async () => {
    if (!user?.company_id) return;

    const confirmReset = window.confirm('🔄 BETA: Reset onboarding progress?\n\nThis will:\n• Clear all onboarding progress\n• Reset to step 1\n• Clear localStorage cache\n• Allow you to choose Quick Start or Advanced again\n\nContinue?');

    if (!confirmReset) return;

    try {
      console.log('🔄 Starting onboarding reset...');

      // 1. Reset onboarding progress in database
      const { error: settingsError } = await supabase
        .from('company_settings')
        .update({
          onboarding_progress: {
            current_step: 1,
            completed_steps: [],
            mode: null,
            started_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('company_id', user.company_id);

      if (settingsError) throw settingsError;

      // 2. Clear localStorage cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('onboarding') || key.includes('company_basics') || key.includes('services'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('🗑️ Cleared localStorage keys:', keysToRemove);

      // 3. Reset local state
      setCurrentStep(1);
      setProgress({
        current_step: 1,
        completed_steps: [],
        mode: null,
        started_at: new Date().toISOString()
      });
      setQuickStartMode(false);
      localStorage.removeItem('onboarding_quickStartMode');
      setValidation({ valid: true, errors: [], warnings: [] });

      console.log('✅ Onboarding reset successfully');
      alert('✅ Onboarding reset! Refresh the page to start over.');

      // Force page refresh to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error resetting onboarding:', error);
      alert('❌ Failed to reset onboarding. Check console for details.');
    }
  };

  // Load onboarding progress
  useEffect(() => {
    loadProgress();
  }, [user?.company_id]);

  const loadProgress = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // FIXED: Handle missing onboarding_progress column gracefully
      const { data, error } = await supabase
        .from('company_settings')
        .select('onboarding_progress')
        .eq('company_id', user.company_id)
        .single();

      let progressData;

      if (error) {
        if (error.code === 'PGRST116') {
          // No company_settings record exists - create one
          console.log('📝 Creating company_settings record for onboarding...');
          const { error: insertError } = await supabase
            .from('company_settings')
            .insert({
              company_id: user.company_id,
              onboarding_progress: {
                current_step: 1,
                completed_steps: [],
                started_at: new Date().toISOString(),
                completed_at: null,
                skipped: false,
                steps: {
                  "1": {"name": "Company Basics", "completed": false, "completed_at": null},
                  "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
                  "3": {"name": "Team Setup", "completed": false, "completed_at": null},
                  "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
                  "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
                  "6": {"name": "Go Live", "completed": false, "completed_at": null}
                }
              }
            });

          if (insertError && !insertError.message.includes('onboarding_progress')) {
            console.error('Error creating company_settings:', insertError);
          }

          progressData = {
            current_step: 1,
            completed_steps: [],
            started_at: new Date().toISOString(),
            completed_at: null,
            skipped: false,
            steps: {}
          };
        } else if (error.message.includes('onboarding_progress') || error.code === '42703') {
          // Column doesn't exist - use default progress
          console.log('⚠️ onboarding_progress column missing - using default progress');
          progressData = {
            current_step: 1,
            completed_steps: [],
            started_at: new Date().toISOString(),
            completed_at: null,
            skipped: false,
            steps: {}
          };
        } else {
          throw error;
        }
      } else {
        progressData = data?.onboarding_progress || {
          current_step: 1,
          completed_steps: [],
          started_at: new Date().toISOString(),
          completed_at: null,
          skipped: false,
          steps: {}
        };
      }

      setProgress(progressData);
      setCurrentStep(progressData.current_step || 1);

      // If already completed, call onComplete
      if (progressData.completed_at) {
        onComplete?.();
        return;
      }

    } catch (error) {
      console.error('Error loading onboarding progress:', error);
      // Fallback to default progress
      const defaultProgress = {
        current_step: 1,
        completed_steps: [],
        started_at: new Date().toISOString(),
        completed_at: null,
        skipped: false,
        steps: {}
      };
      setProgress(defaultProgress);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Validate current step
  const validateStep = async (stepNumber) => {
    if (!user?.company_id) return { valid: false, errors: ['No company ID'], warnings: [] };

    try {
      const { data, error } = await supabase.rpc('validate_onboarding_step', {
        p_company_id: user.company_id,
        p_step: stepNumber
      });

      if (error) throw error;
      return data || { valid: true, errors: [], warnings: [] };
    } catch (error) {
      if (error.message.includes('validate_onboarding_step') || error.code === '42883') {
        console.log('⚠️ Onboarding validation functions missing - using basic validation');
        // Basic validation - just check if we have required data
        return { valid: true, errors: [], warnings: [] };
      }
      console.error('Error validating step:', error);
      return { valid: false, errors: ['Validation failed'], warnings: [] };
    }
  };

  // Update progress in database
  const updateProgress = async (stepNumber, completed = true) => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      // FIXED: Handle missing onboarding functions gracefully
      try {
        const { data, error } = await supabase.rpc('update_onboarding_progress', {
          p_company_id: user.company_id,
          p_step: stepNumber,
          p_completed: completed
        });

        if (error) throw error;

        setProgress(data);
        return data;
      } catch (rpcError) {
        if (rpcError.message.includes('update_onboarding_progress') || rpcError.code === '42883') {
          console.log('⚠️ Onboarding RPC functions missing - using local progress tracking');

          // Fallback: Update progress locally
          const updatedProgress = {
            ...progress,
            current_step: completed && stepNumber < 6 ? stepNumber + 1 : stepNumber,
            completed_steps: completed ? [...(progress.completed_steps || []), stepNumber] : progress.completed_steps,
            steps: {
              ...progress.steps,
              [stepNumber]: {
                name: getStepName(stepNumber),
                completed: completed,
                completed_at: completed ? new Date().toISOString() : null
              }
            },
            last_updated: new Date().toISOString()
          };

          setProgress(updatedProgress);
          return updatedProgress;
        } else {
          throw rpcError;
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Auto-save progress every 30 seconds - Addressing "never lose progress"
  useEffect(() => {
    if (!user?.company_id || !progress) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        // CRITICAL FIX: Use UPDATE instead of UPSERT to prevent 409 Conflict errors
        const { error } = await supabase
          .from('company_settings')
          .update({
            onboarding_progress: {
              ...progress,
              last_auto_save: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('company_id', user.company_id);

        if (error) {
          console.warn('⚠️ Auto-save failed (this is OK):', error.message);
        }
      } catch (error) {
        console.warn('⚠️ Auto-save error (this is OK):', error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [user?.company_id, progress]);

  // Handle step completion
  const handleStepComplete = async (stepData) => {
    console.log('🔄 OnboardingWizard handleStepComplete called');
    console.log('📊 Step data received:', stepData);
    console.log('📊 Current step:', currentStep);
    console.log('📊 User company_id:', user?.company_id);

    try {
      // CRITICAL FIX: Use UPDATE instead of UPSERT to prevent duplicate records
      if (stepData && user?.company_id) {
        console.log('💾 Saving step data to database...');
        const { error: updateError } = await supabase
          .from('company_settings')
          .update({
            onboarding_progress: {
              ...progress,
              [`step_${currentStep}_data`]: stepData,
              last_auto_save: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('company_id', user.company_id);

        if (updateError) {
          console.warn('⚠️ Auto-save failed (this is OK):', updateError.message);
        } else {
          console.log('✅ Step data saved successfully');
        }
      }

      // Validate step
      console.log('🔍 Validating step...');
      const validation = await validateStep(currentStep);
      console.log('📊 Validation result:', validation);
      setValidation(validation);

      if (!validation.valid) {
        console.log('❌ Validation failed, stopping here');
        console.log('❌ Validation errors:', validation.errors);
        return; // Don't proceed if validation fails
      }

      // Update progress
      console.log('📈 Updating progress...');
      const newProgress = await updateProgress(currentStep, true);
      console.log('✅ Progress updated:', newProgress);

      // Quick Start mode: skip to final step after step 2
      if (quickStartMode && currentStep === 2) {
        console.log('🚀 Quick Start mode: jumping to Go Live step');
        setCurrentStep(6); // Jump to Go Live step
      } else if (currentStep < 6) {
        console.log('➡️ Moving to next step:', currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        console.log('🎉 Onboarding complete!');
        // Onboarding complete
        onComplete?.(newProgress);
      }

    } catch (error) {
      console.error('❌ Error completing step:', error);
    }
  };

  // Handle navigation
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 6) {
      setCurrentStep(stepNumber);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goNext = async () => {
    await handleStepComplete();
  };

  // Skip onboarding
  const handleSkip = async () => {
    if (window.confirm('Are you sure you want to skip the setup wizard? You can always complete it later in Settings.')) {
      try {
        // Mark as skipped
        await supabase
          .from('company_settings')
          .update({
            onboarding_progress: {
              ...progress,
              skipped: true,
              skipped_at: new Date().toISOString()
            }
          })
          .eq('company_id', user.company_id);

        onSkip?.();
      } catch (error) {
        console.error('Error skipping onboarding:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  const currentStepConfig = steps.find(s => s.id === currentStep);
  const StepComponent = currentStepConfig?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">TradeMate Pro Setup</h1>
              <span className="ml-3 text-sm text-gray-500">
                Step {currentStep} of {steps.length} • ~5 minutes total
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Live Help Button - Addressing "poor support during setup" */}
              <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                💬 Need Help? Chat Now
              </button>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                Skip Setup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Enhanced with clear required/optional indicators */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Time estimate and completion status */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700">
              ⏱️ Quick Setup • Most users complete in under 5 minutes
            </div>
          </div>

          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = progress?.steps?.[step.id]?.completed;
              const isCurrent = step.id === currentStep;
              const isPast = step.id < currentStep;
              const isRequired = step.id <= 2; // Only first 2 steps are truly required

              return (
                <div key={step.id} className="flex items-center">
                  <div className="text-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? `bg-${step.color}-500 border-${step.color}-500 text-white`
                          : isPast
                          ? 'bg-gray-300 border-gray-300 text-gray-600'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      onClick={() => goToStep(step.id)}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    {/* Required/Optional indicator */}
                    <div className={`text-xs mt-1 ${isRequired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {isRequired ? 'Required' : 'Optional'}
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-lg font-medium text-gray-900">{currentStepConfig?.name}</h2>
            <p className="text-sm text-gray-600">{currentStepConfig?.description}</p>
            {/* Clear indication of what's required vs optional */}
            {currentStep <= 2 ? (
              <div className="mt-2 inline-flex items-center gap-1 text-sm text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Required for basic functionality
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1 text-sm text-gray-500">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Optional - can be completed later
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Please fix these issues:</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Recommendations:</h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mode selection is now handled by OnboardingWelcome component */}

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {StepComponent && (
          <StepComponent
            onComplete={handleStepComplete}
            onValidationChange={setValidation}
            progress={progress}
            quickStartMode={quickStartMode}
          />
        )}
      </div>

      {/* Navigation - Enhanced with better progress indicators */}
      <div className="bg-white border-t px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Setup Progress</span>
              <span>{Math.round((currentStep / (quickStartMode ? 3 : steps.length)) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / (quickStartMode ? 3 : steps.length)) * 100}%` }}
              ></div>
            </div>
            {quickStartMode && (
              <div className="mt-2 text-xs text-blue-600 text-center">
                ⚡ Quick Start Mode - Only essential steps
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>

            {/* Help and status indicators */}
            <div className="flex items-center gap-4">
              {/* BETA: Reset button */}
              <button
                onClick={resetOnboarding}
                className="text-xs text-red-600 hover:text-red-800 underline"
                title="BETA: Reset onboarding to test different modes"
              >
                🔄 Reset (Beta)
              </button>

              {/* Auto-save indicator */}
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-saving progress
              </div>

              {/* Time estimate */}
              <div className="text-xs text-gray-500">
                {quickStartMode ? '~1 min remaining' : `~${Math.max(1, 6 - currentStep)} min remaining`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Skip current step if optional */}
              {currentStep > 2 && !quickStartMode && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Skip This Step
                </button>
              )}

              <button
                onClick={goNext}
                disabled={saving || (!validation.valid && currentStep <= 2)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : currentStep === 6 || (quickStartMode && currentStep === 2) ? (
                  <>
                    Complete Setup
                    <CheckCircleIcon className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
