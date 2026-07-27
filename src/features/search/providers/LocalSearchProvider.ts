import type {
  SearchProviderInterface,
  SearchQueryOptions,
  SearchResult,
  SearchHit,
  SearchEntityType
} from '../types';
import { supabase } from '@/lib/supabase';
import { sanityClient } from '@/lib/sanity';

export class LocalSearchProvider implements SearchProviderInterface {
  readonly providerName = 'local' as const;

  isConfigured(): boolean {
    return true; // Always available as local fallback
  }

  async search(options: SearchQueryOptions): Promise<SearchResult> {
    const startTime = Date.now();
    const { query, entityTypes, limit = 20, page = 1, facetFilters } = options;
    const q = query ? query.trim() : '';
    const term = `%${q}%`;

    const targetEntities: SearchEntityType[] = entityTypes && entityTypes.length > 0
      ? entityTypes
      : ['article', 'startup', 'founder', 'investor'];

    const allHits: SearchHit[] = [];

    // 1. Articles Search (Sanity)
    if (targetEntities.includes('article')) {
      try {
        let groq = `*[_type == "article" && defined(slug.current)`;
        if (q) {
          groq += ` && (title match "*${q}*" || excerpt match "*${q}*" || pt::text(body) match "*${q}*")`;
        }
        groq += `] | order(publishedAt desc)[0...${limit}] {
          _id,
          title,
          excerpt,
          "slug": slug.current,
          "category": category->name,
          "author": author->name,
          "mainImage": mainImage.asset->url
        }`;

        const articles = await sanityClient.fetch(groq);
        (articles || []).forEach((art: any) => {
          allHits.push({
            id: `article-${art._id}`,
            entityType: 'article',
            title: art.title,
            subtitle: [art.author, art.category].filter(Boolean).join(' • ') || 'Article',
            excerpt: art.excerpt || '',
            href: `/feed/${art.slug}`,
            image: art.mainImage || null,
            facets: {
              category: art.category,
            },
          });
        });
      } catch (err) {
        console.warn('LocalSearchProvider Sanity search warning:', err);
      }
    }

    // 2. Startups Search (Supabase)
    if (targetEntities.includes('startup') && supabase) {
      try {
        let stQuery = supabase.from('startups').select('id, name, slug, description, industry, funding_stage, city, country, logo_url');
        if (q) {
          stQuery = stQuery.or(`name.ilike.${term},description.ilike.${term},industry.ilike.${term},city.ilike.${term},country.ilike.${term}`);
        }
        if (facetFilters?.industry) {
          const indVal = Array.isArray(facetFilters.industry) ? facetFilters.industry[0] : facetFilters.industry;
          stQuery = stQuery.eq('industry', indVal);
        }
        const { data: startups } = await stQuery.limit(limit);
        (startups || []).forEach(s => {
          allHits.push({
            id: `startup-${s.id}`,
            entityType: 'startup',
            title: s.name,
            subtitle: [s.industry, [s.city, s.country].filter(Boolean).join(', ')].filter(Boolean).join(' • ') || 'Startup Profile',
            excerpt: s.description || '',
            href: `/startups/${s.slug}`,
            image: s.logo_url,
            facets: {
              industry: s.industry,
              stage: s.funding_stage,
              city: s.city,
              country: s.country,
            },
          });
        });
      } catch (err) {
        console.warn('LocalSearchProvider Startups search warning:', err);
      }
    }

    // 3. Founders Search (Supabase)
    if (targetEntities.includes('founder') && supabase) {
      try {
        let fQuery = supabase.from('founders').select('id, name, slug, job_title, bio, city, country, avatar_url');
        if (q) {
          fQuery = fQuery.or(`name.ilike.${term},job_title.ilike.${term},bio.ilike.${term},city.ilike.${term}`);
        }
        const { data: founders } = await fQuery.limit(limit);
        (founders || []).forEach(f => {
          allHits.push({
            id: `founder-${f.id}`,
            entityType: 'founder',
            title: f.name,
            subtitle: [f.job_title || 'Founder', [f.city, f.country].filter(Boolean).join(', ')].filter(Boolean).join(' • '),
            excerpt: f.bio || '',
            href: `/founders/${f.slug}`,
            image: f.avatar_url,
            facets: {
              city: f.city,
              country: f.country,
            },
          });
        });
      } catch (err) {
        console.warn('LocalSearchProvider Founders search warning:', err);
      }
    }

    // 4. Investors Search (Supabase)
    if (targetEntities.includes('investor') && supabase) {
      try {
        let invQuery = supabase.from('investors').select('id, name, slug, investor_type, thesis, value_add, first_check, target_geography');
        if (q) {
          invQuery = invQuery.or(`name.ilike.${term},investor_type.ilike.${term},thesis.ilike.${term},value_add.ilike.${term}`);
        }
        if (facetFilters?.type) {
          const typeVal = Array.isArray(facetFilters.type) ? facetFilters.type[0] : facetFilters.type;
          invQuery = invQuery.eq('investor_type', typeVal);
        }
        const { data: investors } = await invQuery.limit(limit);
        (investors || []).forEach(inv => {
          allHits.push({
            id: `investor-${inv.id}`,
            entityType: 'investor',
            title: inv.name,
            subtitle: [inv.investor_type || 'Investor', inv.first_check].filter(Boolean).join(' • '),
            excerpt: inv.thesis || inv.value_add || '',
            href: `/investors/${inv.slug}`,
            image: null,
            facets: {
              type: inv.investor_type,
            },
          });
        });
      } catch (err) {
        console.warn('LocalSearchProvider Investors search warning:', err);
      }
    }

    const totalHits = allHits.length;
    const paginatedHits = allHits.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(totalHits / Math.max(1, limit));

    return {
      hits: paginatedHits,
      totalHits,
      page,
      totalPages,
      processingTimeMs: Date.now() - startTime,
      provider: 'local',
    };
  }
}
