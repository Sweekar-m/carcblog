import React from 'react';

interface NotificationsTabProps {
  notifPrefs: Record<string, boolean>;
  setNotifPrefs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifPrefs, setNotifPrefs }) => {
  return (
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
  );
};
