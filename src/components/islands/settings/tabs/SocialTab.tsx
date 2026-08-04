import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SocialLink } from '@/lib/profile';

/* ── Platform options ─────────────────────────────────────────────────────── */
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

export const SocialTab: React.FC<SocialTabProps> = ({
  socials,
  onAddSocial,
  onRemoveSocial,
  onSocialChange,
}) => (
  <div className="flex flex-col gap-3">

    {socials.map((link, idx) => (
      /*
       * Desktop: single flex row — [Platform select 152px] [URL input flex-1] [Delete 44px]
       * All three controls share h-11 (44px) so they align on a common baseline.
       *
       * Mobile: stacked column — platform on top, URL below, delete on the right of URL row.
       */
      <div key={idx} className="flex flex-col sm:flex-row gap-2">

        {/* Platform select */}
        <select
          value={link.platform}
          onChange={e => onSocialChange(idx, 'platform', e.target.value)}
          aria-label="Social platform"
          className={
            'h-11 px-3 w-full sm:w-[152px] sm:shrink-0 rounded-lg border border-hairline bg-white ' +
            'text-ink text-body-sm font-sans cursor-pointer transition-colors ' +
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'
          }
        >
          {PLATFORMS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* URL input + delete button — share a row on mobile */}
        <div className="flex gap-2 flex-1 min-w-0">
          <input
            type="url"
            value={link.url}
            onChange={e => onSocialChange(idx, 'url', e.target.value)}
            placeholder="https://..."
            aria-label="Profile URL"
            className={
              'flex-1 min-w-0 h-11 px-3.5 rounded-lg border border-hairline bg-white ' +
              'text-ink text-body-sm font-sans placeholder:text-stone transition-colors ' +
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'
            }
          />

          {/* Delete button — same h-11 height as controls */}
          <button
            type="button"
            onClick={() => onRemoveSocial(idx)}
            aria-label="Remove social link"
            title="Remove"
            className={
              'h-11 w-11 flex items-center justify-center shrink-0 rounded-lg ' +
              'border border-hairline text-steel transition-all cursor-pointer ' +
              'hover:text-red-500 hover:border-red-200 hover:bg-red-50 ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
            }
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

      </div>
    ))}

    {/* Add link button */}
    <button
      type="button"
      onClick={onAddSocial}
      className={
        'mt-1 inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-dashed ' +
        'border-hairline-strong bg-transparent text-steel font-medium text-body-sm ' +
        'hover:text-ink hover:border-primary hover:bg-surface transition-all cursor-pointer ' +
        'w-full sm:w-auto justify-center sm:justify-start ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      }
    >
      <Plus className="w-4 h-4" aria-hidden="true" />
      Add link
    </button>

  </div>
);
