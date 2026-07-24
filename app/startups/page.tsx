'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Users,
  DollarSign,
  MapPin,
  CheckCircle2,
  Plus,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Navbar from '@/components/navigation/navbar';
import SearchModal from '@/components/search/search-modal';

export interface StartupItem {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  description: string;
  one_liner: string;
  website_url: string;
  industry: string;
  stage: string;
  funding_total: number;
  employee_count: number;
  location: string;
  verified: boolean;
}

const STAGES = ['all', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth'];
const INDUSTRIES = ['all', 'Healthcare AI', 'Developer Tools', 'Robotics & Hardware', 'Cybersecurity', 'FinTech & Web3', 'CleanTech'];
const LOCATIONS = ['all', 'San Francisco', 'New York', 'Austin', 'Boston', 'London', 'Berlin'];

export default function StartupDirectoryPage() {
  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedStage !== 'all') params.append('stage', selectedStage);
        if (selectedIndustry !== 'all') params.append('industry', selectedIndustry);
        if (selectedLocation !== 'all') params.append('location', selectedLocation);
        if (searchQuery.trim()) params.append('search', searchQuery);

        const res = await fetch(`/api/startups?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStartups(data.startups || []);
        }
      } catch (err) {
        console.error('Failed to load startups:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStartups, 200);
    return () => clearTimeout(timer);
  }, [selectedStage, selectedIndustry, selectedLocation, searchQuery]);

  const formatFunding = (amount: number) => {
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased">
      {/* Sticky Translucent Top Navigation */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Hero Section (design.md hero-band-marketing spec) */}
      <section className="border-b border-hairline bg-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-coral px-3.5 py-1 text-xs font-bold text-on-dark shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>FEAT-018 • Startup Directory</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-strong leading-[1.10] text-balance">
                Discover High-Growth Tech Startups
              </h1>
              <p className="text-lg font-medium text-steel leading-relaxed">
                Explore verified technology ventures, early-stage deals, founder profiles, and funding benchmarks powering the startup ecosystem.
              </p>
            </div>

            {/* CTA Button (design.md button-primary spec: black pill) */}
            <a
              href="/startups/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-active transition-colors shadow-xs shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Startup</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content & Filter Bar */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Filter Toolbar (design.md card-base flat container) */}
        <div className="mb-8 rounded-xl border border-hairline bg-canvas p-4 shadow-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Search Input (design.md text-input spec) */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, pitch, category..."
                className="w-full rounded-md border border-hairline bg-canvas py-2 pl-9 pr-4 text-xs font-medium text-ink placeholder-steel focus:border-brand-blue-deep focus:outline-none h-10"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-steel" />
            </div>

            {/* Stage Dropdown */}
            <div>
              <label className="sr-only">Funding Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full rounded-md border border-hairline bg-canvas py-2 px-3 text-xs font-medium text-ink focus:border-brand-blue-deep focus:outline-none h-10"
              >
                <option value="all">All Stages</option>
                {STAGES.filter((s) => s !== 'all').map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            {/* Industry Dropdown */}
            <div>
              <label className="sr-only">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full rounded-md border border-hairline bg-canvas py-2 px-3 text-xs font-medium text-ink focus:border-brand-blue-deep focus:outline-none h-10"
              >
                <option value="all">All Industries</option>
                {INDUSTRIES.filter((i) => i !== 'all').map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="sr-only">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-md border border-hairline bg-canvas py-2 px-3 text-xs font-medium text-ink focus:border-brand-blue-deep focus:outline-none h-10"
              >
                <option value="all">All Locations</option>
                {LOCATIONS.filter((l) => l !== 'all').map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Startup Card Grid (design.md card-base spec: rounded-xl, 1px border) */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 animate-pulse rounded-xl border border-hairline bg-canvas p-6"
              />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="rounded-xl border border-hairline bg-canvas py-16 text-center">
            <Building2 className="mx-auto h-10 w-10 text-stone mb-3" />
            <h3 className="text-base font-semibold text-ink">No Startups Found</h3>
            <p className="mt-1 text-xs text-steel">
              Try adjusting your search query or category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((company) => (
              <div
                key={company.id}
                className="group flex flex-col justify-between rounded-xl border border-hairline bg-canvas p-6 transition-all duration-200 hover:border-hairline-strong hover:shadow-xs"
              >
                <div>
                  {/* Card Header: Logo, Name & Badges */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="h-12 w-12 rounded-lg object-cover border border-hairline shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-base font-bold text-ink group-hover:text-primary transition-colors">
                            {company.name}
                          </h2>
                          {company.verified && (
                            <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success-text">
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-steel">
                          {company.industry}
                        </span>
                      </div>
                    </div>
                    {/* Stage Badge (design.md badge-beta spec) */}
                    <span className="rounded-full bg-brand-blue-200 px-2.5 py-1 text-[11px] font-bold text-brand-blue-deep shrink-0">
                      {company.stage}
                    </span>
                  </div>

                  {/* One-liner Pitch */}
                  <p className="text-xs text-charcoal line-clamp-3 leading-relaxed mb-4">
                    {company.one_liner}
                  </p>
                </div>

                {/* Card Footer Metrics */}
                <div className="border-t border-hairline pt-4">
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="flex items-center gap-1.5 text-steel">
                      <DollarSign className="h-3.5 w-3.5 text-stone" />
                      <span>{formatFunding(company.funding_total)} Raised</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-steel">
                      <Users className="h-3.5 w-3.5 text-stone" />
                      <span>{company.employee_count} Employees</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 text-steel">
                      <MapPin className="h-3.5 w-3.5 text-stone" />
                      <span>{company.location}</span>
                    </div>
                  </div>

                  {/* Button (design.md button-tertiary spec: outline pill) */}
                  <a
                    href={`/startups/${company.slug}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-hairline bg-canvas py-2 text-xs font-semibold text-ink hover:bg-surface transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
