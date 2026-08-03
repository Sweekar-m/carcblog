import React, { useState } from 'react';
import {
  CheckCircle2, MapPin, Building2, Globe, Users, FileText,
  Clock, Sparkles, PenSquare, Settings, Camera, ExternalLink,
  BookOpen, TrendingUp, Heart, Bookmark, MessageSquare, Pin,
  Share2
} from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';
import type { SanityArticle } from '@/types/sanity';
import PexelsCoverPicker from './PexelsCoverPicker';

interface PublicProfileViewProps {
  profile: ExtendedProfile;
  socialLinks: SocialLink[];
  stats: {
    followersCount: number;
    followingCount: number;
    likesCount: number;
    bookmarksCount: number;
  };
  followersList?: ExtendedProfile[];
  followingList?: ExtendedProfile[];
  userArticles: SanityArticle[];
  activityFeed: any[];
  currentUserId?: string | null;
  initialIsFollowing?: boolean;
}

// ── Design System Tokens (per Design.md) ───────────────────────────────────
const S = {
  fontSans: 'var(--font-sans, "DM Sans", system-ui, sans-serif)',
  ink: '#0F172A',
  inkStrong: '#000000',
  charcoal: '#334155',
  slate: '#475569',
  steel: '#64748B',
  stone: '#94A3B8',
  canvas: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceStrong: '#F1F5F9',
  hairline: '#E2E8F0',
  hairlineStrong: '#CBD5E1',
  accent: '#0EA5E9',
  shadowSubtle: '0px 1px 2px 0px rgba(0,0,0,0.04)',
  shadowCard: '0px 4px 6px 0px rgba(0,0,0,0.08)',
  shadowCardHover: '0px 8px 16px 0px rgba(0,0,0,0.10)',
};

// Category Brand Accents (Design.md v2)
const CATEGORY_ACCENTS: Record<string, { bg: string; color: string }> = {
  funding: { bg: '#FF5A36', color: '#FFFFFF' },
  product: { bg: '#0066FF', color: '#FFFFFF' },
  launch: { bg: '#0066FF', color: '#FFFFFF' },
  founder: { bg: '#E019C9', color: '#FFFFFF' },
  ai: { bg: '#6D28D9', color: '#FFFFFF' },
  tech: { bg: '#6D28D9', color: '#FFFFFF' },
  investor: { bg: '#059669', color: '#FFFFFF' },
  scheme: { bg: '#D97706', color: '#FFFFFF' },
  default: { bg: '#0F172A', color: '#FFFFFF' },
};

function getCategoryAccent(categoryName?: string) {
  if (!categoryName) return CATEGORY_ACCENTS.default;
  const lower = categoryName.toLowerCase();
  for (const key of Object.keys(CATEGORY_ACCENTS)) {
    if (lower.includes(key)) return CATEGORY_ACCENTS[key];
  }
  return CATEGORY_ACCENTS.default;
}

// ── Button Styles ─────────────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 22px',
  borderRadius: '9999px',
  border: 'none',
  background: S.ink,
  color: '#FFFFFF',
  fontFamily: S.fontSans,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 150ms ease',
  boxShadow: S.shadowSubtle,
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 22px',
  borderRadius: '9999px',
  border: `1px solid ${S.ink}`,
  background: 'transparent',
  color: S.ink,
  fontFamily: S.fontSans,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 150ms ease',
};

const btnTertiary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px',
  borderRadius: '9999px',
  border: `1px solid ${S.hairline}`,
  background: S.canvas,
  color: S.ink,
  fontFamily: S.fontSans,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 150ms ease',
};

const btnIconCircular: React.CSSProperties = {
  width: '38px', height: '38px',
  borderRadius: '9999px',
  border: `1px solid ${S.hairline}`,
  background: S.canvas,
  color: S.ink,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 150ms ease',
  boxShadow: S.shadowSubtle,
};

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    writer:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Writer' },
    author:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Author' },
    reader:  { bg: S.surfaceStrong, color: S.slate, label: 'Reader' },
    admin:   { bg: '#FEF3C7', color: '#92400E', label: 'Admin' },
    founder: { bg: '#ECFDF5', color: '#065F46', label: 'Founder' },
  };
  const cfg = map[role?.toLowerCase()] ?? { bg: S.surfaceStrong, color: S.slate, label: role || 'Member' };
  return (
    <span style={{
      fontFamily: S.fontSans, fontSize: '11px', fontWeight: 700,
      padding: '3px 10px', borderRadius: '9999px',
      background: cfg.bg, color: cfg.color,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {cfg.label}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function PublicProfileView({
  profile: initialProfile,
  socialLinks,
  stats,
  followersList = [],
  followingList = [],
  userArticles,
  activityFeed,
  currentUserId,
  initialIsFollowing = false,
}: PublicProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<'articles' | 'about' | 'activity' | 'followers' | 'following'>('articles');
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(stats.followersCount);
  const [followLoading, setFollowLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Article engagement interactive state maps (articleId -> boolean / count)
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [bookmarksState, setBookmarksState] = useState<Record<string, { count: number; bookmarked: boolean }>>({});

  const isOwner = currentUserId === profile.id;

  const handleToggleFollow = async () => {
    if (!currentUserId) {
      window.location.href = `/auth/sign-in?redirect_url=/u/${profile.username}`;
      return;
    }
    setFollowLoading(true);
    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: profile.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (e) { console.error(e); }
    finally { setFollowLoading(false); }
  };

  const handleCoverSelect = (photoUrl: string) => {
    setProfile(p => ({ ...p, cover_url: photoUrl || null }));
  };

  const handleToggleLike = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) {
      window.location.href = `/auth/sign-in?redirect_url=/u/${profile.username}`;
      return;
    }

    const current = likesState[articleId] || { count: 0, liked: false };
    const nextLiked = !current.liked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    // Optimistic update
    setLikesState(prev => ({ ...prev, [articleId]: { count: nextCount, liked: nextLiked } }));

    try {
      const res = await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, authorId: profile.id }),
      });
      if (!res.ok) {
        // Revert on failure
        setLikesState(prev => ({ ...prev, [articleId]: current }));
      }
    } catch {
      setLikesState(prev => ({ ...prev, [articleId]: current }));
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) {
      window.location.href = `/auth/sign-in?redirect_url=/u/${profile.username}`;
      return;
    }

    const current = bookmarksState[articleId] || { count: 0, bookmarked: false };
    const nextBookmarked = !current.bookmarked;
    const nextCount = nextBookmarked ? current.count + 1 : Math.max(0, current.count - 1);

    // Optimistic update
    setBookmarksState(prev => ({ ...prev, [articleId]: { count: nextCount, bookmarked: nextBookmarked } }));

    try {
      const res = await fetch('/api/social/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) {
        setBookmarksState(prev => ({ ...prev, [articleId]: current }));
      }
    } catch {
      setBookmarksState(prev => ({ ...prev, [articleId]: current }));
    }
  };

  const tabs = [
    { id: 'articles', label: `Articles (${userArticles.length})`, icon: BookOpen },
    { id: 'about',    label: 'About & Credentials',              icon: Sparkles },
    { id: 'activity', label: 'Activity Feed',                   icon: Clock },
    { id: 'followers', label: `Followers (${followerCount})`,     icon: Users },
    { id: 'following', label: `Following (${stats.followingCount})`, icon: TrendingUp },
  ] as const;

  // Split featured/pinned article if exists
  const featuredArticle = userArticles.length > 0 ? userArticles[0] : null;
  const remainingArticles = userArticles.length > 1 ? userArticles.slice(1) : userArticles;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 16px 96px', fontFamily: S.fontSans }}>

      {/* ── Cover Banner (260px) ── */}
      <div style={{
        height: '260px',
        width: '100%',
        borderRadius: '24px',
        background: profile.cover_url
          ? `url(${profile.cover_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0EA5E9 100%)',
        position: 'relative',
        boxShadow: S.shadowCard,
        overflow: 'hidden',
      }}>
        {/* Subtle dot-grid texture for empty state */}
        {!profile.cover_url && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
        )}

        {/* Owner button: Add / Change cover photo */}
        {isOwner && (
          <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
            <button
              onClick={() => setPickerOpen(true)}
              style={{
                ...btnTertiary,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontSize: '13px',
              }}
            >
              <Camera size={14} />
              {profile.cover_url ? 'Change cover photo' : 'Add cover photo'}
            </button>
          </div>
        )}
      </div>

      {/* ── Profile Header Block ── */}
      <div style={{ padding: '0 8px', marginTop: '-56px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>

          {/* Avatar + Identity */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            {/* Avatar circle */}
            <div style={{
              width: '116px', height: '116px',
              borderRadius: '50%',
              border: '4px solid #FFFFFF',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)',
              boxShadow: '0 8px 24px rgba(15,23,42,0.14)',
              overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#FFFFFF', fontSize: '2.25rem', fontWeight: 800, fontFamily: S.fontSans, textTransform: 'uppercase' }}>
                  {(profile.full_name || profile.username || 'U').charAt(0)}
                </span>
              )}
            </div>

            {/* Name & Handle */}
            <div style={{ paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{
                  fontFamily: S.fontSans,
                  fontSize: '1.65rem', fontWeight: 700,
                  color: S.inkStrong, margin: 0, letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}>
                  {profile.full_name || profile.username}
                </h1>
                {profile.verified && <CheckCircle2 style={{ width: '20px', height: '20px', color: S.accent, flexShrink: 0 }} />}
                <RoleBadge role={profile.role || 'reader'} />
              </div>

              <div style={{ fontFamily: S.fontSans, color: S.steel, fontSize: '15px', fontWeight: 500 }}>
                @{profile.username}
              </div>

              {/* Tagline / Professional Headline */}
              {(profile.tagline || profile.job_title || profile.company) && (
                <div style={{
                  fontFamily: S.fontSans,
                  fontSize: '15px',
                  fontWeight: 600,
                  color: S.charcoal,
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {profile.tagline ? (
                    profile.tagline
                  ) : (
                    <>
                      {profile.job_title && <span>{profile.job_title}</span>}
                      {profile.job_title && profile.company && <span>at</span>}
                      {profile.company && <span style={{ color: S.inkStrong }}>{profile.company}</span>}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingBottom: '8px' }}>
            {!isOwner ? (
              <>
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  style={isFollowing ? btnOutline : btnPrimary}
                >
                  {followLoading ? '…' : isFollowing ? 'Following' : '+ Follow Writer'}
                </button>

                {/* Share profile button */}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: profile.full_name || profile.username, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Profile URL copied to clipboard!');
                    }
                  }}
                  style={btnIconCircular}
                  title="Share profile"
                  aria-label="Share profile"
                >
                  <Share2 size={16} />
                </button>
              </>
            ) : (
              <>
                <a href="/dashboard/settings" style={btnOutline}>
                  <Settings size={15} />Edit Profile
                </a>
                <a href="/dashboard/articles/new" style={btnPrimary}>
                  <PenSquare size={15} />Write Article
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── Professional Bio ── */}
        {profile.bio && (
          <p style={{
            fontFamily: S.fontSans,
            fontSize: '15px', color: S.charcoal,
            margin: '20px 0 0', lineHeight: 1.6,
            maxWidth: '720px',
          }}>
            {profile.bio}
          </p>
        )}

        {/* ── Social / Professional Links Row (Icon Buttons) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
          {socialLinks.map(link => {
            const info = getSocialPlatformInfo(link.platform, link.url);
            return (
              <a
                key={link.id || link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...btnTertiary,
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                }}
                title={`${info.label}: ${link.url}`}
              >
                <SocialIcon platform={link.platform} size={14} />
                <span>{info.label}</span>
                <ExternalLink size={11} style={{ color: S.stone, marginLeft: '2px' }} />
              </a>
            );
          })}

          {/* Website if not already in socialLinks */}
          {profile.website && !socialLinks.some(l => l.url.includes(profile.website!)) && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              style={{
                ...btnTertiary,
                padding: '7px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
              }}
              title={`Website: ${profile.website}`}
            >
              <Globe size={14} style={{ color: S.accent }} />
              <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              <ExternalLink size={11} style={{ color: S.stone, marginLeft: '2px' }} />
            </a>
          )}
        </div>

        {/* ── Metadata Tags (Location, Company) ── */}
        {(profile.city || profile.country || profile.company) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
            {(profile.city || profile.country) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: S.fontSans, fontSize: '13px', color: S.steel, background: S.surface, padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${S.hairline}` }}>
                <MapPin size={13} style={{ color: S.stone }} />
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </span>
            )}
            {profile.company && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: S.fontSans, fontSize: '13px', color: S.steel, background: S.surface, padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${S.hairline}` }}>
                <Building2 size={13} style={{ color: S.stone }} />
                {profile.job_title ? `${profile.job_title} · ` : ''}{profile.company}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Stats Metric Panel (Social Proof — card-base) ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1px',
        background: S.hairline,
        border: `1px solid ${S.hairline}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: S.shadowSubtle,
        marginBottom: '40px',
      }}>
        {[
          { label: 'Followers', value: followerCount, icon: Users },
          { label: 'Following', value: stats.followingCount, icon: TrendingUp },
          { label: 'Articles',  value: userArticles.length, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: S.canvas,
              padding: '16px 20px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontFamily: S.fontSans, fontSize: '1.45rem', fontWeight: 700, color: S.inkStrong, letterSpacing: '-0.02em' }}>
              {value}
            </div>
            <div style={{ fontFamily: S.fontSans, fontSize: '12px', color: S.steel, fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon size={13} />
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── ARTICLES SECTION (Visual Feed Grid + Tappable Engagement) ── */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: S.fontSans, fontSize: '18px', fontWeight: 700, color: S.inkStrong, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
          Published Articles ({userArticles.length})
        </h2>
        <div>
          {userArticles.length > 0 ? (
            <div>
              {/* Highlight / Pinned Story Banner (First article) */}
              {featuredArticle && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: S.steel, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                    <Pin size={13} style={{ color: S.accent }} />
                    Featured Story
                  </div>

                  <a
                    href={`/article/${typeof featuredArticle.slug === 'string' ? featuredArticle.slug : featuredArticle.slug?.current}`}
                    style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '24px',
                      background: S.canvas,
                      border: `1px solid ${S.hairline}`,
                      borderRadius: '20px',
                      padding: '24px',
                      textDecoration: 'none', color: 'inherit',
                      boxShadow: S.shadowCard,
                      transition: 'transform 200ms ease, box-shadow 200ms ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = S.shadowCardHover;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = S.shadowCard;
                    }}
                  >
                    {/* Cover image */}
                    <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', background: S.surface }}>
                      {featuredArticle.coverImage ? (
                        <img
                          src={typeof featuredArticle.coverImage === 'string' ? featuredArticle.coverImage : (featuredArticle.coverImage as any)?.asset?.url}
                          alt={featuredArticle.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0F172A 0%, #0EA5E9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                          <BookOpen size={36} opacity={0.6} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Category accent tag */}
                        {featuredArticle.categories?.[0] && (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: S.fontSans,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '12px',
                            ...getCategoryAccent(featuredArticle.categories[0]?.title),
                          }}>
                            {featuredArticle.categories[0]?.title}
                          </span>
                        )}

                        <h2 style={{
                          fontFamily: S.fontSans, fontSize: '1.25rem', fontWeight: 700,
                          margin: '0 0 10px', color: S.inkStrong, lineHeight: 1.3,
                          letterSpacing: '-0.01em',
                        }}>
                          {featuredArticle.title}
                        </h2>

                        {featuredArticle.excerpt && (
                          <p style={{ fontFamily: S.fontSans, fontSize: '14px', color: S.slate, margin: 0, lineHeight: 1.6 }}>
                            {featuredArticle.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Interactive Engagement Bar */}
                      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${S.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: S.fontSans, fontSize: '12px', color: S.stone }}>
                          {new Date(featuredArticle.publishedAt || (featuredArticle as any)._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Tappable Like Button */}
                          <button
                            onClick={(e) => handleToggleLike(e, featuredArticle._id)}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '5px',
                              color: likesState[featuredArticle._id]?.liked ? '#DC2626' : S.steel,
                              fontSize: '13px', fontWeight: 600, fontFamily: S.fontSans,
                            }}
                          >
                            <Heart size={16} fill={likesState[featuredArticle._id]?.liked ? '#DC2626' : 'none'} />
                            <span>{likesState[featuredArticle._id]?.count ?? 12}</span>
                          </button>

                          {/* Tappable Bookmark Button */}
                          <button
                            onClick={(e) => handleToggleBookmark(e, featuredArticle._id)}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '5px',
                              color: bookmarksState[featuredArticle._id]?.bookmarked ? S.accent : S.steel,
                              fontSize: '13px', fontWeight: 600, fontFamily: S.fontSans,
                            }}
                          >
                            <Bookmark size={16} fill={bookmarksState[featuredArticle._id]?.bookmarked ? S.accent : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              )}

              {/* Main 3-Column Visual Feed Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {userArticles.map((article) => {
                  const slugStr = typeof article.slug === 'string' ? article.slug : article.slug?.current;
                  const cat = article.categories?.[0]?.title;
                  const catStyle = getCategoryAccent(cat);
                  const isLiked = likesState[article._id]?.liked;
                  const likeCount = likesState[article._id]?.count ?? 8;
                  const isBookmarked = bookmarksState[article._id]?.bookmarked;

                  return (
                    <a
                      key={article._id}
                      href={`/article/${slugStr}`}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        background: S.canvas,
                        border: `1px solid ${S.hairline}`,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        textDecoration: 'none', color: 'inherit',
                        boxShadow: S.shadowSubtle,
                        transition: 'transform 200ms ease, box-shadow 200ms ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = S.shadowCardHover;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = S.shadowSubtle;
                      }}
                    >
                      {/* Cover Image + Category Tag */}
                      <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: S.surface }}>
                        {article.coverImage ? (
                          <img
                            src={typeof article.coverImage === 'string' ? article.coverImage : (article.coverImage as any)?.asset?.url}
                            alt={article.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={28} color="#94A3B8" />
                          </div>
                        )}

                        {cat && (
                          <span style={{
                            position: 'absolute', top: '12px', left: '12px',
                            padding: '3px 9px', borderRadius: '9999px',
                            fontSize: '10px', fontWeight: 700, fontFamily: S.fontSans,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            ...catStyle,
                          }}>
                            {cat}
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{
                            fontFamily: S.fontSans, fontSize: '15px', fontWeight: 700,
                            margin: '0 0 8px', color: S.inkStrong, lineHeight: 1.35,
                            letterSpacing: '-0.01em',
                          }}>
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p style={{
                              fontFamily: S.fontSans, fontSize: '13px', color: S.slate, margin: '0 0 14px', lineHeight: 1.5,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {article.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Tappable Engagement Footer */}
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${S.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: S.fontSans, fontSize: '12px', color: S.stone }}>
                            {new Date(article.publishedAt || (article as any)._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* Like toggle */}
                            <button
                              onClick={(e) => handleToggleLike(e, article._id)}
                              style={{
                                border: 'none', background: 'transparent', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: isLiked ? '#DC2626' : S.steel,
                                fontSize: '12px', fontWeight: 600, fontFamily: S.fontSans,
                              }}
                              title="Like article"
                            >
                              <Heart size={14} fill={isLiked ? '#DC2626' : 'none'} />
                              <span>{likeCount}</span>
                            </button>

                            {/* Bookmark toggle */}
                            <button
                              onClick={(e) => handleToggleBookmark(e, article._id)}
                              style={{
                                border: 'none', background: 'transparent', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: isBookmarked ? S.accent : S.steel,
                                fontSize: '12px', fontWeight: 600, fontFamily: S.fontSans,
                              }}
                              title="Bookmark article"
                            >
                              <Bookmark size={14} fill={isBookmarked ? S.accent : 'none'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '64px 32px',
              background: S.canvas, borderRadius: '20px',
              border: `1px solid ${S.hairline}`,
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BookOpen size={24} color={S.stone} />
              </div>
              <p style={{ fontFamily: S.fontSans, fontSize: '16px', fontWeight: 700, color: S.ink, margin: '0 0 6px' }}>No articles published yet</p>
              <p style={{ fontFamily: S.fontSans, fontSize: '14px', color: S.steel, margin: 0 }}>
                {isOwner ? 'Publish your first story to build your audience.' : 'This author has not published any articles yet.'}
              </p>
              {isOwner && (
                <a href="/dashboard/articles/new" style={{ ...btnPrimary, marginTop: '20px', display: 'inline-flex' }}>
                  <PenSquare size={14} />Write your first article
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ABOUT & CREDENTIALS SECTION ── */}
      {(profile.bio || (profile.skills && profile.skills.length > 0) || (profile.writing_topics && profile.writing_topics.length > 0) || socialLinks.length > 0) && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: S.fontSans, fontSize: '18px', fontWeight: 700, color: S.inkStrong, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            About & Credentials
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Bio card */}
            {profile.bio && (
              <div style={{ background: S.canvas, border: `1px solid ${S.hairline}`, borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontFamily: S.fontSans, fontSize: '15px', fontWeight: 700, margin: '0 0 10px', color: S.inkStrong }}>Professional Bio</h3>
                <p style={{ fontFamily: S.fontSans, fontSize: '15px', color: S.charcoal, margin: 0, lineHeight: 1.65 }}>{profile.bio}</p>
              </div>
            )}

            {/* Skills & Expertise */}
            {profile.skills && profile.skills.length > 0 && (
              <div style={{ background: S.canvas, border: `1px solid ${S.hairline}`, borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontFamily: S.fontSans, fontSize: '15px', fontWeight: 700, margin: '0 0 14px', color: S.inkStrong }}>
                  Skills & Areas of Expertise
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} style={{
                      padding: '6px 14px', borderRadius: '9999px',
                      background: S.surface, border: `1px solid ${S.hairline}`,
                      fontSize: '13px', fontWeight: 600, fontFamily: S.fontSans, color: S.charcoal,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Writing Topics */}
            {profile.writing_topics && profile.writing_topics.length > 0 && (
              <div style={{ background: S.canvas, border: `1px solid ${S.hairline}`, borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontFamily: S.fontSans, fontSize: '15px', fontWeight: 700, margin: '0 0 14px', color: S.inkStrong }}>
                  Writing Topics
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.writing_topics.map((topic, idx) => (
                    <span key={idx} style={{
                      padding: '6px 14px', borderRadius: '9999px',
                      background: '#EFF6FF', border: '1px solid #BFDBFE',
                      fontSize: '13px', fontWeight: 600, fontFamily: S.fontSans, color: '#1D4ED8',
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social accounts detailed */}
            {socialLinks.length > 0 && (
              <div style={{ background: S.canvas, border: `1px solid ${S.hairline}`, borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontFamily: S.fontSans, fontSize: '15px', fontWeight: 700, margin: '0 0 14px', color: S.inkStrong }}>
                  Verified Social Accounts
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                  {socialLinks.map((link, idx) => {
                    const info = getSocialPlatformInfo(link.platform, link.url);
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: '12px',
                          border: `1px solid ${S.hairline}`,
                          background: S.surface,
                          color: S.ink, textDecoration: 'none',
                          fontSize: '14px', fontWeight: 600, fontFamily: S.fontSans,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <SocialIcon platform={link.platform} size={16} />
                          <span style={{ textTransform: 'capitalize' }}>{info.label}</span>
                        </div>
                        <ExternalLink size={13} style={{ color: S.stone }} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACTIVITY FEED SECTION ── */}
      {activityFeed.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: S.fontSans, fontSize: '18px', fontWeight: 700, color: S.inkStrong, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            Recent Activity
          </h2>
          <div style={{ background: S.canvas, border: `1px solid ${S.hairline}`, borderRadius: '16px', overflow: 'hidden' }}>
            {activityFeed.map((act, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px 24px',
                borderBottom: idx < activityFeed.length - 1 ? `1px solid ${S.hairline}` : 'none',
              }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: S.surface, border: `1px solid ${S.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={15} color={S.steel} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: S.fontSans, fontSize: '14px', color: S.charcoal, margin: '0 0 4px', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: S.inkStrong }}>{profile.full_name || profile.username}</span>
                    {' '}{act.activity_type?.replace(/_/g, ' ')}
                    {act.target_url && (
                      <>: <a href={act.target_url} style={{ color: S.accent, fontWeight: 600, textDecoration: 'none' }}>{act.target_title}</a></>
                    )}
                  </p>
                  {act.created_at && (
                    <time style={{ fontFamily: S.fontSans, fontSize: '12px', color: S.stone }}>
                      {new Date(act.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cover Photo Picker Modal ── */}
      <PexelsCoverPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCoverSelect}
        currentCoverUrl={profile.cover_url}
      />
    </div>
  );
}

// ── Follower / Following Card Subcomponent ──────────────────────────────────
function FollowList({
  users, emptyMsg, isOwner, ownEmptyMsg,
}: {
  users: ExtendedProfile[];
  emptyMsg: string;
  isOwner: boolean;
  ownEmptyMsg: string;
}) {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 32px', background: S.canvas, borderRadius: '16px', border: `1px solid ${S.hairline}` }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Users size={22} color={S.stone} />
        </div>
        <p style={{ fontFamily: S.fontSans, fontSize: '15px', fontWeight: 700, color: S.ink, margin: '0 0 6px' }}>{emptyMsg}</p>
        {isOwner && <p style={{ fontFamily: S.fontSans, fontSize: '13px', color: S.steel, margin: 0 }}>{ownEmptyMsg}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
      {users.map(usr => (
        <div
          key={usr.id}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', padding: '16px',
            borderRadius: '16px', border: `1px solid ${S.hairline}`,
            background: S.canvas, boxShadow: S.shadowSubtle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 700, fontSize: '18px', flexShrink: 0, overflow: 'hidden',
            }}>
              {usr.avatar_url ? (
                <img src={usr.avatar_url} alt={usr.full_name || usr.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (usr.full_name || usr.username || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: S.fontSans, fontSize: '14px', fontWeight: 700, color: S.inkStrong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {usr.full_name || usr.username}
              </div>
              <div style={{ fontFamily: S.fontSans, fontSize: '12px', color: S.steel }}>@{usr.username}</div>
            </div>
          </div>
          <a
            href={`/u/${usr.username}`}
            style={{
              ...btnTertiary,
              fontSize: '12px',
              padding: '6px 14px',
              flexShrink: 0,
            }}
          >
            View
          </a>
        </div>
      ))}
    </div>
  );
}
