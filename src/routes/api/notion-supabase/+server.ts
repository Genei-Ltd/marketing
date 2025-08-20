import { json, type RequestHandler } from "@sveltejs/kit"
import { X_INTERNAL_API_KEY } from "$env/static/private"
import { transformNotionDBRowToArticle } from "$lib/server/connectors/notion"

export const POST: RequestHandler = async ({ request }) => {
	if (request.headers.get("x-internal-api-key") !== X_INTERNAL_API_KEY) {
		return json({ message: "Unauthorized" }, { status: 401 })
	}

	// if webhook update type is 'page.properties_updated'

	// if webhook update type is 'page.content_updated'

	// if webhook update type is 'file_upload.completed'

	// Receive a notion db row in page properties format

	// write 'in progress' to notion table

	// Transform notion db row in page properties format to supabase object
	// transformNotionDBRowToArticle

	// Fetch the notion page content with the id of the page

	// Upsert the supabase object with the page content

	// Return the supabase object

	// write success to notion table

	const body = await request.json()
	console.log("body", body)

	return json({ message: "Hello, world!" })
}
