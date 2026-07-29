import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { TOPIC_OPTIONS } from '../constants';

interface StepTopicsProps {
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
}

export const StepTopics: React.FC<StepTopicsProps> = ({ selectedTopics, onToggleTopic }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Bookmark style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 4: Topics & Interests</h2>
      </div>
      <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Select topics you want to write about or read in your custom feed.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {TOPIC_OPTIONS.map((t) => {
          const active = selectedTopics.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggleTopic(t)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '9999px',
                border: active ? '1px solid var(--color-primary, #0F172A)' : '1px solid var(--color-hairline, #E2E8F0)',
                background: active ? 'var(--color-primary, #0F172A)' : '#ffffff',
                color: active ? '#ffffff' : 'var(--color-ink, #0F172A)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {active && <Sparkles style={{ width: '14px', height: '14px', color: '#38bdf8' }} />}
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
};
