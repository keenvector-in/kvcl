import type { HttpClient } from './httpClient'

export type ProductStatus = 'draft' | 'active' | 'archived'
export type VariantStatus = 'active' | 'inactive' | 'discontinued'
export type CategoryStatus = 'draft' | 'active' | 'archived'
export type AttributeDataType = 'text' | 'number' | 'enum'
export type AttributeStatus = 'active' | 'archived'

export interface Brand { id: string; tenant_id: string; name: string }
export interface Attribute {
  id: string
  tenant_id: string
  name: string
  data_type: AttributeDataType
  options: string[] // allowed values of a dropdown (enum) attribute
  is_filter: boolean
  status: AttributeStatus
  used_in: number // products with a value for it
}
export interface Category {
  id: string
  tenant_id: string
  parent_id?: string
  name: string
  slug: string
  sort_order: number
  status: CategoryStatus
}
export interface Product {
  id: string
  tenant_id: string
  category_id?: string
  brand_id?: string
  title: string
  description: string
  highlights: string[]
  status: ProductStatus
  created_at: string
  /** From published reviews; 0 and 0 until somebody rates it. Show nothing then (never a made-up rating). */
  rating_avg: number
  rating_count: number
}
export type ReviewStatus = 'published' | 'hidden'
export interface Review {
  id: string
  product_id: string
  product_title?: string
  /** Staff list only; the public list leaves it out. */
  customer_id?: string
  author_name: string
  rating: number
  title: string
  body: string
  /** The shopper has a delivered order for this product (the server decides). */
  verified: boolean
  status: ReviewStatus
  created_at: string
}
export interface RatingSummary {
  rating_avg: number
  rating_count: number
  /** How many 1★ … 5★ (index 0 is 1 star). */
  histogram: [number, number, number, number, number]
}
export interface ReviewInput { author_name: string; rating: number; title: string; body: string }
export interface Variant {
  id: string
  product_id: string
  sku_code: string
  price_minor: number
  mrp_minor: number
  barcode?: string
  weight_grams?: number
  length_mm?: number
  width_mm?: number
  height_mm?: number
  status: VariantStatus
}

// Full-update inputs (PUT): the admin always sends every editable field.
export interface ProductInput {
  title: string
  description: string
  highlights: string[]
  category_id: string | null
  brand_id: string | null
  status: ProductStatus
}
export interface VariantInput {
  sku_code: string
  barcode: string
  weight_grams: number
  length_mm: number
  width_mm: number
  height_mm: number
  status: VariantStatus
}
export interface ProductSpec {
  attribute_id: string
  name: string
  data_type: AttributeDataType
  value: string
}
export interface AttributeInput {
  name: string
  data_type: AttributeDataType
  options: string[]
  is_filter: boolean
}
export interface CategoryInput {
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
  status: CategoryStatus
}

// Public reads return active products, SKUs and categories only — what a storefront shows.
// Tenant admin screens construct this with includeUnpublished: reads then send the caller's token
// and also get drafts and archived items, which the backend allows for tenant members only.
// Writes always require a member token (ADR 0009).
export function catalogApi(http: HttpClient, opts: { includeUnpublished?: boolean } = {}) {
  const all = !!opts.includeUnpublished
  const read = (path: string) => (all ? `${path}${path.includes('?') ? '&' : '?'}include_unpublished=true` : path)

  return {
    listBrands: (tenantId: string) => http.request<{ brands: Brand[] }>('/v1/brands', { tenantId, auth: false }),
    createBrand: (tenantId: string, name: string) =>
      http.request<Brand>('/v1/brands', { method: 'POST', body: { name }, tenantId }),
    updateBrand: (tenantId: string, brandId: string, name: string) =>
      http.request<Brand>(`/v1/brands/${brandId}`, { method: 'PUT', body: { name }, tenantId }),

    listAttributes: (tenantId: string) =>
      http.request<{ attributes: Attribute[] }>('/v1/attributes', { tenantId, auth: false }),
    createAttribute: (tenantId: string, input: AttributeInput) =>
      http.request<Attribute>('/v1/attributes', { method: 'POST', body: input, tenantId }),
    // The input type can't change after creation; a dropdown value still used by a product can't be removed.
    updateAttribute: (tenantId: string, attributeId: string, input: { name: string; options: string[]; is_filter: boolean; status: AttributeStatus }) =>
      http.request<Attribute>(`/v1/attributes/${attributeId}`, { method: 'PUT', body: input, tenantId }),
    // 409 attribute_in_use while any product has a value for it.
    deleteAttribute: (tenantId: string, attributeId: string) =>
      http.request<void>(`/v1/attributes/${attributeId}`, { method: 'DELETE', tenantId }),

    listCategories: (tenantId: string) =>
      http.request<{ categories: Category[] }>(read('/v1/categories'), { tenantId, auth: all }),
    createCategory: (tenantId: string, name: string, slug: string, parentId?: string) =>
      http.request<Category>('/v1/categories', { method: 'POST', body: { name, slug, parent_id: parentId }, tenantId }),
    updateCategory: (tenantId: string, categoryId: string, input: CategoryInput) =>
      http.request<Category>(`/v1/categories/${categoryId}`, { method: 'PUT', body: input, tenantId }),
    // 409 category_in_use while it still has products or subcategories.
    deleteCategory: (tenantId: string, categoryId: string) =>
      http.request<void>(`/v1/categories/${categoryId}`, { method: 'DELETE', tenantId }),

    listProducts: (tenantId: string, limit = 20, offset = 0) =>
      http.request<{ products: Product[] }>(read(`/v1/products?limit=${limit}&offset=${offset}`), { tenantId, auth: all }),
    /** Up to 100 products by id, in one call — a page of search hits. Order is not the ids' order. */
    productsByIds: (tenantId: string, ids: string[]) =>
      http.request<{ products: Product[] }>(read(`/v1/products?limit=100&ids=${ids.join(',')}`), { tenantId, auth: all }),
    getProduct: (tenantId: string, productId: string) =>
      http.request<Product>(read(`/v1/products/${productId}`), { tenantId, auth: all }),
    createProduct: (tenantId: string, title: string, description: string, categoryId?: string, brandId?: string) =>
      http.request<Product>('/v1/products', {
        method: 'POST',
        body: { title, description, category_id: categoryId, brand_id: brandId },
        tenantId
      }),
    updateProduct: (tenantId: string, productId: string, input: ProductInput) =>
      http.request<Product>(`/v1/products/${productId}`, { method: 'PUT', body: input, tenantId }),
    getSpecifications: (tenantId: string, productId: string) =>
      http.request<{ specifications: ProductSpec[] }>(read(`/v1/products/${productId}/specifications`), { tenantId, auth: all }),
    // Replaces the product's full list; an empty value removes that row. 400 invalid_specification explains a bad value.
    setSpecifications: (tenantId: string, productId: string, specs: { attribute_id: string; value: string }[]) =>
      http.request<{ specifications: ProductSpec[] }>(`/v1/products/${productId}/specifications`, { method: 'PUT', body: { specifications: specs }, tenantId }),

    listVariants: (tenantId: string, productId: string) =>
      http.request<{ variants: Variant[] }>(read(`/v1/products/${productId}/variants`), { tenantId, auth: all }),
    createVariant: (tenantId: string, productId: string, skuCode: string, priceMinor: number, mrpMinor: number) =>
      http.request<Variant>(`/v1/products/${productId}/variants`, {
        method: 'POST',
        body: { sku_code: skuCode, price_minor: priceMinor, mrp_minor: mrpMinor },
        tenantId
      }),
    updateVariant: (tenantId: string, productId: string, variantId: string, input: VariantInput) =>
      http.request<Variant>(`/v1/products/${productId}/variants/${variantId}`, { method: 'PUT', body: input, tenantId }),

    // Reviews: anyone reads a product's published ones; a signed-in shopper posts one per product (no
    // edit, 409 already_reviewed); staff list them and hide or show them again.
    productReviews: (tenantId: string, productId: string, limit = 10, offset = 0) =>
      http.request<{ summary: RatingSummary; reviews: Review[] }>(`/v1/products/${productId}/reviews?limit=${limit}&offset=${offset}`, { tenantId, auth: false }),
    myReview: (tenantId: string, productId: string) =>
      http.request<{ review: Review | null; verified: boolean }>(`/v1/products/${productId}/reviews/mine`, { tenantId }),
    postReview: (tenantId: string, productId: string, input: ReviewInput) =>
      http.request<Review>(`/v1/products/${productId}/reviews`, { method: 'POST', body: input, tenantId }),
    listReviews: (tenantId: string, opts: { status?: ReviewStatus; productId?: string; limit?: number; offset?: number } = {}) => {
      const q = new URLSearchParams({ limit: String(opts.limit ?? 50), offset: String(opts.offset ?? 0) })
      if (opts.status) q.set('status', opts.status)
      if (opts.productId) q.set('product_id', opts.productId)
      return http.request<{ reviews: Review[]; total: number }>(`/v1/reviews?${q}`, { tenantId })
    },
    setReviewStatus: (tenantId: string, reviewId: string, status: ReviewStatus) =>
      http.request<Review>(`/v1/reviews/${reviewId}`, { method: 'PATCH', body: { status }, tenantId })
  }
}
