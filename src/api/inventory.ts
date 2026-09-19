import type { HttpClient } from './httpClient'

export interface Warehouse {
  id: string
  tenant_id: string
  name: string
  address: string
  serviceable_pincodes: string[]
  sku_count: number // SKUs with stock on hand here
  units: number
}

export interface WarehouseInput {
  name: string
  address: string
  serviceable_pincodes: string[]
}

export type StockStatus = 'in_stock' | 'low' | 'out' | 'untracked'

// Public view: what a storefront or anonymous caller sees.
export interface StockAvailability {
  sku_id: string
  available: number
  status: StockStatus
}

// Staff view: on hand = ledger total minus committed sales; reserved = unexpired checkout holds.
export interface StockSummary extends StockAvailability {
  on_hand: number
  reserved: number
  track_inventory: boolean
  reorder_level: number
  default_warehouse_id: string | null
}

export interface StockSettings {
  track_inventory: boolean
  reorder_level: number
  default_warehouse_id: string | null
}

export interface WarehouseStock {
  warehouse_id: string
  warehouse_name: string
  on_hand: number
  reserved: number
  available: number
}

// Manual entries from the admin; receipt must add stock and damage must remove it.
export type AdjustReason = 'adjustment' | 'receipt' | 'damage'

export interface LedgerEntry {
  id: number
  sku_id: string
  warehouse_id: string
  warehouse_name: string
  delta: number
  reason: AdjustReason | 'sale' | 'return' | 'transfer_in' | 'transfer_out'
  reference_id?: string
  created_at: string
}

// GET stock and the batch summary are public — a storefront needs live availability without a
// login. The summary returns StockSummary rows only to staff (auth sent); shoppers get availability.
export function inventoryApi(http: HttpClient) {
  return {
    getAvailable: (tenantId: string, skuId: string) =>
      http.request<StockAvailability>(`/v1/stock/${skuId}`, { tenantId, auth: false }),

    publicSummary: (tenantId: string, skuIds: string[]) =>
      http.request<{ stock: StockAvailability[] }>('/v1/stock/summary', { method: 'POST', body: { sku_ids: skuIds }, tenantId, auth: false }),

    summary: (tenantId: string, skuIds: string[]) =>
      http.request<{ stock: StockSummary[] }>('/v1/stock/summary', { method: 'POST', body: { sku_ids: skuIds }, tenantId }),

    warehouseStock: (tenantId: string, skuId: string) =>
      http.request<{ warehouses: WarehouseStock[] }>(`/v1/stock/${skuId}/warehouses`, { tenantId }),

    ledger: (tenantId: string, skuId: string, limit = 20) =>
      http.request<{ entries: LedgerEntry[] }>(`/v1/stock/${skuId}/ledger?limit=${limit}`, { tenantId }),

    setSettings: (tenantId: string, skuId: string, settings: StockSettings) =>
      http.request<StockSettings>(`/v1/stock/${skuId}/settings`, { method: 'PUT', body: settings, tenantId }),

    listWarehouses: (tenantId: string) =>
      http.request<{ warehouses: Warehouse[] }>('/v1/warehouses', { tenantId, auth: false }),

    createWarehouse: (tenantId: string, input: WarehouseInput) =>
      http.request<Warehouse>('/v1/warehouses', { method: 'POST', body: input, tenantId }),

    updateWarehouse: (tenantId: string, id: string, input: WarehouseInput) =>
      http.request<Warehouse>(`/v1/warehouses/${id}`, { method: 'PUT', body: input, tenantId }),

    adjustStock: (tenantId: string, skuId: string, warehouseId: string, delta: number, reason: AdjustReason) =>
      http.request('/v1/stock/adjust', {
        method: 'POST',
        body: { sku_id: skuId, warehouse_id: warehouseId, delta, reason },
        tenantId
      }),

    transfer: (tenantId: string, skuId: string, fromWarehouseId: string, toWarehouseId: string, qty: number) =>
      http.request('/v1/stock/transfers', {
        method: 'POST',
        body: { sku_id: skuId, from_warehouse_id: fromWarehouseId, to_warehouse_id: toWarehouseId, qty },
        tenantId
      })
  }
}
