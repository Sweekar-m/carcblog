import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Check, Loader2, Image } from 'lucide-react';

interface PexelsPhoto {
  id: number;
  src: {
    medium: string;
    large: string;
    original: string;
  };
  photographer: string;
  alt: string;
}

interface PexelsCoverPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photoUrl: string) => void;
  currentCoverUrl?: string | null;
}

const SUGGESTED_QUERIES = [
  'startup', 'technology', 'innovation', 'city skyline', 'abstract',
  'mountains', 'dark minimal', 'architecture', 'creative', 'future',
];

export default function PexelsCoverPicker({
  isOpen,
  onClose,
  onSelect,
  currentCoverUrl,
}: PexelsCoverPickerProps) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setPhotos([]);
      setError(null);
      setSelectedId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
      searchPhotos('startup innovation');
    }
  }, [isOpen]);

  const searchPhotos = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pexels?q=${encodeURIComponent(q)}&per_page=15`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {
      setError('Could not load photos. Please try again.');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length > 1) {
      debounceRef.current = setTimeout(() => searchPhotos(val), 520);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      searchPhotos(query);
    }
    if (e.key === 'Escape') onClose();
  };

  const handleSelect = async (photo: PexelsPhoto) => {
    setSelectedId(photo.id);
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_url: photo.src.large }),
      });
      if (!res.ok) throw new Error('Save failed');
      onSelect(photo.src.large);
      onClose();
    } catch {
      setError('Failed to save cover photo. Please try again.');
      setSelectedId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCover = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_url: '' }),
      });
      if (!res.ok) throw new Error('Remove failed');
      onSelect('');
      onClose();
    } catch {
      setError('Failed to remove cover. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose cover photo"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0px 24px 64px -8px rgba(15, 23, 42, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              Choose a Cover Photo
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
              Search millions of free high-quality photos · Powered by Pexels
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '36px', height: '36px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: '#64748B',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 28px 12px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Search photos… e.g. startup, technology, innovation"
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '40px',
                paddingRight: '16px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: '#0F172A',
                background: '#F8FAFC',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Suggestion chips */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {SUGGESTED_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => { setQuery(q); searchPhotos(q); }}
                style={{
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  border: '1px solid #E2E8F0',
                  background: query === q ? '#0F172A' : '#F8FAFC',
                  color: query === q ? '#FFFFFF' : '#475569',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 28px 24px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontSize: '13px', fontFamily: 'var(--font-sans)', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '16/9',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  animation: 'pexels-shimmer 1.4s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : photos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {photos.map(photo => {
                const isSelected = selectedId === photo.id;
                return (
                  <button
                    key={photo.id}
                    onClick={() => !saving && handleSelect(photo)}
                    disabled={saving}
                    title={`Photo by ${photo.photographer}`}
                    style={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: isSelected ? '3px solid #0F172A' : '2px solid transparent',
                      cursor: saving ? 'wait' : 'pointer',
                      padding: 0,
                      background: '#F1F5F9',
                      transition: 'border-color 150ms ease, transform 150ms ease',
                    }}
                  >
                    <img
                      src={photo.src.medium}
                      alt={photo.alt || `Photo by ${photo.photographer}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Selection overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: isSelected ? 'rgba(15,23,42,0.40)' : 'transparent',
                      transition: 'background 150ms ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && (
                        <div style={{
                          width: '32px', height: '32px',
                          borderRadius: '50%',
                          background: '#0F172A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {saving
                            ? <Loader2 size={16} color="#FFFFFF" style={{ animation: 'pexels-spin 0.8s linear infinite' }} />
                            : <Check size={16} color="#FFFFFF" />
                          }
                        </div>
                      )}
                    </div>
                    {/* Photographer credit */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '6px 8px 4px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.45))',
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '10px',
                      fontFamily: 'var(--font-sans)',
                      textAlign: 'right',
                    }}>
                      {photo.photographer}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontFamily: 'var(--font-sans)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Image size={22} color="#CBD5E1" />
              </div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Search for a photo above</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>Try "startup", "technology", or "city"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: '#FAFAFA',
        }}>
          {currentCoverUrl ? (
            <button
              onClick={handleRemoveCover}
              disabled={saving}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: '1px solid #E2E8F0',
                background: 'transparent',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
              }}
            >
              Remove current photo
            </button>
          ) : <div />}
          <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-sans)', margin: 0 }}>
            All photos by Pexels contributors · Free to use
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pexels-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pexels-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
