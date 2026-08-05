import React from 'react';
import { Bookmark, Sparkles, Users, CheckCircle2 } from 'lucide-react';
import { TOPIC_OPTIONS, SUGGESTED_WRITERS } from '../constants';

interface StepPersonalizeProps {
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
  followedIds: string[];
  onToggleFollow: (id: string) => void;
}

export const StepPersonalize: React.FC<StepPersonalizeProps> = ({
  selectedTopics,
  onToggleTopic,
  followedIds,
  onToggleFollow,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Bookmark style={{ width: '22px', height: '22px', color: 'var(--color-accent, #0EA5E9)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-ink, #0F172A)' }}>
          Step 2: Personalize Your Feed
        </h2>
      </div>
      <p style={{ color: 'var(--color-steel, #64748B)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Choose your favorite topics and follow featured creators to customize your launch feed.
      </p>

      {/* Topics Section */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-ink, #0F172A)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles style={{ width: '16px', height: '16px', color: 'var(--color-accent, #0EA5E9)' }} />
          Topics of Interest
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  border: active
                    ? '1px solid var(--color-primary, #0F172A)'
                    : '1px solid var(--color-hairline, #E2E8F0)',
                  background: active ? 'var(--color-primary, #0F172A)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--color-ink, #0F172A)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {active && <Sparkles style={{ width: '12px', height: '12px', color: '#38bdf8' }} />}
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Creators Section */}
      <div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-ink, #0F172A)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users style={{ width: '16px', height: '16px', color: 'var(--color-accent, #0EA5E9)' }} />
          Featured Creators to Follow
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {SUGGESTED_WRITERS.slice(0, 4).map((writer) => {
            const isFollowing = followedIds.includes(writer.id);
            return (
              <div
                key={writer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-hairline, #E2E8F0)',
                  background: 'var(--color-surface, #F8FAFC)',
                }}
              >
                <div style={{ minWidth: 0, paddingRight: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {writer.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-steel)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{writer.username}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFollow(writer.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: isFollowing ? 'var(--color-success, #059669)' : 'var(--color-primary, #0F172A)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {isFollowing ? (
                    <>
                      <CheckCircle2 style={{ width: '14px', height: '14px' }} />
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
    </div>
  );
};
