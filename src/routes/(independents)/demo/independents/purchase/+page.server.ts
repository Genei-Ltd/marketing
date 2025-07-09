import { STRIPE_SECRET_KEY } from "$env/static/private"
import { getPricingPlans } from "$lib/configs/pricing"
import {
  getApprovedTestimonialsByPage,
  getRandomTestimonials,
} from "$lib/configs/testimonials"
import { redirect } from "@sveltejs/kit"
import Stripe from "stripe"
import type { Actions, PageServerLoad } from "./$types"

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
})

export const load: PageServerLoad = async ({ url }) => {
  try {
    // Get currency from URL parameter
    const currency =
      (url.searchParams.get("currency") as "USD" | "EUR" | "GBP") || "USD"

    // Get pricing plans for the selected currency
    const pricingPlans = getPricingPlans(currency)

    // Enrich pricing plans with Stripe data
    const enrichedPlans = await Promise.all(
      pricingPlans.map(async (plan) => {
        try {
          const price = await stripe.prices.retrieve(
            plan.stripeSubscriptionPriceId,
            {
              expand: ["product"],
            },
          )

          const product = price.product as
            | Stripe.Product
            | Stripe.DeletedProduct

          if (!product || ("deleted" in product && product.deleted)) {
            console.warn(
              `Product not found or deleted for price ID: ${plan.stripeSubscriptionPriceId}`,
            )
            return {
              ...plan,
              unit_amount: 0,
              currency: currency.toLowerCase(),
              name: plan.name || "Product Unavailable",
              description:
                plan.description || "This product is currently not available.",
            }
          }

          const liveProduct = product as Stripe.Product

          return {
            ...plan,
            unit_amount: price.unit_amount || 0,
            currency: price.currency,
            name: plan.name || liveProduct.name,
            description:
              plan.description ||
              liveProduct.description ||
              "No description available.",
          }
        } catch (error) {
          console.error(
            `Error fetching price ${plan.stripeSubscriptionPriceId}:`,
            error,
          )
          return {
            ...plan,
            unit_amount: 0,
            currency: currency.toLowerCase(),
            name: plan.name || "Error Loading Product",
            description:
              plan.description || "Could not load details for this product.",
          }
        }
      }),
    )

    // Get testimonials
    const testimonials = await getApprovedTestimonialsByPage(
      "/demo/independents/purchase",
    )

    return {
      pricingPlans: enrichedPlans,
      testimonials,
      selectedCurrency: currency,
    }
  } catch (error) {
    console.error("Error loading purchase page:", error)

    return {
      pricingPlans: [],
      testimonials: getRandomTestimonials(3),
      selectedCurrency: "USD" as const,
      error: "Could not load pricing information. Please try again later.",
    }
  }
}

export const actions: Actions = {
  checkout: async ({ request, url }) => {
    const formData = await request.formData()
    const planId = formData.get("planId") as string
    const stripePriceId = formData.get("stripePriceId") as string
    const stripeOneTimePriceId = formData.get("stripeOneTimePriceId") as string
    const currency = formData.get("currency") as string

    const origin = url.origin

    console.log("Checkout request:", {
      planId,
      stripePriceId,
      stripeOneTimePriceId,
      currency,
    })

    if (!stripePriceId) {
      return {
        formError: "Missing price information. Please try again.",
        success: false,
      }
    }

    let session: Stripe.Checkout.Session
    try {
      // Validate the price exists and matches currency
      const price = await stripe.prices.retrieve(stripePriceId)

      if (currency !== "TEST" && price.currency.toUpperCase() !== currency) {
        return {
          formError: `Currency mismatch. Please select the correct currency.`,
          success: false,
        }
      }

      //   mode: 'subscription',
      //   line_items: [
      //     {
      //       price: 'price_abc',
      //       quantity: 1,
      //     },
      //   ],
      //   payment_method_collection: 'if_required',
      //   success_url: 'https://example.com/success',
      //   cancel_url: 'https://example.com/cancel',
      // Create Stripe checkout session
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_collection: "always",
        payment_method_configuration: "pmc_1RTRC6LABPmBqoeeLfXHJO8M",
        subscription_data: {
          trial_settings: {
            end_behavior: {
              missing_payment_method: "cancel",
            },
          },
          trial_period_days: 30,
        },
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
          {
            price: stripeOneTimePriceId,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        success_url: `${origin}/demo/independents/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/demo/independents/purchase?currency=${currency}`,
        metadata: {
          plan_id: planId,
          independents_purchase: "true",
        },
      })
    } catch (error) {
      console.error("Checkout error:", error)
      return {
        formError: "An error occurred during checkout. Please try again.",
        success: false,
      }
    }

    if (!session.url) {
      return {
        formError: "Failed to create checkout session. Please try again.",
        success: false,
      }
    }

    throw redirect(303, session.url)
  },
}
