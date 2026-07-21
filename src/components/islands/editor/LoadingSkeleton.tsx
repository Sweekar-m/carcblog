/**
 * Loading skeleton for the Publishing Studio.
 * Shimmer animation uses CSS custom property tokens — zero hardcoded hex.
 * prefers-reduced-motion: animation disabled per AGENTS.md §5.2.
 */
import React from 'react';

// ─── Single skeleton line ─────────────────────────────────────────────────────

interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

function SkeletonLine({ width = '100%', height = '1rem', className = '' }: SkeletonLineProps) {
  return (
    <div
      className={`editor-skeleton-shimmer ${className}`}
      style={{ width, height, borderRadius: 'var(--radius-xs)' }}
      aria-hidden="true"
    />
  );
}

// ─── Shared shimmer styles injected once ─────────────────────────────────────

const SHIMMER_STYLES = `
  @keyframes editor-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .editor-skeleton-shimmer {
    background: linear-gradient(
      90deg,
      var(--color-surface-strong) 25%,
      var(--color-hairline) 50%,
      var(--color-surface-strong) 75%
    );
    background-size: 1200px 100%;
    animation: editor-shimmer 1.6s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .editor-skeleton-shimmer {
      animation: none;
      background: var(--color-surface-strong);
    }
  }
`;

// ─── Full-page editor skeleton ────────────────────────────────────────────────
// Mirrors the three-column layout exactly to prevent layout shift on hydration.

export function EditorLoadingSkeleton() {
  return (
    <>
      <style>{SHIMMER_STYLES}</style>
      <div
        role="status"
        aria-label="Loading editor…"
        style={{
          display: 'flex',
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: 'var(--color-canvas-soft)',
        }}
      >
        {/* Toolbar skeleton */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '52px',
            borderBottom: '1px solid var(--color-hairline)',
            background: 'var(--color-canvas-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-base)',
            zIndex: 10,
          }}
        >
          <SkeletonLine width="120px" height="20px" />
          <SkeletonLine width="80px" height="20px" />
          <SkeletonLine width="100px" height="32px" />
        </div>

        {/* Left sidebar skeleton */}
        <aside
          aria-hidden="true"
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid var(--color-hairline)',
            paddingTop: '68px',
            padding: `68px var(--space-base) var(--space-lg)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <SkeletonLine width="50%" height="10px" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
              <SkeletonLine height="36px" />
              <SkeletonLine height="36px" />
              <SkeletonLine height="36px" />
              <SkeletonLine height="36px" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <SkeletonLine width="40%" height="10px" />
            <SkeletonLine width="90%" height="12px" />
            <SkeletonLine width="70%" height="12px" />
            <SkeletonLine width="80%" height="12px" />
          </div>
        </aside>

        {/* Center editor skeleton */}
        <main
          aria-hidden="true"
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '68px',
            padding: `68px var(--space-xl) var(--space-xxl)`,
            minWidth: 0,
          }}
        >
          <div style={{ width: '100%', maxWidth: '680px' }}>
            {/* Title */}
            <SkeletonLine height="3.5rem" />
            <div style={{ marginTop: 'var(--space-xs)' }}>
              <SkeletonLine width="72%" height="3.5rem" />
            </div>

            {/* Subtitle */}
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <SkeletonLine height="1.25rem" />
              <div style={{ marginTop: 'var(--space-xxs)' }}>
                <SkeletonLine width="60%" height="1.25rem" />
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'var(--color-hairline)',
                margin: `var(--space-xl) 0`,
              }}
            />

            {/* Body lines */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-xs)' }}>
                <SkeletonLine width={i % 4 === 3 ? '55%' : '100%'} height="1rem" />
              </div>
            ))}
          </div>
        </main>

        <span className="sr-only">Loading the article editor, please wait…</span>
      </div>
    </>
  );
}

// ─── Inline skeleton for the BlockNote area (Suspense fallback) ───────────────

export function BlockNoteLoadingSkeleton() {
  return (
    <>
      <style>{SHIMMER_STYLES}</style>
      <div role="status" aria-label="Loading editor content…" style={{ width: '100%' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ marginBottom: 'var(--space-xs)' }}>
            <SkeletonLine width={i % 3 === 2 ? '65%' : '100%'} height="1rem" />
          </div>
        ))}
        <span className="sr-only">Loading editor content…</span>
      </div>
    </>
  );
}
