import { STRIPE_SECRET_KEY } from "$env/static/private"
import { logoFileSchema, workspaceSchema } from "$lib/schemas/workspace"
import { attioConnector } from "$lib/server/connectors/attio"
import { clerkConnector } from "$lib/server/connectors/clerk"
import { internalApiConnector } from "$lib/server/connectors/internal-api"
import { notionConnector } from "$lib/server/connectors/notion"
import { error, fail } from "@sveltejs/kit"
import Stripe from "stripe"
import { superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import type { Actions, PageServerLoad } from "./$types"

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
})

// Constants
const STRIPE_EXPAND_PARAMS = [
  "payment_intent",
  "payment_intent.charges",
  "subscription",
  "subscription.latest_invoice",
  "subscription.latest_invoice.charge",
  "line_items",
  "line_items.data.price.product",
  "total_details.breakdown.discounts",
]

interface PaymentInfo {
  receiptUrl: string | null
  chargeId: string | null
  paymentDate: string | null
}

interface ProductInfo {
  productName: string | null
  productDescription: string | null
  unitPrice: number
  quantity: number
  subtotalAmount: number
}

interface DiscountInfo {
  discountCode: string | null
  discountDescription: string | null
  discountAmount: number
  totalDiscountAmount: number
}

interface SubscriptionInfo {
  subscriptionStatus: string | null
  subscriptionId: string | null
  invoiceUrl: string | null
  invoiceId: string | null
  invoiceReceiptUrl: string | null
  receiptNumber: string | null
  subscriptionStartDate: string | null
  subscriptionCurrentPeriodEnd: string | null
}

async function updateStripeSubscriptionWithClerkOrgId(
  subscriptionId: string,
  clerkOrgId: string,
) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    metadata: { clerk_org_id: clerkOrgId },
  })
}

/**
 * Extracts payment information from Stripe session
 */
async function extractPaymentInfo(
  session: Stripe.Checkout.Session,
): Promise<PaymentInfo> {
  let receiptUrl: string | null = null
  let chargeId: string | null = null
  let paymentDate: string | null = null

  // For one-time payments, get receipt from payment intent charges
  if (session.payment_intent && typeof session.payment_intent === "object") {
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent & {
      charges?: Stripe.ApiList<Stripe.Charge>
    }

    const charge = paymentIntent.charges?.data?.[0]
    if (charge) {
      receiptUrl = charge.receipt_url
      chargeId = charge.id
      paymentDate = new Date(charge.created * 1000).toISOString()
    }
  }

  return { receiptUrl, chargeId, paymentDate }
}

/**
 * Extracts product information from line items
 */
function extractProductInfo(session: Stripe.Checkout.Session): ProductInfo {
  let productName: string | null = null
  let productDescription: string | null = null
  let unitPrice = 0
  let quantity = 1

  const lineItem = session.line_items?.data?.[0]
  if (lineItem) {
    quantity = lineItem.quantity || 1
    unitPrice = lineItem.price?.unit_amount || 0

    if (lineItem.price && typeof lineItem.price.product === "object") {
      const product = lineItem.price.product as Stripe.Product
      productName = product.name
      productDescription = product.description
    }
  }

  const subtotalAmount = unitPrice * quantity

  return {
    productName,
    productDescription,
    unitPrice,
    quantity,
    subtotalAmount,
  }
}

/**
 * Extracts discount information from session
 */
async function extractDiscountInfo(
  session: Stripe.Checkout.Session,
): Promise<DiscountInfo> {
  let discountCode: string | null = null
  let discountDescription: string | null = null
  let discountAmount = 0

  const totalDiscountAmount = session.total_details?.amount_discount || 0
  const discount = session.total_details?.breakdown?.discounts?.[0]

  if (discount?.discount && typeof discount.discount === "object") {
    const stripeDiscount = discount.discount as Stripe.Discount
    discountAmount = discount.amount

    // Get promotion code if available
    if (stripeDiscount.promotion_code) {
      try {
        if (typeof stripeDiscount.promotion_code === "string") {
          const promotionCode = await stripe.promotionCodes.retrieve(
            stripeDiscount.promotion_code,
          )
          discountCode = promotionCode.code
        } else if (typeof stripeDiscount.promotion_code === "object") {
          const promoCode =
            stripeDiscount.promotion_code as Stripe.PromotionCode
          discountCode = promoCode.code
        }
      } catch (promoError) {
        console.warn("Failed to retrieve promotion code:", promoError)
      }
    }
  }

  return {
    discountCode,
    discountDescription,
    discountAmount,
    totalDiscountAmount,
  }
}

/**
 * Extracts subscription information from session
 */
async function extractSubscriptionInfo(
  session: Stripe.Checkout.Session,
  fallbackPaymentInfo: PaymentInfo,
): Promise<{
  subscriptionInfo: SubscriptionInfo
  updatedPaymentInfo: PaymentInfo
}> {
  let subscriptionStatus: string | null = null
  let subscriptionId: string | null = null
  let invoiceUrl: string | null = null
  let invoiceId: string | null = null
  let invoiceReceiptUrl: string | null = null
  let receiptNumber: string | null = null
  let subscriptionStartDate: string | null = null
  let subscriptionCurrentPeriodEnd: string | null = null

  let updatedPaymentInfo = { ...fallbackPaymentInfo }

  if (session.subscription && typeof session.subscription === "object") {
    const subscription = session.subscription as Stripe.Subscription & {
      latest_invoice?: Stripe.Invoice & {
        charge?: Stripe.Charge | string
      }
    }

    subscriptionStatus = subscription.status
    subscriptionId = subscription.id
    subscriptionStartDate = new Date(
      subscription.current_period_start * 1000,
    ).toISOString()
    subscriptionCurrentPeriodEnd = new Date(
      subscription.current_period_end * 1000,
    ).toISOString()

    // Process invoice information
    const invoice = subscription.latest_invoice
    if (invoice && typeof invoice === "object") {
      invoiceUrl = invoice.hosted_invoice_url ?? null
      invoiceId = invoice.id
      invoiceReceiptUrl = invoice.hosted_invoice_url ?? null
      receiptNumber = invoice.receipt_number ?? null

      // Use invoice creation date if no payment date from charge
      if (!updatedPaymentInfo.paymentDate && invoice.created) {
        updatedPaymentInfo.paymentDate = new Date(
          invoice.created * 1000,
        ).toISOString()
      }

      // Handle charge information
      await handleInvoiceCharge(invoice, updatedPaymentInfo)
    }
  }

  return {
    subscriptionInfo: {
      subscriptionStatus,
      subscriptionId,
      invoiceUrl,
      invoiceId,
      invoiceReceiptUrl,
      receiptNumber,
      subscriptionStartDate,
      subscriptionCurrentPeriodEnd,
    },
    updatedPaymentInfo,
  }
}

/**
 * Handles charge information from invoice
 */
async function handleInvoiceCharge(
  invoice: Stripe.Invoice & { charge?: Stripe.Charge | string },
  paymentInfo: PaymentInfo,
): Promise<void> {
  if (!invoice.charge) return

  if (typeof invoice.charge === "object") {
    const charge = invoice.charge as Stripe.Charge
    if (!paymentInfo.receiptUrl) {
      paymentInfo.receiptUrl = charge.receipt_url || null
      paymentInfo.chargeId = charge.id
    }
    if (!paymentInfo.paymentDate) {
      paymentInfo.paymentDate = new Date(charge.created * 1000).toISOString()
    }
  } else if (typeof invoice.charge === "string") {
    // If charge is just an ID, fetch it to get the receipt URL
    try {
      const charge = await stripe.charges.retrieve(invoice.charge)
      if (!paymentInfo.receiptUrl) {
        paymentInfo.receiptUrl = charge.receipt_url || null
        paymentInfo.chargeId = charge.id
      }
      if (!paymentInfo.paymentDate) {
        paymentInfo.paymentDate = new Date(charge.created * 1000).toISOString()
      }
    } catch (chargeError) {
      console.warn("Failed to retrieve charge for receipt URL:", chargeError)
    }
  }
}

// Validate image file (for file uploads)
function validateImageFile(file: File): { isValid: boolean; error?: string } {
  try {
    logoFileSchema.parse({ size: file.size, type: file.type })
    return { isValid: true }
  } catch (err) {
    console.error("Error validating image file:", err)
    return {
      isValid: false,
      error: err instanceof Error ? err.message : "Invalid file",
    }
  }
}

export const load: PageServerLoad = async ({ url }) => {
  const sessionId = url.searchParams.get("session_id")

  if (!sessionId) {
    throw error(400, "Session ID is required")
  }

  try {
    // Fetch Notion content for onboarding
    const pageId = "21b6a3daa35a807d92f6d2ca0de9a936" // Placeholder onboarding page
    const onboardingBlocks =
      await notionConnector.getPageBlocksWithChildren(pageId)

    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: STRIPE_EXPAND_PARAMS,
    })

    // Extract all information in parallel where possible
    const [paymentInfo, productInfo, discountInfo] = await Promise.all([
      extractPaymentInfo(session),
      Promise.resolve(extractProductInfo(session)),
      extractDiscountInfo(session),
    ])

    // Extract subscription info (needs to be sequential due to payment info dependency)
    const { subscriptionInfo, updatedPaymentInfo } =
      await extractSubscriptionInfo(session, paymentInfo)

    // Use session creation date as final fallback for payment date
    const finalPaymentDate =
      updatedPaymentInfo.paymentDate ||
      new Date(session.created * 1000).toISOString()

    // Initialize Superforms with default values
    const form = await superValidate(
      {
        adminEmail: session.customer_details?.email || "",
        name: "",
        adminName: "",
        members: [],
      },
      zod(workspaceSchema),
    )

    return {
      form,
      onboardingBlocks,
      sessionData: {
        // Session basics
        id: session.id,
        amount_total: session.amount_total,
        amount_subtotal: session.amount_subtotal,
        currency: session.currency,
        status: session.status,
        mode: session.mode,
        customer_email: session.customer_details?.email,
        payment_date: finalPaymentDate,

        // Payment info
        receipt_url: updatedPaymentInfo.receiptUrl,
        charge_id: updatedPaymentInfo.chargeId,
        payment_method_details: session.payment_method_types[0],
        // Product info
        product_name: productInfo.productName,
        product_description: productInfo.productDescription,
        unit_price: productInfo.unitPrice,
        quantity: productInfo.quantity,
        subtotal_amount: productInfo.subtotalAmount,

        // Discount info
        discount_amount: discountInfo.discountAmount,
        discount_code: discountInfo.discountCode,
        discount_description: discountInfo.discountDescription,
        total_discount_amount: discountInfo.totalDiscountAmount,
        total_amount: session.amount_total || 0,

        // Subscription info
        subscription_status: subscriptionInfo.subscriptionStatus,
        subscription_id: subscriptionInfo.subscriptionId,
        subscription_start_date: subscriptionInfo.subscriptionStartDate,
        subscription_current_period_end:
          subscriptionInfo.subscriptionCurrentPeriodEnd,
        invoice_url: subscriptionInfo.invoiceUrl,
        invoice_id: subscriptionInfo.invoiceId,
        invoice_receipt_url: subscriptionInfo.invoiceReceiptUrl,
        receipt_number: subscriptionInfo.receiptNumber,
      },
    }
  } catch (err) {
    console.error("Error retrieving checkout session:", err)

    // Provide more specific error messages based on error type
    if (err instanceof Stripe.errors.StripeError) {
      if (err.code === "resource_missing") {
        throw error(404, "Checkout session not found")
      }
      throw error(400, `Stripe error: ${err.message}`)
    }

    throw error(500, "Failed to retrieve session information")
  }
}

export const actions: Actions = {
  createWorkspace: async ({ request }) => {
    const formData = await request.formData()
    const logoFile = formData.get("logo") as File | null
    console.log("formData", formData)

    // Extract and validate the main form data
    const form = await superValidate(formData, zod(workspaceSchema))

    // Handle file upload separately
    let logoError: string | undefined

    if (logoFile && logoFile.size > 0) {
      const fileValidation = validateImageFile(logoFile)
      if (!fileValidation.isValid) {
        logoError = fileValidation.error
      }
    }

    // Return validation errors if any
    if (!form.valid || logoError) {
      return fail(400, {
        form,
        logoError,
        message: {
          error: "Please fix the errors and try again.",
        },
      })
    }

    const { name, adminEmail, adminName, members, pageData } = form.data

    const parsedPageData = JSON.parse(form.data.pageData)
    try {
      // Create workspace in Clerk
      const organization = await clerkConnector.createWorkspace({
        name,
        maxAllowedMemberships: 100,
        publicMetadata: {
          createdFrom: "self-serve",
        },
      })

      // Upload logo if provided
      console.log("logoFile", logoFile)
      console.log("logoFile size", logoFile?.size)
      if (logoFile && logoFile.size > 0) {
        console.log("uploading logo")
        try {
          await clerkConnector.uploadWorkspaceLogo(organization.id, logoFile)
          console.log(
            "Logo uploaded successfully for organization:",
            organization.id,
          )
        } catch (logoUploadError) {
          console.error("Error uploading logo:", logoUploadError)
          // Don't fail the entire process for logo upload issues
        }
      }

      // Create invitations for all members including admin
      const invitationsToCreate = []

      // Add admin invitation
      if (adminEmail) {
        invitationsToCreate.push({
          emailAddress: adminEmail,
          role: "admin" as const,
        })
      }

      console.log("members", members)
      // Add member invitations
      if (members && members.length > 0) {
        for (const member of members) {
          invitationsToCreate.push({
            emailAddress: member.email,
            role: member.role,
          })
        }
      } else {
        console.log("no members to invite")
      }

      // Send invitations
      if (invitationsToCreate.length > 0) {
        try {
          console.log("invitationsToCreate", invitationsToCreate)
          const invitationResults = await clerkConnector.bulkInviteToWorkspace(
            organization.id,
            invitationsToCreate,
          )

          const successfulInvitations = invitationResults.filter(
            (r) => r.success,
          )
          const failedInvitations = invitationResults.filter((r) => !r.success)

          console.log(
            `Successfully sent ${successfulInvitations.length} invitations`,
            successfulInvitations,
          )
          if (failedInvitations.length > 0) {
            console.error(
              `Failed to send ${failedInvitations.length} invitations:`,
              failedInvitations,
            )
          }
        } catch (invitationError) {
          console.error("Error sending workspace invitations:", invitationError)
          // Don't fail the entire process for invitation issues
        }
      }

      // Create record in Attio for tracking
      try {
        // const attioWorkspaceSearchResult = await attioConnector.listRecords(
        //   "workspaces",
        //   {
        //     filter: {
        //       workspace_id: {
        //         $eq: organization.id,
        //       },
        //     },
        //     limit: 1,
        //   },
        // )

        // console.log("attioWorkspaceSearchResult", attioWorkspaceSearchResult)

        // if (attioWorkspaceSearchResult.data.length === 0) {
        //   throw new Error(
        //     `Could not find workspace in Attio with id: ${organization.id}`,
        //   )
        // }
        // const attioWorkspace = attioWorkspaceSearchResult.data[0]

        // const attioInvoiceSearchResult = await attioConnector.listRecords(
        //   "invoices",
        //   {
        //     filter: {
        //       stripe_invoice_id: {
        //         $eq: parsedPageData.invoice_id,
        //       },
        //     },
        //     limit: 1,
        //   },
        // )

        // console.log("attioInvoiceSearchResult", attioInvoiceSearchResult)

        // if (attioInvoiceSearchResult.data.length === 0) {
        //   throw new Error(
        //     `Could not find workspace in Attio with id: ${organization.id}`,
        //   )
        // }

        // const attioInvoice = attioInvoiceSearchResult.data[0]
        // console.log("attioInvoice", attioInvoice)

        // Create Company in Attio
        const attioCompany = await attioConnector.createRecord("companies", {
          values: {
            name: name,
            team: [adminEmail],
          },
        })
        console.log("attioCompany", attioCompany)

        // Create workspace in Attio
        const attioWorkspace = await attioConnector.createRecord("workspaces", {
          values: {
            company: [
              {
                target_record_id: attioCompany.id.record_id,
                target_object: "companies",
              },
            ],
            workspace_id: organization.id,
            name: name,
            access_granted: ["Granted"],
            reset_limits_every: "Month",
            limit_reset_date: new Date().toISOString(),
          },
        })
        console.log("attioWorkspace", attioWorkspace)

        // Create a deal for that company
        const attioDeal = await attioConnector.createRecord("deals", {
          values: {
            associated_company: [
              {
                target_record_id: attioCompany.id.record_id,
                target_object: "companies",
              },
            ],
            name: `${name} Deal`,
            stage: "Active trial",
            duration_months: 1,
            amount: parsedPageData.amount_total,
            owner: "support@coloop.ai",
          },
        })
        console.log("attioDeal", attioDeal)

        // Create a trial product for that deal
        const attioTrialProduct = await attioConnector.createRecord(
          "products",
          {
            values: {
              name: `${name} Trial`,
              associated_deal: [
                {
                  target_record_id: attioDeal.id.record_id,
                  target_object: "deals",
                },
              ],
              origin_of_purchase: ["Self serve"],
              start_date: parsedPageData.payment_date,
              duration_months: 12,
              is_trial: ["Trial"], //purchase type
              stripe_subscription_id: parsedPageData.subscription_id,
            },
          },
        )
        console.log("attioTrialProduct", attioTrialProduct)

        const attioFullProduct = await attioConnector.createRecord("products", {
          values: {
            currency_type: [parsedPageData.currency.toString().toUpperCase()], //currency
            is_trial: ["Full"], //purchase type
            revenue_type: ["New"], //customer type
            associated_deal: [
              {
                target_record_id: attioDeal.id.record_id,
                target_object: "deals",
              },
            ],
            associated_workspace: [
              {
                target_record_id: attioWorkspace.id.record_id,
                target_object: "workspaces",
              },
            ],
            associated_invoices: [
              {
                stripe_invoice_id: [{ value: parsedPageData.invoice_id }],
                target_object: "invoices",
              },
            ],
            origin_of_purchase: ["Self serve"],
            start_date: parsedPageData.payment_date,
            duration_months: 12,
          },
        })
        console.log("attioFullProduct", attioFullProduct)
      } catch (error) {
        console.error("Error creating Attio record:", error) // Don't fail the process for Attio tracking
      }

      try {
        if (parsedPageData.subscription_id) {
          await updateStripeSubscriptionWithClerkOrgId(
            parsedPageData.subscription_id,
            organization.id,
          )
        } else {
          console.error(
            "No subscription ID found in parsedPageData, when adding clerk org id to stripe subscription",
          )
        }
      } catch (error) {
        console.error(
          "Error updating Stripe subscription with clerk org id:",
          error,
        )
      }

      await internalApiConnector.changeOrganizationLimits(organization.id, {
        projectLimit: { reset: -1 },
        chatMessageLimit: { reset: -1 },
        gridQuestionLimit: { reset: -1 },
        transcriptionLimit: { reset: -1 },
        translationLimit: { reset: -1 },
      })

      await internalApiConnector.changeOrganizationUsageCycle(organization.id, {
        limitResetPeriod: "month",
        limitResetAnchor: new Date().getTime(),
      })

      await internalApiConnector.changeOrganizationAccess(organization.id, true)

      // Success response - use message for Superforms
      return {
        form,
        message: {
          success: true,
          workspaceId: organization.id,
        },
      }
    } catch (err) {
      console.error("Workspace creation error:", err)
      return fail(500, {
        form,
        error: "Failed to create workspace. Please try again.",
      })
    }
  },
}
