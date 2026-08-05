import React, { useState } from 'react';
import { User, Bell, Key, Link2, Shield, ChevronDown, AlertTriangle } from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';
import { AISettingsForm } from '@/components/islands/AISettingsForm';
import { ProfileTab } from './tabs/ProfileTab';
import { SocialTab } from './tabs/SocialTab';
import { NotificationsTab } from './tabs/NotificationsTab';

/* ─── Design tokens — inline style constants ────────────────────────────────
 *
 * We use inline styles for ALL design-token-dependent visual properties.
 * Reason: this project runs Tailwind CSS v4 (via @tailwindcss/vite), where
 * the @theme block in tailwind.css controls which utility classes exist.
 * The custom CarcBlog tokens (hairline, steel, canvas, surface, ink, shadow-
 * subtle, etc.) were NOT registered in @theme, so classes like `border-hairline`,
 * `text-steel`, `shadow-subtle` silently generated no CSS. Tailwind layout
 * utilities (flex, grid, w-*, h-*, gap-*, p-*, rounded-*, hidden, block, etc.)
 * are Tailwind primitives that exist in v4 and are safe to use as className.
 *
 * We only use className for: layout, display, position, overflow, cursor,
 * transition-timing (hardcoded values), and responsive prefixes.
 * ALL color, shadow, border-color, font-size, font-weight go inline.
 * ─────────────────────────────────────────────────────────────────────────── */

const T = {
  // Colors
  ink:            '#0f172a',
  steel:          '#64748b',
  stone:          '#94a3b8',
  charcoal:       '#334155',
  canvas:         '#ffffff',
  surface:        '#f8fafc',
  surfaceStrong:  '#f1f5f9',
  hairline:       '#e2e8f0',
  hairlineStrong: '#cbd5e1',
  primary:        '#0f172a',
  brandBlue:      '#0066ff',
  red500:         '#ef4444',
  red600:         '#dc2626',
  red50:          '#fef2f2',
  red200:         '#fecaca',
  white:          '#ffffff',

  // Typography
  fsSm:     '0.875rem',   // 14px body-sm
  fsXs:     '0.8125rem',  // 13px caption
  fsMicro:  '0.75rem',    // 12px micro
  fsBase:   '1rem',       // 16px body-md

  // Shadows
  shadowSubtle:  '0px 1px 2px 0px rgba(0,0,0,0.04)',
  shadowCard:    '0px 4px 6px 0px rgba(0,0,0,0.08)',
  shadowModal:   '0px 12px 16px -4px rgba(36,36,36,0.08)',

  // Font
  fontSans: "'DM Sans', Inter, system-ui, sans-serif",
} as const;

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface SettingsManagerProps {
  profile: ExtendedProfile;
  socialLinks: SocialLink[];
}

type SectionId = 'profile' | 'social' | 'ai' | 'notifications' | 'security';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  badge?: string;
  category: string;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'profile',       label: 'Public Profile',    icon: User,    category: 'Account',       description: 'Your name, bio, location, and public identity.' },
  { id: 'social',        label: 'Social Accounts',   icon: Link2,   category: 'Account',       description: 'Connect your public profiles across social networks.' },
  { id: 'ai',            label: 'AI Writer Keys',    icon: Key,     category: 'Writing Tools', description: 'API keys and model preferences for the AI writing assistant.', badge: 'AI' },
  { id: 'notifications', label: 'Notifications',     icon: Bell,    category: 'Notifications', description: 'Control which activity alerts you receive.' },
  { id: 'security',      label: 'Security',          icon: Shield,  category: 'Security',      description: 'Password, sessions, and account deletion.' },
];

const CATEGORIES = SECTIONS.reduce<{ label: string; items: SectionDef[] }[]>(
  (acc, s) => {
    const g = acc.find(x => x.label === s.category);
    g ? g.items.push(s) : acc.push({ label: s.category, items: [s] });
    return acc;
  }, [],
);

/* ─── Shared input/form field classes (Tailwind layout only) ──────────────── */
export const inputCls =
  'w-full block appearance-none outline-none transition-colors';

export const inputStyle: React.CSSProperties = {
  height: '44px',
  padding: '0 14px',
  borderRadius: '8px',
  border: `1px solid ${T.hairline}`,
  background: T.canvas,
  color: T.ink,
  fontFamily: T.fontSans,
  fontSize: T.fsSm,
  fontWeight: 400,
  boxSizing: 'border-box',
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: 'auto',
  minHeight: '100px',
  padding: '12px 14px',
  resize: 'vertical',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: T.fontSans,
  fontSize: T.fsSm,
  fontWeight: 600,
  color: T.ink,
  marginBottom: '6px',
};

export const hintStyle: React.CSSProperties = {
  fontFamily: T.fontSans,
  fontSize: T.fsXs,
  color: T.steel,
  marginTop: '4px',
  lineHeight: 1.5,
  display: 'block',
};

/* ─── Field wrapper ───────────────────────────────────────────────────────── */
export function Field({ id, labelText, hintText, children }: {
  id: string; labelText: string; hintText?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{labelText}</label>
      {children}
      {hintText && <span style={hintStyle}>{hintText}</span>}
    </div>
  );
}

/* ─── Section card ────────────────────────────────────────────────────────── */
function SectionCard({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{
      background: T.canvas,
      border: `1px solid ${danger ? T.red200 : T.hairline}`,
      borderRadius: '16px',
      boxShadow: T.shadowCard,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

/* ─── Section header strip ────────────────────────────────────────────────── */
function SectionHeader({ section, danger }: { section: SectionDef; danger?: boolean }) {
  const Icon = section.icon;
  return (
    <div style={{
      padding: '20px 32px 16px',
      borderBottom: `1px solid ${danger ? T.red200 : T.hairline}`,
      background: danger ? T.red50 : T.surface,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Icon style={{ width: '18px', height: '18px', color: danger ? T.red600 : T.primary, flexShrink: 0 }} />
          <span style={{ fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: danger ? T.red600 : T.ink, lineHeight: 1 }}>
            {section.label}
          </span>
          {section.badge && (
            <span style={{
              fontFamily: T.fontSans, fontSize: T.fsMicro, fontWeight: 700,
              background: T.brandBlue, color: T.white,
              padding: '2px 8px', borderRadius: '9999px', lineHeight: 1.5,
            }}>
              {section.badge}
            </span>
          )}
        </div>
        <span style={{ fontFamily: T.fontSans, fontSize: T.fsXs, color: T.steel, lineHeight: 1.5, paddingLeft: '26px', display: 'block' }}>
          {section.description}
        </span>
      </div>
    </div>
  );
}

/* ─── Security section content ────────────────────────────────────────────── */
function SecuritySection() {
  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.ink }}>Change password</span>
          <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsXs, color: T.steel, marginTop: '2px' }}>Update the password you use to sign in.</span>
        </div>
        <button type="button" style={{ flexShrink: 0, fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.ink, background: T.canvas, border: `1px solid ${T.hairline}`, borderRadius: '9999px', padding: '0 16px', height: '36px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Change
        </button>
      </div>
      <div style={{ borderTop: `1px solid ${T.hairline}` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertTriangle style={{ width: '16px', height: '16px', color: T.red500, flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.red600 }}>Delete account</span>
            <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsXs, color: T.steel, marginTop: '2px' }}>Permanently delete your account and all associated data. This action cannot be undone.</span>
          </div>
        </div>
        <button type="button" style={{ flexShrink: 0, fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.white, background: T.red600, border: 'none', borderRadius: '9999px', padding: '0 16px', height: '36px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Delete
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════ */
export default function SettingsManager({
  profile: initialProfile,
  socialLinks: initialSocials,
}: SettingsManagerProps) {

  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab && SECTIONS.some(s => s.id === tab)) return tab as SectionId;
    }
    return 'profile';
  });

  const [saving, setSaving]               = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [username, setUsername] = useState(initialProfile.username  || '');
  const [bio,      setBio]      = useState(initialProfile.bio       || '');
  const [tagline,  setTagline]  = useState(initialProfile.tagline   || '');
  const [company,  setCompany]  = useState(initialProfile.company   || '');
  const [jobTitle, setJobTitle] = useState(initialProfile.job_title || '');
  const [city,     setCity]     = useState(initialProfile.city      || '');
  const [country,  setCountry]  = useState(initialProfile.country   || '');
  const [website,   setWebsite]   = useState(initialProfile.website    || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');
  const [coverUrl,  setCoverUrl]  = useState(initialProfile.cover_url  || '');

  // Social links
  const defaultSocials: SocialLink[] = [{ user_id: initialProfile.id, platform: 'x', url: '' }];
  const [socials, setSocials] = useState<SocialLink[]>(
    initialSocials.length > 0 ? initialSocials : defaultSocials,
  );

  // Notifications
  const defaultNotifs = { likes: true, comments: true, followers: true, mentions: true, articles: true, digest: true };
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    initialProfile.notification_prefs || defaultNotifs,
  );

  // Dirty tracking
  const isProfileDirty =
    fullName !== (initialProfile.full_name || '') || username !== (initialProfile.username || '') ||
    bio !== (initialProfile.bio || '') || tagline !== (initialProfile.tagline || '') ||
    company !== (initialProfile.company || '') || jobTitle !== (initialProfile.job_title || '') ||
    city !== (initialProfile.city || '') || country !== (initialProfile.country || '') ||
    website !== (initialProfile.website || '') ||
    avatarUrl !== (initialProfile.avatar_url || '') || coverUrl !== (initialProfile.cover_url || '');
  const baseSocials    = initialSocials.length > 0 ? initialSocials : defaultSocials;
  const isSocialsDirty = JSON.stringify(socials) !== JSON.stringify(baseSocials);
  const isNotifsDirty  = JSON.stringify(notifPrefs) !== JSON.stringify(initialProfile.notification_prefs || defaultNotifs);
  const isDirty = isProfileDirty || isSocialsDirty || isNotifsDirty;

  // Handlers
  const handleAddSocial    = () => setSocials(p => [...p, { user_id: initialProfile.id, platform: 'linkedin', url: '' }]);
  const handleRemoveSocial = (idx: number) => setSocials(p => p.filter((_, i) => i !== idx));
  const handleSocialChange = (idx: number, field: 'platform' | 'url', val: string) =>
    setSocials(p => { const c = [...p]; c[idx] = { ...c[idx], [field]: val }; return c; });

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true); setSaveSuccess(false);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, username, bio, tagline, company, job_title: jobTitle, city, country, website, avatar_url: avatarUrl || null, cover_url: coverUrl || null, notification_prefs: notifPrefs, social_links: socials.filter(s => s.url.trim().length > 0) }),
      });
      if (res.ok) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
      else alert('Failed to save settings.');
    } catch { alert('Network error while saving settings.'); }
    finally { setSaving(false); }
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection) ?? SECTIONS[0];
  const showSave       = activeSection !== 'ai' && activeSection !== 'security';
  const saveLabel      = saving ? 'Saving…' : saveSuccess ? '✓ Saved' : 'Save changes';

  // The navbar height CSS variable (set in tokens.css: --h-nav: 64px).
  // Used for sticky positioning so both elements stay in sync.
  const STICKY_TOP = 'var(--h-nav, 64px)';

  const saveBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 20px', height: '36px', borderRadius: '9999px',
    background: T.primary, color: T.white, border: 'none',
    fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    opacity: (!isDirty || saving) ? 0.35 : 1,
    pointerEvents: (!isDirty || saving) ? 'none' : 'auto',
    transition: 'opacity 150ms ease',
  };

  return (
    <div style={{ fontFamily: T.fontSans, boxSizing: 'border-box' }}
         className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: `1px solid ${T.hairline}` }}>
        <h1 style={{ fontFamily: T.fontSans, fontSize: '1.75rem', fontWeight: 700, color: T.ink, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
          Settings
        </h1>
        <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsSm, color: T.steel, marginTop: '4px' }}>
          Manage your public profile, social links, AI settings, and notifications.
        </span>
      </div>

      {/* ── Mobile section selector (<1024px) ───────────────────────────── */}
      <div className="lg:hidden" style={{ marginBottom: '24px', position: 'relative', zIndex: 20 }}>
        <button
          type="button"
          onClick={() => setMobileNavOpen(p => !p)}
          aria-expanded={mobileNavOpen}
          aria-haspopup="listbox"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', background: T.canvas, border: `1px solid ${mobileNavOpen ? T.primary : T.hairline}`,
            borderRadius: '12px', padding: '12px 16px', boxShadow: T.shadowSubtle,
            cursor: 'pointer', minHeight: '48px', fontFamily: T.fontSans,
            transition: 'border-color 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {React.createElement(currentSection.icon, { style: { width: '16px', height: '16px', color: T.primary, flexShrink: 0 } })}
            <span style={{ fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentSection.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, color: T.steel }}>
            <span className="hidden sm:inline" style={{ fontFamily: T.fontSans, fontSize: T.fsXs, fontWeight: 500 }}>Change Section</span>
            <ChevronDown style={{ width: '16px', height: '16px', transition: 'transform 150ms ease', transform: mobileNavOpen ? 'rotate(180deg)' : 'none', color: mobileNavOpen ? T.primary : T.steel }} />
          </div>
        </button>

        {mobileNavOpen && (
          <>
            <div className="fixed inset-0" style={{ zIndex: 10 }} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
            <div role="listbox" style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: T.canvas, border: `1px solid ${T.hairline}`,
              borderRadius: '12px', boxShadow: T.shadowModal, padding: '6px', zIndex: 30,
            }}>
              {CATEGORIES.map((group, gi) => (
                <div key={group.label}>
                  {gi > 0 && <div style={{ height: '1px', background: T.hairline, margin: '4px 6px' }} />}
                  <div style={{ padding: '8px 12px 4px', fontFamily: T.fontSans, fontSize: '10px', fontWeight: 700, color: T.stone, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {group.label}
                  </div>
                  {group.items.map(section => {
                    const Icon   = section.icon;
                    const active = activeSection === section.id;
                    return (
                      <button key={section.id} role="option" aria-selected={active}
                        onClick={() => { setActiveSection(section.id); setMobileNavOpen(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '8px', border: 'none',
                          background: active ? T.primary : 'transparent',
                          cursor: 'pointer', minHeight: '44px', fontFamily: T.fontSans,
                          fontSize: T.fsSm, fontWeight: active ? 600 : 500,
                          color: active ? T.white : T.ink, textAlign: 'left',
                          transition: 'background 150ms ease, color 150ms ease',
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px', flexShrink: 0, color: active ? T.white : T.steel }} />
                        <span style={{ flex: 1 }}>{section.label}</span>
                        {section.badge && (
                          <span style={{ fontFamily: T.fontSans, fontSize: T.fsMicro, fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', lineHeight: 1.5, background: active ? 'rgba(255,255,255,0.2)' : T.brandBlue + '1a', color: active ? T.white : T.brandBlue }}>
                            {section.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Main two-column layout ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start" style={{ gap: '32px' }}>

        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <nav
          aria-label="Settings navigation"
          className="hidden lg:block"
          style={{ width: '240px', flexShrink: 0, position: 'sticky', top: STICKY_TOP, alignSelf: 'flex-start' }}
        >
          <div style={{
            background: T.canvas, border: `1px solid ${T.hairline}`,
            borderRadius: '12px', boxShadow: T.shadowSubtle, overflow: 'hidden',
          }}>
            {CATEGORIES.map((group, gi) => (
              <div key={group.label}>
                {/* Category header */}
                <div style={{
                  padding: '10px 16px 8px',
                  borderTop: gi > 0 ? `1px solid ${T.hairline}` : 'none',
                  background: T.surface,
                }}>
                  <span style={{ fontFamily: T.fontSans, fontSize: '10px', fontWeight: 700, color: T.stone, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {group.label}
                  </span>
                </div>

                {/* Nav items */}
                <div style={{ padding: '4px 8px 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map(section => {
                    const Icon    = section.icon;
                    const active  = activeSection === section.id;
                    const danger  = section.id === 'security';
                    const bgColor = active ? (danger ? T.red600 : T.primary) : 'transparent';
                    const fgColor = active ? T.white : (danger ? T.red600 : T.steel);
                    const hoverBg = danger ? T.red50 : T.surface;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = hoverBg; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 12px', borderRadius: '8px', border: 'none',
                          background: bgColor, cursor: 'pointer',
                          fontFamily: T.fontSans, fontSize: T.fsSm,
                          fontWeight: active ? 600 : 500, color: fgColor,
                          textAlign: 'left', transition: 'background 150ms ease, color 150ms ease',
                          boxShadow: active ? T.shadowSubtle : 'none',
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px', flexShrink: 0, color: active ? T.white : (danger ? T.red500 : T.steel), transition: 'color 150ms ease' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {section.label}
                        </span>
                        {section.badge && (
                          <span style={{ fontFamily: T.fontSans, fontSize: T.fsMicro, fontWeight: 700, padding: '2px 7px', borderRadius: '9999px', lineHeight: 1.5, flexShrink: 0, background: active ? 'rgba(255,255,255,0.2)' : T.brandBlue + '1a', color: active ? T.white : T.brandBlue }}>
                            {section.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </nav>

        {/* ── Right content column ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full">

          {/* Desktop save bar — appears above card when dirty */}
          {showSave && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '16px', padding: '0 20px', height: '48px', marginBottom: '12px',
              background: isDirty ? T.primary : T.surface,
              borderRadius: '12px',
              border: `1px solid ${isDirty ? 'transparent' : T.hairline}`,
              boxShadow: isDirty ? T.shadowCard : 'none',
              transition: 'background 200ms ease, box-shadow 200ms ease',
            }} className="hidden sm:flex">
              <span style={{ fontFamily: T.fontSans, fontSize: T.fsXs, fontWeight: 500, color: isDirty ? 'rgba(255,255,255,0.7)' : T.steel }}>
                {saveSuccess ? '✓ Changes saved' : isDirty ? 'You have unsaved changes' : currentSection.label}
              </span>
              <button type="button" onClick={handleSave} disabled={!isDirty || saving} style={saveBtnStyle}>
                {saveLabel}
              </button>
            </div>
          )}

          {/* Section cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {activeSection === 'profile' && (
              <SectionCard>
                <SectionHeader section={SECTIONS[0]} />
                <div style={{ padding: '24px 32px' }}>
                  <ProfileTab
                    fullName={fullName}     setFullName={setFullName}
                    username={username}     setUsername={setUsername}
                    tagline={tagline}       setTagline={setTagline}
                    bio={bio}               setBio={setBio}
                    company={company}       setCompany={setCompany}
                    jobTitle={jobTitle}     setJobTitle={setJobTitle}
                    city={city}             setCity={setCity}
                    country={country}       setCountry={setCountry}
                    website={website}       setWebsite={setWebsite}
                    avatarUrl={avatarUrl}   setAvatarUrl={setAvatarUrl}
                    coverUrl={coverUrl}     setCoverUrl={setCoverUrl}
                  />
                </div>
              </SectionCard>
            )}

            {activeSection === 'social' && (
              <SectionCard>
                <SectionHeader section={SECTIONS[1]} />
                <div style={{ padding: '24px 32px' }}>
                  <SocialTab
                    socials={socials}
                    onAddSocial={handleAddSocial}
                    onRemoveSocial={handleRemoveSocial}
                    onSocialChange={handleSocialChange}
                  />
                </div>
              </SectionCard>
            )}

            {activeSection === 'ai' && (
              <SectionCard>
                <SectionHeader section={SECTIONS[2]} />
                <div style={{ padding: '24px 32px' }}>
                  <AISettingsForm embedded={true} />
                </div>
              </SectionCard>
            )}

            {activeSection === 'notifications' && (
              <SectionCard>
                <SectionHeader section={SECTIONS[3]} />
                <div style={{ padding: '0 32px' }}>
                  <NotificationsTab notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} />
                </div>
              </SectionCard>
            )}

            {activeSection === 'security' && (
              <SectionCard danger>
                <SectionHeader section={SECTIONS[4]} danger />
                <SecuritySection />
              </SectionCard>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
