import type { HttpClient } from './httpClient'

export interface SearchHit {
  type: string
  ref_id: string
  title: string
  description: string
  category_id?: string
  brand_id?: string
  /** From published reviews; 0 and 0 when unrated. */
  rating_avg: number
  rating_count: number
  rank: number
}
export interface FacetCount { value: string; count: number }
/** Matching products per value of one attribute (a store filter). */
export interface AttributeFacet { attribute_id: string; value: string; count: number }
/**
 * Facet counts are disjunctive: a group's counts apply every filter except that group's own, so
 * ticking one colour still shows how many products the other colours have.
 */
export interface SearchResult {
  hits: SearchHit[]
  /** Every match, across all pages. */
  total: number
  category_facets: FacetCount[]
  brand_facets: FacetCount[]
  attribute_facets: AttributeFacet[]
}
export interface SearchOptions {
  minRating?: number
  /** rating = most ratings first; new = newest first; az / za = by title. Default: relevance, or title when browsing. */
  sort?: 'rating' | 'new' | 'az' | 'za'
  offset?: number
  /** Any of these categories (pass a category and its descendants). */
  categories?: string[]
  /** Any of these brands. */
  brands?: string[]
  /** attribute_id → accepted values: any value of one attribute, every attribute listed. */
  attrs?: Record<string, string[]>
  /** Attributes to count values for — the store's dropdown attributes marked as filters. */
  facets?: string[]
}

export function searchApi(http: HttpClient) {
  return {
    // q '' browses: the store's category pages filter and page through the same endpoint.
    search: (tenantId: string, query: string, limit = 20, opts: SearchOptions = {}) => {
      const q = new URLSearchParams({ q: query, limit: String(limit) })
      if (opts.minRating) q.set('min_rating', String(opts.minRating))
      if (opts.sort) q.set('sort', opts.sort)
      if (opts.offset) q.set('offset', String(opts.offset))
      opts.categories?.forEach((id) => q.append('category', id))
      opts.brands?.forEach((id) => q.append('brand', id))
      Object.entries(opts.attrs ?? {}).forEach(([id, values]) => values.forEach((v) => q.append('attr', `${id}:${v}`)))
      opts.facets?.forEach((id) => q.append('facet', id))
      return http.request<SearchResult>(`/v1/search?${q}`, { tenantId, auth: false })
    }
  }
}
