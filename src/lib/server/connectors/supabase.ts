import { createClient } from "@supabase/supabase-js"
import {  PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public"
import { SECRET_SUPABASE_API_KEY } from "$env/static/private"
import type { Database } from "../../../../database.types"
import type { Article } from "$lib/types/articles"
import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY)


export const supabaseAdmin = createClient<Database>(
  PUBLIC_SUPABASE_URL,
  SECRET_SUPABASE_API_KEY,
  { auth: { persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false } }
);




export async function uploadImage(bucket: string, base64Image: Buffer, path: string) {
	const { data, error } = await supabase.storage.from(bucket).upload(path, base64Image, {
		contentType: "image/png",
	})

	if (error) {
		console.error(error)
		return null
	}

	return data.path
}

export async function getImage(bucket: string, path: string) {
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 30) //expired in 30 days

	if (error) {
		console.error(error)
		return null
	}

	return data.signedUrl
}


type SupabaseBlogPost = Database["public"]["Tables"]["blogs"]["Row"]

// get an individual blogpost by slug if its status is published return in Article format
export async function getBlogPostBySlug(slug: string): Promise<Article | null> {
	const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).eq("status", "Published").single()
	if (error) {
		console.error(error)
		return null
	}

	return convertSupabaseToArticle(data as SupabaseBlogPost)
}


function convertSupabaseToArticle(data: SupabaseBlogPost): Article {
	const article: Article = {
		id: data.id.toString(),
		title: data.title || "",
		author: data.author_name || "",
		slug: data.slug,
		category: data.category || [],
		group: data.group || [],
		authorImage: data.author_image || undefined,
		company: data.company_name || undefined,
		companyLogo: data.company_logo_image || undefined,
		coverImage: data.cover_image || undefined,
		publishedDate: data.published_date || undefined,
		seoDescription: data.seo_description || undefined,
		status: data.status || undefined,
		externalUrl: data.external_url || undefined,
		blocks: data.blocks as BlockObjectResponse[] || []
	}
	return article
}

// get all published blogposts
// I dont think we ned this
export async function getAllPublishedBlogPosts(): Promise<Article[]> {
	const { data, error } = await supabase.from("blogs").select("*").eq("status", "Published")
	if (error) {
		console.error(error)
		return []
	}
	return data.map(convertSupabaseToArticle)
}

// get blogposts by category 
export async function getDatabaseRowsByGroup(group: string, category?: string[]): Promise<Article[]> {
	const query = supabase.from("blogs").select("*").eq("status", "Published").order("published_date", { ascending: false })
	if (category && category.length > 0) {
		query.overlaps("category", category)
	}
	if (group) {
		query.contains("group", [group])
	}
	const { data, error } = await query
	if (error) {
		console.error(error)
		return []
	}
	return data.map(convertSupabaseToArticle)
}
