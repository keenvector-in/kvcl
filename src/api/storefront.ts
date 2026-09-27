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
  /** Who the shop is — footer and order page. Empty fields are not rendered at all. */
  about?: string
  support?: { phone?: string; email?: string; address?: string; hours?: string }
  policies?: { returns?: string; shipping?: string; privacy?: string }
  /** Full https links to the shop's own profiles; the one place off-site links are allowed. */
  social?: { instagram?: string; facebook?: string; whatsapp?: string; youtube?: string }
  /** Optional About us / Contact us pages (store-about-contact-gap-analysis.md). */
  pages?: StorePages
  /** The store's KeenVector chatbot; shown once the store is linked (store-chatbot-gap-analysis.md). */
  chat?: { enabled: boolean }
}

// Every store is a KeenVector tenant; this is the link the platform keeps for it.
export interface KeenVectorLink {
  kv_tenant_id?: string
  site_slug?: string
  status: 'pending' | 'linked' | 'failed'
  last_error?: string
  attempts: number
  updated_at: string
}
/** `configured: false` = the platform has no KeenVector partner key, so no store will link. */
export interface KeenVectorStatus {
  configured: boolean
  link?: KeenVectorLink
}

// A page shows on the store only when it is enabled and has something to show. The Contact page
// shows `support` — it keeps no copy of its own.
export interface StorePages {
  about?: { enabled: boolean; title?: string; body?: string }
  contact?: {
    enabled: boolean
    intro?: string
    form: boolean
    /** The store's own form; empty or absent = the standard one (DEFAULT_CONTACT_FIELDS). */
    fields?: StoreFormField[]
    /** Leave the support phone / e-mail / address / hours off the page. */
    hide_details?: boolean
    /** After sending; empty = the standard thank-you. */
    success_title?: string
    success_text?: string
  }
}

export type FormFieldType = 'name' | 'email' | 'phone' | 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkboxes'
// One question on a store's Contact us form. `id` never changes once created, so old answers keep
// pointing at the right question after the label changes.
export interface StoreFormField {
  id: string
  type: FormFieldType
  label: string
  required?: boolean
  placeholder?: string
  help?: string
  options?: string[] // select, radio, checkboxes: 2–20
  /** Name and text questions only, in characters; absent = the type's own cap (200, long text 2000). */
  min_length?: number
  max_length?: number
}

/** One stored answer, with the label and type as they were when it was sent. */
export interface EnquiryAnswer {
  id: string
  label: string
  type: FormFieldType
  value: string | string[]
}

// A shopper's message from the Contact us page. Not a customer record.
export type EnquiryStatus = 'new' | 'read' | 'closed'
export interface StoreEnquiry {
  id: string
  tenant_id: string
  store_id: string
  name: string
  phone?: string
  email?: string
  message: string
  answers: EnquiryAnswer[]
  status: EnquiryStatus
  created_at: string
  updated_at: string
}

/** What a shopper sends: answers by field id. `website` is the honeypot's value (empty for people). */
export interface EnquiryInput {
  host: string
  answers: Record<string, string | string[]>
  website?: string
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
  /** KeenVector site whose chatbot to load; absent = no chatbot (not linked, or switched off). */
  chat_slug?: string
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
      http.request<void>(`/v1/tenants/${tenantId}/storefront/content`, { method: 'PUT', body: { content } }),

    // Public: the Contact us form (204). 404 contact_form_off when the store switched the form off,
    // 429 too_many_messages when the store hit its hourly cap.
    sendEnquiry: (input: EnquiryInput) => http.request<void>('/v1/sites/enquiries', { method: 'POST', body: input, auth: false }),
    // Staff with customers:view / customers:update. `unread` counts status "new" whatever the filter.
    listEnquiries: (tenantId: string, status?: EnquiryStatus) =>
      http.request<{ enquiries: StoreEnquiry[]; unread: number }>(
        `/v1/tenants/${tenantId}/enquiries${status ? `?status=${status}` : ''}`
      ),
    setEnquiryStatus: (tenantId: string, id: string, status: EnquiryStatus) =>
      http.request<StoreEnquiry>(`/v1/tenants/${tenantId}/enquiries/${id}`, { method: 'PATCH', body: { status } }),

    // The store's KeenVector chatbot. open (settings:update) returns a one-time sign-in URL into the
    // store's KeenVector chatbot settings — open it straight away, it expires in a minute.
    keenVectorStatus: (tenantId: string) => http.request<KeenVectorStatus>(`/v1/tenants/${tenantId}/keenvector`),
    retryKeenVector: (tenantId: string) => http.request<void>(`/v1/tenants/${tenantId}/keenvector/retry`, { method: 'POST' }),
    openKeenVector: (tenantId: string) => http.request<{ url: string }>(`/v1/tenants/${tenantId}/keenvector/open`, { method: 'POST' })
  }
}
