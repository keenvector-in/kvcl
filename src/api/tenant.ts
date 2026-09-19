import type { HttpClient } from './httpClient'

export type TenantStatus = 'onboarding' | 'active' | 'suspended'
export type MembershipStatus = 'active' | 'invited' | 'removed'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
  status: TenantStatus
  created_at: string
}

export interface Store {
  id: string
  tenant_id: string
  name: string
  timezone: string
  default_currency: string
}

export interface Membership {
  id: string
  tenant_id: string
  user_id: string
  role_id: string
  status: MembershipStatus
  created_at: string
}

export interface FeatureFlag {
  id: string
  tenant_id?: string
  key: string
  enabled: boolean
  rollout_pct: number
}

/** One store the logged-in user belongs to, with their role in it. */
export interface MemberTenant {
  id: string
  name: string
  slug: string
  status: TenantStatus
  role_id: string
}

/** What the logged-in member's role allows in a tenant, as "module:action" (e.g. "offers:create"). */
export interface CallerPermissions {
  role_id: string
  permissions: string[]
}

export function tenantApi(http: HttpClient) {
  return {
    onboard: (name: string, slug: string, plan?: string) =>
      http.request<{ tenant: Tenant; store: Store }>('/v1/tenants', { method: 'POST', body: { name, slug, plan } }),

    get: (tenantId: string) => http.request<Tenant>(`/v1/tenants/${tenantId}`),

    // The stores the caller belongs to — the only tenant call that needs no tenant id, so an
    // admin UI can pick (or auto-select) a store right after login.
    mine: () => http.request<{ tenants: MemberTenant[] }>('/v1/tenants/mine'),

    listMemberships: (tenantId: string) =>
      http.request<{ memberships: Membership[] }>(`/v1/tenants/${tenantId}/memberships`, { tenantId }),

    // Use it to hide actions the role can't take; the services still enforce every check.
    myPermissions: (tenantId: string) =>
      http.request<CallerPermissions>(`/v1/tenants/${tenantId}/permissions`, { tenantId }),

    addMembership: (tenantId: string, userId: string, roleId: string) =>
      http.request<Membership>(`/v1/tenants/${tenantId}/memberships`, {
        method: 'POST',
        body: { user_id: userId, role_id: roleId },
        tenantId
      }),

    // Deliberately public (no auth needed) — see tenant.md's ListFeatureFlags comment.
    listFeatureFlags: (tenantId: string) =>
      http.request<{ feature_flags: FeatureFlag[] }>(`/v1/tenants/${tenantId}/feature-flags`, { auth: false, tenantId }),

    setFeatureFlag: (tenantId: string, key: string, enabled: boolean, rolloutPct = 100) =>
      http.request<FeatureFlag>(`/v1/tenants/${tenantId}/feature-flags/${key}`, {
        method: 'PUT',
        body: { enabled, rollout_pct: rolloutPct },
        tenantId
      })
  }
}
