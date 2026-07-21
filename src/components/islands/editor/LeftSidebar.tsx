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

// ─── Stats display ─────────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: string | number;
  className?: string;
}

function StatItem({ label, value, className = 'flex flex-col gap-xxs' }: StatItemProps) {
  return (
    <div className={className}>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-caption-upper)',
          fontWeight: 'var(--fw-semibold)',
          letterSpacing: 'var(--ls-caption-upper)',
          color: 'var(--color-muted-soft)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-title-sm)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--color-body-strong)',
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

  const sizeClass = item.level === 1
    ? 'text-body-sm font-medium'
    : item.level === 2
      ? 'text-caption font-medium'
      : 'text-caption font-regular';

  return (
    <div className="flex items-center justify-between w-full group relative">
      <button
        type="button"
        onClick={handleClick}
        style={{
          fontFamily: 'var(--font-sans)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          paddingTop: 'var(--space-xxs)',
          paddingBottom: 'var(--space-xxs)',
          borderRadius: 'var(--radius-xs)',
        }}
        className={[
          HEADING_INDENT[item.level] ?? 'pl-0',
          sizeClass,
          'text-muted hover:text-body-strong transition-colors duration-100 truncate flex-1 min-w-0 pr-6',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
        ].join(' ')}
        title={item.text}
      >
        {item.text}
      </button>

      {isSkipped && (
        <span
          className="absolute right-1 text-orange-500 cursor-help"
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-xs">
      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-caption-upper)',
          fontWeight: 'var(--fw-semibold)',
          letterSpacing: 'var(--ls-caption-upper)',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 'var(--space-xs)',
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
      className="relative flex-shrink-0 border-r border-hairline transition-all duration-300 ease-out overflow-hidden"
      style={{
        width: ui.leftSidebarOpen ? '260px' : '0px',
        opacity: ui.leftSidebarOpen ? 1 : 0,
      }}
    >
      <div
        className="w-[260px] h-full flex flex-col gap-xl px-lg py-xl overflow-y-auto"
        style={{ background: 'var(--color-canvas-soft)' }}
      >
        {/* Writing stats */}
        <SidebarSection title="Statistics">
          <div className="flex flex-col gap-sm">
            <div className="grid grid-cols-2 gap-sm">
              <StatItem label="Words" value={stats.wordCount.toLocaleString()} />
              <StatItem label="Characters" value={stats.charCount.toLocaleString()} />
              <StatItem label="Paragraphs" value={stats.paragraphCount} />
              <StatItem label="Read time" value={readingTime} />
            </div>
            
            {stats.wordCount > 0 && (
              <StatItem 
                label="Readability Ease" 
                value={`${stats.readabilityScore ?? 100} (${stats.readabilityLabel ?? 'Standard'})`} 
                className="flex flex-col gap-xxs border-t border-hairline pt-sm"
              />
            )}
          </div>
        </SidebarSection>

        {/* Advisor */}
        <SidebarSection title="Structure Advisor">
          <div className="flex flex-col gap-xs">
            {advisorTips.length === 0 ? (
              <div className="flex items-start gap-xs text-caption text-emerald-600" style={{ fontFamily: 'var(--font-sans)' }}>
                <CheckCircle size={14} className="mt-[2px] flex-shrink-0" />
                <span>Nesting, title size, and readability scores look excellent!</span>
              </div>
            ) : (
              advisorTips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-xs text-caption ${tip.type === 'warning' ? 'text-amber-600' : 'text-muted'}`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {tip.type === 'warning' ? (
                    <AlertTriangle size={14} className="mt-[2px] flex-shrink-0" />
                  ) : (
                    <Info size={14} className="mt-[2px] flex-shrink-0" />
                  )}
                  <span>{tip.text}</span>
                </div>
              ))
            )}
          </div>
        </SidebarSection>

        {/* Article outline */}
        {outline.length > 0 ? (
          <SidebarSection title="Outline">
            <nav aria-label="Article headings outline">
              <ol className="flex flex-col gap-[2px]" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
          <SidebarSection title="Outline">
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
