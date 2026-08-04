import React from 'react';

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

/* ── Shared primitive classes ─────────────────────────────────────────────── */
const input =
  'w-full h-11 px-3.5 rounded-lg border border-hairline bg-white text-ink ' +
  'text-body-sm font-sans placeholder:text-stone focus:outline-none ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all box-border';

const label = 'block text-body-sm font-semibold text-ink mb-1.5';
const hint  = 'text-caption text-steel mt-1 leading-snug';

/* ── Field helper ─────────────────────────────────────────────────────────── */
function Field({
  id,
  labelText,
  hintText,
  children,
}: {
  id: string;
  labelText: string;
  hintText?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={label}>{labelText}</label>
      {children}
      {hintText && <p className={hint}>{hintText}</p>}
    </div>
  );
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  fullName, setFullName,
  username, setUsername,
  tagline,  setTagline,
  bio,      setBio,
  company,  setCompany,
  jobTitle, setJobTitle,
  city,     setCity,
  country,  setCountry,
  website,  setWebsite,
}) => (
  <div className="flex flex-col gap-6">

    {/* Row 1 — Full Name + Username */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field id="fullName" labelText="Full Name">
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className={input}
          placeholder="Your full name"
          autoComplete="name"
        />
      </Field>

      <Field
        id="username"
        labelText="Username"
        hintText={`carcblog.com/u/${username || 'username'}`}
      >
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className={input}
          placeholder="username"
          autoComplete="username"
        />
      </Field>
    </div>

    {/* Row 2 — Tagline */}
    <Field
      id="tagline"
      labelText="Tagline"
      hintText="Shown below your name on your public profile."
    >
      <input
        id="tagline"
        type="text"
        value={tagline}
        onChange={e => setTagline(e.target.value)}
        className={input}
        placeholder="e.g. Founder & Tech Journalist @ TechVentures"
      />
    </Field>

    {/* Row 3 — Bio */}
    <Field id="bio" labelText="Bio">
      <textarea
        id="bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={4}
        className={
          'w-full min-h-[100px] px-3.5 py-3 rounded-lg border border-hairline bg-white ' +
          'text-ink text-body-sm font-sans placeholder:text-stone focus:outline-none ' +
          'focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y box-border'
        }
        placeholder="Tell readers about yourself, your expertise, and what you cover…"
      />
    </Field>

    {/* Row 4 — Company + Job Title */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field id="company" labelText="Company">
        <input
          id="company"
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          className={input}
          placeholder="e.g. Acme Inc."
          autoComplete="organization"
        />
      </Field>

      <Field id="jobTitle" labelText="Job Title">
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          className={input}
          placeholder="e.g. Founder, CEO"
          autoComplete="organization-title"
        />
      </Field>
    </div>

    {/* Row 5 — City + Country */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field id="city" labelText="City">
        <input
          id="city"
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          className={input}
          placeholder="e.g. Bangalore"
          autoComplete="address-level2"
        />
      </Field>

      <Field id="country" labelText="Country">
        <input
          id="country"
          type="text"
          value={country}
          onChange={e => setCountry(e.target.value)}
          className={input}
          placeholder="e.g. India"
          autoComplete="country-name"
        />
      </Field>
    </div>

    {/* Row 6 — Website */}
    <Field
      id="website"
      labelText="Website"
      hintText="Must start with https://"
    >
      <input
        id="website"
        type="url"
        value={website}
        onChange={e => setWebsite(e.target.value)}
        className={input}
        placeholder="https://yoursite.com"
        autoComplete="url"
      />
    </Field>

  </div>
);
