import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import OnboardingWelcome from '../components/OnboardingWelcome';
import OnboardingWizard from '../components/OnboardingWizard';

const OnboardingTest = () => {
  const { user } = useUser();
  const [showWelcome, setShowWelcome] = useState(true);
  const [onboardingMode, setOnboardingMode] = useState(null);

  const handleStartOnboarding = (mode) => {
    setOnboardingMode(mode);
    setShowWelcome(false);
  };

  const handleOnboardingComplete = (data) => {
    console.log('Onboarding completed:', data);
    alert('🎉 Onboarding completed successfully! In a real app, this would redirect to the dashboard.');
  };

  const handleSkip = () => {
    console.log('Onboarding skipped');
    alert('Onboarding skipped. In a real app, this would redirect to the dashboard.');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to test the onboarding system.</p>
        </div>
      </div>
    );
  }

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
};

export default OnboardingTest;
