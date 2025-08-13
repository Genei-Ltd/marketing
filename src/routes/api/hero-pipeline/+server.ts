import { json } from "@sveltejs/kit"
import { runWorkflow } from "$lib/server/connectors/prodia.js"
import { notionConnector } from "$lib/server/connectors/notion.js"
import type { RequestHandler } from "./$types.js"

// // body {
//   source: {
//     type: 'automation',
//     automation_id: '24e6a3da-a35a-809c-97d2-004d63c7fef5',
//     action_id: '24e6a3da-a35a-802a-b16b-005a1598bda0',
//     event_id: 'ebc134f2-b5e6-4043-a353-83aea95897a2',
//     attempt: 1
//   },
//   data: {
//     object: 'page',
//     id: '24e6a3da-a35a-8037-9d1c-cb9bf26badad',
//     created_time: '2025-08-13T13:35:00.000Z',
//     last_edited_time: '2025-08-13T15:10:00.000Z',
//     created_by: { object: 'user', id: '1c8d872b-594c-8159-a078-0002803a9696' },
//     last_edited_by: { object: 'user', id: '1c8d872b-594c-8159-a078-0002803a9696' },
//     cover: null,
//     icon: null,
//     parent: {
//       type: 'database_id',
//       database_id: '24e6a3da-a35a-8027-a782-f0017856bcf1'
//     },
//     archived: false,
//     in_trash: false,
//     properties: {
//       'Query Param': [Object],
//       Status: [Object],
//       'Brand Logo': [Object],
//       Prompt: [Object],
//       Output: [Object]
//     },
//     url: 'https://www.notion.so/pepsi-24e6a3daa35a80379d1ccb9bf26badad';,
//     public_url: null,
//     request_id: '4facc9c0-aba9-4f1f-b782-480a16aeb92b'
//   }
// }

export const POST: RequestHandler = async ({ request }) => {
	console.log("inside the server /api/hero-pipeline")
	console.log("request", request)

	const body = await request.json()
	console.log("body", body)

	// const result = await runWorkflow(prompt, baseImageUrl, maskUrl, 1)
	return json({ message: "Hello, world!" })
}
