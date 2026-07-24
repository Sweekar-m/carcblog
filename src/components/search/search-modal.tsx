'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Newspaper,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'article' | 'startup' | 'founder' | 'investor';
  href: string;
  badge?: string;
}

const MOCK_SEARCH_RESULTS: SearchResultItem[] = [
  {
    id: '1',
    title: 'Aura Health - AI Mental Wellness Platform',
    subtitle: 'Pre-Seed • Healthcare AI • San Francisco, CA',
    type: 'startup',
    href: '/startups/aura-health',
    badge: 'Startup',
  },
  {
    id: '2',
    title: 'The Rise of Sovereign AI Infrastructure in 2026',
    subtitle: 'Deep-Dive Article by Alex Rivera • 8 min read',
    type: 'article',
    href: '/feed/sovereign-ai-2026',
    badge: 'Article',
  },
  {
    id: '3',
    title: 'Sarah Chen - Founder & CEO @ Nexus Robotics',
    subtitle: 'Autonomous Systems • Ex-Tesla • 2 Startups Founded',
    type: 'founder',
    href: '/founders/sarah-chen',
    badge: 'Founder',
  },
  {
    id: '4',
    title: 'Apex Ventures - Early Stage DeepTech & AI Fund',
    subtitle: '$150M AUM • Lead Investor in Seed & Series A',
    type: 'investor',
    href: '/investors/apex-ventures',
    badge: 'VC Firm',
  },
  {
    id: '5',
    title: 'DevPulse Raised $8.5M Series A Funding Round',
    subtitle: 'Developer Tools • Led by Founders Fund',
    type: 'startup',
    href: '/funding/devpulse-series-a',
    badge: 'Funding',
  },
];

/* ── Style Tokens for SearchModal ── */
const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '80px',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  },
  modal: {
    width: '100%',
    maxWidth: '640px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-hairline)',
    background: '#ffffff',
    boxShadow: 'var(--shadow-modal)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-hairline)',
    background: '#ffffff',
    gap: '12px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-body-md)',
    fontWeight: 500,
    color: 'var(--color-ink)',
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: 'var(--radius-xs)',
    border: '1px solid var(--color-hairline)',
    background: 'var(--color-surface)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--color-steel)',
    flexShrink: 0,
  },
  clearBtn: {
    border: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-steel)',
    cursor: 'pointer',
    padding: '2px 6px',
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderBottom: '1px solid var(--color-hairline)',
    background: 'var(--color-surface)',
    overflowX: 'auto' as const,
  },
  catBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 120ms ease',
    border: '1px solid transparent',
  },
  resultsContainer: {
    maxHeight: '380px',
    overflowY: 'auto' as const,
    padding: '8px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    transition: 'background 120ms ease, border-color 120ms ease',
    border: '1px solid transparent',
    cursor: 'pointer',
  },
  resultIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid var(--color-hairline)',
    transition: 'all 120ms ease',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-brand-coral)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    flexShrink: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderTop: '1px solid var(--color-hairline)',
    background: 'var(--color-surface)',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: 'var(--color-steel)',
  },
};

export function SearchModal({ isOpen: externalIsOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'article' | 'startup' | 'founder' | 'investor'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof externalIsOpen === 'boolean') {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    const handleToggleEvent = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('toggle-search-palette', handleToggleEvent);
    return () => window.removeEventListener('toggle-search-palette', handleToggleEvent);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setResults(data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to local filtering
      }

      const q = query.toLowerCase();
      const filtered = MOCK_SEARCH_RESULTS.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
      );
      setResults(filtered);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = activeCategory === 'all'
    ? results
    : results.filter((r) => r.type === activeCategory);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      window.location.href = filteredResults[selectedIndex].href;
      handleClose();
    }
  };

  if (!isOpen) return null;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'article': return Newspaper;
      case 'startup': return Building2;
      case 'founder': return Users;
      case 'investor': return Briefcase;
      default: return Sparkles;
    }
  };

  return (
    <div style={S.overlay} onClick={handleClose}>
      <div
        style={S.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div style={S.inputRow}>
          <Search style={{ width: '20px', height: '20px', color: 'var(--color-steel)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search startups, founders, VCs, articles & topics..."
            style={S.input}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={S.clearBtn}
            >
              Clear
            </button>
          )}
          {/* Dedicated ESC Close Button */}
          <button
            onClick={handleClose}
            title="Close Search (ESC)"
            aria-label="Close search modal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-hairline)',
              background: 'var(--color-surface)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-ink)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-ink)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-hairline)';
            }}
          >
            <X style={{ width: '13px', height: '13px' }} />
            <span>ESC</span>
          </button>
        </div>

        {/* Category Filters */}
        <div style={S.categoryRow}>
          {[
            { key: 'all', label: 'All Results' },
            { key: 'startup', label: 'Startups' },
            { key: 'article', label: 'Articles' },
            { key: 'founder', label: 'Founders' },
            { key: 'investor', label: 'Investors' },
          ].map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key as any)}
                style={{
                  ...S.catBtn,
                  background: active ? 'var(--color-ink)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--color-steel)',
                  borderColor: active ? 'var(--color-ink)' : 'var(--color-hairline)',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Body */}
        <div style={S.resultsContainer}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--color-steel)', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--color-steel)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              Searching platform directory...
            </div>
          ) : !query.trim() ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-steel)' }}>
              <Command style={{ display: 'block', margin: '0 auto 8px', width: '24px', height: '24px', color: 'var(--color-stone)' }} />
              Type to search across startups, articles, funding rounds & investors...
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-steel)' }}>
              No results found for &ldquo;<span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{query}</span>&rdquo;
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredResults.map((item, idx) => {
                const Icon = getItemIcon(item.type);
                const isSelected = idx === selectedIndex;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={handleClose}
                    style={{
                      ...S.resultItem,
                      background: isSelected ? 'var(--color-surface)' : 'transparent',
                      borderColor: isSelected ? 'var(--color-hairline-strong)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = isSelected ? 'var(--color-surface)' : 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          ...S.resultIconBox,
                          background: isSelected ? 'var(--color-ink)' : 'var(--color-surface)',
                          color: isSelected ? '#ffffff' : 'var(--color-steel)',
                          borderColor: isSelected ? 'var(--color-ink)' : 'var(--color-hairline)',
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span style={S.badge}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-charcoal)', marginTop: '2px', margin: 0 }}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      style={{
                        width: '16px',
                        height: '16px',
                        color: isSelected ? 'var(--color-ink)' : 'var(--color-stone)',
                        opacity: isSelected ? 1 : 0.6,
                        flexShrink: 0,
                        marginLeft: '8px',
                      }}
                    />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div style={S.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><kbd style={{ ...S.kbd, padding: '1px 4px' }}>↑↓</kbd> navigate</span>
            <span><kbd style={{ ...S.kbd, padding: '1px 4px' }}>↵</kbd> select</span>
          </div>
          <span>Carcblog Ecosystem Search</span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SearchModal;
