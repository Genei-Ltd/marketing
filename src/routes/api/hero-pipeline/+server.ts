import { json } from "@sveltejs/kit"
import { runWorkflow } from "$lib/server/connectors/prodia.js"
import { notionConnector } from "$lib/server/connectors/notion.js"
import type { RequestHandler } from "./$types.js"

export const POST: RequestHandler = async ({ request }) => {
	const { body } = await request.json()

	console.log(body)

	// const result = await runWorkflow(prompt, baseImageUrl, maskUrl, 1)
	return json({ message: "Hello, world!" })
}
