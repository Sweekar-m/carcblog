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
      <p className="text-steel text-sm mb-6 font-sans">Connect your public profiles across developer and social networks.</p>
      
      <div className="flex flex-col gap-3.5 mb-6">
        {socials.map((link, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-surface sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-hairline">
            <select
              value={link.platform}
              onChange={e => onSocialChange(idx, 'platform', e.target.value)}
              className="w-full sm:w-40 min-h-[44px] px-3 rounded-xl border border-hairline bg-white text-ink text-sm font-sans focus:outline-none focus:border-primary shrink-0"
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
              className="flex-1 w-full min-h-[44px] px-3.5 rounded-xl border border-hairline bg-white text-ink text-sm font-sans focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => onRemoveSocial(idx)}
              className="self-end sm:self-auto p-2.5 text-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Remove link"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSocial}
        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-hairline bg-white text-ink font-semibold text-xs sm:text-sm hover:bg-surface transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
      >
        <Plus className="w-4 h-4" />
        Add Profile Link
      </button>
    </div>
  );
};
