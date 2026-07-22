/**
 * SubtitleInput — Article excerpt / subtitle.
 * Per design.md: title-md token (Inter 500, 20px) for the subtitle level.
 * Per AGENTS.md: font-sans for all UI inputs — never serif.
 * All values from CSS tokens. Zero hardcoded hex/px.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $subtitle, $draftStatus } from './editorStore';

const PLACEHOLDER = 'Add a subtitle or short description…';
const MAX_CHARS = 300;

export function SubtitleInput() {
  const subtitleValue = useStore($subtitle);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => { autoGrow(); }, [autoGrow, subtitleValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length > MAX_CHARS) return;
      $subtitle.set(e.target.value);
      $draftStatus.set('dirty');
      autoGrow();
    },
    [autoGrow]
  );

  /** Enter (without Shift) moves focus into the BlockNote editor */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const bnEditor = document.querySelector<HTMLElement>(
        '.bn-editor [contenteditable="true"]'
      );
      if (bnEditor) bnEditor.focus();
    }
  }, []);

  const remaining = MAX_CHARS - subtitleValue.length;
  const showCounter = subtitleValue.length > MAX_CHARS * 0.8;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Scoped placeholder style — browser default overrides inline color */}
      <style>{`
        #editor-subtitle-input::placeholder {
          color: var(--color-muted);  /* #777169 — subtitle-level muted hint */
          opacity: 1;
        }
      `}</style>
      <textarea
        id="editor-subtitle-input"
        ref={textareaRef}
        value={subtitleValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onInput={autoGrow}
        placeholder={PLACEHOLDER}
        rows={1}
        aria-label="Article subtitle or excerpt"
        aria-describedby={showCounter ? 'subtitle-char-count' : undefined}
        maxLength={MAX_CHARS}
        spellCheck
        autoComplete="off"
        style={{
          // title-md token: Inter 500, 20px — closest to a subtitle level
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-regular)',   /* 400 — body weight for readability */
          fontSize: 'var(--fs-title-md)',    /* 20px */
          lineHeight: 'var(--lh-title-md)',  /* 1.35 */
          letterSpacing: '0',          /* design.md title-md: letterSpacing 0 */
          color: 'var(--color-muted)',
          caretColor: 'var(--color-ink)',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none',
          width: '100%',
          padding: '0',
          margin: '0',
          overflow: 'hidden',
        }}
      />
      {showCounter && (
        <span
          id="subtitle-char-count"
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-caption-upper)',
            letterSpacing: 'var(--ls-caption-upper)',
            color: 'var(--color-muted-soft)',
            textTransform: 'uppercase',
          }}
          aria-label={`${remaining} characters remaining`}
        >
          {remaining}
        </span>
      )}
    </div>
  );
}
