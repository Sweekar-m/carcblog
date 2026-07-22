import React, { useState, useEffect } from 'react';

export const AISettingsForm: React.FC = () => {
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [testing, setTesting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current AI settings on load
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-settings');
      if (res.ok) {
        const data = await res.json();
        setHasKey(data.hasKey);
        if (data.provider) setProvider(data.provider);
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
          provider,
          apiKey: apiKey || 'KEEP_EXISTING', // If testing unsaved key
          testOnly: true
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'API Key verification failed.' });
      } else {
        setMessage({ type: 'success', text: `Connection successful! Your ${provider === 'gemini' ? 'Google Gemini' : 'OpenRouter'} key is valid.` });
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
          provider,
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
        setApiKey(''); // Clear plaintext from local state
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
      style={{
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-hairline)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-card)',
        marginTop: 'var(--space-xl)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--fs-display-sm)',
              fontWeight: 'var(--fw-light)',
              color: 'var(--color-ink)',
              margin: 0
            }}
          >
            AI Writer Settings (BYO Key)
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--color-muted)', margin: '4px 0 0 0' }}>
            Bring your own Google Gemini or OpenRouter API key to enable AI writing tools in the article editor. Keys are encrypted server-side and never exposed.
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
            color: hasKey ? '#16a34a' : 'var(--color-muted)'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hasKey ? '#16a34a' : 'var(--color-muted)' }} />
          {hasKey ? 'AI Key Configured' : 'No Key Saved'}
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
        {/* Provider Selection */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-ink)', marginBottom: 'var(--space-xs)' }}>
            AI Provider
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <label
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'var(--space-sm) var(--space-base)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${provider === 'gemini' ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                background: provider === 'gemini' ? 'var(--color-surface-strong)' : 'transparent',
                cursor: 'pointer',
                fontSize: 'var(--fs-body-sm)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <input
                type="radio"
                name="provider"
                value="gemini"
                checked={provider === 'gemini'}
                onChange={() => setProvider('gemini')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <strong>Google Gemini</strong>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>gemini-3.6-flash (Interactions API)</div>
              </div>
            </label>

            <label
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'var(--space-sm) var(--space-base)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${provider === 'openrouter' ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                background: provider === 'openrouter' ? 'var(--color-surface-strong)' : 'transparent',
                cursor: 'pointer',
                fontSize: 'var(--fs-body-sm)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <input
                type="radio"
                name="provider"
                value="openrouter"
                checked={provider === 'openrouter'}
                onChange={() => setProvider('openrouter')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <strong>OpenRouter</strong>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>OpenAI-compatible router</div>
              </div>
            </label>
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-ink)', marginBottom: 'var(--space-xs)' }}>
            {provider === 'gemini' ? 'Google AI Studio API Key' : 'OpenRouter API Key'}
          </label>

          {hasKey && maskedKey && !apiKey && (
            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-muted)', marginBottom: '6px' }}>
              Currently saved: <code style={{ background: 'var(--color-surface-strong)', padding: '2px 6px', borderRadius: '4px' }}>{maskedKey}</code> (Enter a new key below to replace)
            </div>
          )}

          <input
            type="password"
            placeholder={hasKey && maskedKey ? 'Enter new key to replace existing...' : provider === 'gemini' ? 'AIzaSy...' : 'sk-or-v1-...'}
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
              fontSize: 'var(--fs-body-sm)'
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
              {testing ? 'Testing Connection...' : 'Test Connection'}
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
