import { Client } from "@notionhq/client"
import type {
	GetPageResponse,
	PageObjectResponse,
	QueryDatabaseResponse,
	BlockObjectResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"

import { env } from "$env/dynamic/private"

export class NotionConnector {
	private client: Client

	constructor() {
		const notionToken = env.NOTION_TOKEN

		if (!notionToken) {
			throw new Error("NOTION_TOKEN environment variable is required")
		}

		this.client = new Client({
			auth: notionToken,
		})
	}

	/**
	 * Get a specific page by ID
	 */
	async getPage(pageId: string): Promise<GetPageResponse> {
		try {
			const response = await this.client.pages.retrieve({
				page_id: pageId,
			})
			return response
		} catch (error) {
			console.error("Error fetching Notion page:", error)
			throw new Error(
				`Failed to fetch page ${pageId}: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}

	/**
	 * Get page properties (metadata)
	 */
	async getPageProperties(pageId: string): Promise<PageObjectResponse["properties"] | null> {
		try {
			const page = await this.getPage(pageId)

			if ("properties" in page) {
				return (page as PageObjectResponse).properties
			}

			return null
		} catch (error) {
			console.error("Error fetching page properties:", error)
			throw error
		}
	}

	/**
	 * Get all blocks (content) from a page
	 */
	async getPageBlocks(pageId: string) {
		try {
			const response = await this.client.blocks.children.list({
				block_id: pageId,
			})
			return response.results
		} catch (error) {
			console.error("Error fetching page blocks:", error)
			throw new Error(
				`Failed to fetch blocks for page ${pageId}: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}

	/**
	 * Get child blocks for a specific block (useful for toggles, nested lists, etc.)
	 */
	async getBlockChildren(blockId: string) {
		try {
			const response = await this.client.blocks.children.list({
				block_id: blockId,
			})
			return response.results
		} catch (error) {
			console.error("Error fetching block children:", error)
			throw new Error(
				`Failed to fetch children for block ${blockId}: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}

	/**
	 * Get all blocks with nested content (recursively fetches children for toggles, etc.)
	 */
	async getPageBlocksWithChildren(pageId: string): Promise<BlockObjectResponse[]> {
		try {
			const blocks = await this.getPageBlocks(pageId)
			const blocksWithChildren = await Promise.all(
				blocks.map(async (block: BlockObjectResponse) => {
					// Check if block has children (toggle, column_list, etc.)
					if (block.has_children) {
						try {
							const children = await this.getBlockChildren(block.id)
							return {
								...block,
								children: children,
							}
						} catch (error) {
							console.warn(`Could not fetch children for block ${block.id}:`, error)
							return block
						}
					}
					return block
				}),
			)
			return blocksWithChildren
		} catch (error) {
			console.error("Error fetching page blocks with children:", error)
			throw new Error(
				`Failed to fetch blocks with children for page ${pageId}: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}

	/**
	 * Query a database
	 */
	async queryDatabase(databaseId: string, filter?: any, sorts?: any): Promise<QueryDatabaseResponse> {
		try {
			const response = await this.client.databases.query({
				database_id: databaseId,
				filter,
				sorts,
			})
			return response
		} catch (error) {
			console.error("Error querying Notion database:", error)
			throw new Error(
				`Failed to query database ${databaseId}: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}

	/**
	 * Get database schema/properties
	 */
	async getDatabaseSchema(databaseId: string) {
		try {
			const response = await this.client.databases.retrieve({
				database_id: databaseId,
			})
			return response.properties
		} catch (error) {
			console.error("Error fetching database schema:", error)
			throw new Error(
				`Failed to fetch database schema ${databaseId}: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}

	/**
	 * Search for pages/databases
	 */
	async search(query?: string, filterByType?: "page" | "database") {
		try {
			const response = await this.client.search({
				query,
				filter: filterByType
					? {
							property: "object",
							value: filterByType,
						}
					: undefined,
			})
			return response.results
		} catch (error) {
			console.error("Error searching Notion:", error)
			throw new Error(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`)
		}
	}

	/**
	 * Helper function to extract text content from rich text property
	 */
	extractTextFromRichText(richText: any[]): string {
		return richText.map((item) => item.plain_text || "").join("")
	}

	/**
	 * Helper function to get property value by type
	 */
	getPropertyValue(property: any, type: string): any {
		if (!property || property.type !== type) {
			return null
		}

		switch (type) {
			case "title":
				return this.extractTextFromRichText(property.title)
			case "rich_text":
				return this.extractTextFromRichText(property.rich_text)
			case "number":
				return property.number
			case "select":
				return property.select?.name || null
			case "multi_select":
				return property.multi_select?.map((item: any) => item.name) || []
			case "date":
				return property.date
			case "checkbox":
				return property.checkbox
			case "url":
				return property.url
			case "email":
				return property.email
			case "phone_number":
				return property.phone_number
			case "relation":
				return property.relation
			case "rollup":
				return property.rollup
			case "people":
				return property.people
			case "files":
				return property.files
			case "created_time":
				return property.created_time
			case "created_by":
				return property.created_by
			case "last_edited_time":
				return property.last_edited_time
			case "last_edited_by":
				return property.last_edited_by
			default:
				return property[type] || null
		}
	}
}

export async function getPublishedBlogPosts(databaseId: string) {
	const response = await notionConnector.queryDatabase(databaseId, {
		and: [
			{
				property: "Status",
				status: {
					equals: "Published",
				},
			},
		],
	})
	return response.results
}

export async function getBlogPost(databaseId: string, slug: string) {
	const response = await notionConnector.queryDatabase(databaseId, {
		and: [
			{
				property: "Status",
				status: {
					equals: "Published",
				},
			},
			{
				property: "Slug",
				rich_text: {
					equals: slug,
				},
			},
		],
	})
	return response.results[0]
}

// Export a singleton instance
export const notionConnector = new NotionConnector()
