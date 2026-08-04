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
  const inputClass = "w-full h-11 px-4 rounded-lg border border-hairline bg-white text-ink text-sm font-sans placeholder:text-steel focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all box-border";
  const labelClass = "block text-xs sm:text-sm font-semibold text-ink mb-1.5 font-sans";

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-5">
        <label className={labelClass}>Tagline</label>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} placeholder="e.g. Founder & Tech Journalist @ TechVentures" />
      </div>

      <div className="mb-5">
        <label className={labelClass}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-3.5 rounded-lg border border-hairline bg-white text-ink text-sm font-sans placeholder:text-steel focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all box-border" placeholder="Share your story and interests..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className={labelClass}>Company</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Job Title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
        </div>
      </div>
    </div>
  );
};
