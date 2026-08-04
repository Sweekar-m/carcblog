import React from 'react';

interface NotificationsTabProps {
  notifPrefs: Record<string, boolean>;
  setNotifPrefs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifPrefs, setNotifPrefs }) => {
  return (
    <div>
      <p className="text-steel text-sm mb-6 font-sans">Control what events trigger email or platform notifications.</p>

      <div className="flex flex-col gap-3">
        {Object.keys(notifPrefs).map(key => (
          <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-hairline bg-surface hover:border-hairline-strong transition-all cursor-pointer">
            <span className="capitalize font-semibold text-sm text-ink font-sans">{key} Alerts</span>
            <input type="checkbox" checked={notifPrefs[key]} onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
          </label>
        ))}
      </div>
    </div>
  );
};
