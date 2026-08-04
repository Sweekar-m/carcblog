import React, { useState } from 'react';
import { User, Bell, Key, ChevronDown } from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';
import { AISettingsForm } from '@/components/islands/AISettingsForm';
import { ProfileTab } from './tabs/ProfileTab';
import { SocialTab } from './tabs/SocialTab';
import { NotificationsTab } from './tabs/NotificationsTab';

interface SettingsManagerProps {
  profile: ExtendedProfile;
  socialLinks: SocialLink[];
}

export default function SettingsManager({
  profile: initialProfile,
  socialLinks: initialSocials,
}: SettingsManagerProps) {
  // ── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'notifications'>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab && ['profile', 'ai', 'notifications'].includes(tab)) return tab as any;
    }
    return 'profile';
  });

  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ── Profile state ────────────────────────────────────────────────────────────
  const [fullName, setFullName]   = useState(initialProfile.full_name || '');
  const [username, setUsername]   = useState(initialProfile.username  || '');
  const [bio,      setBio]        = useState(initialProfile.bio       || '');
  const [tagline,  setTagline]    = useState(initialProfile.tagline   || '');
  const [company,  setCompany]    = useState(initialProfile.company   || '');
  const [jobTitle, setJobTitle]   = useState(initialProfile.job_title || '');
  const [city,     setCity]       = useState(initialProfile.city      || '');
  const [country,  setCountry]    = useState(initialProfile.country   || '');
  const [website,  setWebsite]    = useState(initialProfile.website   || '');

  // ── Social links state ───────────────────────────────────────────────────────
  const defaultSocials: SocialLink[] = [{ user_id: initialProfile.id, platform: 'x', url: '' }];
  const [socials, setSocials] = useState<SocialLink[]>(
    initialSocials.length > 0 ? initialSocials : defaultSocials,
  );

  // ── Notifications state ──────────────────────────────────────────────────────
  const defaultNotifs = {
    likes: true, comments: true, followers: true,
    mentions: true, articles: true, digest: true,
  };
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    initialProfile.notification_prefs || defaultNotifs,
  );

  // ── Dirty tracking ───────────────────────────────────────────────────────────
  const isProfileDirty =
    fullName  !== (initialProfile.full_name  || '') ||
    username  !== (initialProfile.username   || '') ||
    bio       !== (initialProfile.bio        || '') ||
    tagline   !== (initialProfile.tagline    || '') ||
    company   !== (initialProfile.company    || '') ||
    jobTitle  !== (initialProfile.job_title  || '') ||
    city      !== (initialProfile.city       || '') ||
    country   !== (initialProfile.country    || '') ||
    website   !== (initialProfile.website    || '');

  const baseSocials = initialSocials.length > 0 ? initialSocials : defaultSocials;
  const isSocialsDirty  = JSON.stringify(socials)     !== JSON.stringify(baseSocials);
  const isNotifsDirty   = JSON.stringify(notifPrefs)  !== JSON.stringify(initialProfile.notification_prefs || defaultNotifs);
  const isDirty         = isProfileDirty || isSocialsDirty || isNotifsDirty;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddSocial = () =>
    setSocials(p => [...p, { user_id: initialProfile.id, platform: 'linkedin', url: '' }]);

  const handleRemoveSocial = (idx: number) =>
    setSocials(p => p.filter((_, i) => i !== idx));

  const handleSocialChange = (idx: number, field: 'platform' | 'url', val: string) =>
    setSocials(p => { const c = [...p]; c[idx] = { ...c[idx], [field]: val }; return c; });

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName, username, bio, tagline, company,
          job_title: jobTitle, city, country, website,
          notification_prefs: notifPrefs,
          social_links: socials.filter(s => s.url.trim().length > 0),
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save settings.');
      }
    } catch {
      alert('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const TAB_ITEMS = [
    { id: 'profile',       label: 'Public Profile', icon: User },
    { id: 'ai',            label: 'AI Settings',    icon: Key,  badge: 'AI' },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
  ] as const;

  const currentTab = TAB_ITEMS.find(t => t.id === activeTab) ?? TAB_ITEMS[0];
  const showSave   = activeTab !== 'ai';

  // ── Save button label ────────────────────────────────────────────────────────
  const saveLabel = saving ? 'Saving…' : saveSuccess ? '✓ Saved' : 'Save changes';

  // ── Shared save-button class ─────────────────────────────────────────────────
  const saveBtnCls =
    'inline-flex items-center justify-center px-5 h-9 rounded-full bg-primary text-white ' +
    'font-semibold text-button-md whitespace-nowrap hover:opacity-90 active:scale-95 ' +
    'transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ' +
    'disabled:pointer-events-none shrink-0';

  return (
    /*
     * Outer shell
     * ----------
     * max-w-[1100px] keeps the page comfortable on 1440px+ screens.
     * pb-28 sm:pb-10 reserves space for the mobile bottom save-bar.
     */
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans pb-28 sm:pb-10">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 pb-6 border-b border-hairline">
        <h1 className="text-2xl sm:text-[1.625rem] font-bold text-ink tracking-tight leading-tight">
          Settings
        </h1>
        <p className="text-body-sm text-steel mt-1.5 leading-relaxed">
          Manage your public profile, social links, AI settings, and notifications.
        </p>
      </div>

      {/* ── Mobile / Tablet section selector  (<1024px) ─────────────────────── */}
      <div className="lg:hidden mb-5 relative z-20">
        <button
          type="button"
          onClick={() => setMobileNavOpen(p => !p)}
          aria-expanded={mobileNavOpen}
          aria-haspopup="listbox"
          aria-label="Select settings section"
          className="w-full flex items-center justify-between gap-3 bg-white border border-hairline rounded-xl px-4 py-3 shadow-subtle hover:border-hairline-strong transition-colors min-h-[48px] cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            {React.createElement(currentTab.icon, { className: 'w-4 h-4 text-primary shrink-0' })}
            <span className="text-body-sm font-semibold text-ink truncate">{currentTab.label}</span>
            {'badge' in currentTab && currentTab.badge && (
              <span className="text-micro font-bold bg-brand-blue text-white px-2 py-0.5 rounded-full shrink-0 leading-none">
                {currentTab.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-steel">
            <span className="text-caption font-medium hidden sm:inline">Switch section</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-150 ${mobileNavOpen ? 'rotate-180 text-primary' : ''}`}
            />
          </div>
        </button>

        {/* Dropdown */}
        {mobileNavOpen && (
          <>
            {/* Click-outside backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-hairline rounded-xl shadow-modal p-1.5 z-30"
            >
              {TAB_ITEMS.map(tab => {
                const TabIcon = tab.icon;
                const active  = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="option"
                    aria-selected={active}
                    onClick={() => { setActiveTab(tab.id as any); setMobileNavOpen(false); }}
                    className={
                      `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium ` +
                      `transition-colors cursor-pointer text-left min-h-[44px] ` +
                      (active ? 'bg-primary text-white font-semibold' : 'text-ink hover:bg-surface')
                    }
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-steel'}`} />
                    <span className="flex-1">{tab.label}</span>
                    {'badge' in tab && tab.badge && (
                      <span className={
                        `text-micro font-bold px-2 py-0.5 rounded-full leading-none ` +
                        (active ? 'bg-white/20 text-white' : 'bg-brand-blue/10 text-brand-blue')
                      }>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* ── Desktop sidebar (≥1024px) ── */}
        <nav
          aria-label="Settings navigation"
          className="hidden lg:block w-[240px] shrink-0 sticky top-[72px]"
        >
          <div className="bg-white border border-hairline rounded-xl overflow-hidden shadow-subtle">
            {/* Sidebar label */}
            <div className="px-4 py-3 border-b border-hairline">
              <span className="text-micro font-bold text-steel uppercase tracking-widest">
                Settings
              </span>
            </div>
            {/* Nav items */}
            <div className="p-2 flex flex-col gap-0.5">
              {TAB_ITEMS.map(tab => {
                const TabIcon = tab.icon;
                const active  = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={
                      `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-body-sm ` +
                      `font-medium transition-all cursor-pointer text-left group ` +
                      (active
                        ? 'bg-primary text-white font-semibold'
                        : 'text-steel hover:text-ink hover:bg-surface')
                    }
                  >
                    <TabIcon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-white' : 'text-stone group-hover:text-steel'
                      }`}
                    />
                    <span className="flex-1 truncate">{tab.label}</span>
                    {'badge' in tab && tab.badge && (
                      <span className={
                        `text-micro font-bold px-2 py-0.5 rounded-full leading-none shrink-0 ` +
                        (active ? 'bg-white/25 text-white' : 'bg-brand-blue/10 text-brand-blue')
                      }>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* ── Content column ── */}
        <div className="flex-1 min-w-0 w-full">
          {/*
           * Single card — no overflow set (default: visible).
           * The sticky header inside uses top-[64px] (navbar height).
           * Because this card has no overflow:hidden/scroll, the browser
           * uses the viewport as the sticky scroll context — works cross-browser.
           */}
          <div className="bg-white border border-hairline rounded-2xl shadow-subtle">

            {/* Card sticky header */}
            <div className="sticky top-[64px] z-10 bg-white rounded-t-2xl border-b border-hairline px-6 sm:px-8 h-14 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                {React.createElement(currentTab.icon, {
                  className: 'w-4 h-4 text-primary shrink-0',
                })}
                <span className="text-body-sm font-semibold text-ink truncate">
                  {currentTab.label}
                </span>
              </div>
              {/* Save — desktop/tablet (sm+) only */}
              {showSave && (
                <button
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className={`hidden sm:inline-flex ${saveBtnCls}`}
                >
                  {saveLabel}
                </button>
              )}
            </div>

            {/* Card body */}
            <div className="px-6 sm:px-8 py-7">

              {/* ── Profile + Social ── */}
              {activeTab === 'profile' && (
                <div>
                  <ProfileTab
                    fullName={fullName}   setFullName={setFullName}
                    username={username}   setUsername={setUsername}
                    tagline={tagline}     setTagline={setTagline}
                    bio={bio}             setBio={setBio}
                    company={company}     setCompany={setCompany}
                    jobTitle={jobTitle}   setJobTitle={setJobTitle}
                    city={city}           setCity={setCity}
                    country={country}     setCountry={setCountry}
                    website={website}     setWebsite={setWebsite}
                  />

                  {/* Social links — divided section within the same card */}
                  <div className="mt-8 pt-8 border-t border-hairline">
                    <div className="mb-5">
                      <h2 className="text-body-md font-semibold text-ink">Social Links</h2>
                      <p className="text-caption text-steel mt-0.5">
                        Connect your public profiles across social and developer networks.
                      </p>
                    </div>
                    <SocialTab
                      socials={socials}
                      onAddSocial={handleAddSocial}
                      onRemoveSocial={handleRemoveSocial}
                      onSocialChange={handleSocialChange}
                    />
                  </div>
                </div>
              )}

              {/* ── AI settings ── */}
              {activeTab === 'ai' && <AISettingsForm embedded={true} />}

              {/* ── Notifications ── */}
              {activeTab === 'notifications' && (
                <NotificationsTab notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} />
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom save-bar (<640px) ─────────────────────────── */}
      {showSave && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-hairline px-4 py-3 flex items-center justify-between gap-3 shadow-modal">
          <span className="text-caption font-medium text-steel">
            {saveSuccess ? '✓ Saved!' : isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={saveBtnCls}
          >
            {saveLabel}
          </button>
        </div>
      )}
    </div>
  );
}
