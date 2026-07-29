import React from 'react';
import type { ExtendedProfile } from '@/lib/profile';

interface PrivacyTabProps {
  profile: ExtendedProfile;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ profile }) => {
  return (
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
          <p style={{ color: '#991b1b', fontSize: '13px', margin: '0 0 12px 0' }}>Account role: <strong>{profile.role}</strong>. Profile completion: <strong>{profile.profile_completion_pct}%</strong>.</p>
        </div>
      </div>
    </div>
  );
};
