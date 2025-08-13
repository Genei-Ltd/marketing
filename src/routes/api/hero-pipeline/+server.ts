import { json } from "@sveltejs/kit"
import { runWorkflow } from "$lib/server/connectors/prodia.js"
import { notionConnector } from "$lib/server/connectors/notion.js"
import type { RequestHandler } from "./$types.js"

export const POST: RequestHandler = async ({ request }) => {
	console.log("inside the server /api/hero-pipeline")
	console.log("request", request)

	const body = await request.json()
	console.log("body", body)

	// const result = await runWorkflow(prompt, baseImageUrl, maskUrl
	return json({ message: "Hello, world!" })
}
