import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import type { OnboardingUserProps } from '@/features/onboarding/types';
import { ProgressBar } from '@/features/onboarding/components/ProgressBar';
import { StepProfile } from '@/features/onboarding/components/StepProfile';
import { StepPersonalize } from '@/features/onboarding/components/StepPersonalize';
import { StepSummary } from '@/features/onboarding/components/StepSummary';

interface OnboardingWizardProps {
  initialUser: OnboardingUserProps;
}

export default function OnboardingWizard({ initialUser }: OnboardingWizardProps) {
  const {
    step,
    setStep,
    loading,
    role,
    setRole,
    fullName,
    setFullName,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    coverUrl,
    setCoverUrl,
    bio,
    setBio,
    tagline,
    setTagline,
    country,
    setCountry,
    city,
    setCity,
    jobTitle,
    company,
    socialLinks,
    selectedTopics,
    toggleTopic,
    followedIds,
    toggleFollow,
    calculateCompletionScore,
    handleNextStep,
    handlePrevStep,
    handleSubmitAll,
  } = useOnboarding(initialUser);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Step Progress Bar */}
      <ProgressBar currentStep={step} totalSteps={3} onStepClick={setStep} />

      {/* Main Form Card */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline, #E2E8F0)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--shadow-card)' }}>
        {step === 1 && (
          <StepProfile
            role={role}
            setRole={setRole}
            fullName={fullName}
            setFullName={setFullName}
            username={username}
            setUsername={setUsername}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            bio={bio}
            setBio={setBio}
            tagline={tagline}
            setTagline={setTagline}
            country={country}
            setCountry={setCountry}
            city={city}
            setCity={setCity}
          />
        )}

        {step === 2 && (
          <StepPersonalize
            selectedTopics={selectedTopics}
            onToggleTopic={toggleTopic}
            followedIds={followedIds}
            onToggleFollow={toggleFollow}
          />
        )}

        {step === 3 && (
          <StepSummary
            role={role}
            fullName={fullName}
            username={username}
            tagline={tagline}
            bio={bio}
            jobTitle={jobTitle}
            company={company}
            country={country}
            city={city}
            socialLinks={socialLinks}
            selectedTopics={selectedTopics}
            followedCount={followedIds.length}
            completionScore={calculateCompletionScore()}
          />
        )}

        {/* Wizard Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--color-hairline, #E2E8F0)' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '9999px',
                border: '1px solid var(--color-hairline, #E2E8F0)',
                background: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '9999px',
                border: 'none',
                background: 'var(--color-primary, #0F172A)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continue
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: 'var(--color-primary, #0F172A)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                'Saving Profile...'
              ) : (
                <>
                  Complete Setup & Launch
                  <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
