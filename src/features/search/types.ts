/**
 * Search Infrastructure Types & Interfaces for CarcBlog.
 * Provider-agnostic abstraction supporting Algolia, Meilisearch, and Local Fallback.
 */

export type SearchEntityType = 'article' | 'startup' | 'founder' | 'investor' | 'writer';

export interface SearchFacetFilter {
  field: string;
  values: string[];
}

export interface SearchQueryOptions {
  query: string;
  entityTypes?: SearchEntityType[];
  facetFilters?: Record<string, string | string[]>;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface SearchHit {
  id: string;
  entityType: SearchEntityType;
  title: string;
  subtitle?: string;
  excerpt?: string;
  href: string;
  image?: string | null;
  score?: number;
  facets?: {
    industry?: string | null;
    stage?: string | null;
    type?: string | null;
    country?: string | null;
    city?: string | null;
    readTime?: number | null;
    category?: string | null;
  };
  highlights?: {
    title?: string;
    excerpt?: string;
    subtitle?: string;
  };
  raw?: Record<string, any>;
}

export interface SearchResult {
  hits: SearchHit[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
  provider: 'algolia' | 'meilisearch' | 'local';
  facetCounts?: Record<string, Record<string, number>>;
}

export interface SearchIndexRecord {
  objectID: string;
  entityType: SearchEntityType;
  title: string;
  subtitle?: string;
  excerpt?: string;
  href: string;
  image?: string | null;
  industry?: string | null;
  stage?: string | null;
  investor_type?: string | null;
  country?: string | null;
  city?: string | null;
  category?: string | null;
  tags?: string[];
  thesis?: string | null;
  bio?: string | null;
  updated_at?: string;
}

export interface SearchProviderInterface {
  readonly providerName: 'algolia' | 'meilisearch' | 'local';
  isConfigured(): boolean;
  search(options: SearchQueryOptions): Promise<SearchResult>;
  indexBatch?(entityType: SearchEntityType, records: SearchIndexRecord[]): Promise<void>;
}
