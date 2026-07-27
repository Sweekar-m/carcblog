import React, { useState } from 'react';
import {
  Search, Filter, Plus, FileText, Eye, Heart, MessageSquare, Bookmark, Clock, MoreVertical, Edit3, Copy, Trash2, Archive, ExternalLink
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
    <div style={{ padding: '32px 0' }}>
      
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-ink)' }}>Article Management CMS</h1>
          <p style={{ color: 'var(--color-steel)', margin: 0, fontSize: '0.9375rem' }}>Search, filter, edit, publish, and analyze your publications.</p>
        </div>

        <a
          href="/dashboard/articles/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '9999px',
            background: 'var(--color-primary, #0F172A)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Create New Article
        </a>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-steel)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles by title or excerpt..."
            style={{ width: '100%', height: '42px', paddingLeft: '40px', paddingRight: '14px', borderRadius: '10px', border: '1px solid var(--color-hairline)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface)', padding: '4px', borderRadius: '10px' }}>
          {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: statusFilter === st ? '#ffffff' : 'transparent',
                color: statusFilter === st ? 'var(--color-ink)' : 'var(--color-steel)',
                fontWeight: statusFilter === st ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                boxShadow: statusFilter === st ? 'var(--color-shadow-subtle)' : 'none'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Bulk Action Bar if Selected */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid var(--color-hairline)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>{selectedIds.length} selected</span>
            <button
              onClick={handleBulkDelete}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #dc2626', background: 'rgba(220, 38, 38, 0.05)', color: '#dc2626', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Article Cards Grid */}
      {filteredArticles.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredArticles.map((art) => {
            const isSelected = selectedIds.includes(art._id);
            return (
              <div
                key={art._id}
                style={{
                  background: '#ffffff',
                  border: isSelected ? '2px solid var(--color-accent, #0EA5E9)' : '1px solid var(--color-hairline)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'all 150ms ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(art._id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />

                {/* Article Cover Preview */}
                <div style={{ width: '90px', height: '65px', borderRadius: '8px', background: 'var(--color-surface)', overflow: 'hidden', flexShrink: 0 }}>
                  {art.coverImage ? (
                    <img src={typeof art.coverImage === 'string' ? art.coverImage : (art.coverImage as any)?.asset?.url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-steel)' }}>
                      <FileText style={{ width: '24px', height: '24px' }} />
                    </div>
                  )}
                </div>

                {/* Article Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: (art.status || 'published') === 'published' ? 'rgba(5, 150, 105, 0.1)' : 'var(--color-surface)',
                      color: (art.status || 'published') === 'published' ? '#059669' : 'var(--color-slate)',
                      textTransform: 'uppercase'
                    }}>
                      {art.status || 'published'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-stone)' }}>
                      {new Date(art.publishedAt || (art as any)._createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {art.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-steel)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {art.excerpt || 'No description summary.'}
                  </p>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-steel)', paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Total Views">
                    <Eye style={{ width: '15px', height: '15px' }} />
                    <span>{(art as any).viewsCount ?? (art as any).views ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Likes">
                    <Heart style={{ width: '15px', height: '15px' }} />
                    <span>{(art as any).likesCount ?? (art as any).likes ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Comments">
                    <MessageSquare style={{ width: '15px', height: '15px' }} />
                    <span>{(art as any).commentsCount ?? (art as any).comments ?? 0}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a
                    href={`/article/${art.slug.current}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--color-hairline)', color: 'var(--color-ink)' }}
                    title="View Published Article"
                  >
                    <ExternalLink style={{ width: '15px', height: '15px' }} />
                  </a>
                  <a
                    href={`/dashboard/articles/new?id=${art._id}`}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--color-hairline)', color: 'var(--color-ink)' }}
                    title="Edit Article"
                  >
                    <Edit3 style={{ width: '15px', height: '15px' }} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-hairline)' }}>
          <FileText style={{ width: '40px', height: '40px', color: 'var(--color-steel)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px 0' }}>No articles match your filter</h3>
          <p style={{ color: 'var(--color-steel)', fontSize: '0.875rem', margin: 0 }}>Try clearing your search or creating a new story.</p>
        </div>
      )}

    </div>
  );
}
