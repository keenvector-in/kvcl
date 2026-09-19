import type { HttpClient } from './httpClient'

export interface CustomerProfile {
  id: string
  tenant_id: string
  user_id: string
  display_name: string
  order_count: number
  total_spent_minor: number
  first_order_at?: string
  last_order_at?: string
  created_at: string
}

export interface Address {
  id: string
  label: string
  name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  /** 6-digit Indian PIN code */
  pincode: string
  is_default: boolean
  created_at: string
}
export type AddressInput = Omit<Address, 'id' | 'is_default' | 'created_at'>

/** Every set field must hold; at least one is required. Money in paise. */
export interface SegmentFilter {
  min_orders?: number
  max_orders?: number
  min_spent_minor?: number
  /** last order no more than N days ago */
  ordered_within_days?: number
  /** has ordered, but not in the last N days */
  not_ordered_for_days?: number
}

export interface Segment {
  id: string
  tenant_id: string
  name: string
  filter: SegmentFilter
  customer_count: number
  created_at: string
}

// Shopper routes (/v1/customers/me) act on the caller's own profile in the store they name; segments
// are backoffice (the customers permission).
export function customerApi(http: HttpClient) {
  return {
    me: (tenantId: string) => http.request<CustomerProfile>('/v1/customers/me', { tenantId }),
    updateMe: (tenantId: string, displayName: string) =>
      http.request<CustomerProfile>('/v1/customers/me', { method: 'PUT', body: { display_name: displayName }, tenantId }),

    addresses: (tenantId: string) => http.request<{ addresses: Address[] }>('/v1/customers/me/addresses', { tenantId }),
    addAddress: (tenantId: string, input: AddressInput) =>
      http.request<Address>('/v1/customers/me/addresses', { method: 'POST', body: input, tenantId }),
    deleteAddress: (tenantId: string, id: string) => http.request<void>(`/v1/customers/me/addresses/${id}`, { method: 'DELETE', tenantId }),
    setDefaultAddress: (tenantId: string, id: string) =>
      http.request<void>(`/v1/customers/me/addresses/${id}/default`, { method: 'POST', tenantId }),

    listSegments: (tenantId: string) => http.request<{ segments: Segment[] }>('/v1/segments', { tenantId }),
    createSegment: (tenantId: string, name: string, filter: SegmentFilter) =>
      http.request<Segment>('/v1/segments', { method: 'POST', body: { name, filter }, tenantId }),
    updateSegment: (tenantId: string, id: string, name: string, filter: SegmentFilter) =>
      http.request<Segment>(`/v1/segments/${id}`, { method: 'PUT', body: { name, filter }, tenantId }),
    deleteSegment: (tenantId: string, id: string) => http.request<void>(`/v1/segments/${id}`, { method: 'DELETE', tenantId })
  }
}
