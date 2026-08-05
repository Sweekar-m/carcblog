import React from 'react';

const T = {
  ink:      '#0f172a',
  steel:    '#64748b',
  hairline: '#e2e8f0',
  primary:  '#0f172a',
  white:    '#ffffff',
  fontSans: "'DM Sans', Inter, system-ui, sans-serif",
  fsSm:     '0.875rem',
  fsXs:     '0.8125rem',
};

/* ── Toggle switch ─────────────────────────────────────────────────────────── */
function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      id={id} type="button" role="switch" aria-checked={checked} onClick={onChange}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: '44px', height: '24px', borderRadius: '9999px', flexShrink: 0,
        border: 'none', cursor: 'pointer', padding: 0,
        background: checked ? T.primary : '#cbd5e1',
        transition: 'background 200ms ease',
        outline: 'none',
      }}
    >
      <span className="sr-only">{checked ? 'Enabled' : 'Disabled'}</span>
      <span style={{
        display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%',
        background: T.white, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: checked ? 'translateX(22px)' : 'translateX(4px)',
        transition: 'transform 200ms ease',
      }} />
    </button>
  );
}

/* ── Notification items ─────────────────────────────────────────────────────── */
const ITEMS = [
  { key: 'likes',     label: 'Likes',             description: 'When someone likes your article or post' },
  { key: 'comments',  label: 'Comments',           description: 'When someone comments on your content' },
  { key: 'followers', label: 'New followers',      description: 'When someone follows your profile' },
  { key: 'mentions',  label: 'Mentions',           description: 'When someone mentions you in an article or comment' },
  { key: 'articles',  label: 'Article published',  description: 'Confirmation when your article goes live' },
  { key: 'digest',    label: 'Weekly digest',      description: 'A weekly roundup of your top-performing content' },
];

interface NotificationsTabProps {
  notifPrefs:    Record<string, boolean>;
  setNotifPrefs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifPrefs, setNotifPrefs }) => {
  const toggle = (key: string) => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div>
      {ITEMS.map((item, i) => {
        const checked = !!notifPrefs[item.key];
        const isLast  = i === ITEMS.length - 1;
        return (
          <div
            key={item.key}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '24px', padding: '16px 0',
              borderBottom: isLast ? 'none' : `1px solid ${T.hairline}`,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <label
                htmlFor={`notif-${item.key}`}
                style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.ink, cursor: 'pointer' }}
              >
                {item.label}
              </label>
              <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsXs, color: T.steel, marginTop: '2px', lineHeight: 1.5 }}>
                {item.description}
              </span>
            </div>
            <Toggle id={`notif-${item.key}`} checked={checked} onChange={() => toggle(item.key)} />
          </div>
        );
      })}
    </div>
  );
};
