import React, { useState } from 'react';
import {
  User, Briefcase, Globe, Bookmark, Users, Bell, CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2, Sparkles, BookOpen, PenTool
} from 'lucide-react';

interface OnboardingWizardProps {
  initialUser: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    email?: string;
    role?: string;
  };
}

const TOPIC_OPTIONS = [
  'Startup', 'AI & Machine Learning', 'Cybersecurity', 'SaaS', 'Finance & FinTech',
  'Cloud Infrastructure', 'Programming', 'Product Management', 'DevOps', 'Open Source', 'Web3'
];

const SUGGESTED_WRITERS = [
  { id: 'user_3GtteUzY1i4L98bnkIG1bKCpNDA', name: 'Sweekar M', username: 'sweekar.m.work', tagline: 'Founder @ CarcBlog · AI & SaaS' },
  { id: 'user_3GxHIoqF8NyJTa8YjxCgOUuZRMA', name: 'Govinda', username: 'srigovinda2025', tagline: 'Tech Lead · DevOps & Cloud' },
  { id: 'user_3GxVczR4xrrhZPPFGQHOj2TILhY', name: 'Devendra', username: 'devendraowlneck', tagline: 'Product Researcher & Tech Journalist' }
];

export default function OnboardingWizard({ initialUser }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [role, setRole] = useState<'reader' | 'writer'>(initialUser.role === 'writer' ? 'writer' : 'reader');
  const [fullName, setFullName] = useState(initialUser.full_name || '');
  const [username, setUsername] = useState(initialUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('San Francisco');
  const [timezone, setTimezone] = useState('UTC');
  const [preferredLang, setPreferredLang] = useState('en');

  // Step 2: Professional Info
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [yearsExp, setYearsExp] = useState(3);
  const [industry, setIndustry] = useState('Technology');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, AI, Node.js');

  // Step 3: Social Links
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([
    { platform: 'x', url: 'https://x.com/' },
    { platform: 'github', url: 'https://github.com/' }
  ]);

  // Step 4: Writing Preferences
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Startup', 'AI & Machine Learning']);

  // Step 5: Followed Writers
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Step 6: Notifications
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    likes: true,
    comments: true,
    followers: true,
    mentions: true,
    articles: true,
    digest: true,
    messages: true
  });

  const toggleTopic = (t: string) => {
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]);
  };

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddSocial = () => {
    setSocialLinks(prev => [...prev, { platform: 'linkedin', url: '' }]);
  };

  const handleRemoveSocial = (idx: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSocialChange = (idx: number, field: 'platform' | 'url', val: string) => {
    setSocialLinks(prev => {
      const copy = [...prev];
      copy[idx][field] = val;
      return copy;
    });
  };

  const calculateCompletion = () => {
    let score = 30;
    if (fullName) score += 10;
    if (avatarUrl) score += 10;
    if (bio) score += 10;
    if (jobTitle || company) score += 10;
    if (socialLinks.length > 0) score += 10;
    if (selectedTopics.length > 0) score += 10;
    if (country || city) score += 10;
    return Math.min(100, score);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        alert('Please enter your Full Name to continue.');
        return;
      }
    }
    setStep(prev => Math.min(7, prev + 1));
  };

  const handleSubmitAll = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        role,
        full_name: fullName.trim() || 'Creator',
        username: username.trim(),
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        bio,
        tagline,
        country,
        city,
        timezone,
        preferred_language: preferredLang,
        company,
        job_title: jobTitle,
        years_experience: yearsExp,
        industry,
        skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
        social_links: socialLinks.filter(s => s.url.trim().length > 0),
        writing_topics: selectedTopics,
        notification_prefs: notifPrefs
      };

      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.profile)) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
        window.location.href = redirectUrl;
      } else {
        alert(data.error || 'Failed to save profile. Please try again.');
      }
    } catch (e: any) {
      console.error('Onboarding save error:', e);
      alert('An error occurred during onboarding: ' + (e?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Step Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            onClick={() => s < step && setStep(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: step === s ? 'var(--color-primary, #0F172A)' : step > s ? 'var(--color-accent, #0EA5E9)' : 'var(--color-surface, #F8FAFC)',
              color: step >= s ? '#ffffff' : 'var(--color-slate, #64748B)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: s < step ? 'pointer' : 'default',
              transition: 'all 200ms ease'
            }}
          >
            {step > s ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : s}
          </div>
        ))}
      </div>

      {/* Main Form Card */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline, #E2E8F0)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--shadow-card)' }}>
        
        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <User style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 1: Account Role & Basic Profile</h2>
            </div>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
              Select your primary role and set up your public identity on CarcBlog.
            </p>

            {/* Role Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                Account Type (Role) *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div
                  onClick={() => setRole('reader')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: role === 'reader' ? '2px solid var(--color-primary, #0F172A)' : '1px solid var(--color-hairline, #E2E8F0)',
                    background: role === 'reader' ? 'var(--color-surface, #F8FAFC)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px', color: 'var(--color-ink)' }}>
                      <BookOpen style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
                      Reader / Explorer
                    </div>
                    <input type="radio" name="role" checked={role === 'reader'} onChange={() => setRole('reader')} />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-steel)', lineHeight: 1.4 }}>
                    Discover tech startups, read founder stories, bookmark articles & follow creators.
                  </p>
                </div>

                <div
                  onClick={() => setRole('writer')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: role === 'writer' ? '2px solid var(--color-primary, #0F172A)' : '1px solid var(--color-hairline, #E2E8F0)',
                    background: role === 'writer' ? 'var(--color-surface, #F8FAFC)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px', color: 'var(--color-ink)' }}>
                      <PenTool style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
                      Writer / Creator
                    </div>
                    <input type="radio" name="role" checked={role === 'writer'} onChange={() => setRole('writer')} />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-steel)', lineHeight: 1.4 }}>
                    Publish startup articles, manage drafts, access AI writing tools & build an audience.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. Alex Rivera"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. alexrivera"
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. Founder & Tech Journalist @ TechVentures"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="Share your story, interests, and what you write about..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Professional Information */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Briefcase style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 2: Professional Information</h2>
            </div>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 28px 0', fontSize: '0.9375rem' }}>
              Help readers understand your background and expertise.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. Senior Software Architect"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. Stripe, OpenAI, Independent"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Industry</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="Technology">Technology & Software</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Venture Capital">Venture Capital & Startups</option>
                  <option value="FinTech">FinTech & Finance</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Media">Media & Publishing</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Years of Experience</label>
                <input
                  type="number"
                  value={yearsExp}
                  onChange={e => setYearsExp(Number(e.target.value))}
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Key Skills & Technologies (comma separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                placeholder="React, TypeScript, Python, LLMs, Cloud Infrastructure"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Social Accounts */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Globe style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 3: Social Accounts</h2>
            </div>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
              Connect your social presence across platforms.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {socialLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={link.platform}
                    onChange={e => handleSocialChange(idx, 'platform', e.target.value)}
                    style={{ width: '140px', height: '42px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', background: '#fff' }}
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="x">X / Twitter</option>
                    <option value="youtube">YouTube</option>
                    <option value="devto">Dev.to</option>
                    <option value="medium">Medium</option>
                    <option value="website">Website</option>
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={e => handleSocialChange(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    style={{ flex: 1, height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(idx)}
                    style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                  >
                    <Trash2 style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSocial}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--color-hairline)', background: 'transparent', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              Add Another Social Profile
            </button>
          </div>
        )}

        {/* STEP 4: Writing Preferences */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Bookmark style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 4: Writing Preferences</h2>
            </div>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
              Select your primary topics to personalize your feed and recommendations.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {TOPIC_OPTIONS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      border: isSelected ? '1px solid var(--color-primary, #0F172A)' : '1px solid var(--color-hairline)',
                      background: isSelected ? 'var(--color-primary, #0F172A)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--color-ink)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {topic} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Follow Interests */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Users style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 5: Follow Writers</h2>
            </div>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
              Follow recommended creators on CarcBlog to populate your feed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {SUGGESTED_WRITERS.map((writer) => {
                const isFollowing = followedIds.includes(writer.id);
                return (
                  <div key={writer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--color-hairline)', background: 'var(--color-surface, #F8FAFC)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-ink)' }}>{writer.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-steel)' }}>{writer.tagline}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollow(writer.id)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: isFollowing ? 'var(--color-surface-soft, #E2E8F0)' : 'var(--color-primary, #0F172A)',
                        color: isFollowing ? 'var(--color-ink)' : '#ffffff',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Notification Preferences */}
        {step === 6 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Bell style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 6: Notification Preferences</h2>
            </div>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
              Control what notifications you receive.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {Object.keys(notifPrefs).map((key) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--color-hairline)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifPrefs[key]}
                    onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '14px' }}>{key} Alerts</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Complete Profile */}
        {step === 7 && (
          <div style={{ textAlignment: 'center' as any }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Sparkles style={{ width: '48px', height: '48px', color: 'var(--color-accent)' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Profile Setup Complete!</h2>
            <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '1rem' }}>
              Your profile strength is at <strong style={{ color: 'var(--color-accent)' }}>{calculateCompletion()}%</strong>.
            </p>

            <div style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Setup Summary:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-steel)', fontSize: '14px', lineHeight: 1.6 }}>
                <li>Account Role: <strong>{role === 'writer' ? 'Writer / Creator' : 'Reader / Explorer'}</strong></li>
                <li>Name & Username: <strong>{fullName}</strong> (@{username})</li>
                <li>Professional Title: <strong>{jobTitle || (role === 'writer' ? 'Writer' : 'Reader')}</strong> in {industry}</li>
                <li>Selected Topics: <strong>{selectedTopics.join(', ')}</strong></li>
                <li>Connected Social Profiles: <strong>{socialLinks.length} platforms</strong></li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--color-hairline)' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '9999px', border: '1px solid var(--color-hairline)', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back
            </button>
          ) : <div />}

          {step < 7 ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 24px',
                borderRadius: '9999px',
                border: 'none',
                background: '#0F172A',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15,23,42,0.15)'
              }}
            >
              Continue
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 30px',
                borderRadius: '9999px',
                border: 'none',
                background: loading ? '#64748B' : '#0F172A',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(15,23,42,0.25)',
                transition: 'all 150ms ease'
              }}
            >
              {loading ? 'Saving Profile...' : 'Complete & Launch Dashboard →'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
