import type { PageServerLoad } from "../$types"
import { getDatabaseRowsByGroup } from "$lib/server/connectors/supabase"
import { generateBlogMetadata } from "$lib/utils/seo"
import { generateBlogListingSchemas } from "$lib/utils/structured-data"

export const load: PageServerLoad = async () => {
	// https://www.notion.so/genei/2326a3daa35a80a19eaae5366b3b2a1d?v=2326a3daa35a8009953f000ce317ee31&source=copy_link
	// const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	// if (!DATABASE_ID) {
	// 	throw error(500, "Please set your Notion database ID in the server file")
	// }

	// Return promises instead of awaited data for proper {#await} functionality
	const articles = getDatabaseRowsByGroup("blog")

	const seoMetadata = generateBlogMetadata()
	const structuredData = generateBlogListingSchemas()

	return {
		articles,
		seoMetadata,
		structuredData,
	}
}
