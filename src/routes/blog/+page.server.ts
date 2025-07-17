import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { error } from "@sveltejs/kit"

import { getPublishedBlogPosts, notionConnector } from "$lib/server/connectors/notion"

import type { PageServerLoad } from "./$types"

export interface BlogPost {
	id: string
	title: string
	excerpt: string
	slug: string
	publishDate: string | { start: string } | null
	status: string | null
	author: string | null
	category: string | null
	tags: string[]
	featured: boolean
	seoDescription: string | null
	coverImage: string | null
	blocks: unknown[]
}

export const load: PageServerLoad = async () => {
	try {
		// Replace with your actual Notion database ID
		// https://www.notion.so/genei/2326a3daa35a80a19eaae5366b3b2a1d?v=2326a3daa35a8009953f000ce317ee31&source=copy_link
		const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

		if (!DATABASE_ID) {
			throw error(500, "Please set your Notion database ID in the server file")
		}
		// get teh schema for the Category property
		const schema = await notionConnector.getDatabaseSchema(DATABASE_ID)
		console.log("schema", schema)
		const categories = schema.Category.multi_select.options.map((option) => option.name)
		console.log("categories :", categories)

		// Query the database to get all blog posts
		const response = await getPublishedBlogPosts(DATABASE_ID)

		// Filter to only include page objects
		const pageObjects = response.filter(
			(item): item is PageObjectResponse => "properties" in item && item.object === "page",
		)

		// For each blog post, get the page content
		const blogPosts = await Promise.all(
			pageObjects.map(async (page: PageObjectResponse): Promise<BlogPost | null> => {
				try {
					const blocks = await notionConnector.getPageBlocksWithChildren(page.id)

					// Extract all page properties
					const properties = page.properties || {}

					const title =
						notionConnector.getPropertyValue(properties.Name || properties.Title, "title") || "Untitled"

					const excerpt =
						notionConnector.getPropertyValue(
							properties.Excerpt || properties["SEO Description"],
							"rich_text",
						) || ""

					const slug = notionConnector.getPropertyValue(properties.Slug, "rich_text") || "404"

					const publishDate = notionConnector.getPropertyValue(
						properties["Published Date"] || properties.Date || properties.Created,
						"date",
					)

					const status = notionConnector.getPropertyValue(properties.Status, "select")

					const author =
						notionConnector.getPropertyValue(properties.Author, "multi_select") ||
						notionConnector.getPropertyValue(properties.Author, "multi_select")

					const category = notionConnector.getPropertyValue(properties.Category, "multi_select")

					const tags = notionConnector.getPropertyValue(properties.Tags, "multi_select") || []

					const featured = notionConnector.getPropertyValue(properties.Featured, "checkbox") || false

					const seoDescription = notionConnector.getPropertyValue(properties["SEO Description"], "rich_text")

					const coverImage =
						notionConnector.getPropertyValue(properties["Cover Image"], "files")?.[0]?.external?.url ||
						notionConnector.getPropertyValue(properties["Cover Image"], "files")?.[0]?.file?.url ||
						null

					return {
						id: page.id,
						title,
						excerpt,
						slug,
						publishDate,
						status,
						author,
						category,
						tags,
						featured,
						seoDescription,
						coverImage,
						blocks,
					}
				} catch (blockError) {
					console.error(`Error fetching blocks for page ${page.id}:`, blockError)
					return {
						id: page.id,
						title: "Error loading post",
						excerpt: "Unable to load post content",
						slug: page.id,
						publishDate: null,
						status: "error",
						author: null,
						category: null,
						tags: [],
						featured: false,
						seoDescription: null,
						coverImage: null,
						blocks: [],
					}
				}
			}),
		)

		// Filter out null results and posts that don't have published status
		const validPosts = blogPosts.filter((post): post is BlogPost => post !== null)
		const publishedPosts = validPosts.filter(
			(post) => !post.status || post.status === "Published" || post.status === "published",
		)

		return {
			blogPosts: publishedPosts,
			categories,
		}
	} catch (err) {
		console.error("Error loading blog posts:", err)
		throw error(500, "Failed to load blog posts")
	}
}
