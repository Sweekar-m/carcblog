import { useState, useCallback } from 'react';
import { UserRole, type UserRoleType } from '@/types/roles';
import { DEFAULT_COVER_URL } from '../constants';
import type { OnboardingUserProps, SocialLinkInput } from '../types';

export function useOnboarding(initialUser: OnboardingUserProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Profile & Role (Default to WRITER for all users)
  const [role, setRole] = useState<UserRoleType>(UserRole.WRITER);
  const [fullName, setFullName] = useState(initialUser.full_name || '');
  const [username, setUsername] = useState(initialUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER_URL);
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('San Francisco');
  const [timezone, setTimezone] = useState('UTC');
  const [preferredLang, setPreferredLang] = useState('en');

  // Step 2: Professional Info
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [yearsExp, setYearsExp] = useState(3);
  const [industry, setIndustry] = useState('Technology');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, AI, Node.js');

  // Step 3: Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([
    { platform: 'x', url: 'https://x.com/' },
    { platform: 'github', url: 'https://github.com/' },
  ]);

  // Step 4: Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Startup', 'AI & Machine Learning']);

  // Step 5: Followed Creators
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Step 6: Notifications
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    likes: true,
    comments: true,
    followers: true,
    mentions: true,
    articles: true,
    digest: true,
  });

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const addSocialLink = useCallback(() => {
    setSocialLinks((prev) => [...prev, { platform: 'linkedin', url: '' }]);
  }, []);

  const removeSocialLink = useCallback((idx: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateSocialLink = useCallback((idx: number, field: 'platform' | 'url', val: string) => {
    setSocialLinks((prev) => {
      const copy = [...prev];
      copy[idx][field] = val;
      return copy;
    });
  }, []);

  const calculateCompletionScore = useCallback(() => {
    let score = 30;
    if (fullName) score += 10;
    if (avatarUrl) score += 10;
    if (bio) score += 10;
    if (jobTitle || company) score += 10;
    if (socialLinks.length > 0) score += 10;
    if (selectedTopics.length > 0) score += 10;
    if (country || city) score += 10;
    return Math.min(100, score);
  }, [fullName, avatarUrl, bio, jobTitle, company, socialLinks, selectedTopics, country, city]);

  const handleNextStep = useCallback(() => {
    if (step === 1 && !fullName.trim()) {
      alert('Please enter your Full Name to continue.');
      return;
    }
    setStep((prev) => Math.min(3, prev + 1));
  }, [step, fullName]);

  const handlePrevStep = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const handleSubmitAll = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        role,
        full_name: fullName.trim() || 'Creator',
        username: username.trim(),
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        bio,
        tagline,
        country,
        city,
        timezone,
        preferred_language: preferredLang,
        company,
        job_title: jobTitle,
        years_experience: yearsExp,
        industry,
        skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
        social_links: socialLinks.filter((s) => s.url.trim().length > 0),
        writing_topics: selectedTopics,
        notification_prefs: notifPrefs,
      };

      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.profile)) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect_url') || '/dashboard/profile';
        window.location.href = redirectUrl;
      } else {
        alert(data.error || 'Failed to save profile. Please try again.');
      }
    } catch (e: any) {
      console.error('Onboarding submission error:', e);
      alert('An error occurred during onboarding: ' + (e?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    role,
    fullName,
    username,
    avatarUrl,
    coverUrl,
    bio,
    tagline,
    country,
    city,
    timezone,
    preferredLang,
    company,
    jobTitle,
    yearsExp,
    industry,
    skillsInput,
    socialLinks,
    selectedTopics,
    notifPrefs,
  ]);

  return {
    step,
    setStep,
    loading,
    role,
    setRole,
    fullName,
    setFullName,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    coverUrl,
    setCoverUrl,
    bio,
    setBio,
    tagline,
    setTagline,
    country,
    setCountry,
    city,
    setCity,
    company,
    setCompany,
    jobTitle,
    setJobTitle,
    yearsExp,
    setYearsExp,
    industry,
    setIndustry,
    skillsInput,
    setSkillsInput,
    socialLinks,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    selectedTopics,
    toggleTopic,
    followedIds,
    toggleFollow,
    notifPrefs,
    setNotifPrefs,
    calculateCompletionScore,
    handleNextStep,
    handlePrevStep,
    handleSubmitAll,
  };
}
