import React from 'react';

/* ── Toggle switch component ──────────────────────────────────────────────── */
function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={
        `relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ` +
        `transition-colors duration-200 cursor-pointer ` +
        `focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ` +
        (checked ? 'bg-primary' : 'bg-hairline-strong')
      }
    >
      <span className="sr-only">{checked ? 'Enabled' : 'Disabled'}</span>
      <span
        className={
          `inline-block h-4 w-4 rounded-full bg-white shadow-sm ` +
          `transition-transform duration-200 ` +
          (checked ? 'translate-x-6' : 'translate-x-1')
        }
      />
    </button>
  );
}

/* ── Notification items ───────────────────────────────────────────────────── */
const ITEMS: { key: string; label: string; description: string }[] = [
  {
    key:         'likes',
    label:       'Likes',
    description: 'When someone likes your article or post',
  },
  {
    key:         'comments',
    label:       'Comments',
    description: 'When someone comments on your content',
  },
  {
    key:         'followers',
    label:       'New followers',
    description: 'When someone follows your profile',
  },
  {
    key:         'mentions',
    label:       'Mentions',
    description: 'When someone mentions you in an article or comment',
  },
  {
    key:         'articles',
    label:       'Article published',
    description: 'Confirmation when your article goes live',
  },
  {
    key:         'digest',
    label:       'Weekly digest',
    description: 'A weekly roundup of your top-performing content',
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */
interface NotificationsTabProps {
  notifPrefs:    Record<string, boolean>;
  setNotifPrefs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifPrefs,
  setNotifPrefs,
}) => {
  const toggle = (key: string) =>
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col">
      {ITEMS.map((item, i) => {
        const checked = !!notifPrefs[item.key];
        const toggleId = `notif-toggle-${item.key}`;
        const isLast   = i === ITEMS.length - 1;

        return (
          <div
            key={item.key}
            className={`flex items-center justify-between gap-6 py-4 ${isLast ? '' : 'border-b border-hairline'}`}
          >
            {/* Label + description */}
            <div className="min-w-0 flex-1">
              {/*
               * The label's htmlFor points to the toggle button's id.
               * Clicking the label text will trigger the button's onClick via
               * the browser's label–control association.
               */}
              <label
                htmlFor={toggleId}
                className="block text-body-sm font-semibold text-ink cursor-pointer"
              >
                {item.label}
              </label>
              <p className="text-caption text-steel mt-0.5">{item.description}</p>
            </div>

            {/* Toggle */}
            <Toggle id={toggleId} checked={checked} onChange={() => toggle(item.key)} />
          </div>
        );
      })}
    </div>
  );
};
