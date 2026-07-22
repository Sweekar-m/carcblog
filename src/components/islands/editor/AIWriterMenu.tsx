import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AIChatPanel } from './AIChatPanel';

export const AIWriterMenu: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Fetch AI settings on mount
  useEffect(() => {
    fetch('/api/ai-settings')
      .then((res) => res.json())
      .then((data) => {
        setHasKey(!!data.hasKey);
        setProvider(data.provider || null);
      })
      .catch((err) => console.error('Failed to load AI settings status:', err))
      .finally(() => setLoadingConfig(false));
  }, []);

  return (
    <>
      {/* Toolbar Button */}
      <button
        id="editor-ai-writer-btn"
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        disabled={loadingConfig}
        title={hasKey ? `AI Assistant (${provider === 'gemini' ? 'Gemini 3.6' : 'OpenRouter'})` : 'No AI key configured — Add key in Profile Settings'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-xxs)',
          height: '32px',
          padding: '0 var(--space-sm)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-hairline)',
          background: chatOpen ? 'var(--color-surface-strong)' : 'transparent',
          color: hasKey ? 'var(--color-ink)' : 'var(--color-muted)',
          opacity: hasKey ? 1 : 0.7,
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-caption)',
          fontWeight: 'var(--fw-medium)',
          cursor: loadingConfig ? 'wait' : 'pointer',
          transition: 'all 150ms ease'
        }}
      >
        <Sparkles size={14} strokeWidth={1.75} style={{ color: hasKey ? '#7C3AED' : 'var(--color-muted)' }} />
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
