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
export interface SearchResult {
  hits: SearchHit[]
  category_facets: FacetCount[]
  brand_facets: FacetCount[]
}

export function searchApi(http: HttpClient) {
  return {
    // minRating keeps products averaging at least that many stars; sort 'rating' = most ratings first.
    search: (tenantId: string, query: string, limit = 20, opts: { minRating?: number; sort?: 'rating' } = {}) => {
      const q = new URLSearchParams({ q: query, limit: String(limit) })
      if (opts.minRating) q.set('min_rating', String(opts.minRating))
      if (opts.sort) q.set('sort', opts.sort)
      return http.request<SearchResult>(`/v1/search?${q}`, { tenantId, auth: false })
    }
  }
}
