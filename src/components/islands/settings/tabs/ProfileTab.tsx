import React from 'react';
import { Field, inputStyle, textareaStyle, labelStyle } from '../SettingsManager';

// All inline styles — see SettingsManager.tsx for why we avoid Tailwind tokens here.
const T = {
  ink:      '#0f172a',
  steel:    '#64748b',
  stone:    '#94a3b8',
  hairline: '#e2e8f0',
  canvas:   '#ffffff',
  primary:  '#0f172a',
  fontSans: "'DM Sans', Inter, system-ui, sans-serif",
  fsSm:     '0.875rem',
  fsXs:     '0.8125rem',
};

interface ProfileTabProps {
  fullName:   string; setFullName:  (v: string) => void;
  username:   string; setUsername:  (v: string) => void;
  tagline:    string; setTagline:   (v: string) => void;
  bio:        string; setBio:       (v: string) => void;
  company:    string; setCompany:   (v: string) => void;
  jobTitle:   string; setJobTitle:  (v: string) => void;
  city:       string; setCity:      (v: string) => void;
  country:    string; setCountry:   (v: string) => void;
  website:    string; setWebsite:   (v: string) => void;
}

// Focus handlers — JS-applied since CSS focus-visible requires the class to exist
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = T.primary;
  e.currentTarget.style.boxShadow   = `0 0 0 3px rgba(15,23,42,0.08)`;
};
const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = T.hairline;
  e.currentTarget.style.boxShadow   = 'none';
};

export const ProfileTab: React.FC<ProfileTabProps> = ({
  fullName, setFullName, username, setUsername,
  tagline, setTagline, bio, setBio,
  company, setCompany, jobTitle, setJobTitle,
  city, setCity, country, setCountry,
  website, setWebsite,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

    {/* Row 1 — Full Name + Username */}
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <Field id="fullName" labelText="Full Name">
        <input id="fullName" type="text" value={fullName}
          onChange={e => setFullName(e.target.value)} onFocus={onFocus} onBlur={onBlur}
          placeholder="Your full name" autoComplete="name"
          style={inputStyle} className="w-full block"
        />
      </Field>
      </div>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <Field id="username" labelText="Username" hintText={`carcblog.com/u/${username || 'username'}`}>
        <input id="username" type="text" value={username}
          onChange={e => setUsername(e.target.value)} onFocus={onFocus} onBlur={onBlur}
          placeholder="username" autoComplete="username"
          style={inputStyle} className="w-full block"
        />
      </Field>
      </div>
    </div>

    {/* Row 2 — Tagline */}
    <Field id="tagline" labelText="Tagline" hintText="Shown below your name on your public profile.">
      <input id="tagline" type="text" value={tagline}
        onChange={e => setTagline(e.target.value)} onFocus={onFocus} onBlur={onBlur}
        placeholder="e.g. Founder & Tech Journalist @ TechVentures"
        style={inputStyle} className="w-full block"
      />
    </Field>

    {/* Row 3 — Bio */}
    <div>
      <label htmlFor="bio" style={labelStyle}>Bio</label>
      <textarea id="bio" value={bio} rows={4}
        onChange={e => setBio(e.target.value)}
        onFocus={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(15,23,42,0.08)`; }}
        onBlur={e =>  { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.boxShadow = 'none'; }}
        placeholder="Tell readers about yourself, your expertise, and what you cover…"
        style={textareaStyle} className="w-full block"
      />
    </div>

    {/* Section divider */}
    <div style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: '4px' }}>
      <span style={{ display: 'block', fontFamily: T.fontSans, fontSize: T.fsSm, fontWeight: 600, color: T.ink, marginBottom: '16px' }}>
        Work & Location
      </span>
    </div>

    {/* Row 4 — Company + Job Title */}
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <Field id="company" labelText="Company">
        <input id="company" type="text" value={company}
          onChange={e => setCompany(e.target.value)} onFocus={onFocus} onBlur={onBlur}
          placeholder="e.g. Acme Inc." autoComplete="organization"
          style={inputStyle} className="w-full block"
        />
      </Field>
      </div>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <Field id="jobTitle" labelText="Job Title">
        <input id="jobTitle" type="text" value={jobTitle}
          onChange={e => setJobTitle(e.target.value)} onFocus={onFocus} onBlur={onBlur}
          placeholder="e.g. Founder, CEO" autoComplete="organization-title"
          style={inputStyle} className="w-full block"
        />
      </Field>
      </div>
    </div>

    {/* Row 5 — City + Country */}
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <Field id="city" labelText="City">
        <input id="city" type="text" value={city}
          onChange={e => setCity(e.target.value)} onFocus={onFocus} onBlur={onBlur}
          placeholder="e.g. Bangalore" autoComplete="address-level2"
          style={inputStyle} className="w-full block"
        />
      </Field>
      </div>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <Field id="country" labelText="Country">
        <input id="country" type="text" value={country}
          onChange={e => setCountry(e.target.value)} onFocus={onFocus} onBlur={onBlur}
          placeholder="e.g. India" autoComplete="country-name"
          style={inputStyle} className="w-full block"
        />
      </Field>
      </div>
    </div>

    {/* Row 6 — Website */}
    <Field id="website" labelText="Website" hintText="Must start with https://">
      <input id="website" type="url" value={website}
        onChange={e => setWebsite(e.target.value)} onFocus={onFocus} onBlur={onBlur}
        placeholder="https://yoursite.com" autoComplete="url"
        style={inputStyle} className="w-full block"
      />
    </Field>

  </div>
);
