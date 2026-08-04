import React, { useState, useEffect } from 'react';

interface AISettingsFormProps {
  embedded?: boolean;
}

export const AISettingsForm: React.FC<AISettingsFormProps> = ({ embedded = false }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [testing, setTesting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Fetch current AI settings on load
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-settings');
      if (res.ok) {
        const data = await res.json();
        setHasKey(data.hasKey);
        if (data.maskedKey) setMaskedKey(data.maskedKey);
      }
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle Test Connection
  const handleTest = async () => {
    if (!apiKey && !hasKey) {
      setMessage({ type: 'error', text: 'Please enter an API key to test.' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          apiKey: apiKey || 'KEEP_EXISTING',
          testOnly: true
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'API Key verification failed.' });
      } else {
        setMessage({ type: 'success', text: 'Connection successful! Your Google Gemini key is valid.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  // Handle Save Key
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setMessage({ type: 'error', text: 'Please enter an API key.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          apiKey
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings.' });
      } else {
        setMessage({ type: 'success', text: 'AI Writer settings saved securely!' });
        setHasKey(true);
        setMaskedKey(data.maskedKey);
        setApiKey('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle Remove Key
  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your AI API key?')) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/ai-settings', { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'AI API key removed.' });
        setHasKey(false);
        setMaskedKey(null);
        setApiKey('');
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to remove key.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error removing key.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-md)', color: 'var(--color-muted)', fontSize: 'var(--fs-body-sm)' }}>
        Loading AI Settings...
      </div>
    );
  }

  return (
    <div
      style={embedded ? {} : {
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-card)',
        marginTop: 'var(--space-xl)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', gap: '12px' }}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-card-title)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--color-ink-strong)',
              margin: 0
            }}
          >
            AI Writer — Google Gemini
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--color-muted)', margin: '4px 0 0 0' }}>
            Add your Google Gemini API key to enable AI writing tools in the article editor. Keys are encrypted and never exposed.
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 'var(--fw-medium)',
            background: hasKey ? 'rgba(22, 163, 74, 0.1)' : 'var(--color-surface-strong)',
            color: hasKey ? '#16a34a' : 'var(--color-muted)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hasKey ? '#16a34a' : 'var(--color-muted)' }} />
          {hasKey ? 'Key Configured' : 'No Key Saved'}
        </span>
      </div>

      {message && (
        <div
          style={{
            padding: 'var(--space-sm) var(--space-base)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-md)',
            fontSize: 'var(--fs-body-sm)',
            fontFamily: 'var(--font-sans)',
            background: message.type === 'error' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(22, 163, 74, 0.08)',
            border: `1px solid ${message.type === 'error' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(22, 163, 74, 0.2)'}`,
            color: message.type === 'error' ? '#dc2626' : '#16a34a'
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* How to get API Key guide */}
        <div
          style={{
            background: 'var(--color-surface-soft, #f8fafc)',
            border: '1px solid var(--color-hairline, #e2e8f0)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: 'var(--space-md, 16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm, 14px)', color: 'var(--color-ink-strong, #0f172a)' }}>
              How to get your Google Gemini API Key (Free)
            </strong>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted, #64748b)',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showGuide ? 'Hide' : 'Show'}
            </button>
          </div>

          {showGuide && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-hairline-soft, #f1f5f9)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-body, #475569)', margin: 0, lineHeight: 1.5 }}>
                  Google provides free API keys for <strong>Gemini Flash</strong> with generous daily quotas — no credit card required.
                </p>

                <ol style={{ margin: 0, paddingLeft: '18px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-body, #475569)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Open <strong>Google AI Studio</strong> using the button below.</li>
                  <li>Sign in with your Google account.</li>
                  <li>Click the blue <strong>"Create API key"</strong> button.</li>
                  <li>Copy the key (starts with <code style={{ background: 'var(--color-surface-strong, #f1f5f9)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>AIzaSy...</code>).</li>
                  <li>Paste it into the field below and click <strong>"Save AI Key"</strong>.</li>
                </ol>

                <div style={{ marginTop: '4px' }}>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      background: 'var(--color-primary, #0f172a)',
                      color: 'var(--color-on-primary, #ffffff)',
                      fontSize: '12px',
                      fontWeight: 'var(--fw-medium, 500)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <span>Get Free Gemini Key → Google AI Studio</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API Key Input */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-ink)', marginBottom: 'var(--space-xs)' }}>
            Google AI Studio API Key
          </label>

          {hasKey && maskedKey && !apiKey && (
            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-muted)', marginBottom: '6px' }}>
              Currently saved: <code style={{ background: 'var(--color-surface-strong)', padding: '2px 6px', borderRadius: '4px' }}>{maskedKey}</code> — enter a new key below to replace
            </div>
          )}

          <input
            type="password"
            placeholder={hasKey && maskedKey ? 'Enter new key to replace existing...' : 'AIzaSy...'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-hairline)',
              background: 'var(--color-surface-card)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-body-sm)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-xs)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || (!apiKey && !hasKey)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-hairline-strong)',
                background: 'transparent',
                color: 'var(--color-ink)',
                fontSize: 'var(--fs-body-sm)',
                fontWeight: 'var(--fw-medium)',
                cursor: testing || (!apiKey && !hasKey) ? 'not-allowed' : 'pointer',
                opacity: testing || (!apiKey && !hasKey) ? 0.6 : 1
              }}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="submit"
              disabled={saving || !apiKey}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                fontSize: 'var(--fs-body-sm)',
                fontWeight: 'var(--fw-medium)',
                cursor: saving || !apiKey ? 'not-allowed' : 'pointer',
                opacity: saving || !apiKey ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save AI Key'}
            </button>
          </div>

          {hasKey && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: 'transparent',
                color: 'var(--color-error)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 'var(--fw-medium)',
                cursor: 'pointer'
              }}
            >
              Remove Key
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AISettingsForm;
