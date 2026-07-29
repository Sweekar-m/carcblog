import React, { useState } from 'react';
import {
  Search, Plus, FileText, Eye, Heart, MessageSquare, Edit3, ExternalLink
} from 'lucide-react';
import type { SanityArticle } from '@/types/sanity';

interface ArticleCMSManagerProps {
  articles: SanityArticle[];
}

export default function ArticleCMSManager({ articles: initialArticles }: ArticleCMSManagerProps) {
  const [articles, setArticles] = useState<SanityArticle[]>(initialArticles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || (art.excerpt && art.excerpt.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : (art.status || 'published') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} article(s)?`)) return;
    setArticles(prev => prev.filter(a => !selectedIds.includes(a._id)));
    setSelectedIds([]);
  };

  return (
    <div style={{ padding: '16px 0 40px 0', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)' }}>
      
      {/* Top Header Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-ink, #0f172a)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Article Management CMS
          </h1>
          <p style={{ fontFamily: 'var(--font-sans, sans-serif)', color: 'var(--color-steel, #64748b)', margin: 0, fontSize: '0.875rem' }}>
            Search, filter, edit, publish, and analyze your publications.
          </p>
        </div>

        <a
          href="/dashboard/articles/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '44px',
            padding: '0 20px',
            borderRadius: '9999px',
            background: 'var(--color-primary, #0F172A)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans, sans-serif)',
            boxSizing: 'border-box',
          }}
        >
          <Plus size={16} />
          <span>Create New Article</span>
        </a>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline, #e2e8f0)', borderRadius: '16px', padding: '14px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Search Input Row */}
        <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-steel, #64748b)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles by title..."
            style={{ width: '100%', height: '42px', paddingLeft: '38px', paddingRight: '12px', borderRadius: '10px', border: '1px solid var(--color-hairline, #e2e8f0)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-sans, sans-serif)', boxSizing: 'border-box', background: 'var(--color-surface, #f8fafc)' }}
          />
        </div>

        {/* Status Filter Tabs Row */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface, #f8fafc)', padding: '4px', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', boxSizing: 'border-box' }}>
          {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                flex: '1 0 auto',
                padding: '8px 14px',
                minHeight: '36px',
                borderRadius: '8px',
                border: 'none',
                background: statusFilter === st ? '#ffffff' : 'transparent',
                color: statusFilter === st ? 'var(--color-ink, #0f172a)' : 'var(--color-steel, #64748b)',
                fontWeight: statusFilter === st ? 700 : 500,
                fontSize: '12px',
                fontFamily: 'var(--font-sans, sans-serif)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Bulk Delete Bar */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-hairline, #e2e8f0)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink, #0f172a)' }}>{selectedIds.length} selected</span>
            <button
              onClick={handleBulkDelete}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #dc2626', background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Articles List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map((art) => {
            const isSelected = selectedIds.includes(art._id);
            const coverUrl = typeof art.coverImage === 'string' ? art.coverImage : (art.coverImage as any)?.asset?.url;
            return (
              <div
                key={art._id}
                style={{
                  background: '#ffffff',
                  border: isSelected ? '2px solid #0ea5e9' : '1px solid var(--color-hairline, #e2e8f0)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box',
                }}
              >
                {/* Card Header Row: Badge + Date + Selection Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: (art.status || 'published') === 'published' ? '#d1fae5' : '#f1f5f9',
                      color: (art.status || 'published') === 'published' ? '#047857' : '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {art.status || 'published'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(art.publishedAt || (art as any)._createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(art._id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                {/* Card Content Row: Cover Thumbnail + Title */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '64px', height: '52px', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                    {coverUrl ? (
                      <img src={coverUrl} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <FileText size={20} />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a', lineHeight: 1.35 }}>
                      {art.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: '0.8125rem', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {art.excerpt || 'No description summary available.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer Row: Metrics + Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Views">
                      <Eye size={14} /> {(art as any).viewsCount ?? (art as any).views ?? 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Likes">
                      <Heart size={14} /> {(art as any).likesCount ?? (art as any).likes ?? 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Comments">
                      <MessageSquare size={14} /> {(art as any).commentsCount ?? (art as any).comments ?? 0}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={`/article/${typeof art.slug === 'string' ? art.slug : art.slug?.current}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                      title="View Article"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <a
                      href={`/dashboard/articles/new?id=${art._id}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                      title="Edit Article"
                    >
                      <Edit3 size={16} />
                    </a>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 16px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <FileText size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>No articles found</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Try clearing your search query or creating a new story.</p>
          </div>
        )}
      </div>

    </div>
  );
}
