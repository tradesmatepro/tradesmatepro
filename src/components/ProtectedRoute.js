import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import StrictAuthGuard from './StrictAuthGuard';
import Login from '../pages/Login';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingWizard from './OnboardingWizard';
import { supabase } from '../utils/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useUser();
  const [onboardingStatus, setOnboardingStatus] = useState('checking'); // 'checking', 'needed', 'complete'
  const [showWelcome, setShowWelcome] = useState(true);
  const [onboardingMode, setOnboardingMode] = useState(null);

  // Check if user should bypass onboarding (app_owner only)
  const shouldBypassOnboarding = () => {
    // Only app_owner bypasses onboarding - regular companies must complete it
    return user?.app_metadata?.role === 'app_owner' || user?.user_metadata?.role === 'app_owner';
  };

  // Check if onboarding is complete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // App owner bypasses onboarding entirely
      if (shouldBypassOnboarding()) {
        console.log('🔑 App owner detected - bypassing onboarding');
        setOnboardingStatus('complete');
        return;
      }

      if (!user?.company_id) {
        setOnboardingStatus('complete'); // No company means skip onboarding check
        return;
      }

      try {
        // Check if onboarding is complete using the database function
        const { data, error } = await supabase.rpc('is_onboarding_complete', {
          p_company_id: user.company_id
        });

        if (error) {
          console.warn('⚠️ Onboarding check failed, assuming complete:', error.message);
          setOnboardingStatus('complete');
          return;
        }

        setOnboardingStatus(data ? 'complete' : 'needed');
      } catch (error) {
        console.warn('⚠️ Onboarding check error, assuming complete:', error);
        setOnboardingStatus('complete');
      }
    };

    if (isAuthenticated && user) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TradeMate Pro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Show onboarding if needed
  if (onboardingStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (onboardingStatus === 'needed') {
    const handleStartOnboarding = (mode) => {
      setOnboardingMode(mode);
      setShowWelcome(false);
    };

    const handleOnboardingComplete = () => {
      console.log('🎉 Onboarding completed successfully!');
      setOnboardingStatus('complete');
    };

    const handleSkip = () => {
      console.log('Onboarding skipped');
      setOnboardingStatus('complete');
    };

    if (showWelcome) {
      return (
        <OnboardingWelcome
          onStartOnboarding={handleStartOnboarding}
          onSkip={handleSkip}
        />
      );
    }

    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onSkip={handleSkip}
        quickStartMode={onboardingMode === 'quick'}
      />
    );
  }

  // Wrap children in strict auth guard for additional session validation
  return (
    <StrictAuthGuard>
      {children}
    </StrictAuthGuard>
  );
};

export default ProtectedRoute;
