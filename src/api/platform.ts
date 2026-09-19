import type { HttpClient } from './httpClient'
import type { FeatureFlag, Tenant, TenantStatus } from './tenant'

/** One platform-admin action, as identity recorded it (ADR 0015). */
export interface AuditEntry {
  id: number
  actor_user_id: string
  tenant_id?: string
  action: string
  target?: string
  old_value?: string
  new_value?: string
  note?: string
  created_at: string
}

// Super admin portal (ADR 0015). Every call needs a token identity minted with `platform_admin: true`
// — the gateway answers 403 not_platform_admin otherwise. Every call is written to the audit log.
/** A business that asked to be contacted from the marketing site (ADR 0016). */
export interface Lead {
  id: string
  name: string
  phone: string
  business: string
  city: string
  message: string
  status: 'new' | 'contacted' | 'converted' | 'dropped'
  converted_tenant_id?: string
  created_at: string
  updated_at: string
}

export interface LeadInput {
  name: string
  phone: string
  business: string
  city?: string
  message?: string
}

// Public: the marketing site's contact form. Rate-limited at the gateway; answers only an id.
export function leadsApi(http: HttpClient) {
  return {
    create: (input: LeadInput) => http.request<{ id: string; status: string }>('/v1/leads', { method: 'POST', body: input, auth: false })
  }
}

export function platformApi(http: HttpClient) {
  return {
    tenants: (limit = 100, offset = 0) => http.request<{ tenants: Tenant[] }>(`/v1/platform/tenants?limit=${limit}&offset=${offset}`),
    /** active | suspended */
    setTenantStatus: (tenantId: string, status: Extract<TenantStatus, 'active' | 'suspended'>) =>
      http.request<Tenant>(`/v1/platform/tenants/${tenantId}/status`, { method: 'PATCH', body: { status } }),
    /** every flag row: platform defaults (no tenant_id) and per-tenant overrides */
    featureFlags: () => http.request<{ feature_flags: FeatureFlag[] }>('/v1/platform/feature-flags'),
    /** platform default for a key (applies to every tenant without an override) */
    setDefaultFlag: (key: string, enabled: boolean, rolloutPct = 100) =>
      http.request<FeatureFlag>(`/v1/platform/feature-flags/${key}`, { method: 'PUT', body: { enabled, rollout_pct: rolloutPct } }),
    /** one tenant's override */
    setTenantFlag: (tenantId: string, key: string, enabled: boolean, rolloutPct = 100) =>
      http.request<FeatureFlag>(`/v1/platform/tenants/${tenantId}/feature-flags/${key}`, { method: 'PUT', body: { enabled, rollout_pct: rolloutPct } }),
    leads: (status = '', limit = 200) => http.request<{ leads: Lead[] }>(`/v1/platform/leads?status=${status}&limit=${limit}`),
    setLeadStatus: (id: string, status: 'new' | 'contacted' | 'dropped') =>
      http.request<Lead>(`/v1/platform/leads/${id}`, { method: 'PATCH', body: { status } }),
    /** onboards a tenant owned by the lead's phone; name defaults to the business name */
    convertLead: (id: string, slug: string, name?: string) =>
      http.request<Tenant>(`/v1/platform/leads/${id}/convert`, { method: 'POST', body: { slug, name } }),
    auditLog: (limit = 100) => http.request<{ entries: AuditEntry[] }>(`/v1/platform/audit-log?limit=${limit}`)
  }
}

/** Flags the platform admin manages today, with what each switches off. */
export const PLATFORM_FLAGS: { key: string; label: string; description: string }[] = [
  { key: 'payments.cod', label: 'Cash on delivery', description: 'Shoppers may choose cash on delivery at checkout.' },
  { key: 'payments.online', label: 'Online payment', description: 'Shoppers may pay online (Razorpay, or the simulated gateway locally).' }
]
