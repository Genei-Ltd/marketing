import { fail } from "@sveltejs/kit"
import { getApprovedTestimonialsByPage } from "$lib/server/connectors/notion-testimonials"

import type { Actions } from "./$types"
import { getDatabaseRowsByGroup, transformDBRowsToArticles } from "$lib/server/connectors/notion"
import type { Article } from "$lib/types/articles"

export const load = async () => {
	// get testimonials from notion
	const testimonials = await getApprovedTestimonialsByPage("/", false)
	const ctaTestimonial = await getApprovedTestimonialsByPage("CTA", false)
	const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	const blogs = await getDatabaseRowsByGroup(DATABASE_ID, "landing-page")
	const articles: Article[] = await transformDBRowsToArticles(blogs)

	console.log("articles :", articles)
	return {
		testimonials,
		ctaTestimonial,
		articles,
	}
}

export const actions: Actions = {
	emailSubmit: async ({ request }) => {
		const data = await request.formData()
		const email = data.get("email") as string

		// Validate email
		if (!email) {
			return fail(400, {
				email,
				errors: {
					email: "Email is required",
				},
			})
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return fail(400, {
				email,
				errors: {
					email: "Please enter a valid email address",
				},
			})
		}

		try {
			// Here you would typically:
			// 1. Save to database
			// 2. Send to email service
			// 3. Add to CRM (like Attio)
			// For now, we'll just log it
			console.log("Email submitted:", email)

			return {
				success: true,
				message: "Email submitted successfully!",
			}
		} catch (error) {
			console.error("Error submitting email:", error)
			return fail(500, {
				email,
				errors: {
					general: "An error occurred while submitting your email. Please try again.",
				},
			})
		}
	},
}
