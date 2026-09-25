import type { HttpClient } from './httpClient'

// Media (media service, phase 5). The bytes live in object storage and are fetched straight from it by
// the browser — this API only ever deals in metadata and URLs.

/** What a picture is a picture of. */
export type MediaOwnerType = 'product' | 'category' | 'brand' | 'store'

/** The renditions every upload produces: 200px, 600px and 1600px on the longest edge. */
export type MediaSize = 'thumb' | 'card' | 'full'

export interface MediaAsset {
  id: string
  tenant_id: string
  owner_type: MediaOwnerType
  owner_id: string
  /** URL per size; use `srcset` rather than guessing which one a layout needs. */
  urls: Record<MediaSize, string>
  /** The card size — what to use when the layout has no opinion. */
  url: string
  /** Dimensions of the original, for an aspect ratio that stops the grid jumping. */
  width: number
  height: number
  bytes: number
  alt: string
  sort_order: number
  created_at: string
}

/** `srcset` across the three sizes, so a phone doesn't download the 1600px copy. */
export const mediaSrcSet = (a: MediaAsset) => `${a.urls.thumb} 200w, ${a.urls.card} 600w, ${a.urls.full} 1600w`

/** The main image of a thing: the first by sort order, or nothing if it has none. */
export const mainImage = (assets?: MediaAsset[]) => (assets && assets.length ? assets[0] : undefined)

export function mediaApi(http: HttpClient) {
  return {
    /**
     * Uploads one image. Needs the permission of whatever owns it (`products:update`, or
     * `settings:update` for a store logo). 415 `not_an_image`, 413 `image_too_large` (5 MB / 8000px),
     * 409 `too_many_images` past 8 per owner.
     */
    upload: (tenantId: string, input: { file: File; ownerType: MediaOwnerType; ownerId: string; alt?: string }) => {
      const body = new FormData()
      body.set('file', input.file)
      body.set('owner_type', input.ownerType)
      body.set('owner_id', input.ownerId)
      if (input.alt) body.set('alt', input.alt)
      return http.request<MediaAsset>('/v1/media', { method: 'POST', body, tenantId })
    },
    /** One thing's images, in display order. */
    forOwner: (tenantId: string, ownerType: MediaOwnerType, ownerId: string) =>
      http.request<{ assets: MediaAsset[] }>(`/v1/media?owner_type=${ownerType}&owner_id=${ownerId}`, { tenantId }),
    /**
     * Images for a page of things, in one call — a grid must never fetch per row. Public: a shopper
     * browsing a storefront has no token.
     */
    forOwners: (tenantId: string, ownerType: MediaOwnerType, ownerIds: string[]) =>
      http.request<{ by_owner: Record<string, MediaAsset[]> }>(
        `/v1/public/media?owner_type=${ownerType}&owner_ids=${ownerIds.join(',')}`,
        { tenantId, auth: false }
      ),
    /** Sets display order; the first id becomes the main image. */
    reorder: (tenantId: string, ownerType: MediaOwnerType, ownerId: string, ids: string[]) =>
      http.request<{ assets: MediaAsset[] }>('/v1/media/order', {
        method: 'PUT',
        body: { owner_type: ownerType, owner_id: ownerId, ids },
        tenantId
      }),
    setAlt: (tenantId: string, id: string, alt: string) =>
      http.request<MediaAsset>(`/v1/media/${id}/alt`, { method: 'PUT', body: { alt }, tenantId }),
    remove: (tenantId: string, id: string) => http.request<void>(`/v1/media/${id}`, { method: 'DELETE', tenantId })
  }
}
