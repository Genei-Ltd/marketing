import { fail, redirect, type ActionFailure } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"
import { z } from "zod"

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	teamType: z.enum(["freelancer", "academic", "icg-member", "agency", "in-house"], {
		required_error: "Please select your team type",
	}),
	discoverySource: z.string().min(1, "Please tell us how you discovered CoLoop"),
	productInterest: z.enum(["qualitative", "open-ends", "both"], {
		required_error: "Please select your product interest",
	}),
})

export const load: PageServerLoad = async ({ url }) => {
	const email = url.searchParams.get("email") || ""

	return {
		email: email,
	}
}

export const actions: Actions = {
	submit: async ({ request }): Promise<ActionFailure<any> | { success: boolean; redirectUrl?: string }> => {
		const formData = await request.formData()

		const submission = {
			email: formData.get("email") as string,
			teamType: formData.get("teamType") as string,
			discoverySource: formData.get("discoverySource") as string,
			productInterest: formData.get("productInterest") as string,
		}

		// Validate the form data
		const validation = formSchema.safeParse(submission)

		if (!validation.success) {
			const errors: Record<string, string> = {}
			validation.error.errors.forEach((error) => {
				errors[error.path[0] as string] = error.message
			})

			return fail(400, {
				errors,
				values: submission,
			})
		}

		const validData = validation.data

		// TODO: Save form data to your database/CRM here
		console.log("Book demo form submission:", validData)

		// Routing logic based on responses
		const shouldShowCalEmbed = shouldEmbedCal(validData)

		if (shouldShowCalEmbed.success) {
			return {
				success: true,
				data: {
					calEmbedLink: shouldShowCalEmbed.calEmbedLink,
				},
			}
		} else {
			// Route to external URL or different page
			const redirectUrl = getRedirectUrl(validData)
			return redirect(302, redirectUrl)
		}
	},
}

function shouldEmbedCal(data: z.infer<typeof formSchema>): { success: boolean; calEmbedLink: string } {
	// Logic to determine if we should show cal.com embed
	// For now, show cal embed for in-house teams interested in qualitative or both
	if (data.teamType === "in-house") {
		return { success: true, calEmbedLink: "https://coloop.cal.com/coloop-ai/in-house-demo" }
	}

	// Show cal embed for agencies
	if (data.teamType === "agency") {
		return { success: true, calEmbedLink: "https://coloop.cal.com/coloop-ai/agencies" }
	}

	return { success: false, calEmbedLink: "" }
}

function getRedirectUrl(data: z.infer<typeof formSchema>): string {
	// Route based on team type and interests
	if (data.teamType === "freelancer" || data.teamType === "academic" || data.teamType === "icg-member") {
		return "https://pay.coloop.ai/demo/independents"
	}

	// Default redirect
	return "https://pay.coloop.ai/demo/independents"
}
