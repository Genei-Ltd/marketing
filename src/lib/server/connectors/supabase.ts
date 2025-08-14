import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_API_KEY } from "$env/static/public"
import { decode } from "base64-arraybuffer"

const supabaseUrl = "https://ufmeemkydmhzrgwiujij.supabase.co"
const supabaseKey = PUBLIC_SUPABASE_API_KEY
console.log("supabaseKey", supabaseKey)
const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImage(base64Image: Buffer, path: string) {
	const { data, error } = await supabase.storage.from("hero-images").upload(path, base64Image, {
		contentType: "image/png",
	})

	if (error) {
		console.error(error)
		return null
	}

	return data.path
}
