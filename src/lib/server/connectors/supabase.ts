import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_API_KEY } from "$env/static/public"

const supabaseUrl = "https://ufmeemkydmhzrgwiujij.supabase.co"
const supabaseKey = PUBLIC_SUPABASE_API_KEY
console.log("supabaseKey", supabaseKey)
export const supabase = createClient(supabaseUrl, supabaseKey)

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
