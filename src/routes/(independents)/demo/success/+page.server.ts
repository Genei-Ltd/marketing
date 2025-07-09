import { STRIPE_SECRET_KEY } from "$env/static/private"
import Stripe from "stripe"
import type { PageServerLoad } from "./$types"

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
})

export const load: PageServerLoad = async ({ url }) => {
  const sessionId = url.searchParams.get("session_id")

  if (!sessionId) {
    return {
      success: false,
      error: "No session ID provided",
    }
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    })

    // Extract purchase details
    const lineItems = session.line_items?.data || []
    const planId = session.metadata?.plan_id
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null

    return {
      success: true,
      sessionId,
      planId,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: paymentIntent?.status,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount_total: item.amount_total,
      })),
    }
  } catch (error) {
    console.error("Error retrieving Stripe session:", error)
    return {
      success: false,
      error: "Could not retrieve payment information",
    }
  }
}
