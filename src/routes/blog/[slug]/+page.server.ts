// get the slug from the url then get the blog post from the database
import { getBlogPost, notionConnector } from "$lib/server/connectors/notion"
import { error } from "@sveltejs/kit"

export const load = async ({ params }: { params: { slug: string } }) => {
	const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	if (!DATABASE_ID) {
		throw error(500, "Please set your Notion database ID in the server file")
	}

	const { slug } = params

	const blogPostMetadata = await getBlogPost(DATABASE_ID!, slug)

	// page response
	//     {
	//   object: 'page',
	//   id: '2326a3da-a35a-802e-a5a4-f542f3e0c19c',
	//   created_time: '2025-07-16T18:38:00.000Z',
	//   last_edited_time: '2025-07-17T12:44:00.000Z',
	//   created_by: { object: 'user', id: '1c8d872b-594c-8159-a078-0002803a9696' },
	//   last_edited_by: { object: 'user', id: '1c8d872b-594c-8159-a078-0002803a9696' },
	//   cover: null,
	//   icon: {
	//     type: 'external',
	//     external: { url: 'https://www.notion.so/icons/compose_gray.svg' }
	//   },
	//   parent: {
	//     type: 'database_id',
	//     database_id: '2326a3da-a35a-80a1-9eaa-e5366b3b2a1d'
	//   },
	//   archived: false,
	//   in_trash: false,
	//   properties: {
	//     'SEO Description': { id: 'EtWT', type: 'rich_text', rich_text: [Array] },
	//     Author: { id: 'Ls%40H', type: 'rich_text', rich_text: [Array] },
	//     Slug: { id: 'SIbv', type: 'rich_text', rich_text: [Array] },
	//     Featured: { id: '%5Ehs%3B', type: 'checkbox', checkbox: true },
	//     Category: { id: '%60KG%5C', type: 'multi_select', multi_select: [Array] },
	//     'Published Date': { id: 'dhtj', type: 'date', date: [Object] },
	//     Status: { id: 'pzG%3A', type: 'status', status: [Object] },
	//     'Cover Image': { id: 'rbnZ', type: 'files', files: [] },
	//     Tags: { id: '~uDb', type: 'multi_select', multi_select: [Array] },
	//     Title: { id: 'title', type: 'title', title: [Array] }
	//   },
	//   url: 'https://www.notion.so/10-Essential-Productivity-Tools-for-Remote-Workers-2326a3daa35a802ea5a4f542f3e0c19c',
	//   public_url: null
	// }

	const blogPostBlocks = await notionConnector.getPageBlocksWithChildren(blogPostMetadata.id)

	console.log(blogPostBlocks)

	return { blogPostMetadata, blogPostBlocks }
}
