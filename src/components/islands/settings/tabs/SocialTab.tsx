import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SocialLink } from '@/lib/profile';

interface SocialTabProps {
  socials: SocialLink[];
  onAddSocial: () => void;
  onRemoveSocial: (idx: number) => void;
  onSocialChange: (idx: number, field: 'platform' | 'url', val: string) => void;
}

export const SocialTab: React.FC<SocialTabProps> = ({
  socials,
  onAddSocial,
  onRemoveSocial,
  onSocialChange,
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Social Accounts & Links</h3>
      <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Connect your public profiles across developer and social networks.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {socials.map((link, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={link.platform}
              onChange={e => onSocialChange(idx, 'platform', e.target.value)}
              style={{ width: '140px', height: '42px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', background: '#fff' }}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="github">GitHub</option>
              <option value="x">X / Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="devto">Dev.to</option>
              <option value="medium">Medium</option>
              <option value="website">Website</option>
            </select>
            <input
              type="url"
              value={link.url}
              onChange={e => onSocialChange(idx, 'url', e.target.value)}
              placeholder="https://..."
              style={{ flex: 1, height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => onRemoveSocial(idx)}
              style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }}
            >
              <Trash2 style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSocial}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--color-hairline)', background: 'transparent', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
      >
        <Plus style={{ width: '14px', height: '14px' }} />
        Add Profile Link
      </button>
    </div>
  );
};
