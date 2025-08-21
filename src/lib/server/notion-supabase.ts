import type { Article } from "$lib/types/articles"
import { supabase } from "./connectors/supabase"
import type { Database } from "../../../database.types"
import { supabaseAdmin } from "./connectors/supabase"

type SupabaseBlogPost = Database["public"]["Tables"]["blogs"]["Insert"]

function transformArticleToSupabaseBlogPost(article: Article): SupabaseBlogPost {
	return {
		author_name: article.author,
		author_image: article.authorImage || null,
		company_name: article.company || null,
		company_logo_image: article.companyLogo || null,
		category: article.category || null,
		group: article.group || null,
		external_url: article.externalUrl || null,
		published_date: article.publishedDate || null,
		seo_description: article.seoDescription || null,
		status: article.status || null,
		cover_image: article.coverImage || null,
		slug: article.slug,
		title: article.title || null,
	}
}

export async function upsertBlogPost(blogPost: Article) {
	console.log("about to upsert blog post:", blogPost.title)
	console.log("with content:", blogPost.blocks?.length)

	
	const blog_as_supabase = transformArticleToSupabaseBlogPost(blogPost)

	console.log("blog_as_supabase", blog_as_supabase)
	const { data, error } = await supabaseAdmin.from("blogs").upsert(blog_as_supabase, {
		onConflict: "slug",
	}).select()

	if (error) {
		console.error(error)
		return null
	}

	return data
}

export async function getBlogPost(slug: string) {
	const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).single()

	if (error) {
		console.error(error)
		return null
	}

	return data
}
