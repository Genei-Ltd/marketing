import { createClient } from "@supabase/supabase-js"
import {  PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from "$env/static/public"
import { SECRET_SUPABASE_API_KEY } from "$env/static/private"
import type { Database } from "../../../../database.types"

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY)


export const supabaseAdmin = createClient(
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



