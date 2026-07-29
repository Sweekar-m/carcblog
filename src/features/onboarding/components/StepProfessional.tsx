import React from 'react';
import { Briefcase } from 'lucide-react';

interface StepProfessionalProps {
  jobTitle: string;
  setJobTitle: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  yearsExp: number;
  setYearsExp: (val: number) => void;
  skillsInput: string;
  setSkillsInput: (val: string) => void;
}

export const StepProfessional: React.FC<StepProfessionalProps> = ({
  jobTitle,
  setJobTitle,
  company,
  setCompany,
  industry,
  setIndustry,
  yearsExp,
  setYearsExp,
  skillsInput,
  setSkillsInput,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Briefcase style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Step 2: Professional & Career Info</h2>
      </div>
      <p style={{ color: 'var(--color-steel)', margin: '0 0 24px 0', fontSize: '0.9375rem' }}>
        Add details about your current role, industry, and skills.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Company / Organization</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Tech"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
              background: '#ffffff',
            }}
          >
            <option value="Technology">Technology & Software</option>
            <option value="AI & Robotics">AI & Robotics</option>
            <option value="Finance & FinTech">Finance & FinTech</option>
            <option value="Healthcare">Healthcare & BioTech</option>
            <option value="E-commerce">E-commerce & Retail</option>
            <option value="Venture Capital">Venture Capital & Investment</option>
            <option value="Media & Publishing">Media & Publishing</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Years of Experience</label>
          <input
            type="number"
            min={0}
            max={50}
            value={yearsExp}
            onChange={(e) => setYearsExp(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-hairline, #E2E8F0)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
          Key Skills (Comma-separated)
        </label>
        <input
          type="text"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder="e.g. React, TypeScript, Product Strategy, AI Agents"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-hairline, #E2E8F0)',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
};
