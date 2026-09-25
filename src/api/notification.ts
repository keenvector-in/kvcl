import type { HttpClient } from './httpClient'

// Notification (notification service, phase 5): what a store sends when something happens to an order,
// and whether it arrived. Templates and the on/off switches are data, so adding a message is an edit,
// never a deployment.

export type NotifyChannel = 'whatsapp' | 'email'

/** The order events a shopper is told about. Internal steps (PACKED) are deliberately absent. */
export type NotifyEvent = 'OrderConfirmed' | 'OrderShipped' | 'OrderOutForDelivery' | 'OrderDelivered' | 'OrderCancelled'

export interface NotifyTemplate {
  id: string
  tenant_id: string
  event: NotifyEvent
  channel: NotifyChannel
  /** E-mail only; WhatsApp is a single body. */
  subject: string
  body: string
  enabled: boolean
  updated_at: string
}

/** `sent` reached the provider; `failed` it refused; `skipped` means we never tried, and `detail` says why. */
export type DeliveryStatus = 'sent' | 'failed' | 'skipped'

export interface NotifyDelivery {
  id: string
  event: NotifyEvent
  event_id: string
  channel: NotifyChannel
  recipient: string
  subject?: string
  body: string
  status: DeliveryStatus
  detail?: string
  order_id?: string
  created_at: string
}

/** What each event means to a shopper, for the admin screen. */
export const NOTIFY_EVENTS: { value: NotifyEvent; label: string; when: string }[] = [
  { value: 'OrderConfirmed', label: 'Order confirmed', when: 'as soon as an order is placed and paid for' },
  { value: 'OrderShipped', label: 'Order shipped', when: 'when the parcel leaves the shop' },
  { value: 'OrderOutForDelivery', label: 'Out for delivery', when: 'on the morning it arrives' },
  { value: 'OrderDelivered', label: 'Delivered', when: 'once the courier marks it delivered' },
  { value: 'OrderCancelled', label: 'Cancelled', when: 'when an order is cancelled, with the refund position' }
]

/** Placeholders a template may use; anything else renders empty. */
export const NOTIFY_PLACEHOLDERS = [
  'store_name',
  'customer_name',
  'order_number',
  'total',
  'payment_method',
  'courier_line',
  'refund_line'
] as const

/** A flat send to a segment. Draft until sent; `sending` while it runs, so one click means one send. */
export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed'

export interface Campaign {
  id: string
  name: string
  segment_id?: string
  channel: NotifyChannel
  subject?: string
  body: string
  status: CampaignStatus
  /** How many consented shoppers it was aimed at, and what happened. */
  audience: number
  sent_count: number
  failed_count: number
  skipped_count: number
  created_at: string
  sent_at?: string
}

export function notificationApi(http: HttpClient) {
  return {
    /** settings:view. Seeded with sensible defaults the first time a store looks. */
    templates: (tenantId: string) => http.request<{ templates: NotifyTemplate[] }>('/v1/notifications/templates', { tenantId }),
    /** settings:update. Editing the wording, or turning one message off. */
    saveTemplate: (tenantId: string, id: string, input: { subject: string; body: string; enabled: boolean }) =>
      http.request<NotifyTemplate>(`/v1/notifications/templates/${id}`, { method: 'PUT', body: input, tenantId }),
    /** settings:view. Every attempt, newest first. */
    deliveries: (tenantId: string, limit = 100) =>
      http.request<{ deliveries: NotifyDelivery[] }>(`/v1/notifications?limit=${limit}`, { tenantId }),
    /** settings:update. Sends one message to an address you name, with example values. */
    sendTest: (tenantId: string, input: { event: NotifyEvent; channel: NotifyChannel; recipient: string }) =>
      http.request<NotifyDelivery>('/v1/notifications/test', { method: 'POST', body: input, tenantId }),

    // Campaigns (settings:*). Only shoppers who opted in to that channel are ever counted or written
    // to — consent is enforced in the customer service, not here.
    campaigns: (tenantId: string) => http.request<{ campaigns: Campaign[] }>('/v1/notifications/campaigns', { tenantId }),
    /** How many shoppers a campaign would reach, before anyone commits to sending it. */
    audience: (tenantId: string, channel: NotifyChannel, segmentId?: string) =>
      http.request<{ audience: number }>(
        `/v1/notifications/audience?channel=${channel}${segmentId ? `&segment=${segmentId}` : ''}`,
        { tenantId }
      ),
    createCampaign: (tenantId: string, input: { name: string; channel: NotifyChannel; body: string; subject?: string; segment_id?: string }) =>
      http.request<Campaign>('/v1/notifications/campaigns', { method: 'POST', body: input, tenantId }),
    /** 409 `already_sent` if it ran, 409 `no_audience` if nobody consented. */
    sendCampaign: (tenantId: string, id: string) =>
      http.request<Campaign>(`/v1/notifications/campaigns/${id}/send`, { method: 'POST', tenantId })
  }
}
