import type {
  SearchProviderInterface,
  SearchQueryOptions,
  SearchResult,
  SearchHit,
  SearchEntityType,
  SearchIndexRecord
} from '../types';

export class AlgoliaProvider implements SearchProviderInterface {
  readonly providerName = 'algolia' as const;

  private appId: string;
  private searchKey: string;
  private adminApiKey: string;
  private indexPrefix: string;

  constructor() {
    const env = typeof process !== 'undefined' ? process.env : {};
    const metaEnv = (import.meta as any).env || {};

    this.appId = env.ALGOLIA_APP_ID || metaEnv.ALGOLIA_APP_ID || '';
    this.searchKey = env.ALGOLIA_SEARCH_KEY || metaEnv.ALGOLIA_SEARCH_KEY || env.ALGOLIA_API_KEY || metaEnv.ALGOLIA_API_KEY || '';
    this.adminApiKey = env.ALGOLIA_API_KEY || metaEnv.ALGOLIA_API_KEY || this.searchKey;
    this.indexPrefix = env.ALGOLIA_INDEX_PREFIX || metaEnv.ALGOLIA_INDEX_PREFIX || 'carcblog_';
  }

  isConfigured(): boolean {
    return Boolean(this.appId && this.searchKey);
  }

  private getIndexName(entityType?: SearchEntityType): string {
    if (!entityType) return `${this.indexPrefix}all`;
    return `${this.indexPrefix}${entityType}s`;
  }

  async search(options: SearchQueryOptions): Promise<SearchResult> {
    const startTime = Date.now();
    if (!this.isConfigured()) {
      throw new Error('Algolia search is not configured. Missing ALGOLIA_APP_ID or ALGOLIA_SEARCH_KEY.');
    }

    const { query, entityTypes, limit = 20, page = 1, facetFilters } = options;
    const targetEntities: SearchEntityType[] = entityTypes && entityTypes.length > 0
      ? entityTypes
      : ['article', 'startup', 'founder', 'investor'];

    const requests = targetEntities.map(entityType => {
      const indexName = this.getIndexName(entityType);
      let algoliaFacetFilters: string[] = [];

      if (facetFilters) {
        Object.entries(facetFilters).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach(v => algoliaFacetFilters.push(`${key}:${v}`));
          } else if (val) {
            algoliaFacetFilters.push(`${key}:${val}`);
          }
        });
      }

      return {
        indexName,
        params: new URLSearchParams({
          query: query || '',
          hitsPerPage: limit.toString(),
          page: Math.max(0, page - 1).toString(),
          facetFilters: JSON.stringify(algoliaFacetFilters),
          attributesToHighlight: JSON.stringify(['title', 'subtitle', 'excerpt', 'thesis', 'bio']),
        }).toString(),
      };
    });

    const response = await fetch(`https://${this.appId}-dsn.algolia.net/1/indexes/*/queries`, {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': this.appId,
        'X-Algolia-API-Key': this.searchKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Algolia query error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const allHits: SearchHit[] = [];
    let totalHits = 0;

    (data.results || []).forEach((res: any, idx: number) => {
      totalHits += res.nbHits || 0;
      const fallbackEntityType = targetEntities[idx] || 'article';

      (res.hits || []).forEach((hit: any) => {
        const entityType = (hit.entityType || fallbackEntityType) as SearchEntityType;
        allHits.push({
          id: hit.objectID || hit.id,
          entityType,
          title: hit.title || hit.name,
          subtitle: hit.subtitle || hit.industry || hit.job_title || hit.investor_type,
          excerpt: hit.excerpt || hit.thesis || hit.bio || hit.description,
          href: hit.href || `/${entityType}s/${hit.slug || hit.objectID}`,
          image: hit.image || hit.logo_url || hit.avatar_url,
          facets: {
            industry: hit.industry,
            stage: hit.stage,
            type: hit.investor_type,
            country: hit.country,
            city: hit.city,
          },
          highlights: {
            title: hit._highlightResult?.title?.value || hit._highlightResult?.name?.value,
            excerpt: hit._highlightResult?.excerpt?.value || hit._highlightResult?.thesis?.value,
          },
          raw: hit,
        });
      });
    });

    const totalPages = Math.ceil(totalHits / Math.max(1, limit));

    return {
      hits: allHits.slice(0, limit),
      totalHits,
      page,
      totalPages,
      processingTimeMs: Date.now() - startTime,
      provider: 'algolia',
    };
  }

  async indexBatch(entityType: SearchEntityType, records: SearchIndexRecord[]): Promise<void> {
    if (!this.appId || !this.adminApiKey) {
      throw new Error('Algolia indexing requires ALGOLIA_APP_ID and ALGOLIA_API_KEY.');
    }

    const indexName = this.getIndexName(entityType);
    const body = {
      requests: records.map(record => ({
        action: 'addObject',
        body: record,
      })),
    };

    const response = await fetch(`https://${this.appId}.algolia.net/1/indexes/${indexName}/batch`, {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': this.appId,
        'X-Algolia-API-Key': this.adminApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Algolia indexBatch failed: ${err}`);
    }
  }
}
