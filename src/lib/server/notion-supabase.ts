import { supabase } from "./connectors/supabase"

function transformNotionBlogPostToSupabaseBlogPost(notionBlogPost: NotionBlogPost): BlogPost {
	// return {
	// 	id: notionBlogPost.id,
	// 	title: notionBlogPost.title,
	// 	content: notionBlogPost.content,
	// }
}

export async function upsertBlogPost(blogPost: BlogPost) {
	const { data, error } = await supabase.from("blog_posts").upsert(blogPost).select()

	if (error) {
		console.error(error)
		return null
	}

	return data
}

export async function getBlogPost(slug: string) {
	const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).single()

	if (error) {
		console.error(error)
		return null
	}

	return data
}
