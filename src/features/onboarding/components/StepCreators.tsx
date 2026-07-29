import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { SUGGESTED_WRITERS } from '../constants';

interface StepCreatorsProps {
  followedIds: string[];
  onToggleFollow: (id: string) => void;
}

export const StepCreators: React.FC<StepCreatorsProps> = ({ followedIds, onToggleFollow }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Users style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 5: Follow Featured Creators</h2>
      </div>
      <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Follow tech leaders and editorial writers to populate your launch feed.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SUGGESTED_WRITERS.map((writer) => {
          const isFollowing = followedIds.includes(writer.id);
          return (
            <div
              key={writer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--color-hairline, #E2E8F0)',
                background: 'var(--color-surface, #F8FAFC)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-ink)' }}>{writer.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-steel)' }}>@{writer.username} · {writer.tagline}</div>
              </div>

              <button
                type="button"
                onClick={() => onToggleFollow(writer.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: isFollowing ? 'var(--color-success, #059669)' : 'var(--color-primary, #0F172A)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isFollowing ? (
                  <>
                    <CheckCircle2 style={{ width: '15px', height: '15px' }} />
                    Following
                  </>
                ) : (
                  'Follow'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
