import type { APIRoute } from 'astro';
import { searchService } from '@/features/search/SearchService';
import type { SearchEntityType } from '@/features/search/types';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const typeParam = url.searchParams.get('type') || '';
  const limitParam = parseInt(url.searchParams.get('limit') || '20', 10);
  const pageParam = parseInt(url.searchParams.get('page') || '1', 10);

  if (!query.trim()) {
    return new Response(JSON.stringify({ hits: [], totalHits: 0, provider: searchService.getActiveProviderName() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const entityTypes: SearchEntityType[] | undefined = typeParam && typeParam !== 'all'
    ? [typeParam as SearchEntityType]
    : undefined;

  try {
    const searchResult = await searchService.search({
      query: searchService.expandQuerySynonyms(query),
      entityTypes,
      limit: limitParam,
      page: pageParam,
    });

    // Map hits for front-end consumption in Command Palette & instant search
    const results = searchResult.hits.map(hit => ({
      id: hit.id,
      title: hit.title,
      subtitle: hit.subtitle || hit.excerpt || '',
      type: hit.entityType,
      href: hit.href,
      image: hit.image || null,
      highlights: hit.highlights,
    }));

    return new Response(JSON.stringify({
      hits: results,
      totalHits: searchResult.totalHits,
      page: searchResult.page,
      totalPages: searchResult.totalPages,
      processingTimeMs: searchResult.processingTimeMs,
      provider: searchResult.provider,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Search API endpoint error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Search failed', hits: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
