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

export default function SettingsManager({ profile: initialProfile, socialLinks: initialSocials }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'notifications'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['profile', 'ai', 'notifications'].includes(tab)) {
        return tab as any;
      }
    }
    return 'profile';
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [username, setUsername] = useState(initialProfile.username || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [tagline, setTagline] = useState(initialProfile.tagline || '');
  const [company, setCompany] = useState(initialProfile.company || '');
  const [jobTitle, setJobTitle] = useState(initialProfile.job_title || '');
  const [city, setCity] = useState(initialProfile.city || '');
  const [country, setCountry] = useState(initialProfile.country || '');
  const [website, setWebsite] = useState(initialProfile.website || '');

  // Socials
  const [socials, setSocials] = useState<SocialLink[]>(
    initialSocials.length > 0 ? initialSocials : [{ user_id: initialProfile.id, platform: 'x', url: 'https://x.com/' }]
  );

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    initialProfile.notification_prefs || { likes: true, comments: true, followers: true, mentions: true, articles: true, digest: true }
  );

  // Dirty state tracking
  const isProfileDirty =
    fullName !== (initialProfile.full_name || '') ||
    username !== (initialProfile.username || '') ||
    bio !== (initialProfile.bio || '') ||
    tagline !== (initialProfile.tagline || '') ||
    company !== (initialProfile.company || '') ||
    jobTitle !== (initialProfile.job_title || '') ||
    city !== (initialProfile.city || '') ||
    country !== (initialProfile.country || '') ||
    website !== (initialProfile.website || '');

  const isSocialsDirty = JSON.stringify(socials) !== JSON.stringify(initialSocials.length > 0 ? initialSocials : [{ user_id: initialProfile.id, platform: 'x', url: 'https://x.com/' }]);

  const isNotifsDirty = JSON.stringify(notifPrefs) !== JSON.stringify(initialProfile.notification_prefs || { likes: true, comments: true, followers: true, mentions: true, articles: true, digest: true });

  const isDirty = isProfileDirty || isSocialsDirty || isNotifsDirty;

  const handleAddSocial = () => {
    setSocials((prev) => [...prev, { user_id: initialProfile.id, platform: 'linkedin', url: '' }]);
  };

  const handleRemoveSocial = (idx: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSocialChange = (idx: number, field: 'platform' | 'url', val: string) => {
    setSocials((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          username,
          bio,
          tagline,
          company,
          job_title: jobTitle,
          city,
          country,
          website,
          notification_prefs: notifPrefs,
          social_links: socials.filter((s) => s.url.trim().length > 0),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save profile settings.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const TAB_ITEMS = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'ai', label: 'AI Settings', icon: Key, badge: 'AI' },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const currentTabObj = TAB_ITEMS.find((t) => t.id === activeTab) || TAB_ITEMS[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans pb-24 sm:pb-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 border-b border-hairline pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-sans">
          Settings
        </h1>
        <p className="text-steel text-sm sm:text-base mt-1 font-sans">
          Manage your public profile, social links, AI settings, and notifications.
        </p>
      </div>

      {/* ── TABLET & MOBILE SECTION SELECTOR (<1024px) ── */}
      <div className="lg:hidden mb-6 relative">
        <button
          onClick={() => setMobileNavOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 bg-white border border-hairline rounded-2xl p-4 shadow-xs hover:border-hairline-strong transition-all min-h-[48px] cursor-pointer text-left"
          aria-label="Select settings category"
          aria-expanded={mobileNavOpen}
        >
          <div className="flex items-center gap-3 min-w-0">
            {React.createElement(currentTabObj.icon, {
              className: 'w-5 h-5 text-primary shrink-0',
            })}
            <span className="font-sans text-sm sm:text-base font-bold text-ink truncate">
              {currentTabObj.label}
            </span>
            {currentTabObj.badge && (
              <span className="text-[10px] font-extrabold bg-brand-blue text-white px-2 py-0.5 rounded-full shrink-0">
                {currentTabObj.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-steel">
            <span className="text-xs font-semibold hidden sm:inline">Change Section</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                mobileNavOpen ? 'rotate-180 text-primary' : ''
              }`}
            />
          </div>
        </button>

        {mobileNavOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-hairline rounded-2xl p-2.5 shadow-xl flex flex-col gap-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2 font-sans text-xs font-bold text-steel uppercase tracking-wider border-b border-hairline-soft mb-1 flex items-center justify-between">
              <span>Select Settings Section</span>
              <span className="text-[11px] font-normal text-slate-400">3 sections</span>
            </div>
            {TAB_ITEMS.map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all text-left cursor-pointer min-h-[44px] ${
                    active
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'bg-transparent text-ink hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-steel'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-brand-blue text-white'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PAGE LAYOUT SYSTEM (Desktop sidebar + Content area) ── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full min-w-0">
        {/* Fixed Desktop Navigation Sidebar (≥1024px) */}
        <div className="hidden lg:flex flex-col gap-1.5 bg-white border border-hairline rounded-2xl p-3.5 h-fit shrink-0 w-56 sticky top-24">
          <div className="px-3 py-1.5 font-sans text-[11px] font-bold text-steel uppercase tracking-wider border-b border-hairline-soft pb-2.5 mb-1.5">
            Settings
          </div>
          {TAB_ITEMS.map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-between gap-2.5 px-4 py-3 rounded-full text-sm font-sans font-medium transition-all cursor-pointer text-left ${
                  active
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-transparent text-steel hover:text-ink hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TabIcon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-steel'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-brand-blue text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 max-w-full lg:max-w-3xl w-full bg-white border border-hairline rounded-2xl p-5 sm:p-8 shadow-card relative">
          {/* Desktop Sticky Header inside Panel */}
          {activeTab !== 'ai' && (
            <div className="hidden sm:flex sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 mb-6 border-b border-hairline items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {React.createElement(currentTabObj.icon, { className: "w-5 h-5 text-primary shrink-0" })}
                <span className="font-bold text-base sm:text-lg text-ink truncate font-sans">{currentTabObj.label}</span>
              </div>
              <button
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="inline-flex items-center justify-center px-6 h-11 rounded-full bg-primary text-white font-bold text-sm whitespace-nowrap leading-none hover:opacity-90 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Settings'}
              </button>
            </div>
          )}

          {/* Active Tab Panel Content */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-8">
              {/* Profile fields */}
              <ProfileTab
                fullName={fullName}
                setFullName={setFullName}
                username={username}
                setUsername={setUsername}
                tagline={tagline}
                setTagline={setTagline}
                bio={bio}
                setBio={setBio}
                company={company}
                setCompany={setCompany}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                city={city}
                setCity={setCity}
                country={country}
                setCountry={setCountry}
              />

              {/* Social Links section — merged into Public Profile */}
              <div className="pt-6 border-t border-hairline">
                <div className="mb-4">
                  <h3 className="font-bold text-base text-ink font-sans mb-1">Social Links</h3>
                  <p className="text-steel text-sm font-sans">Connect your public profiles across developer and social networks.</p>
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

          {activeTab === 'ai' && <AISettingsForm embedded={true} />}

          {activeTab === 'notifications' && (
            <NotificationsTab notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} />
          )}
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM ACTION BAR (<640px) ── */}
      {activeTab !== 'ai' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-hairline z-50 flex items-center justify-between gap-3 shadow-lg">
          <div className="text-xs font-semibold text-steel font-sans">
            {saveSuccess ? '✓ Saved!' : isDirty ? 'Unsaved changes' : 'No changes'}
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="inline-flex items-center justify-center px-6 h-11 rounded-full bg-primary text-white font-bold text-sm whitespace-nowrap leading-none hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}
