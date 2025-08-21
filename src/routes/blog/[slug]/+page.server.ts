// get the slug from the url then get the blog post from the database
import { generateBlogPostMetadata } from "$lib/utils/seo"
import { generateBlogPostSchemas } from "$lib/utils/structured-data"
import { error } from "@sveltejs/kit"
import { getBlogPostBySlug } from "$lib/server/connectors/supabase"

export const load = async ({ params }: { params: { slug: string } }) => {
	// const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	// if (!DATABASE_ID) {
	// 	throw error(500, "Please set your Notion database ID in the server file")
	// }

	const { slug } = params

	try {

		const blogPost = await getBlogPostBySlug(slug)

		if (!blogPost) {
			throw error(404, `Blog post with slug "${slug}" not found`)
		}


		// Get blog post metadata from Notion (fast - needed for SEO)
		// const blogPostMetadata = await getBlogPost(DATABASE_ID, slug)

		// if (!blogPostMetadata) {
		// 	throw error(404, `Blog post with slug "${slug}" not found`)
		// }

		// Transform Notion data to Article format (fast - needed for SEO)
		// const article = await transformNotionDBRowToArticle(blogPostMetadata as PageObjectResponse)

		// Generate SEO metadata and structured data on the server (fast - needed immediately)
		const seoMetadata = generateBlogPostMetadata(blogPost)
		const structuredData = generateBlogPostSchemas(blogPost)

		// Stream the heavy content blocks (slow - can load after page renders)
		// const blogPostBlocks = notionConnector.getPageBlocksWithChildren(blogPostMetadata.id)

		return {
			// Immediate data for SEO and initial render
			seoMetadata,
			structuredData,
			// Streamed promises for content
			article: blogPost,
			// blogPostMetadata,
			// blogPostBlocks,
		}
	} catch (err) {
		console.error(`Error loading blog post "${slug}":`, err)

		if (err instanceof Error && err.message.includes("404")) {
			throw error(404, `Blog post with slug "${slug}" not found`)
		}

		throw error(500, `Failed to load blog post "${slug}"`)
	}
}
