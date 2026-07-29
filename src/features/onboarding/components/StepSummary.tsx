import React from 'react';
import { CheckCircle2, User, Briefcase, Globe, Bookmark, Users, Bell } from 'lucide-react';
import type { SocialLinkInput } from '../types';

interface StepSummaryProps {
  role: string;
  fullName: string;
  username: string;
  tagline: string;
  bio: string;
  jobTitle: string;
  company: string;
  country: string;
  city: string;
  socialLinks: SocialLinkInput[];
  selectedTopics: string[];
  followedCount: number;
  completionScore: number;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  role,
  fullName,
  username,
  tagline,
  bio,
  jobTitle,
  company,
  country,
  city,
  socialLinks,
  selectedTopics,
  followedCount,
  completionScore,
}) => {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <CheckCircle2 style={{ width: '48px', height: '48px', color: 'var(--color-success, #059669)', margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0' }}>Profile Ready to Launch!</h2>
        <p style={{ color: 'var(--color-steel)', margin: 0, fontSize: '0.9375rem' }}>
          Review your onboarding configuration before completing setup.
        </p>
      </div>

      {/* Completion Meter */}
      <div
        style={{
          background: 'var(--color-surface, #F8FAFC)',
          border: '1px solid var(--color-hairline, #E2E8F0)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
          <span>Profile Strength Score</span>
          <span style={{ color: 'var(--color-accent)' }}>{completionScore}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${completionScore}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0ea5e9, #7c3aed)',
              borderRadius: '4px',
              transition: 'width 300ms ease',
            }}
          />
        </div>
      </div>

      {/* Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ border: '1px solid var(--color-hairline)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <User style={{ width: '15px', height: '15px', color: 'var(--color-accent)' }} /> Identity & Role
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{fullName || 'Creator'}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-steel)' }}>
            @{username || 'user'} · Role: <strong style={{ textTransform: 'capitalize' }}>{role}</strong>
          </div>
          {tagline && <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>"{tagline}"</div>}
        </div>

        <div style={{ border: '1px solid var(--color-hairline)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <Briefcase style={{ width: '15px', height: '15px', color: 'var(--color-accent)' }} /> Career & Location
          </div>
          <div style={{ fontSize: '13px' }}>
            {jobTitle ? `${jobTitle} at ${company || 'Independent'}` : 'Not specified'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-steel)', marginTop: '4px' }}>
            Location: {[city, country].filter(Boolean).join(', ') || 'Global'}
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-hairline)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <Bookmark style={{ width: '15px', height: '15px', color: 'var(--color-accent)' }} /> Topics
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-steel)' }}>
            {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None selected'}
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-hairline)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <Globe style={{ width: '15px', height: '15px', color: 'var(--color-accent)' }} /> Social & Network
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-steel)' }}>
            {socialLinks.length} Social Profiles Connected · Following {followedCount} Creators
          </div>
        </div>
      </div>
    </div>
  );
};
