import type { HttpClient } from './httpClient'

export type CartStatus = 'active' | 'checked_out' | 'abandoned'

export interface Cart {
  id: string
  tenant_id: string
  customer_id: string
  currency: string
  status: CartStatus
}
export interface CartLine {
  id: string
  cart_id: string
  kind: 'product'
  kind_version: number
  ref_id: string
  qty: number
  unit_price_minor: number
  line_total_minor: number
  /** set when the cart was priced: what offers took off this line */
  discount_minor?: number
  offer_name?: string
}

/** Pricing's totals for the cart as it stands — never add money up in the client. */
export interface CartSummary {
  currency: string
  subtotal_minor: number
  offer_discount_minor: number
  /** the coupon on the cart, valued by pricing on every read */
  coupon_code?: string
  coupon_discount_minor: number
  /** applied | not_combinable | invalid (the stored code stopped working, e.g. expired) */
  coupon_status?: 'applied' | 'not_combinable' | 'invalid'
  discount_minor: number
  tax_minor: number
  total_minor: number
  offers: { id: string; name: string; discount_minor: number }[]
}

export interface CartView {
  cart: Cart & { coupon_code?: string }
  lines: CartLine[]
  summary: CartSummary | null
}

// Every cart route needs a logged-in caller (a cart is the caller's own
// data) — unlike catalog/pricing/inventory reads, nothing here is public.
export function cartApi(http: HttpClient) {
  return {
    getActive: (tenantId: string) => http.request<CartView>('/v1/carts', { tenantId }),

    /** Applies a coupon on the cart; pricing validates it. 422 coupon_invalid / coupon_not_combinable / empty_cart. */
    applyCoupon: (tenantId: string, cartId: string, code: string) =>
      http.request<CartView>(`/v1/carts/${cartId}/coupon`, { method: 'POST', body: { code }, tenantId }),

    removeCoupon: (tenantId: string, cartId: string) => http.request<CartView>(`/v1/carts/${cartId}/coupon`, { method: 'DELETE', tenantId }),

    /** Adds qty of a variant. A variant already in the cart has its line's quantity raised; the returned line carries the new total. 409 insufficient_stock counts what's already in the cart. */
    addLine: (tenantId: string, variantId: string, qty: number) =>
      http.request<CartLine>('/v1/carts/lines', { method: 'POST', body: { variant_id: variantId, qty }, tenantId }),

    /** Sets a line's quantity (1-999) and reprices the cart. 409 insufficient_stock when raising past what's available. */
    updateLineQty: (tenantId: string, cartId: string, lineId: string, qty: number) =>
      http.request<CartLine>(`/v1/carts/${cartId}/lines/${lineId}`, { method: 'PATCH', body: { qty }, tenantId }),

    removeLine: (tenantId: string, cartId: string, lineId: string) =>
      http.request<void>(`/v1/carts/${cartId}/lines/${lineId}`, { method: 'DELETE', tenantId })
  }
}
