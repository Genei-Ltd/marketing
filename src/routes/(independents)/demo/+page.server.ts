import { PRIVATE_PRE_QUALIFICATION_WEBHOOK_URL } from "$env/static/private"
import { validatePreQualificationData } from "$lib/configs/pre-qualification"
import { getPricingPlans } from "$lib/configs/pricing"
import { sendEmailWebhook } from "$lib/utils/webhook"
import { fail, redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ url, locals }) => {

  try {
    // Get currency from URL parameter
    const currency =
      (url.searchParams.get("currency") as "USD" | "EUR" | "GBP") || "USD"

    // Get basic pricing plans for qualification form (simplified)
    const pricingPlans = getPricingPlans(currency)

    return {
      pricingPlans,
      selectedCurrency: currency,
    }
  } catch (error) {
    console.error("Error loading demo page:", error)

    return {
      pricingPlans: [],
      selectedCurrency: "USD" as const,
      error: "Could not load pricing information.",
    }
  }
}

export const actions: Actions = {
  prequalification: async ({ request }) => {
    const formData = await request.formData()

    const email = formData.get("email")?.toString().trim() || ""
    const discoverySource =
      formData.get("discoverySource")?.toString().trim() || ""
    const productInterest = formData.get("productInterest")?.toString() || ""

    // Validate the form data
    const validation = validatePreQualificationData({
      email,
      discoverySource,
      productInterest: productInterest as "qualification" | "open-ends",
    })

    if (!validation.isValid) {
      return fail(400, {
        errors: validation.errors,
        email,
        discoverySource,
        productInterest,
      })
    }

    // Send webhook
    try {
      if (PRIVATE_PRE_QUALIFICATION_WEBHOOK_URL) {
        const webhookResult = await sendEmailWebhook(
          PRIVATE_PRE_QUALIFICATION_WEBHOOK_URL,
          {
            email,
            discoverySource,
            productInterest,
            metadata: {
              step: "pre_qualification",
              form_completed: true,
            },
          },
        )

        if (!webhookResult.success) {
          console.error("Webhook failed:", webhookResult.error)
        }
      }
    } catch (error) {
      console.error("Webhook error:", error)
      // Don't fail the form submission if webhook fails
    }

    return {
      success: true,
      data: {
        email,
        discoverySource,
        productInterest: productInterest as "qualification" | "open-ends",
      },
    }
  },
}
