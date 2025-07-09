export interface WebhookPayload {
  email: string
  discovery_source?: string
  product_interest?: string
  timestamp: string
  source: string
  user_agent: string
  referrer: string
  url: string
}

export interface WebhookResponse {
  success: boolean
  error?: string
}

export async function sendEmailWebhook(
  webhookUrl: string,
  data: {
    email: string
    discoverySource?: string
    productInterest?: string
    metadata?: Record<string, any>
  },
): Promise<WebhookResponse> {
  if (!webhookUrl) {
    console.warn("No webhook URL configured for email capture")
    return { success: false, error: "No webhook URL configured" }
  }

  const payload: WebhookPayload = {
    email: data.email.trim(),
    discovery_source: data.discoverySource?.trim() || "",
    product_interest: data.productInterest || "",
    timestamp: new Date().toISOString(),
    source: "demo_page",
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    url: typeof window !== "undefined" ? window.location.href : "",
    ...data.metadata,
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(
        `Webhook request failed: ${response.status} ${response.statusText}`,
      )
    }

    const result = await response.json().catch(() => ({}))

    return { success: true, ...result }
  } catch (error) {
    console.error("Webhook request failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Debounced webhook sender to prevent multiple calls
const webhookCallTracker = new Set<string>()

export async function sendEmailWebhookOnce(
  webhookUrl: string,
  data: {
    email: string
    discoverySource?: string
    productInterest?: string
    metadata?: Record<string, any>
  },
): Promise<WebhookResponse> {
  const trackingKey = `${data.email.toLowerCase().trim()}-${Date.now()}`

  if (webhookCallTracker.has(data.email.toLowerCase().trim())) {
    return { success: true, error: "Webhook already sent for this email" }
  }

  webhookCallTracker.add(data.email.toLowerCase().trim())

  try {
    const result = await sendEmailWebhook(webhookUrl, data)

    // Remove from tracker after a delay to allow for retries if needed
    setTimeout(() => {
      webhookCallTracker.delete(data.email.toLowerCase().trim())
    }, 30000) // 30 seconds

    return result
  } catch (error) {
    // Remove from tracker on error to allow retry
    webhookCallTracker.delete(data.email.toLowerCase().trim())
    throw error
  }
}
