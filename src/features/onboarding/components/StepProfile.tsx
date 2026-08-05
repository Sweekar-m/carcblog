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
  fullName,
  setFullName,
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl,
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
        <User style={{ width: '22px', height: '22px', color: 'var(--color-accent, #0EA5E9)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-ink, #0F172A)' }}>
          Step 1: Your Identity
        </h2>
      </div>
      <p style={{ color: 'var(--color-steel, #64748B)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Set up your public profile identity on CarcBlog.
      </p>

      {/* Creator Profile Badge */}
      <div style={{ marginBottom: '24px', padding: '14px 18px', borderRadius: '12px', background: 'var(--color-surface, #F8FAFC)', border: '1px solid var(--color-hairline, #E2E8F0)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PenTool style={{ width: '20px', height: '20px', color: 'var(--color-accent, #0EA5E9)', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink, #0F172A)' }}>Creator & Writer Profile</span>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-steel, #64748B)' }}>
            You'll get full access to publish stories, follow tech startups, and build your audience.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Avatar Image URL (Optional)</label>
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
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Location (City / Country)</label>
          <input
            type="text"
            value={[city, country].filter(Boolean).join(', ')}
            onChange={(e) => {
              const parts = e.target.value.split(',');
              setCity(parts[0]?.trim() || '');
              setCountry(parts[1]?.trim() || '');
            }}
            placeholder="e.g. San Francisco, USA"
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
