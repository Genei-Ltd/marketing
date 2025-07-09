import {
  PRIVATE_INTERNAL_API_KEY,
  PRIVATE_INTERNAL_API_URL,
} from "$env/static/private"

// Common data types
export type UnlimitedNumber = -1 | number // –1 ↔ unlimited, otherwise ≥ 0
export type LimitResetPeriod = "month" | "year"

export interface Usage {
  used: number
  total: UnlimitedNumber
  remaining: UnlimitedNumber
  period: LimitResetPeriod
}

export interface NonCyclingUsage {
  credited: number
  debited: number
  remaining: number
}

export interface UsageAdjustment {
  delta: number
  direction: "increment" | "decrement"
}

export interface LimitPatch {
  reset: UnlimitedNumber
}

// --- Request/Response Payloads ---

export interface AccessPatch {
  authorized: boolean
}

export interface AccessResponse {
  id: string
  authorized: boolean
}

export interface LimitsPatch {
  chatMessageLimit?: LimitPatch
  gridQuestionLimit?: LimitPatch
  projectLimit?: LimitPatch
  transcriptionLimit?: LimitPatch
  translationLimit?: LimitPatch
}

export interface UsageCyclePatch {
  limitResetPeriod: LimitResetPeriod
  limitResetAnchor: number // UNIX ms timestamp
}

export interface UsageCycleResponse {
  id: string
  limitResetPeriod: LimitResetPeriod
  limitResetAnchor: string // ISO string
}

export interface UsageSnapshot {
  chatMessageUsage: Usage
  gridQuestionUsage: Usage
  projectUsage: Usage
  transcriptionUsage: Usage
  translationUsage: Usage
  openEndLabelUsage: NonCyclingUsage
}

export interface UsageAdjustmentPayload {
  projectUsage?: UsageAdjustment
  chatMessageUsage?: UsageAdjustment
  gridQuestionUsage?: UsageAdjustment
  transcriptionUsage?: UsageAdjustment
  translationUsage?: UsageAdjustment
  openEndLabelUsage?: UsageAdjustment
}

export class InternalApiConnector {
  private apiKey: string
  private baseUrl: string

  constructor() {
    const internalApiKey = PRIVATE_INTERNAL_API_KEY
    const internalApiUrl = PRIVATE_INTERNAL_API_URL

    if (!internalApiKey) {
      throw new Error(
        "PRIVATE_INTERNAL_API_KEY environment variable is required",
      )
    }
    if (!internalApiUrl) {
      throw new Error(
        "PRIVATE_INTERNAL_API_URL environment variable is required",
      )
    }

    this.apiKey = internalApiKey
    this.baseUrl = internalApiUrl
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseUrl}/api/internal${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Internal-API-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      try {
        const errorBody = await response.json()
        const errorMessage =
          errorBody.error || `Internal API error (${response.status})`
        const errorDetails = errorBody.details
          ? ` Details: ${JSON.stringify(errorBody.details)}`
          : ""
        throw new Error(`${errorMessage}${errorDetails}`)
      } catch (e) {
        throw new Error(
          `Internal API error (${response.status}): ${response.statusText}`,
        )
      }
    }

    return response.json()
  }

  // --- Organisation-level routes ---

  async changeOrganizationAccess(
    organizationId: string,
    authorized: boolean,
  ): Promise<AccessResponse> {
    return this.makeRequest(`/organizations/${organizationId}/access`, {
      method: "POST",
      body: JSON.stringify({ authorized } as AccessPatch),
    })
  }

  async changeOrganizationLimits(
    organizationId: string,
    limits: LimitsPatch,
  ): Promise<LimitsPatch> {
    return this.makeRequest(`/organizations/${organizationId}/limits`, {
      method: "POST",
      body: JSON.stringify(limits),
    })
  }

  async changeOrganizationUsageCycle(
    organizationId: string,
    cycle: UsageCyclePatch,
  ): Promise<UsageCycleResponse> {
    return this.makeRequest(`/organizations/${organizationId}/usage-cycle`, {
      method: "POST",
      body: JSON.stringify(cycle),
    })
  }

  async getOrganizationUsage(organizationId: string): Promise<UsageSnapshot> {
    return this.makeRequest(`/organizations/${organizationId}/usage`)
  }

  async adjustOrganizationUsage(
    organizationId: string,
    adjustments: UsageAdjustmentPayload,
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/organizations/${organizationId}/usage`, {
      method: "POST",
      body: JSON.stringify(adjustments),
    })
  }

  // --- User-level routes ---

  async changeUserAccess(
    userId: string,
    authorized: boolean,
  ): Promise<AccessResponse> {
    return this.makeRequest(`/users/${userId}/access`, {
      method: "POST",
      body: JSON.stringify({ authorized } as AccessPatch),
    })
  }

  async changeUserLimits(
    userId: string,
    limits: LimitsPatch,
  ): Promise<LimitsPatch> {
    return this.makeRequest(`/users/${userId}/limits`, {
      method: "POST",
      body: JSON.stringify(limits),
    })
  }

  async changeUserUsageCycle(
    userId: string,
    cycle: UsageCyclePatch,
  ): Promise<UsageCycleResponse> {
    return this.makeRequest(`/users/${userId}/usage-cycle`, {
      method: "POST",
      body: JSON.stringify(cycle),
    })
  }

  async getUserUsage(userId: string): Promise<UsageSnapshot> {
    return this.makeRequest(`/users/${userId}/usage`)
  }

  async adjustUserUsage(
    userId: string,
    adjustments: UsageAdjustmentPayload,
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/users/${userId}/usage`, {
      method: "POST",
      body: JSON.stringify(adjustments),
    })
  }
}

export const internalApiConnector = new InternalApiConnector()
