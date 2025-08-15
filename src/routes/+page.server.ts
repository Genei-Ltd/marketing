import { fail } from "@sveltejs/kit"
import { getApprovedTestimonialsByPage } from "$lib/server/connectors/notion-testimonials"

import type { Actions } from "./$types"
import {
	getDatabaseRowsByGroup,
	getPageByPageName,
	transformDBRowsToArticles,
	transformPageToSimpleObject,
	updatePageProperty,
} from "$lib/server/connectors/notion"

export const load = async ({ url }) => {
	// get testimonials from notion
	// https://www.notion.so/genei/24e6a3daa35a8027a782f0017856bcf1?v=24e6a3daa35a8075bed4000c9d48422e&source=copy_link
	const HERO_DATABASE_ID = "24e6a3daa35a8027a782f0017856bcf1"

	let partnerHero = null
	try {
		if (
			url.searchParams.get("partner") &&
			url.searchParams.get("partner") !== "" &&
			url.searchParams.get("partner") !== null &&
			url.searchParams.get("partner") !== undefined
		) {
			// console.log("partner", url.searchParams.get("partner"))
			const partner = url.searchParams.get("partner") as string

			const page = await getPageByPageName(HERO_DATABASE_ID, partner)
			if (!page) {
				console.log("No Published page found for partner", partner)
			}
			// console.log("getPageByPageName", page)

			const pageObject = await transformPageToSimpleObject(page)
			// console.log("simple pageObject", pageObject)

			// await updatePageProperty(pageObject.id, "Status", {
			// 	status: {
			// 		name: "Processing",
			// 	},
			// })
			partnerHero = pageObject.hero[0]
			// console.log("partnerHero URL = ", partnerHero)
		}
	} catch (error) {
		console.error("Error loading partner hero:", error)
	}

	// https://www.notion.so/genei/2326a3daa35a80a19eaae5366b3b2a1d?v=2326a3daa35a8009953f000ce317ee31&source=copy_link
	const BLOG_DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	return {
		testimonials: getApprovedTestimonialsByPage("/", false),
		ctaTestimonial: getApprovedTestimonialsByPage("CTA", false),
		articles: transformDBRowsToArticles(await getDatabaseRowsByGroup(BLOG_DATABASE_ID, "landing-page")),
		partner: partnerHero,
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
			// https://hooks.zapier.com/hooks/catch/22350330/2xy2kin/
			// curl -X POST https://hooks.zapier.com/hooks/catch/22350330/2xy2kin/ \
			//   -H "Content-Type: application/json" \
			//   -d '{"email":"user@example.com"}'
			// Sends to this Zapier Zap to add to Active Campaign
			// https://zapier.com/editor/292212448/published

			const response = await fetch("https://hooks.zapier.com/hooks/catch/22350330/2xy2kin/", {
				method: "POST",
				body: JSON.stringify({ email }),
			})

			if (!response.ok) {
				throw new Error("Failed to submit email")
			}

			console.log("Email submitted:", email, response)

			return {
				success: true,
				message: "Email submitted successfully!",
				data: {
					email,
				},
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
