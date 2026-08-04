import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Sparkles } from 'lucide-react';
import { AIChatPanel } from './AIChatPanel';
import { $aiSettings, loadAiSettings } from './aiSettingsStore';
import { useState } from 'react';

export const AIWriterMenu: React.FC = () => {
  // Read AI settings from the shared store — no local fetch
  const { hasKey, provider, loading: loadingConfig } = useStore($aiSettings);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Trigger the shared fetch on mount — deduplication inside loadAiSettings()
  // means this is a no-op if AIChatPanel or AISettingsForm already called it
  useEffect(() => {
    loadAiSettings();
  }, []);

  return (
    <>
      {/* Toolbar Button */}
      <button
        id="editor-ai-writer-btn"
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        disabled={loadingConfig}
        aria-pressed={chatOpen}
        title={hasKey ? `AI Assistant (${provider === 'gemini' ? 'Gemini 3.6' : 'OpenRouter'})` : 'No AI key configured — Add key in Profile Settings'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-xxs)',
          height: '32px',
          padding: '0 var(--space-sm)',
          borderRadius: 'var(--radius-sm)',
          border: chatOpen ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid var(--color-hairline)',
          background: chatOpen ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
          color: chatOpen ? '#7C3AED' : (hasKey ? 'var(--color-ink)' : 'var(--color-muted)'),
          opacity: hasKey ? 1 : 0.65,
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-caption)',
          fontWeight: chatOpen ? 'var(--fw-medium)' : 'var(--fw-regular)',
          cursor: loadingConfig ? 'wait' : 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        <Sparkles size={14} strokeWidth={1.75} style={{ color: hasKey || chatOpen ? '#7C3AED' : 'var(--color-muted)' }} />
        <span>AI Assistant</span>
        {!hasKey && !loadingConfig && (
          <span style={{ fontSize: '10px', background: 'var(--color-surface-strong)', padding: '1px 5px', borderRadius: '4px', color: 'var(--color-muted)' }}>
            Off
          </span>
        )}
      </button>

      {/* Sliding AI Chatbot Panel */}
      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default AIWriterMenu;
