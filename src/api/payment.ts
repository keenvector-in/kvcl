import type { HttpClient } from './httpClient'

export type PaymentMode = 'test' | 'live'

// A tenant's linked payment provider account. The API never returns key secrets; the key id is masked.
export interface PaymentAccount {
  provider: 'razorpay'
  mode: PaymentMode
  key_id_masked: string
  webhook_url: string // this tenant's own webhook URL, to paste into Razorpay
  webhook_events: string[]
  verified_at: string
  updated_at: string
}

// Every store member can list accounts; only the owner can connect, rotate, reveal the webhook
// secret or disconnect (403 otherwise).
export function paymentApi(http: HttpClient) {
  const base = (tenantId: string) => `/v1/tenants/${tenantId}/payment-accounts`
  return {
    listAccounts: (tenantId: string) => http.request<{ accounts: PaymentAccount[] }>(base(tenantId), { tenantId }),

    // Razorpay checks the keys before anything is saved (422 invalid_keys when it rejects them).
    connectRazorpay: (tenantId: string, mode: PaymentMode, keyId: string, keySecret: string) =>
      http.request<PaymentAccount>(`${base(tenantId)}/razorpay`, { method: 'PUT', body: { mode, key_id: keyId, key_secret: keySecret }, tenantId }),

    disconnectRazorpay: (tenantId: string) => http.request<void>(`${base(tenantId)}/razorpay`, { method: 'DELETE', tenantId }),

    rotateWebhookSecret: (tenantId: string) =>
      http.request<PaymentAccount>(`${base(tenantId)}/razorpay/rotate-webhook-secret`, { method: 'POST', tenantId }),

    // Storefront: what Checkout.js hands back after a Razorpay payment. Public; the signature is the
    // auth (422 bad_signature). The order flips to PAID/CONFIRMED right after, no webhook wait.
    confirmRazorpay: (tenantId: string, intentId: string, result: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      http.request<void>(`/v1/pay/razorpay/${intentId}/confirm`, { method: 'POST', body: result, tenantId, auth: false }),

    getWebhookSecret: (tenantId: string) => http.request<{ webhook_secret: string }>(`${base(tenantId)}/razorpay/webhook-secret`, { tenantId })
  }
}
