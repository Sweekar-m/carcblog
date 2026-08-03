import React from 'react';
import { User, PenTool } from 'lucide-react';
import { UserRole, type UserRoleType } from '@/types/roles';

interface StepProfileProps {
  role: UserRoleType;
  setRole: (role: UserRoleType) => void;
  fullName: string;
  setFullName: (name: string) => void;
  username: string;
  setUsername: (username: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  coverUrl: string;
  setCoverUrl: (url: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  tagline: string;
  setTagline: (tagline: string) => void;
  country: string;
  setCountry: (country: string) => void;
  city: string;
  setCity: (city: string) => void;
}

export const StepProfile: React.FC<StepProfileProps> = ({
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
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <User style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 1: Account Role & Basic Profile</h2>
      </div>
      <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Select your primary role and set up your public identity on CarcBlog.
      </p>

      {/* Creator Profile Badge */}
      <div style={{ marginBottom: '24px', padding: '14px 18px', borderRadius: '12px', background: 'var(--color-surface, #F8FAFC)', border: '1px solid var(--color-hairline, #E2E8F0)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PenTool style={{ width: '20px', height: '20px', color: 'var(--color-accent, #0EA5E9)', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink, #0F172A)' }}>Writer & Creator Account</span>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-steel, #64748B)' }}>
            All members get full writing, story publishing, and creator studio access.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alexrivera"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tagline</label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Founder @ TechStart · Building AI Products"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-hairline, #E2E8F0)',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Short Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers about yourself, your work, or your passions..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-hairline, #E2E8F0)',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Avatar Image URL</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Cover Image URL</label>
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. San Francisco"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>
    </div>
  );
};
