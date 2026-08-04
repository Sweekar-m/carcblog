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
      <p className="text-steel text-sm mb-6 font-sans">Download a complete JSON snapshot of your profile, social links, and activity data.</p>
      
      <div className="flex flex-col gap-4 items-start w-full">
        <button
          onClick={exportData}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-hairline bg-white text-ink font-semibold text-sm hover:bg-surface transition-all cursor-pointer min-h-[44px] shadow-xs w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Export Profile Data (.json)
        </button>

        <div className="p-4 sm:p-5 rounded-xl border border-hairline bg-surface w-full box-border">
          <div className="font-bold text-sm text-ink mb-1 font-sans">Looking for AI Key configuration?</div>
          <p className="text-steel text-xs sm:text-sm mb-3 leading-relaxed font-sans">Configure your Google Gemini or OpenRouter key for AI assistant features in the editor.</p>
          <button
            onClick={() => onNavigateTab('ai')}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all cursor-pointer border-0 w-full sm:w-auto"
          >
            <Key className="w-3.5 h-3.5" />
            Manage AI Writer Keys →
          </button>
        </div>
      </div>
    </div>
  );
};
