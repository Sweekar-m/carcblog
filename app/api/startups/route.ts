import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock Startups Database for FEAT-018
export const MOCK_STARTUPS = [
  {
    id: 's1',
    slug: 'aura-health',
    name: 'Aura Health',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Aura Health builds real-time ambient AI biometric monitoring for clinical and home care settings.',
    one_liner: 'Real-time ambient AI biometric monitoring platform for preventive health.',
    website_url: 'https://aurahealth.example.com',
    industry: 'Healthcare AI',
    stage: 'Pre-Seed',
    funding_total: 1200000,
    employee_count: 8,
    location: 'San Francisco, CA',
    verified: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 's2',
    slug: 'devpulse',
    name: 'DevPulse',
    logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'DevPulse automatically instruments engineering workflows to measure code quality and deployment velocity.',
    one_liner: 'Autonomous observability & velocity intelligence for modern engineering teams.',
    website_url: 'https://devpulse.example.com',
    industry: 'Developer Tools',
    stage: 'Series A',
    funding_total: 8500000,
    employee_count: 24,
    location: 'New York, NY',
    verified: true,
    created_at: '2025-11-20T00:00:00Z',
  },
  {
    id: 's3',
    slug: 'nexus-robotics',
    name: 'Nexus Robotics',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Next-generation humanoid robotics controllers trained with spatial foundation models.',
    one_liner: 'Spatial AI robotics foundation models for industrial automation.',
    website_url: 'https://nexusrobotics.example.com',
    industry: 'Robotics & Hardware',
    stage: 'Seed',
    funding_total: 4200000,
    employee_count: 15,
    location: 'Austin, TX',
    verified: true,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 's4',
    slug: 'cybermesh',
    name: 'CyberMesh',
    logo_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Zero-trust microsegmentation network security for serverless cloud applications.',
    one_liner: 'Instant zero-trust cloud security & automated threat isolation.',
    website_url: 'https://cybermesh.example.com',
    industry: 'Cybersecurity',
    stage: 'Series B',
    funding_total: 18000000,
    employee_count: 45,
    location: 'Boston, MA',
    verified: false,
    created_at: '2025-08-10T00:00:00Z',
  },
  {
    id: 's5',
    slug: 'quantflow',
    name: 'QuantFlow',
    logo_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Decentralized liquidity routing and institutional quantitative trading rails for digital assets.',
    one_liner: 'Institutional quantitative liquidity engine and smart routing protocol.',
    website_url: 'https://quantflow.example.com',
    industry: 'FinTech & Web3',
    stage: 'Seed',
    funding_total: 3500000,
    employee_count: 12,
    location: 'London, UK',
    verified: true,
    created_at: '2026-03-12T00:00:00Z',
  },
  {
    id: 's6',
    slug: 'solargrid-ai',
    name: 'SolarGrid AI',
    logo_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Predictive energy grid balancing and smart microgrid battery management.',
    one_liner: 'AI microgrid optimization software for clean energy transition.',
    website_url: 'https://solargrid.example.com',
    industry: 'CleanTech',
    stage: 'Pre-Seed',
    funding_total: 800000,
    employee_count: 6,
    location: 'Berlin, Germany',
    verified: false,
    created_at: '2026-04-05T00:00:00Z',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // If Supabase is connected, query database
    if (supabase) {
      let query = supabase.from('startups').select('*', { count: 'exact' });

      if (stage && stage !== 'all') query = query.eq('stage', stage);
      if (industry && industry !== 'all') query = query.eq('industry', industry);
      if (location && location !== 'all') query = query.ilike('location', `%${location}%`);
      if (search) query = query.textSearch('fts_vector', search);

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (!error && data) {
        return NextResponse.json({
          startups: data,
          total: count || data.length,
          page,
          totalPages: Math.ceil((count || data.length) / limit),
        });
      }
    }

    // Fallback Mock Filtering
    let results = [...MOCK_STARTUPS];

    if (stage && stage !== 'all') {
      results = results.filter((s) => s.stage.toLowerCase() === stage.toLowerCase());
    }
    if (industry && industry !== 'all') {
      results = results.filter((s) => s.industry.toLowerCase().includes(industry.toLowerCase()));
    }
    if (location && location !== 'all') {
      results = results.filter((s) => s.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.one_liner.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q)
      );
    }

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      startups: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching startups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
