import React from 'react';
import type { ExtendedProfile } from '@/lib/profile';

interface PrivacyTabProps {
  profile: ExtendedProfile;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ profile }) => {
  return (
    <div>
      <p className="text-steel text-sm mb-6 font-sans">Manage security settings, authentication options, and data privacy.</p>

      <div className="flex flex-col gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-hairline bg-surface">
          <div className="font-bold text-sm text-ink mb-1 font-sans">Authentication Session</div>
          <p className="text-steel text-xs sm:text-sm margin-0 leading-relaxed font-sans">
            Your session is secured with Clerk authentication. You can manage password resets or connected social logins on your Clerk security portal.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-red-200 bg-red-50">
          <div className="font-bold text-sm text-red-700 mb-1 font-sans">Account Status</div>
          <p className="text-red-900 text-xs sm:text-sm margin-0 leading-relaxed font-sans">
            Account role: <strong>{profile.role}</strong>. Profile completion: <strong>{profile.profile_completion_pct}%</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
