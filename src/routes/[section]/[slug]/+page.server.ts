import { error } from "@sveltejs/kit"

import {
	getDatabaseRowsBySectionAndSlug,
	notionConnector,
	transformNotionDBRowToSectionSlugPage,
} from "$lib/server/connectors/notion"

import type { PageServerLoad } from "./$types"
import { generateSectionSlugPageMetadata } from "$lib/utils/seo"
import { generateSectionSlugPageSchemas } from "$lib/utils/structured-data"
import type { PageObjectResponse } from "@notionhq/client"

export const load: PageServerLoad = async ({ params }) => {
	const { section, slug } = params as { section: string; slug: string }

	// https://www.notion.so/24f6a3daa35a803c92a8d70b526b2466?v=24f6a3daa35a81c4b104000c4e8ee5e2&source=copy_link
	const DATABASE_ID = "24f6a3daa35a803c92a8d70b526b2466"

	if (!DATABASE_ID) {
		throw error(500, "Please set your Notion database ID in the server file")
	}

	try {
		// Get blog post metadata from Notion (fast - needed for SEO)
		const sectionSlugPageMetadata = await getDatabaseRowsBySectionAndSlug(DATABASE_ID, section, slug)

		if (!sectionSlugPageMetadata) {
			throw error(404, `Page "/${section}/${slug}" not found`)
		}

		// Transform Notion data to Article format (fast - needed for SEO)
		const sectionSlugPage = await transformNotionDBRowToSectionSlugPage(
			sectionSlugPageMetadata as PageObjectResponse,
		)

		// Generate SEO metadata and structured data on the server (fast - needed immediately)
		const seoMetadata = generateSectionSlugPageMetadata(sectionSlugPage)
		const structuredData = generateSectionSlugPageSchemas(sectionSlugPage)

		// Stream the heavy content blocks (slow - can load after page renders)
		const sectionSlugPageBlocks = notionConnector.getPageBlocksWithChildren(sectionSlugPageMetadata.id)

		return {
			// Immediate data for SEO and initial render
			seoMetadata,
			structuredData,
			// Streamed promises for content
			sectionSlugPage,
			sectionSlugPageBlocks,
		}
	} catch (err) {
		console.error(`Error loading page "/${section}/${slug}":`, err)

		if (err instanceof Error && err.message.includes("404")) {
			throw error(404, `Page "/${section}/${slug}" not found`)
		}

		throw error(500, `Failed to load page "/${section}/${slug}"`)
	}
}
