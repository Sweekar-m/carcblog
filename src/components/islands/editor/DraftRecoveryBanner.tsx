/**
 * DraftRecoveryBanner — inline alert to restore or dismiss a saved localStorage draft.
 * Per design.md: uses transparent warning background and proper typography.
 * Per AGENTS.md: Lucide AlertTriangle icon.
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { DraftSnapshot } from '@/types/editor';

interface DraftRecoveryBannerProps {
  snapshot: DraftSnapshot;
  onRestore: () => void;
  onDismiss: () => void;
}

export function DraftRecoveryBanner({ snapshot, onRestore, onDismiss }: DraftRecoveryBannerProps) {
  const savedDate = new Date(snapshot.savedAt);
  const timeLabel = savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateLabel = savedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-sm px-base py-xs border-b"
      style={{
        background: 'rgba(202, 138, 4, 0.08)', // Transparent warning amber
        borderColor: 'rgba(202, 138, 4, 0.25)',
      }}
    >
      <div className="flex items-center gap-xs min-w-0">
        <AlertTriangle size={16} color="rgba(202, 138, 4, 1)" className="flex-shrink-0" aria-hidden="true" />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-caption)',
            color: 'var(--color-body-strong)',
            margin: 0,
          }}
          className="truncate"
        >
          Unsaved draft found from {dateLabel} at {timeLabel}
          {snapshot.title ? ` — "${snapshot.title}"` : ''}
        </p>
      </div>
      <div className="flex items-center gap-xs flex-shrink-0">
        <button
          type="button"
          onClick={onRestore}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--color-body-strong)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            padding: 0,
          }}
        >
          Restore
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-caption)',
            color: 'var(--color-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
          aria-label="Dismiss draft recovery"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
