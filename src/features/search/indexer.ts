import type { SearchIndexRecord, SearchEntityType } from './types';
import { supabase } from '@/lib/supabase';
import { sanityClient } from '@/lib/sanity';
import { AlgoliaProvider } from './providers/AlgoliaProvider';
import { MeilisearchProvider } from './providers/MeilisearchProvider';

export async function fetchArticlesForIndex(): Promise<SearchIndexRecord[]> {
  const groq = `*[_type == "article" && defined(slug.current)] {
    _id,
    title,
    excerpt,
    "slug": slug.current,
    "category": category->name,
    "author": author->name,
    "tags": tags[]->name,
    "image": mainImage.asset->url,
    _updatedAt
  }`;

  try {
    const articles = await sanityClient.fetch(groq);
    return (articles || []).map((a: any) => ({
      objectID: `article-${a._id}`,
      entityType: 'article' as SearchEntityType,
      title: a.title,
      subtitle: [a.author, a.category].filter(Boolean).join(' • '),
      excerpt: a.excerpt || '',
      href: `/feed/${a.slug}`,
      image: a.image || null,
      category: a.category || null,
      tags: Array.isArray(a.tags) ? a.tags : [],
      updated_at: a._updatedAt,
    }));
  } catch (err) {
    console.error('Failed to fetch articles for indexing:', err);
    return [];
  }
}

export async function fetchStartupsForIndex(): Promise<SearchIndexRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('startups')
    .select('id, name, slug, description, industry, funding_stage, city, country, logo_url, updated_at');

  if (error) {
    console.error('Failed to fetch startups for indexing:', error);
    return [];
  }

  return (data || []).map(s => ({
    objectID: `startup-${s.id}`,
    entityType: 'startup' as SearchEntityType,
    title: s.name,
    subtitle: [s.industry, [s.city, s.country].filter(Boolean).join(', ')].filter(Boolean).join(' • '),
    excerpt: s.description || '',
    href: `/startups/${s.slug}`,
    image: s.logo_url || null,
    industry: s.industry || null,
    stage: s.funding_stage || null,
    city: s.city || null,
    country: s.country || null,
    updated_at: s.updated_at,
  }));
}

export async function fetchFoundersForIndex(): Promise<SearchIndexRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('founders')
    .select('id, name, slug, job_title, bio, city, country, avatar_url, updated_at');

  if (error) {
    console.error('Failed to fetch founders for indexing:', error);
    return [];
  }

  return (data || []).map(f => ({
    objectID: `founder-${f.id}`,
    entityType: 'founder' as SearchEntityType,
    title: f.name,
    subtitle: [f.job_title || 'Founder', [f.city, f.country].filter(Boolean).join(', ')].filter(Boolean).join(' • '),
    excerpt: f.bio || '',
    href: `/founders/${f.slug}`,
    image: f.avatar_url || null,
    bio: f.bio || null,
    city: f.city || null,
    country: f.country || null,
    updated_at: f.updated_at,
  }));
}

export async function fetchInvestorsForIndex(): Promise<SearchIndexRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('investors')
    .select('id, name, slug, investor_type, thesis, value_add, first_check, updated_at');

  if (error) {
    console.error('Failed to fetch investors for indexing:', error);
    return [];
  }

  return (data || []).map(inv => ({
    objectID: `investor-${inv.id}`,
    entityType: 'investor' as SearchEntityType,
    title: inv.name,
    subtitle: [inv.investor_type || 'Investor', inv.first_check].filter(Boolean).join(' • '),
    excerpt: inv.thesis || inv.value_add || '',
    href: `/investors/${inv.slug}`,
    image: null,
    investor_type: inv.investor_type || null,
    thesis: inv.thesis || null,
    updated_at: inv.updated_at,
  }));
}

export async function runFullSearchIndexing(targetProvider?: 'algolia' | 'meilisearch'): Promise<void> {
  const providerType = targetProvider || (process.env.SEARCH_PROVIDER as any) || 'local';
  console.log(`Starting full search reindex for target provider: ${providerType}...`);

  const [articles, startups, founders, investors] = await Promise.all([
    fetchArticlesForIndex(),
    fetchStartupsForIndex(),
    fetchFoundersForIndex(),
    fetchInvestorsForIndex(),
  ]);

  console.log(`Extracted records for indexing:
    - Articles: ${articles.length}
    - Startups: ${startups.length}
    - Founders: ${founders.length}
    - Investors: ${investors.length}`);

  if (providerType === 'algolia') {
    const algolia = new AlgoliaProvider();
    if (articles.length > 0) await algolia.indexBatch('article', articles);
    if (startups.length > 0) await algolia.indexBatch('startup', startups);
    if (founders.length > 0) await algolia.indexBatch('founder', founders);
    if (investors.length > 0) await algolia.indexBatch('investor', investors);
    console.log('Successfully updated Algolia search indexes!');
  } else if (providerType === 'meilisearch') {
    const meili = new MeilisearchProvider();
    if (articles.length > 0) await meili.indexBatch('article', articles);
    if (startups.length > 0) await meili.indexBatch('startup', startups);
    if (founders.length > 0) await meili.indexBatch('founder', founders);
    if (investors.length > 0) await meili.indexBatch('investor', investors);
    console.log('Successfully updated Meilisearch search indexes!');
  } else {
    console.log('Provider is set to local. Records are ready and searchable directly via Supabase/Sanity!');
  }
}
