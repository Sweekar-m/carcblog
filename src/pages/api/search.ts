import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const MOCK_SEARCH_RESULTS = [
  {
    id: 's-1',
    title: 'Aura Health - AI Mental Wellness Platform',
    subtitle: 'Pre-Seed • Healthcare AI • San Francisco, CA',
    type: 'startup',
    href: '/startups/aura-health',
  },
  {
    id: 's-2',
    title: 'DevPulse - Realtime Developer Analytics',
    subtitle: 'Series A • Developer Tools • New York, NY',
    type: 'startup',
    href: '/startups/devpulse',
  },
  {
    id: 'a-1',
    title: 'The Future of Sovereign AI Infrastructure in 2026',
    subtitle: 'Deep-Dive Article by Alex Rivera • 8 min read',
    type: 'article',
    href: '/feed/sovereign-ai-2026',
  },
  {
    id: 'f-1',
    title: 'Sarah Chen - Founder & CEO @ Nexus Robotics',
    subtitle: 'Autonomous Systems • Ex-Tesla',
    type: 'founder',
    href: '/founders/sarah-chen',
  },
  {
    id: 'v-1',
    title: 'Apex Ventures - Early Stage DeepTech Fund',
    subtitle: 'VC Firm • AUM: $150M',
    type: 'investor',
    href: '/investors/apex-ventures',
  },
];

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  if (!query.trim()) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const results: any[] = [];

  if (supabase) {
    const term = `%${query.trim()}%`;

    // Query Startups
    const { data: startups } = await supabase
      .from('startups')
      .select('id, name, slug, description, industry, city, country')
      .or(`name.ilike.${term},description.ilike.${term},industry.ilike.${term}`)
      .limit(6);

    if (startups && startups.length > 0) {
      startups.forEach(s => {
        results.push({
          id: `startup-${s.id}`,
          title: s.name,
          subtitle: [s.industry, [s.city, s.country].filter(Boolean).join(', ')].filter(Boolean).join(' • ') || 'Startup Profile',
          type: 'startup',
          href: `/startups/${s.slug}`,
        });
      });
    }

    // Query Founders
    const { data: founders } = await supabase
      .from('founders')
      .select('id, name, slug, job_title, city, country')
      .or(`name.ilike.${term},job_title.ilike.${term}`)
      .limit(6);

    if (founders && founders.length > 0) {
      founders.forEach(f => {
        results.push({
          id: `founder-${f.id}`,
          title: f.name,
          subtitle: [f.job_title || 'Founder', [f.city, f.country].filter(Boolean).join(', ')].filter(Boolean).join(' • '),
          type: 'founder',
          href: `/founders/${f.slug}`,
        });
      });
    }

    // Query Investors
    const { data: investors } = await supabase
      .from('investors')
      .select('id, name, slug, investor_type, first_check')
      .or(`name.ilike.${term},investor_type.ilike.${term},thesis.ilike.${term}`)
      .limit(6);

    if (investors && investors.length > 0) {
      investors.forEach(inv => {
        results.push({
          id: `investor-${inv.id}`,
          title: inv.name,
          subtitle: [inv.investor_type || 'Investor', inv.first_check].filter(Boolean).join(' • '),
          type: 'investor',
          href: `/investors/${inv.slug}`,
        });
      });
    }

    if (results.length > 0) {
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const q = query.toLowerCase();
  const filtered = MOCK_SEARCH_RESULTS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
  );

  return new Response(JSON.stringify(filtered), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

