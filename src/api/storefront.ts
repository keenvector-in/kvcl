import type { HttpClient } from './httpClient'
import type { TenantStatus } from './tenant'
import type { StoreTheme } from '../tokens/storeTheme'


// Home page copy the store admin edits (store-home-content-gap-analysis.md). Every field optional;
// the storefront falls back to catalog-generated text for anything empty. Links are store paths only.
export interface StoreContent {
  announcement?: string
  hero?: { eyebrow?: string; headline?: string; subline?: string; cta_label?: string; cta_link?: string }
  badges?: string[]
  tiles?: { emoji?: string; title: string; text?: string; link?: string }[]
  rails?: string[] // category ids in display order
}

// What tenant-web-portal needs to render a store for a hostname (tenancy.md: tenant from hostname).
export interface Storefront {
  tenant_id: string
  tenant_status: TenantStatus
  store_id: string
  store_name: string
  hostname: string
  template: string
  template_version: number
  theme?: StoreTheme // absent = template defaults
  content?: StoreContent // absent = generated from the catalog
}

// A hostname serving the store: the platform subdomain from onboarding, or a custom domain the
// store added (served once verified_at is set: DNS CNAME to the platform checked by verify).
export interface TenantDomain {
  id: string
  hostname: string
  kind: 'subdomain' | 'custom'
  verified_at?: string
  is_primary: boolean
  created_at: string
}

export function storefrontApi(http: HttpClient) {
  return {
    // Public: shoppers aren't logged in. 404 = no store serves this hostname.
    resolve: (host: string) => http.request<Storefront>(`/v1/sites/resolve?host=${encodeURIComponent(host)}`, { auth: false }),

    // Tenant members only: the tenant's own storefront (hostname, template, theme) for its admin.
    getStorefront: (tenantId: string) => http.request<Storefront>(`/v1/tenants/${tenantId}/storefront`),

    // Tenant members only. theme null/omitted resets to template defaults.
    setStorefront: (tenantId: string, template: string, theme?: StoreTheme | null) =>
      http.request<{ template: string; theme: StoreTheme | null }>(`/v1/tenants/${tenantId}/storefront`, {
        method: 'PUT',
        body: { template, theme: theme ?? null }
      }),

    // Online store → Domains (settings:view / settings:update).
    listDomains: (tenantId: string) => http.request<{ domains: TenantDomain[]; base_domain: string }>(`/v1/tenants/${tenantId}/domains`),
    addDomain: (tenantId: string, hostname: string) =>
      http.request<TenantDomain>(`/v1/tenants/${tenantId}/domains`, { method: 'POST', body: { hostname } }),
    // 422 dns_not_pointed until the CNAME lands on the platform.
    verifyDomain: (tenantId: string, id: string) => http.request<void>(`/v1/tenants/${tenantId}/domains/${id}/verify`, { method: 'POST' }),
    deleteDomain: (tenantId: string, id: string) => http.request<void>(`/v1/tenants/${tenantId}/domains/${id}`, { method: 'DELETE' }),

    // Tenant members only (settings:update). null resets the home page to generated defaults.
    setContent: (tenantId: string, content: StoreContent | null) =>
      http.request<void>(`/v1/tenants/${tenantId}/storefront/content`, { method: 'PUT', body: { content } })
  }
}
