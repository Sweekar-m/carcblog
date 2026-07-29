import React, { useState } from 'react';
import { User, Globe, Bell, Shield, Eye, Download, Key } from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';
import { AISettingsForm } from '@/components/islands/AISettingsForm';
import { ProfileTab } from './tabs/ProfileTab';
import { SocialTab } from './tabs/SocialTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { PrivacyTab } from './tabs/PrivacyTab';
import { DataExportTab } from './tabs/DataExportTab';

interface SettingsManagerProps {
  profile: ExtendedProfile;
  socialLinks: SocialLink[];
}

export default function SettingsManager({ profile: initialProfile, socialLinks: initialSocials }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'social' | 'notifications' | 'privacy' | 'appearance' | 'data'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['profile', 'ai', 'social', 'notifications', 'privacy', 'appearance', 'data'].includes(tab)) {
        return tab as any;
      }
    }
    return 'profile';
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div style={{ padding: '32px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-ink)' }}>Account & Preference Settings</h1>
          <p style={{ color: 'var(--color-steel)', margin: 0, fontSize: '0.9375rem' }}>Manage your public profile, AI Writer API key, social links, notifications, and security.</p>
        </div>

        {activeTab !== 'ai' && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '9999px', border: 'none', background: 'var(--color-primary, #0F172A)', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Settings'}
          </button>
        )}
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px' }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '12px', height: 'fit-content' }}>
          {[
            { id: 'profile', label: 'Public Profile', icon: User },
            { id: 'ai', label: 'AI Writer Keys (BYOK)', icon: Key, badge: 'AI' },
            { id: 'social', label: 'Social Accounts', icon: Globe },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Eye },
            { id: 'data', label: 'Data Export', icon: Download },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: active ? 'var(--color-surface, #F8FAFC)' : 'transparent',
                  color: active ? 'var(--color-ink)' : 'var(--color-steel)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TabIcon style={{ width: '16px', height: '16px', color: active ? 'var(--color-accent)' : 'inherit' }} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#0EA5E9', color: '#fff', padding: '2px 6px', borderRadius: '9999px' }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
          {activeTab === 'profile' && (
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
          )}

          {activeTab === 'ai' && <AISettingsForm embedded={true} />}

          {activeTab === 'social' && (
            <SocialTab
              socials={socials}
              onAddSocial={handleAddSocial}
              onRemoveSocial={handleRemoveSocial}
              onSocialChange={handleSocialChange}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} />
          )}

          {activeTab === 'privacy' && <PrivacyTab profile={initialProfile} />}

          {activeTab === 'appearance' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Appearance & Theme</h3>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Customize your reading and writing interface preferences.</p>
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--color-hairline)', background: 'var(--color-surface, #F8FAFC)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Design System: MiniMax Studio (v2)</div>
                <p style={{ color: 'var(--color-steel)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  CarcBlog uses DM Sans geometric typography, pill-shaped action controls, and encoded category color cards for editorial clarity.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <DataExportTab profile={initialProfile} onNavigateTab={(tab) => setActiveTab(tab as any)} />
          )}
        </div>
      </div>
    </div>
  );
}
