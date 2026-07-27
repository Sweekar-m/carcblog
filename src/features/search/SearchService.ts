import type {
  SearchProviderInterface,
  SearchQueryOptions,
  SearchResult,
  SearchEntityType
} from './types';
import { AlgoliaProvider } from './providers/AlgoliaProvider';
import { MeilisearchProvider } from './providers/MeilisearchProvider';
import { LocalSearchProvider } from './providers/LocalSearchProvider';

/**
 * Synonyms expansion dictionary for search queries.
 * Expands technical or industry shorthand terms before execution.
 */
const SYNONYMS_MAP: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'llm', 'genai', 'deep tech'],
  saas: ['software', 'cloud', 'b2b', 'platform'],
  vc: ['venture capital', 'investor', 'fund', 'angel', 'syndicate'],
  founder: ['entrepreneur', 'ceo', 'co-founder', 'leader'],
  funding: ['investment', 'round', 'pre-seed', 'seed', 'series a'],
};

export class SearchService {
  private static instance: SearchService;
  private provider: SearchProviderInterface;

  private constructor() {
    const env = typeof process !== 'undefined' ? process.env : {};
    const metaEnv = (import.meta as any).env || {};
    const selectedProvider = (env.SEARCH_PROVIDER || metaEnv.SEARCH_PROVIDER || 'local').toLowerCase();

    if (selectedProvider === 'algolia') {
      const algolia = new AlgoliaProvider();
      this.provider = algolia.isConfigured() ? algolia : new LocalSearchProvider();
    } else if (selectedProvider === 'meilisearch') {
      const meili = new MeilisearchProvider();
      this.provider = meili.isConfigured() ? meili : new LocalSearchProvider();
    } else {
      this.provider = new LocalSearchProvider();
    }

    console.log(`[SearchService] Initialized active provider: ${this.provider.providerName}`);
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  public getActiveProviderName(): string {
    return this.provider.providerName;
  }

  /**
   * Expands query terms using the synonyms dictionary.
   */
  public expandQuerySynonyms(query: string): string {
    if (!query) return '';
    const words = query.trim().toLowerCase().split(/\s+/);
    const expandedTerms = new Set<string>();

    words.forEach(word => {
      expandedTerms.add(word);
      if (SYNONYMS_MAP[word]) {
        SYNONYMS_MAP[word].forEach(syn => expandedTerms.add(syn));
      }
    });

    return Array.from(expandedTerms).join(' ');
  }

  /**
   * Universal search execution.
   */
  public async search(options: SearchQueryOptions): Promise<SearchResult> {
    try {
      return await this.provider.search(options);
    } catch (err: any) {
      console.warn(`[SearchService] Provider ${this.provider.providerName} search failed: ${err.message}. Falling back to LocalSearchProvider...`);
      const fallback = new LocalSearchProvider();
      return await fallback.search(options);
    }
  }

  /**
   * Entity-specific query helper for directory searches (Startups, Founders, Investors).
   */
  public async searchEntity(entityType: SearchEntityType, query: string, limit = 24, page = 1, facetFilters?: Record<string, string | string[]>) {
    return this.search({
      query,
      entityTypes: [entityType],
      limit,
      page,
      facetFilters,
    });
  }
}

export const searchService = SearchService.getInstance();
