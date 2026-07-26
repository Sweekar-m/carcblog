import React, { useState } from 'react';
import {
  User, Globe, Bell, Shield, Eye, Trash2, Key, Download, Check, Save, Plus
} from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';

interface SettingsManagerProps {
  profile: ExtendedProfile;
  socialLinks: SocialLink[];
}

export default function SettingsManager({ profile: initialProfile, socialLinks: initialSocials }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'notifications' | 'privacy' | 'appearance' | 'data'>('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile fields
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
  const [socials, setSocials] = useState<SocialLink[]>(initialSocials.length > 0 ? initialSocials : [{ user_id: initialProfile.id, platform: 'x', url: '' }]);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(initialProfile.notification_prefs || {
    likes: true, comments: true, followers: true, mentions: true, articles: true, digest: true
  });

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
          social_links: socials.filter(s => s.url.trim().length > 0)
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(initialProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `carcblog_data_${initialProfile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ padding: '32px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-ink)' }}>Account & Preference Settings</h1>
          <p style={{ color: 'var(--color-steel)', margin: 0, fontSize: '0.9375rem' }}>Manage your public profile, social accounts, notifications, and security.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '9999px', border: 'none', background: 'var(--color-primary, #0F172A)', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Grid (Sidebar + Panel) */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px' }}>
        
        {/* Settings Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '12px', height: 'fit-content' }}>
          {[
            { id: 'profile', label: 'Public Profile', icon: User },
            { id: 'social', label: 'Social Accounts', icon: Globe },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Eye },
            { id: 'data', label: 'API & Data Export', icon: Download },
          ].map(tab => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: active ? 'var(--color-surface, #F8FAFC)' : 'transparent',
                  color: active ? 'var(--color-ink)' : 'var(--color-steel)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <TabIcon style={{ width: '16px', height: '16px' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Settings Form Panel */}
        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px 0' }}>Profile Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tagline</label>
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px 0' }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(notifPrefs).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--color-hairline)' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '14px' }}>{key} Notifications</span>
                    <input type="checkbox" checked={notifPrefs[key]} onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px 0' }}>Export & Account Options</h3>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Download a complete JSON snapshot of your articles, bookmarks, and activity data.</p>
              
              <button
                onClick={exportData}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '9999px', border: '1px solid var(--color-hairline)', background: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Export My Data (.json)
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
