import { json, type RequestHandler } from "@sveltejs/kit"
import {
	isNotionWebhookValid,
	notionConnector,
	transformNotionDBRowToArticle,
	updatePageProperty,
} from "$lib/server/connectors/notion"
import type { Article } from "$lib/types/articles"
import { upsertBlogPost } from "$lib/server/notion-supabase"

export const POST: RequestHandler = async ({ request }) => {
	if (!(await isNotionWebhookValid(request))) {
		return json({ message: "Unauthorized" }, { status: 401 })
	}

	// if webhook is valid, get the body
	const body = await request.json()
	console.log("body", body)

    try {
        // if webhook update type is 'page.properties_updated'
        if (body.type === "page.properties_updated" || body.type === "page.content_updated") {
            // write 'processing' to notion table
            await updatePageProperty(body.data.object.id, "Status", "Processing")
        
            // Receive a notion db row in page properties format
            const updatedPageId = body.entity.id
        
            // const page = await getPage(updatedPageId)
            const dbRowPage = await notionConnector.getPage(updatedPageId)
            // const notionDBRow = dbRowPage as PageObjectResponse
            console.log("dbRowPage", dbRowPage)
        
            // Transform notion db row in page properties format to supabase object
            const article: Article = await transformNotionDBRowToArticle(dbRowPage)
            console.log("article", article)
        
            const pageBlocks = await notionConnector.getPageBlocksWithChildren(updatedPageId)
            console.log("pageBlocks", pageBlocks)

            const articleWithBlocks = {
                ...article,
                blocks: pageBlocks
            }
        
            // Upsert the supabase object with the page content
            await upsertBlogPost(articleWithBlocks)
        
            // write success to notion table
            await updatePageProperty(updatedPageId, "updated_at", new Date().toISOString())
            await updatePageProperty(body.data.object.id, "Status", "Success")

            return json({ message: "Success" })
        }
    } catch (error) {
        console.error(error)
        await updatePageProperty(body.data.object.id, "Status", "Error")
        return json({ message: "Error" }, { status: 500 })
    }

	// Return the supabase object

	// write success to notion table

	// ------------------------------------------------------------

	// if webhook update type is 'page.content_updated'
	if (body.type === "page.content_updated") {
		// write 'in progress' to notion table
		updatePageProperty(body.data.object.id, "status", "in progress")

		// Receive a notion db row in page content format

		// write 'in progress' to notion table

		// Transform notion db row in page content format to supabase object
		// transformNotionDBRowToArticle

		// Upsert the supabase object with the page content

		// Return the supabase object

		// write success to notion table

		// ------------------------------------------------------------
		// if webhook update type is 'file_upload.completed'
		// Leave this for now but we will put the image uploader for the bucket here

		// Receive a notion db row in page properties format

		// write 'in progress' to notion table

		// Transform notion db row in page properties format to supabase object
		// transformNotionDBRowToArticle

		// Fetch the notion page content with the id of the page

		// Upsert the supabase object with the page content

		// Return the supabase object

		// write success to notion table

		return json({ message: "Hello, world!" })
	}

	return json({ message: "Hello, world!" })
}
