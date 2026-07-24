import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@nanostores/react';
import {
  Sparkles,
  Send,
  X,
  FileText,
  Type,
  Image as ImageIcon,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { $title, $subtitle, $content } from './editorStore';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  structured?: {
    replyText?: string;
    headline?: string;
    subtitle?: string;
    articleBody?: string;
    imageSuggestion?: string;
  };
  timestamp: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Write a story about a startup pivoting to AI, turn it into a full blog.',
  'Convert my ideas into an editorial article with headline & image suggestions.',
  'Generate 3 high-converting headlines & subtitles for my article.',
  'Write an engaging introduction and outline about modern tech trends.'
];

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose }) => {
  const title = useStore($title);
  const subtitle = useStore($subtitle);
  const content = useStore($content);

  const [mounted, setMounted] = useState<boolean>(false);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Set mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check AI provider settings on load
  useEffect(() => {
    fetch('/api/ai-settings')
      .then((res) => res.json())
      .then((data) => {
        setHasKey(!!data.hasKey);
        setProvider(data.provider || null);
      })
      .catch((err) => console.error('Failed to load AI settings:', err))
      .finally(() => setLoadingConfig(false));
  }, []);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: 'Hello! I am your CarcBlog AI Assistant. Tell me what story or article idea you want to write, and I will generate a complete blog post with headline, subtitle, full content, and image suggestions.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Handle Send Message
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSubmit = (customPrompt || inputText).trim();
    if (!promptToSubmit || loading) return;

    if (!hasKey) {
      setStatusMessage({ type: 'error', text: 'No AI key configured. Please add a key in Profile Settings.' });
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: promptToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          prompt: promptToSubmit,
          context: title ? `Current Title: ${title}\nSubtitle: ${subtitle}` : ''
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error === 'NO_KEY_CONFIGURED') {
          setHasKey(false);
          setStatusMessage({ type: 'error', text: 'No AI key configured. Add one in Profile Settings.' });
        } else {
          setStatusMessage({ type: 'error', text: data.message || data.error || 'Failed to generate content.' });
        }
        return;
      }

      const structured = data.structured || {
        replyText: 'Here is your story blog post:',
        headline: 'Article Story',
        articleBody: data.result,
        imageSuggestion: 'Startup technology minimal'
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: structured.replyText || 'I have created your article structure below:',
        structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error communicating with AI Assistant.' });
    } finally {
      setLoading(false);
    }
  };

  // Action 1: Apply Headline & Subtitle to Editor
  const handleApplyHeadlineSubtitle = (headline?: string, sub?: string) => {
    if (headline) $title.set(headline);
    if (sub) $subtitle.set(sub);
    setStatusMessage({ type: 'success', text: 'Headline and Subtitle applied to article!' });
  };

  // Action 2: Insert Full Story into BlockNote Editor
  const handleInsertArticle = (articleBody?: string) => {
    if (!articleBody) return;
    window.dispatchEvent(new CustomEvent('editor:ai-insert-outline', { detail: { text: articleBody } }));
    setStatusMessage({ type: 'success', text: 'Full article story inserted into editor!' });
  };

  // Action 3: Trigger Image Suggestion Search
  const handleSearchImage = (query?: string) => {
    if (!query) return;
    window.dispatchEvent(new CustomEvent('editor:open-media-search', { detail: { query } }));
    setStatusMessage({ type: 'success', text: `Opened media search for "${query}"` });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '420px',
        maxWidth: '100vw',
        background: 'var(--color-canvas)',
        borderLeft: '1px solid var(--color-hairline-strong)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-md) var(--space-base)',
          borderBottom: '1px solid var(--color-hairline)',
          background: 'var(--color-surface-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(124, 58, 237, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7C3AED'
            }}
          >
            <Sparkles size={16} />
          </div>
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
              AI Story Assistant
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
              {hasKey ? `Powered by ${provider === 'gemini' ? 'Gemini 3.6 Flash' : 'OpenRouter'}` : 'No AI Key Configured'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Alert banner if no key */}
      {!hasKey && !loadingConfig && (
        <div
          style={{
            padding: 'var(--space-sm) var(--space-base)',
            background: 'rgba(220, 38, 38, 0.08)',
            borderBottom: '1px solid rgba(220, 38, 38, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--fs-caption)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
            <AlertCircle size={14} />
            <span>Add an API key to enable AI generation.</span>
          </div>
          <a
            href="/dashboard/profile"
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: '#dc2626',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 'var(--fw-medium)'
            }}
          >
            Settings
          </a>
        </div>
      )}

      {/* Status toast message */}
      {statusMessage && (
        <div
          style={{
            padding: '8px 14px',
            background: statusMessage.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
            color: statusMessage.type === 'error' ? '#dc2626' : '#16a34a',
            fontSize: '12px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <CheckCircle2 size={14} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'var(--space-base)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '6px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Sender Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-muted)' }}>
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User size={12} />
                </>
              ) : (
                <>
                  <Bot size={12} style={{ color: '#7C3AED' }} />
                  <span>AI Assistant</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Message Bubble / Card */}
            <div
              style={{
                maxWidth: '100%',
                boxSizing: 'border-box',
                padding: 'var(--space-sm) var(--space-base)',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--color-surface-card)',
                color: msg.sender === 'user' ? 'var(--color-on-primary)' : 'var(--color-ink)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--color-hairline)',
                fontSize: 'var(--fs-body-sm)',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                boxShadow: msg.sender === 'assistant' ? 'var(--shadow-card)' : 'none'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>{msg.text}</div>

              {/* Structured Blog Card Output */}
              {msg.structured && (
                <div
                  style={{
                    marginTop: 'var(--space-sm)',
                    paddingTop: 'var(--space-sm)',
                    borderTop: '1px solid var(--color-hairline)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-xs)'
                  }}
                >
                  {/* Headline / Title */}
                  {msg.structured.headline && (
                    <div style={{ background: 'var(--color-surface-strong)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 'var(--fw-semibold)' }}>
                        Proposed Headline
                      </div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 'var(--fw-semibold)', color: 'var(--color-ink-strong)', marginTop: '2px' }}>
                        {msg.structured.headline}
                      </div>
                    </div>
                  )}

                  {/* Subtitle / Excerpt */}
                  {msg.structured.subtitle && (
                    <div style={{ background: 'var(--color-surface-strong)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 'var(--fw-semibold)' }}>
                        Proposed Subtitle
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-body)', marginTop: '2px' }}>
                        {msg.structured.subtitle}
                      </div>
                    </div>
                  )}

                  {/* Image Suggestion */}
                  {msg.structured.imageSuggestion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0EA5E9', background: 'rgba(14, 165, 233, 0.08)', padding: '6px 10px', borderRadius: 'var(--radius-pill)' }}>
                      <ImageIcon size={14} />
                      <span>Suggested Cover Image: <strong>{msg.structured.imageSuggestion}</strong></span>
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'var(--space-xs)' }}>
                    {msg.structured.headline && (
                      <button
                        type="button"
                        onClick={() => handleApplyHeadlineSubtitle(msg.structured?.headline, msg.structured?.subtitle)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--color-hairline-strong)',
                          background: 'transparent',
                          color: 'var(--color-ink)',
                          fontSize: '12px',
                          fontWeight: 'var(--fw-medium)',
                          cursor: 'pointer'
                        }}
                      >
                        <Type size={14} style={{ color: '#7C3AED' }} />
                        <span>Apply Headline & Subtitle to Article</span>
                      </button>
                    )}

                    {msg.structured.articleBody && (
                      <button
                        type="button"
                        onClick={() => handleInsertArticle(msg.structured?.articleBody)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-pill)',
                          border: 'none',
                          background: 'var(--color-primary)',
                          color: 'var(--color-on-primary)',
                          fontSize: '12px',
                          fontWeight: 'var(--fw-medium)',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={14} />
                        <span>Insert Full Story into Editor</span>
                      </button>
                    )}

                    {msg.structured.imageSuggestion && (
                      <button
                        type="button"
                        onClick={() => handleSearchImage(msg.structured?.imageSuggestion)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--color-hairline)',
                          background: 'transparent',
                          color: '#0EA5E9',
                          fontSize: '12px',
                          fontWeight: 'var(--fw-medium)',
                          cursor: 'pointer'
                        }}
                      >
                        <ImageIcon size={14} />
                        <span>Search Suggested Image ({msg.structured.imageSuggestion})</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-muted)', fontSize: '13px', padding: '8px' }}>
            <Loader2 size={16} className="animate-spin" style={{ color: '#7C3AED' }} />
            <span>AI Assistant is writing story & blog package...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ padding: 'var(--space-xs) var(--space-base)', borderTop: '1px solid var(--color-hairline)', overflowX: 'auto', display: 'flex', gap: '6px' }}>
        {QUICK_PROMPTS.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            disabled={loading || !hasKey}
            style={{
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-hairline)',
              background: 'var(--color-surface-card)',
              color: 'var(--color-muted)',
              fontSize: '11px',
              cursor: loading || !hasKey ? 'not-allowed' : 'pointer',
              flexShrink: 0
            }}
          >
            {promptText.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div style={{ padding: 'var(--space-sm) var(--space-base)', borderTop: '1px solid var(--color-hairline)', background: 'var(--color-surface-card)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'flex-end' }}
        >
          <textarea
            ref={inputRef}
            rows={2}
            placeholder={hasKey ? "Tell AI what story to write, ask for rewrites, or request ideas..." : "No AI Key — configure in Settings to chat..."}
            value={inputText}
            disabled={!hasKey || loading}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-hairline)',
              background: 'var(--color-canvas)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-body-sm)',
              resize: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!hasKey || loading || !inputText.trim()}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !hasKey || loading || !inputText.trim() ? 'not-allowed' : 'pointer',
              opacity: !hasKey || loading || !inputText.trim() ? 0.5 : 1
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AIChatPanel;
