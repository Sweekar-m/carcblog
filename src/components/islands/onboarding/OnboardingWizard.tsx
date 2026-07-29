import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import type { OnboardingUserProps } from '@/features/onboarding/types';
import { ProgressBar } from '@/features/onboarding/components/ProgressBar';
import { StepProfile } from '@/features/onboarding/components/StepProfile';
import { StepProfessional } from '@/features/onboarding/components/StepProfessional';
import { StepSocial } from '@/features/onboarding/components/StepSocial';
import { StepTopics } from '@/features/onboarding/components/StepTopics';
import { StepCreators } from '@/features/onboarding/components/StepCreators';
import { StepNotifications } from '@/features/onboarding/components/StepNotifications';
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
    company,
    setCompany,
    jobTitle,
    setJobTitle,
    yearsExp,
    setYearsExp,
    industry,
    setIndustry,
    skillsInput,
    setSkillsInput,
    socialLinks,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    selectedTopics,
    toggleTopic,
    followedIds,
    toggleFollow,
    notifPrefs,
    setNotifPrefs,
    calculateCompletionScore,
    handleNextStep,
    handlePrevStep,
    handleSubmitAll,
  } = useOnboarding(initialUser);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Step Progress Bar */}
      <ProgressBar currentStep={step} totalSteps={7} onStepClick={setStep} />

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
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
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
          <StepProfessional
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            company={company}
            setCompany={setCompany}
            industry={industry}
            setIndustry={setIndustry}
            yearsExp={yearsExp}
            setYearsExp={setYearsExp}
            skillsInput={skillsInput}
            setSkillsInput={setSkillsInput}
          />
        )}

        {step === 3 && (
          <StepSocial
            socialLinks={socialLinks}
            onAddSocial={addSocialLink}
            onRemoveSocial={removeSocialLink}
            onSocialChange={updateSocialLink}
          />
        )}

        {step === 4 && (
          <StepTopics selectedTopics={selectedTopics} onToggleTopic={toggleTopic} />
        )}

        {step === 5 && (
          <StepCreators followedIds={followedIds} onToggleFollow={toggleFollow} />
        )}

        {step === 6 && (
          <StepNotifications notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} />
        )}

        {step === 7 && (
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

          {step < 7 ? (
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
                padding: '12px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(90deg, #0ea5e9, #7c3aed)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Sparkles style={{ width: '18px', height: '18px' }} />
              {loading ? 'Saving Profile...' : 'Complete & Launch Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
