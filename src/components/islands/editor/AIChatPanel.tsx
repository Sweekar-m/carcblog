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
  AlertCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  // Reset conversation handler
  const handleClearConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Hello! I am your CarcBlog AI Assistant. Tell me what story or article idea you want to write, and I will generate a complete blog post with headline, subtitle, full content, and image suggestions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setStatusMessage({ type: 'success', text: 'Conversation history reset. Ready for a new article idea!' });
  };

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

    // Build session conversation history payload for backend context
    const messagesPayload = messages
      .filter((m) => !m.id.startsWith('welcome-'))
      .map((m) => ({
        role: m.sender,
        content: m.text
      }));

    try {
      const res = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          prompt: promptToSubmit,
          context: title ? `Current Title: ${title}\nSubtitle: ${subtitle}` : '',
          messages: messagesPayload
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error === 'NO_KEY_CONFIGURED') {
          setHasKey(false);
          // In development mode, check if prompt is vague vs specific
          if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
            const lower = promptToSubmit.toLowerCase();
            const isVague = promptToSubmit.length < 25 && (
              lower.includes('hi') || lower.includes('help') || lower.includes('can you') || lower.includes('hello')
            );

            let devStructured: any;
            if (isVague) {
              devStructured = {
                replyText: "Hello! I'd love to help you write your article. To get started, could you share:\n1. What is the main topic or story you want to cover?\n2. Who is your target audience?\n3. Any specific angle, founder story, or key points you want included?",
                headline: '',
                subtitle: '',
                articleBody: '',
                imageSuggestion: ''
              };
            } else {
              devStructured = {
                replyText: 'Generated story package for your article idea:',
                headline: promptToSubmit.includes('pivot') ? 'The $10M Pivot: How One Founder Rebuilt Their Tech Stack for AI' : 'Building in Public: Lessons From Scaling a Modern Tech Startup',
                subtitle: 'A deep-dive into product strategy, engineering decisions, and founder resilience in the era of artificial intelligence.',
                articleBody: `## Introduction\nIn today's fast-moving software ecosystem, adaptability is everything. When the market shifted toward intelligent agents, our engineering team faced a critical decision: double down on legacy infrastructure or rebuild from the ground up.\n\n## The Engineering Reality\nTransitioning to AI-first architecture required rethinking data pipelines, prompt engineering, and real-time state management.\n\n- **Key Takeaway 1:** Prioritize developer velocity over premature optimization.\n- **Key Takeaway 2:** Leverage strict type validation across API boundaries.\n- **Key Takeaway 3:** Build modular UI components for maximum flexibility.\n\n## Conclusion\nThe pivot proved transformational. By staying focused on core user problems, we scaled user acquisition by 300% in under six months.`,
                imageSuggestion: 'Minimalist tech startup team collaborating night'
              };
            }

            const hasCard = !!(
              (devStructured.headline && devStructured.headline.trim().length > 0) ||
              (devStructured.articleBody && devStructured.articleBody.trim().length > 0)
            );

            const devMsg: ChatMessage = {
              id: `assistant-dev-${Date.now()}`,
              sender: 'assistant',
              text: devStructured.replyText,
              structured: hasCard ? devStructured : undefined,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, devMsg]);
            setStatusMessage({ type: 'success', text: isVague ? 'Dev Mode: Asking clarifying questions...' : 'Dev Mode: Generated sample AI story package!' });
            return;
          }

          setStatusMessage({ type: 'error', text: 'No AI key configured. Add one in Profile Settings.' });
        } else {
          setStatusMessage({ type: 'error', text: data.message || data.error || 'Failed to generate content.' });
        }
        return;
      }

      const structured = data.structured;
      const hasCard = !!(
        (structured?.headline && structured.headline.trim().length > 0) ||
        (structured?.articleBody && structured.articleBody.trim().length > 0)
      );

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: structured?.replyText || (hasCard ? 'I have created your article structure below:' : data.result),
        structured: hasCard ? structured : undefined,
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

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Mobile/Tablet Backdrop */}
      <div
        className="editor-ai-panel-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '52px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.20)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 44,
          display: isOpen ? 'block' : 'none',
        }}
      />

      {/* Sliding AI Panel */}
      <div
        style={{
          position: 'fixed',
          top: '52px',
          right: 0,
          bottom: 0,
          height: 'calc(100vh - 52px)',
          width: isExpanded ? '460px' : '360px',
          maxWidth: '100vw',
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid var(--color-hairline)',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.10)',
          zIndex: 45,
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transition: 'width 200ms ease-out',
        }}
      >

        {/* Header */}
        <div
          style={{
            padding: '12px var(--space-base)',
            borderBottom: '1px solid var(--color-hairline)',
            background: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.06) 100%)',
                border: '1px solid rgba(124, 58, 237, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED',
                flexShrink: 0,
              }}
            >
              <Sparkles size={14} strokeWidth={1.75} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--fs-body-sm)',
                  fontWeight: 'var(--fw-semibold)',
                  color: 'var(--color-ink-strong)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                AI Story Assistant
              </h3>
              <span style={{
                fontSize: '11px',
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '1px',
              }}>
                <Bot size={10} style={{ color: '#7C3AED', flexShrink: 0 }} />
                {hasKey ? `Powered by ${provider === 'gemini' ? 'Gemini 3.6 Flash' : 'OpenRouter'}` : 'No AI Key Configured'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            {/* Expand / Collapse Width Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Narrow panel' : 'Expand panel'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Clear Conversation / Start Over Button */}
            <button
              type="button"
              onClick={handleClearConversation}
              title="Clear conversation / Start over"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={15} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close AI Assistant"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
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
      <div style={{
        padding: '8px var(--space-base)',
        borderTop: '1px solid var(--color-hairline)',
        overflowX: 'auto',
        display: 'flex',
        gap: '5px',
        flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
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
              background: 'var(--color-surface)',
              color: 'var(--color-steel)',
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              cursor: loading || !hasKey ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              opacity: loading || !hasKey ? 0.5 : 1,
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
          >
            {promptText.slice(0, 30)}…
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div style={{
        padding: 'var(--space-sm) var(--space-base)',
        borderTop: '1px solid var(--color-hairline)',
        background: 'var(--color-surface)',
        flexShrink: 0,
      }}>
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
              border: '1px solid var(--color-hairline-strong)',
              background: 'var(--color-canvas)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-body-sm)',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
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
              opacity: !hasKey || loading || !inputText.trim() ? 0.4 : 1,
              flexShrink: 0,
              transition: 'opacity 150ms ease',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  </>,
  document.body
);
};

export default AIChatPanel;
