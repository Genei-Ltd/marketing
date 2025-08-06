import { error } from "@sveltejs/kit"

import {
	getDatabaseRowsByGroup,
	transformDBRowsToArticles,
} from "$lib/server/connectors/notion"

import type { PageServerLoad } from "../$types"

export const load: PageServerLoad = async ({ params }) => {
	const { category } = params as { category: string }

	// https://www.notion.so/genei/2326a3daa35a80a19eaae5366b3b2a1d?v=2326a3daa35a8009953f000ce317ee31&source=copy_link
	const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	if (!DATABASE_ID) {
		throw error(500, "Please set your Notion database ID in the server file")
	}

	// Return promises instead of awaited data for proper {#await} functionality
	const articles = getDatabaseRowsByGroup(
		DATABASE_ID,
		"blog",
		category.replaceAll("-", " ").replaceAll("and", "&"),
	).then(transformDBRowsToArticles)

	return {
		articles,
		category,
	}
}
