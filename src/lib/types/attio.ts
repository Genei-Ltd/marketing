// Attio API Types

export interface AttioRecordId {
	workspace_id: string
	object_id: string
	record_id: string
}

export interface AttioRecord {
	id: AttioRecordId
	values: Record<string, any>
	created_at?: string
	web_url?: string
}

// Product-specific types
export interface AttioProduct extends AttioRecord {
	values: {
		name?: string
		is_trial?: string[]
		origin_of_purchase?: string[]
		start_date?: string
		duration_months?: number
		associated_workspace?: Array<{
			target_record_id: string
			target_object: string
		}>
		currency_type?: string[]
		revenue_type?: string[]
		workspace_id?: string
		cancelled_date?: string
		[key: string]: any
	}
}

// Workspace-specific types
export interface AttioWorkspace extends AttioRecord {
	values: {
		name?: string
		workspace_id?: string
		company?: Array<{
			target_record_id: string
			target_object: string
		}>
		access_granted?: string[]
		reset_limits_every?: string
		limit_reset_date?: string
		[key: string]: any
	}
}

// Frontend workspace type (combination of Clerk and Attio data)
export interface WorkspaceWithProducts {
	id: string
	name: string
	slug?: string
	imageUrl?: string
	createdAt?: string
	memberCount: number
	userRole: string
	publicMetadata?: Record<string, any>
	privateMetadata?: Record<string, any>
	usage?: UsageSnapshot | null
	products: AttioProduct[]
	error?: boolean
}

// Usage types (from internal API)
export interface UsageSnapshot {
	[key: string]:
		| {
				used: number
				total: number
				remaining: number
				period?: string
		  }
		| {
				credited: number
				debited: number
				remaining: number
		  }
}

// API Response types
export interface AttioApiResponse<T> {
	data: T
	has_more?: boolean
}

export interface AttioProductsResponse {
	products: AttioProduct[]
	error?: string
}

export interface AttioWorkspaceResponse {
	workspace: AttioWorkspace | null
	error?: string
}

export interface TrialCancellationResponse {
	success: boolean
	error?: string
}

// Helper functions types
export interface TrialInfo {
	isTrial: boolean
	startDate?: string
	endDate?: Date
	durationMonths?: number
	timeRemaining: {
		days: number
		expired: boolean
	}
}

export interface ProductDisplayInfo {
	id: string
	name: string
	type: "Trial" | "Full Product" | "Unknown"
	status: "Active" | "Expired" | "Cancelled"
	startDate?: string
	endDate?: string
	daysRemaining?: number
	source?: string
	trialInfo?: TrialInfo
}
