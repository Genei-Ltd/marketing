import { Client } from "@notionhq/client"
import type {
	GetPageResponse,
	PageObjectResponse,
	QueryDatabaseResponse,
	BlockObjectResponse,
	PartialBlockObjectResponse,
	RichTextItemResponse,
	QueryDatabaseParameters,
	PartialPageObjectResponse,
	UserObjectResponse,
	PartialUserObjectResponse,
	PartialDatabaseObjectResponse,
	DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"

// @ts-expect-error - SvelteKit environment import
import { env } from "$env/dynamic/private"
import type { Article } from "$lib/types/articles"

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
				blocks.map(async (block: BlockObjectResponse | PartialBlockObjectResponse) => {
					// Check if block has children (toggle, column_list, etc.)
					if ("has_children" in block && block.has_children) {
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
			return blocksWithChildren.filter((block) => "type" in block) as BlockObjectResponse[]
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
	async queryDatabase(
		databaseId: string,
		filter?: QueryDatabaseParameters["filter"],
		sorts?: QueryDatabaseParameters["sorts"],
	): Promise<QueryDatabaseResponse> {
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
	extractTextFromRichText(richText: Array<RichTextItemResponse>): string {
		return richText.map((item) => item.plain_text || "").join("")
	}

	/**
	 * Helper function to get property value by type
	 */
	getPropertyValue(property: PageObjectResponse["properties"][string], type: string): unknown {
		if (!property || property.type !== type) {
			return null
		}

		switch (type) {
			case "title":
				return this.extractTextFromRichText((property as { title: RichTextItemResponse[] }).title)
			case "rich_text":
				return this.extractTextFromRichText((property as { rich_text: RichTextItemResponse[] }).rich_text)
			case "number":
				return (property as { number: number | null }).number
			case "select":
				return (property as { select: { name: string } | null }).select?.name || null
			case "multi_select":
				return (property as { multi_select: { name: string }[] }).multi_select?.map((item) => item.name) || []
			case "date":
				return (property as { date: { start: string; end: string | null; time_zone: string | null } | null })
					.date
			case "checkbox":
				return (property as { checkbox: boolean }).checkbox
			case "url":
				return (property as { url: string | null }).url
			case "email":
				return (property as { email: string | null }).email
			case "phone_number":
				return (property as { phone_number: string | null }).phone_number
			case "relation":
				return (property as { relation: { id: string }[] }).relation
			case "rollup":
				return (
					property as {
						rollup:
							| { type: "number"; number: number | null; function: string }
							| { type: "date"; date: { start: string; end: string | null } | null; function: string }
							| {
									type: "array"
									array: ({ type: "title"; title: RichTextItemResponse[] } | object)[]
									function: string
							  }
					}
				).rollup
			case "people":
				return (property as { people: (UserObjectResponse | PartialUserObjectResponse)[] }).people
			case "files": {
				const files = (
					property as {
						files: Array<{
							type: "external" | "file"
							external?: { url: string }
							file?: { url: string }
							name?: string
						}>
					}
				).files

				console.log(
					"FILE",
					files.map((file) => file.file?.url),
				)
				console.log(
					"EXTERNAL",
					files.map((file) => file.external?.url),
				)

				// Return array of URLs instead of raw file objects
				return (
					files
						?.map((file) => {
							if (file.type === "external") {
								return file.external?.url
							}
							if (file.type === "file") {
								return file.file?.url
							}
							return null
						})
						.filter(Boolean) || []
				)
			}
			case "status":
				return (property as { status: { id: string; name: string; color: string } | null }).status
			case "created_time":
				return (property as { created_time: string }).created_time
			case "created_by":
				return (property as { created_by: UserObjectResponse | PartialUserObjectResponse }).created_by
			case "last_edited_time":
				return (property as { last_edited_time: string }).last_edited_time
			case "last_edited_by":
				return (property as { last_edited_by: UserObjectResponse | PartialUserObjectResponse }).last_edited_by
			default:
				return (property as Record<string, unknown>)[type] || null
		}
	}
}

export async function getAllPublishedBlogPosts(databaseId: string) {
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

export async function getDatabaseRowsByGroup(
	databaseId: string,
	group: string,
	category?: string,
): Promise<
	(PageObjectResponse | PartialPageObjectResponse | DatabaseObjectResponse | PartialDatabaseObjectResponse)[]
> {
	const response = await notionConnector.queryDatabase(
		databaseId,
		{
			and: [
				{
					property: "Group",
					multi_select: {
						contains: group,
					},
				},
				{
					property: "Status",
					status: {
						equals: "Published",
					},
				},
				...(category ? [{ property: "Category", multi_select: { contains: category } }] : []),
			],
		},
		[
			{
				property: "Published Date",
				direction: "descending",
			},
		],
	)
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
function calculateReadingTime(blocks: (BlockObjectResponse | PartialBlockObjectResponse)[]): number {
	const wordsPerMinute = 200
	let totalWords = 0

	function getTextFromBlock(block: BlockObjectResponse): string {
		if (!block) return ""
		const blockType = block.type
		// @ts-expect-error - dynamic access
		const richText = block[blockType]?.rich_text
		if (richText) {
			return richText.map((rt: RichTextItemResponse) => rt.plain_text).join(" ")
		}
		return ""
	}

	for (const block of blocks) {
		if ("type" in block) {
			const text = getTextFromBlock(block)
			totalWords += text.split(/\s+/).filter(Boolean).length
		}
	}

	return Math.ceil(totalWords / wordsPerMinute)
}
export async function transformNotionDBRowToArticle(
	notionDBItem: PageObjectResponse | PartialPageObjectResponse,
): Promise<Article> {
	if (!("properties" in notionDBItem)) {
		return {} as Article
	}
	const props = notionDBItem.properties
	const blocks = await notionConnector.getPageBlocks(notionDBItem.id)
	const readingTime = calculateReadingTime(blocks)
	return {
		id: notionDBItem.id,
		title: (notionConnector.getPropertyValue(props["Title"], "title") as string) || "",
		excerpt: notionConnector.getPropertyValue(props["Excerpt"], "rich_text") as string | undefined,
		author: (notionConnector.getPropertyValue(props["Author"], "rich_text") as string) || "",
		slug: (notionConnector.getPropertyValue(props["Slug"], "rich_text") as string) || "",
		company: notionConnector.getPropertyValue(props["Company"], "rich_text") as string | undefined,
		companyLogo: (notionConnector.getPropertyValue(props["Company Logo"], "files") as string[])?.[0],
		coverImage: (notionConnector.getPropertyValue(props["Cover Image"], "files") as string[])?.[0],
		authorImage: (notionConnector.getPropertyValue(props["Author Image"], "files") as string[])?.[0],
		category: notionConnector.getPropertyValue(props["Category"], "multi_select") as string[] | undefined,
		tags: notionConnector.getPropertyValue(props["Tags"], "multi_select") as string[] | undefined,
		group: notionConnector.getPropertyValue(props["Group"], "multi_select") as string[] | undefined,
		publishedDate: (
			notionConnector.getPropertyValue(props["Published Date"], "date") as {
				start: string
				end: string | null
				time_zone: string | null
			} | null
		)?.start,
		seoDescription: notionConnector.getPropertyValue(props["SEO Description"], "rich_text") as string | undefined,
		featured: notionConnector.getPropertyValue(props["Featured"], "checkbox") as boolean | undefined,
		status: (
			notionConnector.getPropertyValue(props["Status"], "status") as {
				id: string
				name: string
				color: string
			} | null
		)?.name,
		externalUrl: notionConnector.getPropertyValue(props["URL"], "url") as string | undefined,
		url: notionDBItem.url,
		icon: notionDBItem.icon as { type: "external"; external: { url: string } } | null,
		blocks: [], // Will be populated separately when fetching page content,
		readingTime: readingTime,
	}
}

export async function transformDBRowsToArticles(
	dbRows: (PageObjectResponse | PartialPageObjectResponse | DatabaseObjectResponse | PartialDatabaseObjectResponse)[],
): Promise<Article[]> {
	const onlyPageObjects: PageObjectResponse[] | PartialPageObjectResponse[] = dbRows.filter(
		(row) => row.object === "page",
	) as PageObjectResponse[] | PartialPageObjectResponse[]
	return Promise.all(onlyPageObjects.map(transformNotionDBRowToArticle))
}

export async function getDatabaseSchemaMultiSelectOptionsForProperty(
	databaseId: string,
	property: string,
): Promise<string[]> {
	const schema = await notionConnector.getDatabaseSchema(databaseId)
	const propertySchema = schema[property as keyof typeof schema]

	if (propertySchema && propertySchema.type === "multi_select") {
		return (propertySchema as { multi_select: { options: { name: string }[] } }).multi_select.options.map(
			(option) => option.name,
		)
	}

	return []
}

// Export a singleton instance
export const notionConnector = new NotionConnector()
