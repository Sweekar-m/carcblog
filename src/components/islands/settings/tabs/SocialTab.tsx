import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SocialLink } from '@/lib/profile';

const T = {
  ink:      '#0f172a',
  steel:    '#64748b',
  stone:    '#94a3b8',
  hairline: '#e2e8f0',
  canvas:   '#ffffff',
  surface:  '#f8fafc',
  primary:  '#0f172a',
  red100:   '#fee2e2',
  red500:   '#ef4444',
  fontSans: "'DM Sans', Inter, system-ui, sans-serif",
  fsSm:     '0.875rem',
  fsXs:     '0.8125rem',
};

const PLATFORMS = [
  { value: 'linkedin',  label: 'LinkedIn'    },
  { value: 'x',         label: 'X / Twitter' },
  { value: 'github',    label: 'GitHub'      },
  { value: 'youtube',   label: 'YouTube'     },
  { value: 'instagram', label: 'Instagram'   },
  { value: 'devto',     label: 'Dev.to'      },
  { value: 'medium',    label: 'Medium'      },
  { value: 'website',   label: 'Website'     },
] as const;

interface SocialTabProps {
  socials:        SocialLink[];
  onAddSocial:    () => void;
  onRemoveSocial: (idx: number) => void;
  onSocialChange: (idx: number, field: 'platform' | 'url', val: string) => void;
}

const controlBase: React.CSSProperties = {
  height: '44px', borderRadius: '8px',
  border: `1px solid ${T.hairline}`, background: T.canvas,
  color: T.ink, fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 400,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms ease, box-shadow 150ms ease',
};

export const SocialTab: React.FC<SocialTabProps> = ({ socials, onAddSocial, onRemoveSocial, onSocialChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

    {socials.map((link, idx) => (
      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Platform select */}
        <select
          value={link.platform}
          onChange={e => onSocialChange(idx, 'platform', e.target.value)}
          aria-label="Social platform"
          style={{ ...controlBase, width: '148px', flexShrink: 0, padding: '0 10px', cursor: 'pointer' }}
          onFocus={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)'; }}
          onBlur={e =>  { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {/* URL input */}
        <input
          type="url" value={link.url} placeholder="https://..."
          aria-label="Profile URL"
          onChange={e => onSocialChange(idx, 'url', e.target.value)}
          style={{ ...controlBase, flex: 1, minWidth: 0, padding: '0 14px' }}
          onFocus={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)'; }}
          onBlur={e =>  { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.boxShadow = 'none'; }}
        />

        {/* Remove button */}
        <button
          type="button" onClick={() => onRemoveSocial(idx)}
          aria-label="Remove social link" title="Remove"
          style={{
            width: '44px', height: '44px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, borderRadius: '8px',
            border: `1px solid ${T.hairline}`, background: T.canvas, color: T.steel,
            cursor: 'pointer', transition: 'color 150ms ease, border-color 150ms ease, background 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = T.red500; (e.currentTarget as HTMLButtonElement).style.borderColor = T.red100; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = T.steel; (e.currentTarget as HTMLButtonElement).style.borderColor = T.hairline; (e.currentTarget as HTMLButtonElement).style.background = T.canvas; }}
        >
          <Trash2 style={{ width: '15px', height: '15px' }} aria-hidden="true" />
        </button>
      </div>
    ))}

    {/* Add link button */}
    <button
      type="button" onClick={onAddSocial}
      style={{
        marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '0 16px', height: '40px', borderRadius: '8px', width: '100%',
        border: `1px dashed ${T.stone}`, background: 'transparent',
        fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 500, color: T.steel,
        cursor: 'pointer', justifyContent: 'center', transition: 'color 150ms ease, border-color 150ms ease, background 150ms ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = T.ink; (e.currentTarget as HTMLButtonElement).style.borderColor = T.primary; (e.currentTarget as HTMLButtonElement).style.background = T.surface; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = T.steel; (e.currentTarget as HTMLButtonElement).style.borderColor = T.stone; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <Plus style={{ width: '16px', height: '16px' }} aria-hidden="true" />
      Add social link
    </button>
  </div>
);
