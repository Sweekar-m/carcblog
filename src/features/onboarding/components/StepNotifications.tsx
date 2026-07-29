import React from 'react';
import { Bell } from 'lucide-react';

interface StepNotificationsProps {
  notifPrefs: Record<string, boolean>;
  setNotifPrefs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const StepNotifications: React.FC<StepNotificationsProps> = ({ notifPrefs, setNotifPrefs }) => {
  const togglePref = (key: string) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const prefLabels: Record<string, { title: string; desc: string }> = {
    articles: { title: 'New Article Alerts', desc: 'Get notified when creators you follow publish new articles.' },
    comments: { title: 'Comment Discussions', desc: 'Alerts when readers reply to your comments or articles.' },
    likes: { title: 'Appreciation & Likes', desc: 'Notifications when someone likes your stories or comments.' },
    followers: { title: 'New Followers', desc: 'Know immediately when other community members follow you.' },
    digest: { title: 'Weekly Tech Digest', desc: 'Receive a curated weekly summary of top startup stories.' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Bell style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 6: Notification Preferences</h2>
      </div>
      <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Customize how and when CarcBlog notifies you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(prefLabels).map(([key, item]) => {
          const enabled = notifPrefs[key] ?? true;
          return (
            <div
              key={key}
              onClick={() => togglePref(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--color-hairline, #E2E8F0)',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-ink)' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-steel)' }}>{item.desc}</div>
              </div>

              <input type="checkbox" checked={enabled} onChange={() => togglePref(key)} style={{ width: '18px', height: '18px' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
