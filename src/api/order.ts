import type { HttpClient } from './httpClient'

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'

/** What an admin may move an order to from each status (mirrors order's domain.NextStatuses). */
export const NEXT_ORDER_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'OUT_FOR_DELIVERY', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED']
}

/** One row of the order's timeline. */
export interface OrderStatusChange {
  from: OrderStatus | ''
  to: OrderStatus
  actor: 'system' | 'admin' | 'customer'
  note?: string
  created_at: string
}

/** What the client needs to pay an online order. */
export interface OrderPayment {
  intent_id: string
  provider: 'dev' | 'razorpay'
  provider_ref: string
  key_id?: string
  /** hosted page (dev provider); empty for Checkout.js providers */
  checkout_url?: string
}

export type ShipmentStatus = 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'

export interface TrackingEvent {
  status: ShipmentStatus
  location?: string
  note?: string
  occurred_at: string
}

export interface Shipment {
  id: string
  order_id: string
  provider: string
  courier: string
  awb: string
  status: ShipmentStatus
  eta?: string
  events?: TrackingEvent[]
  created_at: string
  updated_at: string
}

export interface OrderOffer {
  id: string
  name: string
  discount_minor: number
}

export interface OrderLine {
  id: number
  kind: 'product'
  /** variant id */
  ref_id: string
  qty: number
  unit_price_minor: number
  subtotal_minor: number
  discount_minor: number
  tax_minor: number
  line_total_minor: number
  offers: OrderOffer[]
}

/** Totals are pricing's at checkout, stored on the order — never recomputed in the client. */
export interface Order {
  id: string
  customer_id: string
  status: OrderStatus
  payment_method: 'cod' | 'online'
  /** set on online orders */
  payment?: OrderPayment
  delivery_method: string
  currency: string
  subtotal_minor: number
  offer_discount_minor: number
  coupon_discount_minor: number
  tax_minor: number
  shipping_minor: number
  total_minor: number
  coupon_code?: string
  shipping_address: { name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string }
  failure_reason?: string
  return_reason?: string
  refund_minor: number
  refund_ref?: string
  offers: OrderOffer[]
  lines: OrderLine[]
  /** timeline; present on single-order reads */
  history?: OrderStatusChange[]
  /** logistics' shipment with tracking; present on single-order reads once shipped */
  shipment?: Shipment
  created_at: string
  updated_at: string
}

export interface CheckoutInput {
  /** one per checkout attempt; retrying with the same key returns the same order */
  idempotency_key: string
  address_id: string
  /** defaults to the coupon applied on the cart */
  coupon_code?: string
  /** one of pricingApi.shippingMethods; default standard */
  delivery_method?: string
  /** default cod */
  payment_method?: 'cod' | 'online'
}

export function orderApi(http: HttpClient) {
  return {
    // Turns the caller's active cart into an order (cash on delivery).
    checkout: (tenantId: string, input: CheckoutInput) => http.request<Order>('/v1/orders/checkout', { method: 'POST', body: input, tenantId }),
    myOrders: (tenantId: string) => http.request<{ orders: Order[] }>('/v1/orders', { tenantId }),
    myOrder: (tenantId: string, id: string) => http.request<Order>(`/v1/orders/${id}`, { tenantId }),
    /** Shopper gives up on an unpaid online order: holds and coupon uses go back, order ends PAYMENT_FAILED. */
    cancelUnpaid: (tenantId: string, id: string) => http.request<Order>(`/v1/orders/${id}/cancel-unpaid`, { method: 'POST', tenantId }),
    /** DELIVERED orders only, within 7 days. 409 return_window_closed, 400 return_reason_required. */
    requestReturn: (tenantId: string, id: string, reason: string) =>
      http.request<Order>(`/v1/orders/${id}/return`, { method: 'POST', body: { reason }, tenantId }),
    // backoffice, orders:view
    storeOrders: (tenantId: string) => http.request<{ orders: Order[] }>('/v1/store/orders', { tenantId }),
    storeOrder: (tenantId: string, id: string) => http.request<Order>(`/v1/store/orders/${id}`, { tenantId }),
    /** orders:update. Only NEXT_ORDER_STATUSES transitions; 409 invalid_transition otherwise. Cancel before shipment and RETURNED put stock back; RETURNED refunds online orders. */
    updateStatus: (tenantId: string, id: string, status: OrderStatus, note?: string) =>
      http.request<Order>(`/v1/store/orders/${id}/status`, { method: 'PATCH', body: { status, note }, tenantId })
  }
}

/** What a shipment may move to from each status (mirrors logistics' domain). */
export const NEXT_SHIPMENT_STATUSES: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  created: ['picked_up', 'in_transit', 'failed'],
  picked_up: ['in_transit', 'out_for_delivery', 'failed'],
  in_transit: ['out_for_delivery', 'delivered', 'failed'],
  out_for_delivery: ['delivered', 'failed'],
  failed: ['in_transit', 'out_for_delivery', 'returned']
}

/** A store's courier API account, masked (Settings → Shipping providers). */
export interface CourierAccount {
  provider: 'bluedart'
  login_id: string
  license_key_masked: string
  customer_code: string
  origin_area: string
  pickup: { name: string; address: string; city: string; pincode: string; phone: string }
  enabled: boolean
  base_url: string
  verified_at?: string
  updated_at: string
}

export interface BlueDartInput {
  login_id: string
  /** omit to keep the stored key */
  license_key?: string
  customer_code?: string
  origin_area?: string
  pickup: CourierAccount['pickup']
  enabled?: boolean
  base_url?: string
}

// Shipments (logistics service, shipping:* permissions). Creating one moves the order to SHIPPED;
// scans move it to OUT_FOR_DELIVERY / DELIVERED — the storefront order page shows them.
export function logisticsApi(http: HttpClient) {
  return {
    list: (tenantId: string) => http.request<{ shipments: Shipment[] }>('/v1/store/shipments', { tenantId }),
    get: (tenantId: string, id: string) => http.request<Shipment>(`/v1/store/shipments/${id}`, { tenantId }),
    /** Order must be CONFIRMED or PACKED. 409 duplicate_shipment if it already has one. eta is YYYY-MM-DD. */
    create: (tenantId: string, input: { order_id: string; courier: string; awb: string; eta?: string }) =>
      http.request<Shipment>('/v1/store/shipments', { method: 'POST', body: input, tenantId }),
    /** Records a scan; only NEXT_SHIPMENT_STATUSES transitions. */
    track: (tenantId: string, id: string, status: ShipmentStatus, location?: string, note?: string) =>
      http.request<Shipment>(`/v1/store/shipments/${id}/status`, { method: 'PATCH', body: { status, location, note }, tenantId }),

    // Courier accounts (shipping:view / shipping:update). Saving Blue Dart logs in with the credentials
    // first: 422 courier_rejected when they're wrong, 502 courier_unavailable when it can't be reached.
    courierAccounts: (tenantId: string) => http.request<{ providers: CourierAccount[] }>(`/v1/tenants/${tenantId}/shipping-providers`, { tenantId }),
    saveBlueDart: (tenantId: string, input: BlueDartInput) =>
      http.request<CourierAccount>(`/v1/tenants/${tenantId}/shipping-providers/bluedart`, { method: 'PUT', body: input, tenantId }),
    deleteBlueDart: (tenantId: string) => http.request<void>(`/v1/tenants/${tenantId}/shipping-providers/bluedart`, { method: 'DELETE', tenantId })
  }
}
