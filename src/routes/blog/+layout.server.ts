import { getDatabaseSchemaMultiSelectOptionsForProperty } from "$lib/server/connectors/notion"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => {
	const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"
	const categories = getDatabaseSchemaMultiSelectOptionsForProperty(DATABASE_ID, "Category")

	return {
		categories,
	}
}
