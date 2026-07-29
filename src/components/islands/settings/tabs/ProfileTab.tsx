import React from 'react';

interface ProfileTabProps {
  fullName: string;
  setFullName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  tagline: string;
  setTagline: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  jobTitle: string;
  setJobTitle: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  fullName,
  setFullName,
  username,
  setUsername,
  tagline,
  setTagline,
  bio,
  setBio,
  company,
  setCompany,
  jobTitle,
  setJobTitle,
  city,
  setCity,
  country,
  setCountry,
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px 0' }}>Profile Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tagline</label>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Founder & Tech Journalist @ TechVentures" />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Share your story and interests..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Country</label>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-hairline)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>
    </div>
  );
};
