import { attioConnector } from "$lib/server/connectors/attio"
import {
  internalApiConnector,
  type UsageSnapshot,
} from "$lib/server/connectors/internal-api"
import {
  cancelSubscription,
  getSubscription,
} from "$lib/server/connectors/stripe"
import { fail, redirect } from "@sveltejs/kit"

import { clerkConnector } from "$lib/server/connectors/clerk"

export async function load({ url, locals }) {
  const { userId } = locals.auth()

  if (!userId) {
    return redirect(307, "/sign-in")
  }

  const user = await clerkConnector.getClient().users.getUser(userId)
  console.log("🟠 user", user)

  if (!user) {
    throw redirect(303, "/sign-in")
  }

  const memberships = await clerkConnector
    .getClient()
    .users.getOrganizationMembershipList({
      userId: userId,
    })

  console.log("🟠 memberships", memberships)

  // Get full workspace details for each membership
  const workspaces = []
  for (const membership of memberships.data) {
    try {
      const organization = await clerkConnector
        .getClient()
        .organizations.getOrganization({
          organizationId: membership.organization.id,
        })

      // Get member count for this workspace
      const membersList = await clerkConnector
        .getClient()
        .organizations.getOrganizationMembershipList({
          organizationId: membership.organization.id,
        })

      // Get usage data for this workspace
      let usage: UsageSnapshot | null = null
      try {
        usage = await internalApiConnector.getOrganizationUsage(organization.id)
      } catch (error) {
        console.error(
          `Error fetching usage data for workspace ${organization.id}:`,
          error,
        )
      }

      // Get products from Attio for this workspace
      let products: any[] = []
      try {
        const productResult = await attioConnector.queryAttio("products", {
          filter: {
            $and: [
              {
                is_trial: {
                  $eq: "Trial",
                },
              },
              {
                origin_of_purchase: {
                  $eq: "Self serve",
                },
              },
              {
                path: [
                  ["products", "associated_workspace"],
                  ["workspaces", "workspace_id"],
                ],
                constraints: {
                  $eq: organization.id,
                },
              },
            ],
          },
        })

        console.log("🟠 productResult", productResult)
        products = productResult || []

        if (productResult.length === 0) {
          console.warn(
            `Products fetch warning for workspace ${organization.id}: ${productResult.length}`,
          )
        }

        console.log(
          `Found ${products.length} products for workspace ${organization.id}`,
        )
        for (const product of products) {
          // get relevant subscription from stripe
          const stripeSubscription = await getSubscription(
            product.values.stripe_subscription_id[0].value,
          )

          product.stripeSubscription = stripeSubscription

          console.log("🟠 stripeSubscription", stripeSubscription)
        }
      } catch (error) {
        console.error(
          `Error fetching products from Attio for workspace ${organization.id}:`,
          error,
        )
      }

      workspaces.push({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        imageUrl: organization.imageUrl,
        createdAt: organization.createdAt,
        memberCount: membersList.totalCount,
        userRole: membership.role,
        publicMetadata: organization.publicMetadata,
        privateMetadata: organization.privateMetadata,
        usage,
        products,
      })
    } catch (error) {
      console.error(
        `Error fetching workspace details for ${membership.organization.id}:`,
        error,
      )
      // Add minimal info if we can't get full details
      workspaces.push({
        id: membership.organization.id,
        name: membership.organization.name || "Unknown Workspace",
        slug: membership.organization.slug,
        imageUrl: membership.organization.imageUrl,
        memberCount: 0,
        userRole: membership.role,
        error: true,
        usage: null,
        products: [],
      })
    }
  }

  //   get all workspace credits and usage limits

  try {
    const data = JSON.parse(
      JSON.stringify({
        user,
        memberships,
        workspaces,
        userId,
      }),
    )

    return data
  } catch (e) {
    console.error("Billing load error:", e)
    throw redirect(303, "/error")
  }
}

export const actions = {
  cancelTrial: async ({ request, locals }) => {
    const { userId } = locals.auth()

    if (!userId) {
      console.error("❌ Cancel trial failed: Unauthorized user")
      return fail(401, { error: "Unauthorized" })
    }

    const startTime = Date.now()
    let productId: string | undefined
    let workspaceId: string | undefined
    let stripeSubscriptionId: string | undefined

    try {
      const formData = await request.formData()
      productId = formData.get("productId")?.toString()
      workspaceId = formData.get("workspaceId")?.toString()
      stripeSubscriptionId = formData.get("stripeSubscriptionId")?.toString()

      console.log("🔄 Starting trial cancellation:", {
        userId,
        productId,
        workspaceId,
        stripeSubscriptionId,
        timestamp: new Date().toISOString(),
      })

      if (!productId) {
        console.error("❌ Cancel trial failed: Missing product ID")
        return fail(400, { error: "Product ID is required" })
      }

      if (!workspaceId) {
        console.error("❌ Cancel trial failed: Missing workspace ID")
        return fail(400, { error: "Workspace ID is required" })
      }

      if (!stripeSubscriptionId) {
        console.error("❌ Cancel trial failed: Missing Stripe subscription ID")
        return fail(400, { error: "Stripe Subscription ID is required" })
      }

      // Step 1: Cancel the Stripe subscription
      console.log("🔄 Step 1: Cancelling Stripe subscription...")
      const cancelationResponse = await cancelSubscription(stripeSubscriptionId)

      if (!cancelationResponse) {
        console.error(
          "❌ Step 1 failed: Stripe subscription cancellation failed",
          {
            stripeSubscriptionId,
            response: cancelationResponse,
          },
        )
        return fail(500, {
          error: "Failed to cancel Stripe subscription",
          details: "Stripe cancellation returned null/undefined response",
        })
      }

      console.log("✅ Step 1 complete: Stripe subscription cancelled", {
        stripeSubscriptionId,
        cancelationResponse,
      })

      // Step 2: Update product in Attio
      console.log("🔄 Step 2: Updating product in Attio...")
      const productUpdateResponse = await attioConnector.updateRecord(
        "products",
        productId,
        {
          values: {
            allowance_active_state: ["Expired"],
            actual_end_date: [new Date().toISOString().split("T")[0]],
          },
        },
      )

      if (!productUpdateResponse) {
        console.error("❌ Step 2 failed: Product update failed", {
          productId,
          response: productUpdateResponse,
        })
        return fail(500, {
          error: "Failed to update product status",
          details: "Product update returned null/undefined response",
        })
      }

      console.log("✅ Step 2 complete: Product updated in Attio", {
        productId,
        productUpdateResponse,
      })

      // Step 3: Get product details to find associated deal
      console.log("🔄 Step 3: Getting product details...")
      const product = await attioConnector.getRecord("products", productId)

      if (!product) {
        console.error("❌ Step 3 failed: Product not found", {
          productId,
        })
        return fail(500, {
          error: "Failed to retrieve product details",
          details: "Product not found in Attio",
        })
      }

      const dealId = product.values.associated_deal?.[0]?.target_record_id

      if (!dealId) {
        console.error("❌ Step 3 failed: No associated deal found", {
          productId,
          product: product.values,
        })
        return fail(500, {
          error: "Failed to find associated deal",
          details: "No associated deal found in product record",
        })
      }

      console.log("✅ Step 3 complete: Found associated deal", {
        productId,
        dealId,
      })

      // Step 4: Update deal status
      console.log("🔄 Step 4: Updating deal status...")
      const dealUpdateResponse = await attioConnector.updateRecord(
        "deals",
        dealId,
        {
          values: {
            stage: ["Closed/lost"],
          },
        },
      )

      if (!dealUpdateResponse) {
        console.error("❌ Step 4 failed: Deal update failed", {
          dealId,
          response: dealUpdateResponse,
        })
        return fail(500, {
          error: "Failed to update deal status",
          details: "Deal update returned null/undefined response",
        })
      }

      console.log("✅ Step 4 complete: Deal updated in Attio", {
        dealId,
        dealUpdateResponse,
      })

      const duration = Date.now() - startTime
      console.log("✅ Trial cancellation completed successfully", {
        userId,
        productId,
        workspaceId,
        stripeSubscriptionId,
        dealId,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        message: "Trial cancelled successfully",
        productId,
        workspaceId,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error("❌ Trial cancellation failed with exception", {
        userId,
        productId,
        workspaceId,
        stripeSubscriptionId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })

      return fail(500, {
        error: "Internal server error during trial cancellation",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  },
}
