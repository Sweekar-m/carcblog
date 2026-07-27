import type {
  SearchProviderInterface,
  SearchQueryOptions,
  SearchResult,
  SearchHit,
  SearchEntityType,
  SearchIndexRecord
} from '../types';

export class MeilisearchProvider implements SearchProviderInterface {
  readonly providerName = 'meilisearch' as const;

  private host: string;
  private masterKey: string;
  private indexPrefix: string;

  constructor() {
    const env = typeof process !== 'undefined' ? process.env : {};
    const metaEnv = (import.meta as any).env || {};

    this.host = env.MEILI_HOST || metaEnv.MEILI_HOST || 'http://localhost:7700';
    this.masterKey = env.MEILI_MASTER_KEY || metaEnv.MEILI_MASTER_KEY || env.MEILI_KEY || metaEnv.MEILI_KEY || '';
    this.indexPrefix = env.MEILI_INDEX_PREFIX || metaEnv.MEILI_INDEX_PREFIX || 'carcblog_';
  }

  isConfigured(): boolean {
    return Boolean(this.host && this.masterKey);
  }

  private getIndexName(entityType: SearchEntityType): string {
    return `${this.indexPrefix}${entityType}s`;
  }

  async search(options: SearchQueryOptions): Promise<SearchResult> {
    const startTime = Date.now();
    if (!this.isConfigured()) {
      throw new Error('Meilisearch is not configured. Missing MEILI_HOST or MEILI_MASTER_KEY.');
    }

    const { query, entityTypes, limit = 20, page = 1, facetFilters } = options;
    const targetEntities: SearchEntityType[] = entityTypes && entityTypes.length > 0
      ? entityTypes
      : ['article', 'startup', 'founder', 'investor'];

    const queries = targetEntities.map(entityType => {
      const indexUid = this.getIndexName(entityType);
      const filterConditions: string[] = [];

      if (facetFilters) {
        Object.entries(facetFilters).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            const orGroup = val.map(v => `${key} = "${v}"`).join(' OR ');
            filterConditions.push(`(${orGroup})`);
          } else if (val) {
            filterConditions.push(`${key} = "${val}"`);
          }
        });
      }

      return {
        indexUid,
        q: query || '',
        limit,
        offset: (Math.max(1, page) - 1) * limit,
        filter: filterConditions.length > 0 ? filterConditions.join(' AND ') : undefined,
        attributesToHighlight: ['title', 'subtitle', 'excerpt', 'thesis', 'bio'],
      };
    });

    const response = await fetch(`${this.host.replace(/\/$/, '')}/multi-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.masterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queries }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Meilisearch query error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const allHits: SearchHit[] = [];
    let totalHits = 0;

    (data.results || []).forEach((res: any, idx: number) => {
      totalHits += res.estimatedTotalHits || res.hitsCount || (res.hits ? res.hits.length : 0);
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
            title: hit._formatted?.title || hit._formatted?.name,
            excerpt: hit._formatted?.excerpt || hit._formatted?.thesis,
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
      provider: 'meilisearch',
    };
  }

  async indexBatch(entityType: SearchEntityType, records: SearchIndexRecord[]): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Meilisearch indexing requires MEILI_HOST and MEILI_MASTER_KEY.');
    }

    const indexUid = this.getIndexName(entityType);
    const url = `${this.host.replace(/\/$/, '')}/indexes/${indexUid}/documents`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.masterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Meilisearch indexBatch failed: ${err}`);
    }
  }
}
