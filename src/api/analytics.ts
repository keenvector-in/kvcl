import type { HttpClient } from './httpClient'

// Reports (phase 5, docs/01_Platform/architecture/phase5-analytics-gap-analysis.md). All amounts are
// integer paise copied from order and payment events — analytics never recomputes money. Dates are
// the store's local days (IST), both ends included; empty = the last 30 days. Needs analytics:view.

export type Grain = 'day' | 'week' | 'month'
export interface ReportRange {
  from?: string // YYYY-MM-DD
  to?: string
  grain?: Grain
}

export interface SalesBucket {
  start: string
  orders: number
  revenue_minor: number
  refunds_minor: number
  net_minor: number
  cancelled: number
  refunded_orders: number
}
/** Orders and revenue leave out cancelled orders; refunds are those on orders placed in the range. */
export interface SalesTotals {
  orders: number
  revenue_minor: number
  refunds_minor: number
  net_minor: number
  cancelled: number
  refunded_orders: number
  aov_minor: number
}
export interface SalesReport {
  series: SalesBucket[]
  totals: SalesTotals
  /** The same length of time just before the range, for "vs previous". */
  previous: SalesTotals
}
export interface ProductSales {
  kind: 'product' | 'service'
  /** Variant (SKU) id — resolve names from catalog. */
  ref_id: string
  units: number
  orders: number
  revenue_minor: number
}
export interface CustomerSales {
  customer_id: string
  orders: number
  revenue_minor: number
  first_order_at: string
  new: boolean
}
export interface CustomersReport {
  buyers: number
  new: number
  returning: number
  /** Share of everyone who ever ordered with 2+ orders, in basis points (10000 = 100%). */
  repeat_rate_bp: number
  top: CustomerSales[]
}

const qs = (r: ReportRange) => {
  const p = new URLSearchParams()
  if (r.from) p.set('from', r.from)
  if (r.to) p.set('to', r.to)
  if (r.grain) p.set('grain', r.grain)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export function analyticsApi(http: HttpClient) {
  return {
    sales: (tenantId: string, r: ReportRange = {}) => http.request<SalesReport>(`/v1/analytics/sales${qs(r)}`, { tenantId }),
    products: (tenantId: string, r: ReportRange = {}) =>
      http.request<{ products: ProductSales[] }>(`/v1/analytics/products${qs(r)}`, { tenantId }),
    customers: (tenantId: string, r: ReportRange = {}) => http.request<CustomersReport>(`/v1/analytics/customers${qs(r)}`, { tenantId })
  }
}
