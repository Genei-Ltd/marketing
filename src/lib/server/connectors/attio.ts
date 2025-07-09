import { PRIVATE_ATTIO_API_TOKEN } from "$env/static/private"

interface AttioRecordId {
  workspace_id: string
  object_id: string
  record_id: string
}

interface AttioRecord {
  id: AttioRecordId
  values: Record<string, any>
  created_at?: string
  web_url?: string
}

interface AttioCreateRecordParams {
  values: Record<string, any>
}

interface AttioUpdateRecordParams {
  values: Record<string, any>
}

interface AttioListRecordsParams {
  limit?: number
  offset?: number
  filter?: Record<string, any>
  sorts?: Array<{
    attribute: string
    direction: "asc" | "desc"
  }>
}

export class AttioConnector {
  private apiKey: string
  private baseUrl = "https://api.attio.com/v2"

  constructor() {
    const attioApiKey = PRIVATE_ATTIO_API_TOKEN

    if (!attioApiKey) {
      throw new Error("ATTIO_API_KEY environment variable is required")
    }

    this.apiKey = attioApiKey
  }

  /**
   * Make a request to the Attio API
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Attio API error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  /**
   * Create a record in a custom object
   */
  async createRecord(
    objectId: string,
    params: AttioCreateRecordParams,
  ): Promise<AttioRecord> {
    try {
      const response = await this.makeRequest(`/objects/${objectId}/records`, {
        method: "POST",
        body: JSON.stringify({
          data: params,
        }),
      })
      return response.data
    } catch (error) {
      console.error("Error creating Attio record:", error)
      throw new Error(
        `Failed to create record in object ${objectId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Get a record by ID
   */
  async getRecord(objectType: string, recordId: string): Promise<AttioRecord> {
    try {
      const response = await this.makeRequest(
        `/objects/${objectType}/records/${recordId}`,
      )
      return response.data
    } catch (error) {
      console.error("Error fetching Attio record:", error)
      throw new Error(
        `Failed to fetch record ${recordId} from object ${objectType}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Update a record
   */
  async updateRecord(
    objectType: string,
    recordId: string,
    params: AttioUpdateRecordParams,
  ): Promise<AttioRecord> {
    try {
      const response = await this.makeRequest(
        `/objects/${objectType}/records/${recordId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            data: params,
          }),
        },
      )
      return response.data
    } catch (error) {
      console.error("Error updating Attio record:", error)
      throw new Error(
        `Failed to update record ${recordId} in object ${objectType}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(objectId: string, recordId: string): Promise<void> {
    try {
      await this.makeRequest(`/objects/${objectId}/records/${recordId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting Attio record:", error)
      throw new Error(
        `Failed to delete record ${recordId} from object ${objectId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * List records in an object
   */
  async listRecords(
    objectType: string,
    params?: AttioListRecordsParams,
  ): Promise<{ data: AttioRecord[]; has_more: boolean }> {
    try {
      const body: any = {}
      if (params?.limit) body.limit = params.limit
      if (params?.offset) body.offset = params.offset
      if (params?.filter) body.filter = params.filter
      if (params?.sorts) body.sorts = params.sorts

      const response = await this.makeRequest(
        `/objects/${objectType}/records/query`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      )

      return {
        data: response.data,
        has_more: response.has_more || false,
      }
    } catch (error) {
      console.error("Error listing Attio records:", error)
      throw new Error(
        `Failed to list records from object ${objectType}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Search records across objects
   */
  async searchRecords(
    query: string,
    object?: string,
    limit?: number,
  ): Promise<{ data: AttioRecord[]; has_more: boolean }> {
    try {
      const body: any = { query }
      if (object) body.object = object
      if (limit) body.limit = limit

      const response = await this.makeRequest("/search", {
        method: "POST",
        body: JSON.stringify(body),
      })

      return {
        data: response.data,
        has_more: response.has_more || false,
      }
    } catch (error) {
      console.error("Error searching Attio records:", error)
      throw new Error(
        `Failed to search records: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Get object schema
   */
  async getObjectSchema(objectId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/objects/${objectId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching Attio object schema:", error)
      throw new Error(
        `Failed to fetch object schema ${objectId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * List all objects
   */
  async listObjects(): Promise<any[]> {
    try {
      const response = await this.makeRequest("/objects")
      return response.data
    } catch (error) {
      console.error("Error listing Attio objects:", error)
      throw new Error(
        `Failed to list objects: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Create a new object
   */
  async createObject(params: {
    name: string
    plural_name: string
    api_slug: string
    fields: Array<{
      name: string
      type: string
      config?: Record<string, any>
    }>
  }): Promise<any> {
    try {
      const response = await this.makeRequest("/objects", {
        method: "POST",
        body: JSON.stringify({
          data: params,
        }),
      })
      return response.data
    } catch (error) {
      console.error("Error creating Attio object:", error)
      throw new Error(
        `Failed to create object: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Cancel a trial product
   */
  async cancelTrialProduct(productId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Update the product to mark it as cancelled
      const updatedProduct = await this.updateRecord("products", productId, {
        values: {
          is_trial: ["Cancelled"],
          cancelled_date: new Date().toISOString(),
        },
      })

      return {
        success: true,
      }
    } catch (error) {
      console.error(`Error cancelling trial product ${productId}:`, error)
      return {
        success: false,
        error: `Failed to cancel trial: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Query Attio records with sophisticated pagination, timeout, and error handling
   * Based on the excellent pattern from the user's code
   */
  async queryAttio(
    recordType: string,
    query: any = {},
  ): Promise<AttioRecord[]> {
    const records: AttioRecord[] = []
    let hasMore = true
    let offset = 0
    const limit = 300
    const maxRecords = 10000 // Safety limit to prevent infinite loops
    const requestTimeout = 30000 // 30 second timeout per request

    while (hasMore && records.length < maxRecords) {
      console.log(recordType, "Records in store: ", records.length)

      try {
        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

        const response = await fetch(
          `${this.baseUrl}/objects/${recordType}/records/query`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              limit,
              offset,
              ...query,
            }),
            signal: controller.signal,
          },
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error(
            `Attio ${recordType} API error: ${response.status} - ${await response.text()}`,
          )
          break
        }

        const data = await response.json()
        const fetchedRecords = data.data || []
        console.log(recordType, "Records Fetched: ", fetchedRecords.length)
        records.push(...fetchedRecords)

        offset += fetchedRecords.length
        if (fetchedRecords.length < limit) {
          hasMore = false
        }
        console.log(recordType, records.length, offset, limit, hasMore)
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.error(
            `Attio ${recordType} query timed out after ${requestTimeout}ms`,
          )
        } else {
          console.error(`Attio ${recordType} query error:`, error)
        }
        break
      }
    }

    if (records.length >= maxRecords) {
      console.warn(
        `Attio ${recordType} query hit max records limit (${maxRecords})`,
      )
    }

    return records
  }

  /**
   * Get products for a specific workspace
   */
  async getProductsForWorkspace(workspaceId: string): Promise<{
    products: AttioRecord[]
    error?: string
  }> {
    try {
      const products = await this.queryAttio("products", {
        filter: {
          workspace_id: workspaceId,
        },
      })

      return {
        products,
      }
    } catch (error) {
      console.error(
        `Error fetching products for workspace ${workspaceId}:`,
        error,
      )
      return {
        products: [],
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Export a singleton instance
export const attioConnector = new AttioConnector()
