import React from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';
import type { SocialLinkInput } from '../types';

interface StepSocialProps {
  socialLinks: SocialLinkInput[];
  onAddSocial: () => void;
  onRemoveSocial: (idx: number) => void;
  onSocialChange: (idx: number, field: 'platform' | 'url', val: string) => void;
}

export const StepSocial: React.FC<StepSocialProps> = ({
  socialLinks,
  onAddSocial,
  onRemoveSocial,
  onSocialChange,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Globe style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 3: Social & Web Presence</h2>
      </div>
      <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Connect your social profiles, GitHub, and personal portfolio.
      </p>

      {socialLinks.map((link, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
          <select
            value={link.platform}
            onChange={(e) => onSocialChange(idx, 'platform', e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
              background: '#ffffff',
              width: '140px',
            }}
          >
            <option value="linkedin">LinkedIn</option>
            <option value="github">GitHub</option>
            <option value="x">X / Twitter</option>
            <option value="website">Website</option>
            <option value="portfolio">Portfolio</option>
            <option value="medium">Medium</option>
            <option value="youtube">YouTube</option>
          </select>

          <input
            type="url"
            value={link.url}
            onChange={(e) => onSocialChange(idx, 'url', e.target.value)}
            placeholder="https://..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />

          <button
            type="button"
            onClick={() => onRemoveSocial(idx)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline)',
              background: '#ffffff',
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddSocial}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px border var(--color-hairline, #E2E8F0)',
          background: 'var(--color-surface, #F8FAFC)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Plus style={{ width: '15px', height: '15px' }} />
        Add Social Link
      </button>
    </div>
  );
};
