/**
 * KeyboardShortcutsModal — overlay dialog showing keyboard shortcut references.
 * Triggered by pressing '?' (outside text fields) or clicking a toolbar help shortcut.
 * Per design.md: rounded-xl for card overlay, button-primary for dismiss.
 */
import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-sm) 0',
        borderBottom: '1px solid var(--color-hairline-soft)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-caption)',
          color: 'var(--color-body)',
        }}
      >
        {description}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-xxs)' }}>
        {keys.map((key, idx) => (
          <kbd
            key={idx}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption-upper)',
              fontWeight: 'var(--fw-semibold)',
              background: 'var(--color-surface-strong)',
              border: '1px solid var(--color-hairline-strong)',
              borderRadius: 'var(--radius-xs)',
              padding: '2px 6px',
              color: 'var(--color-body-strong)',
              boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
            }}
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts reference"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(12, 10, 9, 0.4)', // transparent ink background
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-hairline)',
          boxShadow: 'var(--shadow-card-hover)',
          padding: 'var(--space-lg)',
          position: 'relative',
          margin: 'var(--space-base)',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent close on card click
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-md)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-title-sm)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--color-body-strong)',
              margin: 0,
            }}
          >
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts list"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              transition: 'color var(--duration-150) var(--ease-out), background var(--duration-150) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-strong)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ShortcutRow keys={['Cmd', 'S']} description="Save draft explicitly" />
          <ShortcutRow keys={['Ctrl', 'S']} description="Save draft (Windows)" />
          <ShortcutRow keys={['F']} description="Toggle Focus Mode (when not editing)" />
          <ShortcutRow keys={['Cmd', 'P']} description="Toggle Preview Mode" />
          <ShortcutRow keys={['Esc']} description="Exit Focus Mode / Close Panels" />
          <ShortcutRow keys={['/']} description="Open Slash Command blocks menu" />
          <ShortcutRow keys={['?']} description="Toggle keyboard shortcuts menu" />
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 'var(--h-btn)',
              padding: '0 var(--space-base)',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-btn)',
              fontWeight: 'var(--fw-medium)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background var(--duration-150) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-active)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
