import React, { useState } from 'react';
import {
  User, Globe, Bell, Shield, Eye, Trash2, Key, Download, Check, Save, Plus, ExternalLink, Sparkles
} from 'lucide-react';
import type { ExtendedProfile, SocialLink } from '@/lib/profile';
import { AISettingsForm } from '@/components/islands/AISettingsForm';

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
  const [socials, setSocials] = useState<SocialLink[]>(
    initialSocials.length > 0 ? initialSocials : [{ user_id: initialProfile.id, platform: 'x', url: 'https://x.com/' }]
  );

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(initialProfile.notification_prefs || {
    likes: true, comments: true, followers: true, mentions: true, articles: true, digest: true
  });

  const handleAddSocial = () => {
    setSocials(prev => [...prev, { user_id: initialProfile.id, platform: 'linkedin', url: '' }]);
  };

  const handleRemoveSocial = (idx: number) => {
    setSocials(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSocialChange = (idx: number, field: 'platform' | 'url', val: string) => {
    setSocials(prev => {
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
          social_links: socials.filter(s => s.url.trim().length > 0)
        })
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

      {/* Settings Grid (Sidebar + Panel) */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px' }}>
        
        {/* Settings Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '12px', height: 'fit-content' }}>
          {[
            { id: 'profile', label: 'Public Profile', icon: User },
            { id: 'ai', label: 'AI Writer Keys (BYOK)', icon: Key, badge: 'AI' },
            { id: 'social', label: 'Social Accounts', icon: Globe },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Eye },
            { id: 'data', label: 'Data Export', icon: Download },
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
                  justifyContent: 'space-between',
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
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Founder & Tech Journalist @ TechVentures" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Share your story and interests..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Country</label>
                  <input type="text" value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* AI Writer & API Keys Tab */}
          {activeTab === 'ai' && (
            <div>
              <AISettingsForm embedded={true} />
            </div>
          )}

          {/* Social Accounts Tab */}
          {activeTab === 'social' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Social Accounts & Links</h3>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Connect your public profiles across developer and social networks.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {socials.map((link, idx) => (
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
                Add Profile Link
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Notification Preferences</h3>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Control what events trigger email or platform notifications.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.keys(notifPrefs).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--color-hairline)', background: 'var(--color-surface, #F8FAFC)' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '14px' }}>{key} Alerts</span>
                    <input type="checkbox" checked={notifPrefs[key]} onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#0F172A' }} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Privacy & Security</h3>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Manage security settings, authentication options, and data privacy.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-hairline)', background: 'var(--color-surface, #F8FAFC)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Authentication Session</div>
                  <p style={{ color: 'var(--color-steel)', fontSize: '13px', margin: 0 }}>Your session is secured with Clerk authentication. You can manage password resets or connected social logins on your Clerk security portal.</p>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fef2f2' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#dc2626', marginBottom: '4px' }}>Account Status</div>
                  <p style={{ color: '#991b1b', fontSize: '13px', margin: '0 0 12px 0' }}>Account role: <strong>{initialProfile.role}</strong>. Profile completion: <strong>{initialProfile.profile_completion_pct}%</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
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

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Export & Account Data</h3>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginBottom: '24px' }}>Download a complete JSON snapshot of your profile, social links, and activity data.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                <button
                  onClick={exportData}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '9999px', border: '1px solid var(--color-hairline)', background: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Export Profile Data (.json)
                </button>

                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-hairline)', background: 'var(--color-surface, #F8FAFC)', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Looking for AI Key configuration?</div>
                  <p style={{ color: 'var(--color-steel)', fontSize: '13px', margin: '0 0 12px 0' }}>Configure your Google Gemini or OpenRouter key for AI assistant features in the editor.</p>
                  <button
                    onClick={() => setActiveTab('ai')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', background: '#0F172A', color: '#fff', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                  >
                    <Key style={{ width: '14px', height: '14px' }} />
                    Manage AI Writer Keys →
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
