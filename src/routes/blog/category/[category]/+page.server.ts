import { error } from "@sveltejs/kit"

import {
	getDatabaseRowsByGroup,
	getDatabaseSchemaMultiSelectOptionsForProperty,
	transformDBRowsToArticles,
} from "$lib/server/connectors/notion"

import type { PageServerLoad } from "../$types"

export const load: PageServerLoad = async ({ params }) => {
	const { category } = params as { category: string }

	try {
		// https://www.notion.so/genei/2326a3daa35a80a19eaae5366b3b2a1d?v=2326a3daa35a8009953f000ce317ee31&source=copy_link
		const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

		if (!DATABASE_ID) {
			throw error(500, "Please set your Notion database ID in the server file")
		}

		// Query the database to get all blog posts
		const response = await getDatabaseRowsByGroup(
			DATABASE_ID,
			"blog",
			category.replaceAll("-", " ").replaceAll("and", "&"),
		)

		const articles = await transformDBRowsToArticles(response)

		const categories = await getDatabaseSchemaMultiSelectOptionsForProperty(DATABASE_ID, "Category")

		return {
			articles,
			category,
			categories,
		}
	} catch (err) {
		console.error("Error loading blog posts:", err)
		throw error(500, "Failed to load blog posts")
	}
}
