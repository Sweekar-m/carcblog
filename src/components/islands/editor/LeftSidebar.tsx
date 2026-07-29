/**
 * LeftSidebar — Collapsible contextual panel.
 * Shows: writing statistics, article outline (headings), and SEO/Readability Advisor.
 * Reads from Nano Stores — zero prop drilling.
 * Per AGENTS.md: icons from lucide-react. All values from CSS tokens.
 */
import React, { useCallback, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { ChevronLeft, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { $outline, $stats, $ui, $title, toggleLeftSidebar } from './editorStore';
import type { OutlineItem } from '@/types/editor';

function StatItem({ label, value, style }: { label: string; value: string | number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, boxSizing: 'border-box', ...style }}>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          fontWeight: 'var(--fw-semibold)',
          letterSpacing: '0.06em',
          color: 'var(--color-muted-soft)',
          textTransform: 'uppercase',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-body-sm)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--color-body-strong)',
          lineHeight: 'var(--lh-body)',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          minWidth: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}


// ─── Outline item ─────────────────────────────────────────────────────────────

const HEADING_INDENT: Record<number, string> = {
  1: 'pl-0',
  2: 'pl-xs',
  3: 'pl-sm',
  4: 'pl-base',
  5: 'pl-md',
  6: 'pl-lg',
};

interface OutlineItemRowProps {
  item: OutlineItem;
  isSkipped: boolean;
}

function OutlineItemRow({ item, isSkipped }: OutlineItemRowProps) {
  const handleClick = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-id="${item.id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const editable = el.querySelector<HTMLElement>('[contenteditable="true"]');
      if (editable) editable.focus();
    }
  }, [item.id]);

  // Font size per heading level — inline to guarantee token resolution
  const fontSize = item.level === 1
    ? 'var(--fs-body-sm)'
    : 'var(--fs-caption)';
  const fontWeight = item.level <= 2
    ? 'var(--fw-medium)'
    : 'var(--fw-regular)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize,
          fontWeight,
          color: 'var(--color-muted)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          paddingTop: 'var(--space-xxs)',
          paddingBottom: 'var(--space-xxs)',
          paddingRight: 'var(--space-lg)',
          borderRadius: 'var(--radius-xs)',
          transition: `color var(--duration-150) var(--ease-out)`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
        }}
        className={HEADING_INDENT[item.level] ?? 'pl-0'}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
        onFocus={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)'; }}
        onBlur={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
        title={item.text}
      >
        {item.text}
      </button>

      {isSkipped && (
        <span
          style={{
            position: 'absolute',
            right: 'var(--space-xxs)',
            color: 'var(--color-warning)',
            cursor: 'help',
            flexShrink: 0,
          }}
          title="Accessibility warning: Heading levels skipped (e.g., H1 directly to H3). Check nesting hierarchy."
        >
          <AlertTriangle size={12} strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SidebarSection({
  title,
  children,
  divider = false,
}: {
  title: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
        ...(divider && {
          borderTop: '1px solid var(--color-hairline)',
          paddingTop: 'var(--space-lg)',
        }),
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',               /* 10px micro uppercase */
          fontWeight: 'var(--fw-semibold)',
          letterSpacing: '0.08em',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 'var(--space-xxs)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Collapse toggle button ───────────────────────────────────────────────────

interface CollapseButtonProps {
  open: boolean;
}

function CollapseButton({ open }: CollapseButtonProps) {
  return (
    <button
      id="editor-sidebar-toggle"
      type="button"
      onClick={toggleLeftSidebar}
      aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-expanded={open}
      style={{
        position: 'absolute',
        right: '-12px',
        top: '24px',
        zIndex: 10,
        width: '24px',
        height: '24px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-hairline)',
        backgroundColor: 'var(--color-surface-card)',
        boxShadow: 'var(--shadow-card-hover)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-muted)',
        transition: 'color var(--duration-150) var(--ease-out), border-color var(--duration-150) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-hairline-strong)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-hairline)';
      }}
    >
      <ChevronLeft
        size={14}
        strokeWidth={2}
        style={{
          transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform var(--duration-200) var(--ease-out)',
        }}
      />
    </button>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export function LeftSidebar() {
  const ui = useStore($ui);
  const stats = useStore($stats);
  const outline = useStore($outline);
  const title = useStore($title);

  const readingTime = stats.readingTimeMinutes === 1
    ? '1 min read'
    : `${stats.readingTimeMinutes} min read`;

  // Compute structure errors for the advisor
  const advisorTips = useMemo(() => {
    const tips: { type: 'warning' | 'info'; text: string }[] = [];

    // Title length advisor
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      tips.push({ type: 'info', text: 'Add an article title to begin.' });
    } else if (cleanTitle.length < 10) {
      tips.push({ type: 'info', text: 'Title is very short (<10 chars).' });
    } else if (cleanTitle.length > 60) {
      tips.push({ type: 'warning', text: 'Title exceeds 60 chars. May get truncated in Google SERPs.' });
    }

    // Article depth advisor
    if (stats.wordCount > 0 && stats.wordCount < 300) {
      tips.push({ type: 'info', text: 'Draft is under 300 words. Add depth for SEO visibility.' });
    }

    // Heading skipped level advisor
    let hasSkipped = false;
    for (let i = 1; i < outline.length; i++) {
      if (outline[i].level > outline[i - 1].level + 1) {
        hasSkipped = true;
        break;
      }
    }
    if (hasSkipped) {
      tips.push({ type: 'warning', text: 'Nesting skipped in headings (e.g. H1 to H3). Fix hierarchy.' });
    }

    return tips;
  }, [title, stats.wordCount, outline]);

  return (
    <aside
      id="editor-left-sidebar"
      aria-label="Article outline and statistics"
      className="editor-responsive-left-sidebar"
      style={{
        position: 'relative',
        flexShrink: 0,
        borderRight: '1px solid var(--color-hairline-strong)', /* visible separator */
        transition: 'width var(--duration-300) var(--ease-out), opacity var(--duration-300) var(--ease-out)',
        overflow: 'hidden',
        width: ui.leftSidebarOpen ? '260px' : '0px',
        opacity: ui.leftSidebarOpen ? 1 : 0,
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .editor-responsive-left-sidebar {
            display: none !important;
          }
        }
      `}</style>
      <div
        style={{
          width: '260px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',  /* unified 20px gap between sections */
          padding: 'var(--space-lg) var(--space-md)', /* 20px v, 16px h — tighter fit */
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          background: 'rgba(248, 250, 252, 0.90)', /* canvas at 90% — orbs bleed through */
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* Writing stats */}
        <SidebarSection title="Statistics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm) var(--space-xs)' }}>
              <StatItem label="Words" value={stats.wordCount.toLocaleString()} />
              <StatItem label="Characters" value={stats.charCount.toLocaleString()} />
              <StatItem label="Paragraphs" value={stats.paragraphCount} />
              <StatItem label="Read Time" value={readingTime} />
            </div>

            {stats.wordCount > 0 && (
              <StatItem
                label="Readability"
                value={`${stats.readabilityScore ?? 100} — ${stats.readabilityLabel ?? 'Standard'}`}
                style={{
                  borderTop: '1px solid var(--color-hairline)',
                  paddingTop: 'var(--space-sm)',
                }}
              />
            )}
          </div>
        </SidebarSection>

        {/* Advisor */}
        <SidebarSection title="Structure Advisor" divider>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {advisorTips.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-xs)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--color-success)',
                }}
              >
                <CheckCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>Nesting, title size, and readability look excellent!</span>
              </div>
            ) : (
              advisorTips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-xs)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--fs-caption)',
                    color: tip.type === 'warning' ? 'var(--color-warning)' : 'var(--color-muted)',
                  }}
                >
                  {tip.type === 'warning' ? (
                    <AlertTriangle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  ) : (
                    <Info size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  )}
                  <span>{tip.text}</span>
                </div>
              ))
            )}
          </div>
        </SidebarSection>

        {/* Article outline */}
        {outline.length > 0 ? (
          <SidebarSection title="Outline" divider>
            <nav aria-label="Article headings outline">
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {outline.map((item, index) => {
                  const prev = index > 0 ? outline[index - 1] : null;
                  const isSkipped = prev ? item.level > prev.level + 1 : false;
                  return (
                    <li key={item.id}>
                      <OutlineItemRow item={item} isSkipped={isSkipped} />
                    </li>
                  );
                })}
              </ol>
            </nav>
          </SidebarSection>
        ) : (
          <SidebarSection title="Outline" divider>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--color-muted-soft)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              Add headings to see your outline here.
            </p>
          </SidebarSection>
        )}
      </div>

      {/* Collapse/expand toggle */}
      <CollapseButton open={ui.leftSidebarOpen} />
    </aside>
  );
}
