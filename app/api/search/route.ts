import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock data fallback if Supabase env vars are not set during local dev
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Call Supabase global_search RPC function if available
    if (supabase) {
      const { data, error } = await supabase.rpc('global_search', {
        query_text: query,
      });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    }

    // Fallback mock filtering
    const q = query.toLowerCase();
    const filtered = MOCK_SEARCH_RESULTS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('Error in search API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
