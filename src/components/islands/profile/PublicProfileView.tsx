import React, { useState } from 'react';
import {
  CheckCircle2, MapPin, Building2, Globe, Users, FileText, Eye, Heart, Bookmark, Clock, Sparkles, MessageSquare
} from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';
import type { SanityArticle } from '@/types/sanity';

interface PublicProfileViewProps {
  profile: ExtendedProfile;
  socialLinks: SocialLink[];
  stats: {
    followersCount: number;
    followingCount: number;
    likesCount: number;
    bookmarksCount: number;
  };
  userArticles: SanityArticle[];
  activityFeed: any[];
  currentUserId?: string | null;
  initialIsFollowing?: boolean;
}

export default function PublicProfileView({
  profile,
  socialLinks,
  stats,
  userArticles,
  activityFeed,
  currentUserId,
  initialIsFollowing = false
}: PublicProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'articles' | 'about' | 'activity' | 'followers' | 'following' | 'bookmarks' | 'likes'>('articles');
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(stats.followersCount);
  const [followLoading, setFollowLoading] = useState(false);

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
        body: JSON.stringify({ followingId: profile.id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Cover Banner */}
      <div style={{
        height: '240px',
        width: '100%',
        borderRadius: '0 0 24px 24px',
        overflow: 'hidden',
        background: profile.cover_url ? `url(${profile.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0EA5E9 100%)',
        position: 'relative'
      }} />

      {/* Hero Content Header */}
      <div style={{ padding: '0 32px', marginTop: '-60px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Avatar & Basic Identity */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid #ffffff',
              background: '#ffffff',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                  {profile.full_name || profile.username}
                </h1>
                {profile.verified && (
                  <CheckCircle2 style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
                )}
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', color: 'var(--color-steel)', textTransform: 'uppercase' }}>
                  {profile.role || 'Writer'}
                </span>
              </div>
              <div style={{ color: 'var(--color-steel)', fontSize: '0.9375rem', marginTop: '2px' }}>
                @{profile.username}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {currentUserId !== profile.id ? (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: isFollowing ? 'var(--color-surface, #F8FAFC)' : 'var(--color-primary, #0F172A)',
                  color: isFollowing ? 'var(--color-ink)' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                {isFollowing ? 'Following' : '+ Follow Writer'}
              </button>
            ) : (
              <a
                href="/dashboard/settings"
                style={{
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: '1px solid var(--color-hairline)',
                  background: '#ffffff',
                  color: 'var(--color-ink)',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                Edit Profile
              </a>
            )}
          </div>
        </div>

        {/* Bio & Details */}
        {profile.tagline && (
          <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-ink)', margin: '16px 0 6px 0' }}>
            {profile.tagline}
          </p>
        )}
        {profile.bio && (
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-steel)', margin: '0 0 16px 0', lineHeight: 1.6, maxWidth: '720px' }}>
            {profile.bio}
          </p>
        )}

        {/* Metadata items */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: 'var(--color-steel)', margin: '16px 0 24px 0' }}>
          {(profile.city || profile.country) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin style={{ width: '15px', height: '15px' }} />
              <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {profile.company && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 style={{ width: '15px', height: '15px' }} />
              <span>{profile.job_title ? `${profile.job_title} at ` : ''}{profile.company}</span>
            </div>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', textDecoration: 'none' }}>
              <Globe style={{ width: '15px', height: '15px' }} />
              <span>{profile.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Statistics Banner Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '16px 24px', boxShadow: 'var(--shadow-subtle)' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>{followerCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel)', fontWeight: 500 }}>Followers</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>{stats.followingCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel)', fontWeight: 500 }}>Following</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>{userArticles.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel)', fontWeight: 500 }}>Articles</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>{stats.likesCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-steel)', fontWeight: 500 }}>Reactions</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-hairline)', marginTop: '32px', overflowX: 'auto' }}>
          {[
            { id: 'articles', label: `Articles (${userArticles.length})`, icon: FileText },
            { id: 'about', label: 'About & Skills', icon: Sparkles },
            { id: 'activity', label: 'Activity Timeline', icon: Clock },
            { id: 'followers', label: `Followers (${followerCount})`, icon: Users },
            { id: 'following', label: `Following (${stats.followingCount})`, icon: Users },
          ].map(tab => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: active ? '2px solid var(--color-primary, #0F172A)' : '2px solid transparent',
                  color: active ? 'var(--color-ink)' : 'var(--color-steel)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <TabIcon style={{ width: '16px', height: '16px' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={{ marginTop: '24px' }}>
          
          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div>
              {userArticles.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {userArticles.map(article => (
                    <a
                      key={article._id}
                      href={`/article/${article.slug.current}`}
                      style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '20px', textDecoration: 'none', color: 'inherit' }}
                    >
                      {article.coverImage && (
                        <img src={typeof article.coverImage === 'string' ? article.coverImage : (article.coverImage as any)?.asset?.url} alt={article.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }} />
                      )}
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-ink)' }}>{article.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-steel)', margin: '0 0 16px 0', lineHeight: 1.5 }}>{article.excerpt}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-stone)' }}>
                        <span>{new Date(article.publishedAt || (article as any)._createdAt).toLocaleDateString()}</span>
                        <span>Read Article →</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-steel)', background: '#fff', borderRadius: '16px', border: '1px solid var(--color-hairline)' }}>
                  No published articles yet.
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 16px 0' }}>Professional Background</h3>
              {profile.skills && profile.skills.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)', marginBottom: '8px' }}>Skills & Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} style={{ padding: '6px 14px', borderRadius: '9999px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', fontSize: '13px', fontWeight: 600 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)', marginBottom: '8px' }}>Social Platforms</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {socialLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-hairline)', color: 'var(--color-ink)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {link.platform}: {link.url.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '24px' }}>
              {activityFeed.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activityFeed.map((act, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Clock style={{ width: '16px', height: '16px', color: 'var(--color-steel)' }} />
                      <div style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                        <span style={{ fontWeight: 600 }}>{profile.full_name || profile.username}</span> {act.activity_type.replace('_', ' ')}: <a href={act.target_url} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{act.target_title}</a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-steel)', textAlign: 'center', padding: '32px' }}>No recent activity.</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
