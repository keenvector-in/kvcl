import type { HttpClient } from './httpClient'

export interface PriceBreakdown {
  currency: string
  unit_price_minor: number
  subtotal_minor: number
  discount_minor: number
  tax_minor: number
  line_total_minor: number
  // the automatic offer that applied, if any; discount_minor = offer + coupon
  offer_id?: string
  offer_name?: string
  offer_discount_minor: number
  coupon_discount_minor: number
}

/** A delivery option the store offers; pricing adds its fee to the order total at checkout. */
export interface ShippingMethod {
  key: string
  label: string
  description: string
  fee_minor: number
  /** fee waived when the cart (after discounts) reaches this */
  free_above_minor?: number | null
  enabled: boolean
  sort_order: number
}

export type DiscountType = 'percent' | 'flat' | 'bogo'
export type OfferStatus = 'active' | 'inactive'
export type OfferTargetType = 'product' | 'category' | 'brand'

/** A product, or a category (which also covers its subcategories), an offer applies to. */
export interface OfferTarget {
  type: OfferTargetType
  id: string
}

export interface Offer {
  id: string
  tenant_id: string
  name: string
  discount_type: DiscountType
  /** percent: 1–100; flat: paise off each unit; bogo: 0 */
  discount_value: number
  /** bogo: buy buy_qty, get get_qty free; 0 otherwise */
  buy_qty: number
  get_qty: number
  /** cart subtotal (paise, before discounts) the cart must reach; 0 = no minimum */
  min_cart_minor: number
  /** the most the offer takes off one cart, in paise; absent = no cap */
  max_discount_minor?: number
  /** only shoppers in this customer segment get it; absent = everyone */
  audience_segment_id?: string
  /** uses across every order; absent = unlimited */
  usage_limit?: number
  /** uses per shopper; absent = unlimited */
  per_customer_limit?: number
  /** orders that have used it so far */
  used_count: number
  /** adds to other stackable offers on the same item instead of competing with them */
  stackable: boolean
  /** a coupon can't also be used on items this offer discounts */
  excludes_coupons: boolean
  starts_at: string
  ends_at?: string
  status: OfferStatus
  targets: OfferTarget[]
  created_at: string
}

/** starts_at defaults to now; ends_at null/omitted = no end date. targets only count on create. */
export interface OfferInput {
  name: string
  discount_type: DiscountType
  discount_value: number
  buy_qty?: number
  get_qty?: number
  min_cart_minor?: number
  max_discount_minor?: number | null
  audience_segment_id?: string | null
  usage_limit?: number | null
  per_customer_limit?: number | null
  stackable?: boolean
  excludes_coupons?: boolean
  starts_at?: string
  ends_at?: string | null
  status?: OfferStatus
  targets?: OfferTarget[]
}

// A code a shopper types at the cart (pricing validates and values it on every cart read).
export interface Coupon {
  id: string
  tenant_id: string
  code: string
  discount_type: 'flat' | 'percent'
  /** percent: 1–100; flat: paise off the cart */
  discount_value: number
  /** null = unlimited */
  usage_limit: number | null
  used_count: number
  per_customer_limit: number
  starts_at: string
  /** null = no end date */
  ends_at: string | null
  stackable: boolean
}

// GST rate per category (category_id absent = the store default), in basis points (1800 = 18%).
export interface TaxRule {
  id: string
  tenant_id: string
  category_id?: string
  rate_bps: number
  region: string
}

export interface PriceList {
  id: string
  tenant_id: string
  variant_id: string
  price_minor: number
  mrp_minor: number
  currency: string
  effective_from: string
  effective_to?: string
  rate_unit: string
}

// compute() and getEffectivePrice() are public — a storefront needs live
// price without a login (pricing.md#scope: pricing is the single source of
// truth for money, cart/order persist whatever it returns, never re-derive).
export function pricingApi(http: HttpClient) {
  return {
    compute: (tenantId: string, variantId: string, qty: number, categoryId?: string, couponCode?: string) =>
      http.request<PriceBreakdown>('/v1/compute', {
        method: 'POST',
        body: { variant_id: variantId, qty, category_id: categoryId, coupon_code: couponCode },
        tenantId,
        auth: false
      }),

    getEffectivePrice: (tenantId: string, variantId: string) =>
      http.request<PriceList>(`/v1/price-lists/${variantId}`, { tenantId, auth: false }),

    setPrice: (tenantId: string, variantId: string, priceMinor: number, mrpMinor: number, currency = 'INR') =>
      http.request<PriceList>('/v1/price-lists', {
        method: 'POST',
        body: { variant_id: variantId, price_minor: priceMinor, mrp_minor: mrpMinor, currency },
        tenantId
      }),

    // Upserts per (category, region); settings:update.
    setTaxRule: (tenantId: string, rateBps: number, region: string, categoryId?: string) =>
      http.request<TaxRule>('/v1/tax-rules', { method: 'POST', body: { rate_bps: rateBps, region, category_id: categoryId }, tenantId }),
    listTaxRules: (tenantId: string) => http.request<{ tax_rules: TaxRule[] }>('/v1/tax-rules', { tenantId }),
    deleteTaxRule: (tenantId: string, id: string) => http.request<void>(`/v1/tax-rules/${id}`, { method: 'DELETE', tenantId }),

    createCoupon: (
      tenantId: string,
      code: string,
      discountType: 'flat' | 'percent',
      discountValue: number,
      /** 0 = unlimited */
      usageLimit: number,
      startsAt: string,
      /** null = no end date */
      endsAt: string | null
    ) =>
      http.request<Coupon>('/v1/coupons', {
        method: 'POST',
        body: { code, discount_type: discountType, discount_value: discountValue, usage_limit: usageLimit, starts_at: startsAt, ends_at: endsAt },
        tenantId
      }),
    listCoupons: (tenantId: string) => http.request<{ coupons: Coupon[] }>('/v1/coupons', { tenantId }),
    // 409 coupon_used once it has redemptions — let it expire instead.
    deleteCoupon: (tenantId: string, id: string) => http.request<void>(`/v1/coupons/${id}`, { method: 'DELETE', tenantId }),

    // Offers — automatic discounts pricing applies in compute(); managed under the offers permission.
    // Public: live offers a shopper could get on a variant (a storefront's "available offers"),
    // including ones whose minimum cart value the cart hasn't reached.
    liveOffers: (tenantId: string, variantId: string) =>
      http.request<{ offers: Offer[] }>(`/v1/offers/live?variant_id=${encodeURIComponent(variantId)}`, { tenantId, auth: false }),

    listOffers: (tenantId: string) => http.request<{ offers: Offer[] }>('/v1/offers', { tenantId }),

    // Delivery options: public (checkout page); the store replaces the whole set (settings:update).
    shippingMethods: (tenantId: string) => http.request<{ methods: ShippingMethod[] }>('/v1/shipping-methods', { auth: false, tenantId }),
    setShippingMethods: (tenantId: string, methods: Omit<ShippingMethod, 'sort_order'>[]) =>
      http.request<{ methods: ShippingMethod[] }>('/v1/shipping-methods', { method: 'PUT', body: { methods }, tenantId }),

    getOffer: (tenantId: string, offerId: string) => http.request<Offer>(`/v1/offers/${offerId}`, { tenantId }),

    createOffer: (tenantId: string, input: OfferInput) =>
      http.request<Offer>('/v1/offers', { method: 'POST', body: input, tenantId }),

    // Replaces the terms and status; where it applies changes through applyOffer/removeOffer.
    updateOffer: (tenantId: string, offerId: string, input: OfferInput) =>
      http.request<Offer>(`/v1/offers/${offerId}`, { method: 'PUT', body: input, tenantId }),

    deleteOffer: (tenantId: string, offerId: string) => http.request<void>(`/v1/offers/${offerId}`, { method: 'DELETE', tenantId }),

    applyOffer: (tenantId: string, offerId: string, target: OfferTarget) =>
      http.request<Offer>(`/v1/offers/${offerId}/targets`, { method: 'POST', body: target, tenantId }),

    removeOffer: (tenantId: string, offerId: string, target: OfferTarget) =>
      http.request<Offer>(`/v1/offers/${offerId}/targets/${target.type}/${target.id}`, { method: 'DELETE', tenantId })
  }
}
