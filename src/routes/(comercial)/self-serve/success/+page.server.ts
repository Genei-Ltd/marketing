import { CLERK_SECRET_KEY, STRIPE_SECRET_KEY } from "$env/static/private"
import { createClerkClient } from "@clerk/backend"
import { error as svelteKitError } from "@sveltejs/kit"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
})

// Initialize Clerk
const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY as string })

export async function load({ url }) {
  const sessionId = url.searchParams.get("session_id")

  if (!sessionId) {
    throw svelteKitError(400, "Missing session_id parameter")
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        "line_items",
        "line_items.data.price.product",
        "invoice",
        "payment_intent",
        "payment_intent.payment_method",
      ],
    })

    // Verify the payment was successful
    if (session.payment_status !== "paid") {
      throw svelteKitError(400, "Payment was not successful")
    }

    // Parse metadata
    const clerkWorkspaceId = session.metadata?.clerk_workspace_id
    const items = session.metadata?.items
      ? JSON.parse(session.metadata.items)
      : []
    const usageAdjustments = session.metadata?.usage_adjustments
      ? JSON.parse(session.metadata.usage_adjustments)
      : {}

    // Fetch workspace details from Clerk if we have a workspace ID
    let workspaceName = null
    let workspaceAvatarUrl = null
    if (clerkWorkspaceId) {
      try {
        const organization = await clerkClient.organizations.getOrganization({
          organizationId: clerkWorkspaceId,
        })
        if (organization && organization.name) {
          workspaceName = organization.name
        } else if (
          organization &&
          organization.publicMetadata &&
          (organization.publicMetadata as any).name
        ) {
          workspaceName = (organization.publicMetadata as any).name
        }
        if (organization && organization.imageUrl) {
          workspaceAvatarUrl = organization.imageUrl
        }
      } catch (clerkError: any) {
        console.warn(
          `Failed to fetch workspace details for ${clerkWorkspaceId}:`,
          clerkError.errors || clerkError.message || clerkError,
        )
        // Continue without workspace details rather than failing
      }
    }

    // Get receipt URL from payment intent if available
    let receiptUrl = null
    if (session.payment_intent && typeof session.payment_intent === "object") {
      const charges = await stripe.charges.list({
        payment_intent: session.payment_intent.id,
        limit: 1,
      })
      if (charges.data.length > 0) {
        receiptUrl = charges.data[0].receipt_url
      }
    }

    // Get invoice PDF URL if available
    let invoicePdfUrl = null
    if (session.invoice && typeof session.invoice === "object") {
      invoicePdfUrl = session.invoice.invoice_pdf
    }

    return {
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        payment_status: session.payment_status,
        created: session.created,
        payment_intent: session.payment_intent,
        receiptUrl,
        invoicePdfUrl,
      },
      lineItems: session.line_items?.data || [],
      metadata: {
        clerkWorkspaceId,
        items,
        usageAdjustments,
      },
      workspace: {
        id: clerkWorkspaceId,
        name: workspaceName,
        avatarUrl: workspaceAvatarUrl,
      },
    }
  } catch (e: any) {
    console.error("Error retrieving checkout session:", e)

    if (e.status) {
      throw e // Re-throw SvelteKit errors
    }

    throw svelteKitError(500, "Failed to retrieve payment information")
  }
}
