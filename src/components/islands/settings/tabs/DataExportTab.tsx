import React from 'react';
import { Download, Key } from 'lucide-react';
import type { ExtendedProfile } from '@/lib/profile';

interface DataExportTabProps {
  profile: ExtendedProfile;
  onNavigateTab: (tab: string) => void;
}

export const DataExportTab: React.FC<DataExportTabProps> = ({ profile, onNavigateTab }) => {
  const exportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `carcblog_data_${profile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
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
            onClick={() => onNavigateTab('ai')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', background: '#0F172A', color: '#fff', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}
          >
            <Key style={{ width: '14px', height: '14px' }} />
            Manage AI Writer Keys →
          </button>
        </div>
      </div>
    </div>
  );
};
