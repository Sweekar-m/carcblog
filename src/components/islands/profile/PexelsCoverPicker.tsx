import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Check, Loader2, Image as ImageIcon, Upload, Link as LinkIcon, Sparkles } from 'lucide-react';

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

const PRESET_BANNERS = [
  { id: 'dark-minimal', title: 'Dark Minimal', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80' },
  { id: 'tech-skyline', title: 'Tech Skyline', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80' },
  { id: 'abstract-gradient', title: 'Electric Gradient', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80' },
  { id: 'volcanic-coral', title: 'Volcanic Coral', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80' },
  { id: 'emerald-flow', title: 'Emerald Flow', url: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=1200&q=80' },
  { id: 'deep-violet', title: 'Deep Violet', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80' },
];

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
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'pexels'>('upload');
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setPhotos([]);
      setError(null);
      setSelectedUrl(currentCoverUrl || null);
      setCustomUrlInput(currentCoverUrl || '');
    }
  }, [isOpen, currentCoverUrl]);

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
      setError('Could not load Pexels photos. Try uploading a photo or selecting a preset banner.');
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

  const handleApplyUrl = async (urlToSave: string) => {
    if (!urlToSave.trim()) return;
    setSelectedUrl(urlToSave);
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_url: urlToSave }),
      });
      if (!res.ok) throw new Error('Save failed');
      onSelect(urlToSave);
      onClose();
    } catch {
      setError('Failed to save cover photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));

      let finalUrl = '';
      if (res.ok && data.url) {
        finalUrl = data.url;
      } else {
        // Fallback to Data URL
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string || '');
          reader.readAsDataURL(file);
        });
      }

      if (finalUrl) {
        setCustomUrlInput(finalUrl);
        await handleApplyUrl(finalUrl);
      }
    } catch (err: any) {
      setError('Upload failed. Please try pasting an image URL.');
    } finally {
      setUploading(false);
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
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

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
          padding: '24px 28px 16px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              Choose a Cover Banner
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
              Upload your own banner, pick from presets, or search Pexels photos.
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

        {/* Navigation Tabs */}
        <div style={{ padding: '0 28px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', background: '#F8FAFC' }}>
          {[
            { id: 'upload' as const, label: 'Upload Photo / URL', icon: Upload },
            { id: 'presets' as const, label: 'Preset Banners', icon: Sparkles },
            { id: 'pexels' as const, label: 'Search Pexels', icon: Search },
          ].map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id);
                  if (id === 'pexels' && photos.length === 0) {
                    searchPhotos('startup innovation');
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '12px 16px', border: 'none', borderBottom: active ? '2px solid #0F172A' : '2px solid transparent',
                  background: 'transparent', color: active ? '#0F172A' : '#64748B',
                  fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 150ms ease',
                }}
              >
                <Icon size={14} style={{ color: active ? '#0F172A' : '#64748B' }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontSize: '13px', fontFamily: 'var(--font-sans)', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* TAB 1: UPLOAD PHOTO / URL */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* File upload box */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '16px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  cursor: uploading ? 'wait' : 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0F172A')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  {uploading ? <Loader2 size={20} className="animate-spin" color="#0F172A" /> : <Upload size={20} color="#0F172A" />}
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
                  {uploading ? 'Uploading Photo...' : 'Click to Upload Custom Cover Photo'}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontFamily: 'var(--font-sans)' }}>
                  Supports PNG, JPG, WebP up to 5 MB
                </p>
              </div>

              {/* URL paste input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-sans)', marginBottom: '6px' }}>
                  Or Paste Banner Image URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={e => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    style={{
                      flex: 1, height: '44px', padding: '0 14px', borderRadius: '8px',
                      border: '1px solid #E2E8F0', fontSize: '14px', fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyUrl(customUrlInput)}
                    disabled={saving || !customUrlInput.trim()}
                    style={{
                      padding: '0 20px', height: '44px', borderRadius: '8px', border: 'none',
                      background: '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
                      fontFamily: 'var(--font-sans)', cursor: 'pointer', whiteSpace: 'nowrap',
                      opacity: (!customUrlInput.trim() || saving) ? 0.4 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Apply URL'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET BANNERS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {PRESET_BANNERS.map(preset => {
                const isSelected = selectedUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyUrl(preset.url)}
                    disabled={saving}
                    style={{
                      position: 'relative',
                      height: '110px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: isSelected ? '3px solid #0F172A' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      padding: 0,
                      background: `url(${preset.url}) center/cover no-repeat`,
                      textAlign: 'left',
                      transition: 'transform 150ms ease, border-color 150ms ease',
                    }}
                  >
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(transparent, rgba(15,23,42,0.75))',
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    }}>
                      <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                        {preset.title}
                      </span>
                      {isSelected && (
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={13} color="#FFFFFF" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: PEXELS SEARCH */}
          {activeTab === 'pexels' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
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
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{ aspectRatio: '16/9', borderRadius: '10px', background: '#F1F5F9', animation: 'pexels-shimmer 1.4s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : photos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {photos.map(photo => (
                    <button
                      key={photo.id}
                      onClick={() => handleApplyUrl(photo.src.large)}
                      disabled={saving}
                      title={`Photo by ${photo.photographer}`}
                      style={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: selectedUrl === photo.src.large ? '3px solid #0F172A' : '2px solid transparent',
                        cursor: saving ? 'wait' : 'pointer',
                        padding: 0,
                        background: '#F1F5F9',
                      }}
                    >
                      <img src={photo.src.medium} alt={photo.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 24px', color: '#94A3B8', fontFamily: 'var(--font-sans)' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Search for a photo above</p>
                </div>
              )}
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
            CarcBlog Creator Cover Banners
          </p>
        </div>
      </div>
    </div>
  );
}
