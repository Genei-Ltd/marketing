import { fail } from "@sveltejs/kit"
import { getApprovedTestimonialsByPage } from "$lib/server/connectors/notion-testimonials"

import type { Actions } from "./$types"
import { getDatabaseRowsByGroup, transformDBRowsToArticles } from "$lib/server/connectors/notion"

export const load = async ({ url }) => {
	// get testimonials from notion
	const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	let partner = null
	if (url.searchParams.get("partner")) {
		partner = url.searchParams.get("partner")
	}

	return {
		testimonials: getApprovedTestimonialsByPage("/", false),
		ctaTestimonial: getApprovedTestimonialsByPage("CTA", false),
		articles: transformDBRowsToArticles(await getDatabaseRowsByGroup(DATABASE_ID, "landing-page")),
		partner,
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
