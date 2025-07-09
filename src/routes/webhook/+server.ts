import { STRIPE_SECRET_KEY } from "$env/static/private"
import { pricingConfig, type PricingPlan } from "$lib/configs/pricing"
import { InternalApiConnector } from "$lib/server/connectors/internal-api"
import { error, json } from "@sveltejs/kit"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
})

// Initialize Internal API connector
const internalApi = new InternalApiConnector()

// Get webhook secret from environment (you'll need to add this to your .env file)
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

function findPricingPlanByPriceId(priceId: string): PricingPlan | null {
  // Search through all currencies for the matching price ID
  for (const currency of ["USD", "EUR", "GBP"] as const) {
    const plans = pricingConfig[currency]
    for (const plan of plans) {
      if (
        plan.stripeSubscriptionPriceId === priceId ||
        plan.stripeOneTimePriceId === priceId
      ) {
        return plan
      }
    }
  }
  return null
}

export async function POST({ request }) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("No Stripe signature found")
      throw error(400, "No Stripe signature found")
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured")
      throw error(500, "Webhook secret not configured")
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
      )
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      throw error(400, "Webhook signature verification failed")
    }

    console.log("Received webhook event:", event.type, event.id)

    // Handle the specific event type
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription
      const previousAttributes = event.data
        .previous_attributes as Partial<Stripe.Subscription>

      console.log("Subscription updated:", subscription.id)
      console.log("Current status:", subscription.status)
      console.log("Previous status:", previousAttributes?.status)

      // Check if subscription is newly active (transitioned from non-active to active)
      const isNewlyActive =
        subscription.status === "active" &&
        previousAttributes?.status &&
        previousAttributes.status !== "active"

      if (!isNewlyActive) {
        console.log("Subscription is not newly active, skipping processing")
        return json({ received: true, processed: false })
      }

      // Get clerk org ID from metadata
      const clerkOrgId =
        subscription.metadata.clerk_workspace_id ||
        subscription.metadata.clerk_org_id

      if (!clerkOrgId) {
        console.error("No clerk_workspace_id found in subscription metadata")
        throw error(400, "No clerk workspace ID found in subscription metadata")
      }

      console.log("Processing newly active subscription for org:", clerkOrgId)

      // Get the price ID from the subscription
      const subscriptionItem = subscription.items.data[0]
      if (!subscriptionItem) {
        console.error("No subscription items found")
        throw error(400, "No subscription items found")
      }

      const priceId = subscriptionItem.price.id
      console.log("Price ID:", priceId)

      // Find the matching pricing plan
      const pricingPlan = findPricingPlanByPriceId(priceId)
      if (!pricingPlan) {
        console.error("No pricing plan found for price ID:", priceId)
        throw error(400, `No pricing plan found for price ID: ${priceId}`)
      }

      console.log("Found pricing plan:", pricingPlan.id)

      try {
        // 1. Activate the workspace
        await internalApi.changeOrganizationAccess(clerkOrgId, true)
        console.log("Activated workspace access for org:", clerkOrgId)

        // 2. Set up usage cycle (monthly cycle starting now)
        const now = Date.now()
        await internalApi.changeOrganizationUsageCycle(clerkOrgId, {
          limitResetPeriod: "year",
          limitResetAnchor: now,
        })
        console.log("Set up usage cycle for org:", clerkOrgId)

        // 3. Update allowances based on the pricing plan
        if (pricingPlan.allowance_units) {
          await internalApi.adjustOrganizationUsage(
            clerkOrgId,
            pricingPlan.allowance_units,
          )
          console.log(
            "Updated allowances for org:",
            clerkOrgId,
            pricingPlan.allowance_units,
          )
        }

        console.log(
          "Successfully processed subscription activation for org:",
          clerkOrgId,
        )
      } catch (internalApiError) {
        console.error("Internal API error:", internalApiError)
        throw error(500, `Internal API error: ${internalApiError as string}`)
      }

      return json({
        received: true,
        processed: true,
        organizationId: clerkOrgId,
        pricingPlan: pricingPlan.id,
      })
    }

    // For other event types, just acknowledge receipt
    console.log("Unhandled event type:", event.type)
    return json({ received: true, processed: false })
  } catch (err) {
    console.error("Webhook error:", err)

    if ((err as any).status) {
      // Re-throw SvelteKit errors
      throw err
    }

    // Handle unexpected errors
    throw error(500, "Internal server error")
  }
}
