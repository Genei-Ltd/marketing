import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { getApprovedTestimonialsByPage } from "$lib/server/connectors/notion-testimonials"

export const load = async ({ locals }) => {
  // get testimonials from notion
  const testimonials = await getApprovedTestimonialsByPage("/", false)
  const ctaTestimonial = await getApprovedTestimonialsByPage("CTA", false)

  return {
    testimonials,
    ctaTestimonial,
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
          general:
            "An error occurred while submitting your email. Please try again.",
        },
      })
    }
  },
}
