import type { HttpClient } from './httpClient'

export interface SearchHit {
  type: string
  ref_id: string
  title: string
  description: string
  category_id?: string
  brand_id?: string
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
    search: (tenantId: string, query: string, limit = 20) =>
      http.request<SearchResult>(`/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`, { tenantId, auth: false })
  }
}
