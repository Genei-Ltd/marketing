import {
  CLERK_SECRET_KEY,
  NODE_ENV,
  STRIPE_SECRET_KEY,
} from "$env/static/private"
import { createClerkClient } from "@clerk/backend"
import { redirect, error as svelteKitError } from "@sveltejs/kit"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16", // Specify a Stripe API version
})

// Initialize Clerk
// Ensure CLERK_SECRET_KEY is in your .env file or environment variables
if (!CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is not set in environment variables.")
  // Optionally, throw an error or handle appropriately
  // For now, we will let it potentially fail at createClerkClient if not set,
  // or you could default to a less functional mode or throw:
  // throw new Error("Server configuration error: CLERK_SECRET_KEY is missing.")
}
const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY as string })

// Configuration for items - REPLACE with your actual Stripe Price IDs
interface ItemConfig {
  id: string // Internal ID, can be same as stripePriceId or a slug
  stripePriceId: string
  icon: string // Icon name for the item
  badge?: string // Optional badge text (e.g., "POPULAR", "BEST VALUE")
  benefits?: string[] // Optional list of benefits/features
  footer?: string // Optional footer text
  allowance_units: UsageAdjustments
}

export type UsageAdjustments = {
  projectUsage?: { delta: number; direction: "increment" }
  chatMessageUsage?: { delta: number; direction: "increment" }
  gridQuestionUsage?: { delta: number; direction: "increment" }
  transcriptionUsage?: { delta: number; direction: "increment" }
  translationUsage?: { delta: number; direction: "increment" }
  openEndLabelUsage?: { delta: number; direction: "increment" }
}

// {
//     "projectUsage":        UsageAdjustment?,
//     "chatMessageUsage":    UsageAdjustment?,
//     "gridQuestionUsage":   UsageAdjustment?,
//     "transcriptionUsage":  UsageAdjustment?,
//     "translationUsage":    UsageAdjustment?
// }

const isTestMode = NODE_ENV === "development"

const testItemConfigs: ItemConfig[] = [
  {
    id: "test-pack",
    stripePriceId: "price_1RTRUtLABPmBqoeefGzHwfNj",
    icon: "IconTestPipe",
    badge: "* TEST PRODUCT *",
    footer: `This is a FAKE item, for testing purposes ONLY.`,
    allowance_units: {
      projectUsage: { delta: 7, direction: "increment" },
      chatMessageUsage: { delta: 200, direction: "increment" },
      gridQuestionUsage: { delta: 30, direction: "increment" },
      transcriptionUsage: { delta: 40, direction: "increment" },
      translationUsage: { delta: 60, direction: "increment" },
      openEndLabelUsage: { delta: 1284, direction: "increment" },
    },
  },
]

const USDitemConfigs: ItemConfig[] = [
  {
    id: "project-pack",
    stripePriceId: "price_1RT5Q6LABPmBqoee2ViiMm74",
    icon: "IconClipboard",
    badge: "RECOMMENDED",
    benefits: [
      "50 Translation Hours",
      "50 Transcription Hours",
      "100 Analysis Grid Questions",
      "100 Chat Messages",
    ],
    allowance_units: {
      projectUsage: { delta: 1, direction: "increment" },
      chatMessageUsage: { delta: 100, direction: "increment" },
      gridQuestionUsage: { delta: 100, direction: "increment" },
      transcriptionUsage: { delta: 50, direction: "increment" },
      translationUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "grid-pack",
    stripePriceId: "price_1RVuz0LABPmBqoeehXE0alsc",
    icon: "IconGrid4x4",
    benefits: ["50 Analysis Grid Questions"],
    allowance_units: {
      gridQuestionUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "chat-pack",
    stripePriceId: "price_1RThu7LABPmBqoeezPfzTqen",
    icon: "IconMessageCircle",
    benefits: ["50 Chat Messages"],
    allowance_units: {
      chatMessageUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "translation-pack",
    stripePriceId: "price_1RThspLABPmBqoeeZwsupCxq",
    icon: "IconLanguage",
    benefits: ["50 Translation Hours", "Multi-language support"],
    allowance_units: {
      translationUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "transcription-pack",
    stripePriceId: "price_1RThruLABPmBqoee250LlVSG",
    icon: "IconMicrophone",
    benefits: ["50 Transcription Hours"],
    allowance_units: {
      transcriptionUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "open-ends-pack-small",
    stripePriceId: "price_1RWEK8LABPmBqoee7CGL3u4N",
    icon: "IconMessages",
    benefits: [
      "Nuanced Themes",
      "Works on Chatbot Data",
      "Simple export to SAV, SPSS Format",
      "Al Summaries",
    ],
    allowance_units: {
      openEndLabelUsage: { delta: 1000, direction: "increment" },
    },
    footer: `Need more than 200,000 credits? 
      Contact sales@coloop.ai for bulk pricing.`,
  },
  {
    id: "open-ends-pack-large",
    stripePriceId: "price_1RTi7bLABPmBqoeeI0EcflyM",
    icon: "IconMessages",
    benefits: [
      "Nuanced Themes",
      "Works on Chatbot Data",
      "Simple export to SAV, SPSS Format",
      "Al Summaries",
    ],
    allowance_units: {
      openEndLabelUsage: { delta: 10000, direction: "increment" },
    },
    footer: `Need more than 200,000 credits? 
      Contact sales@coloop.ai for bulk pricing.`,
  },
]
const EURitemConfigs: ItemConfig[] = [
  {
    id: "project-pack",
    stripePriceId: "price_1RVum8LABPmBqoeeEqpvA34k",
    icon: "IconClipboard",
    badge: "RECOMMENDED",
    benefits: [
      "50 Translation Hours",
      "50 Transcription Hours",
      "100 Analysis Grid Questions",
      "100 Chat Messages",
    ],
    allowance_units: {
      projectUsage: { delta: 1, direction: "increment" },
      chatMessageUsage: { delta: 100, direction: "increment" },
      gridQuestionUsage: { delta: 100, direction: "increment" },
      transcriptionUsage: { delta: 50, direction: "increment" },
      translationUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "grid-pack",
    stripePriceId: "price_1RVuznLABPmBqoeewfywXCZh",
    icon: "IconGrid4x4",
    benefits: ["50 Analysis Grid Questions"],
    allowance_units: {
      gridQuestionUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "chat-pack",
    stripePriceId: "price_1RVuxQLABPmBqoeevapNn8PR",
    icon: "IconMessageCircle",
    benefits: ["50 Chat Messages"],
    allowance_units: {
      chatMessageUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "translation-pack",
    stripePriceId: "price_1RVupELABPmBqoeeZpRR74as",
    icon: "IconLanguage",
    benefits: ["50 Translation Hours", "Multi-language support"],
    allowance_units: {
      translationUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "transcription-pack",
    stripePriceId: "price_1RVurkLABPmBqoee735qnMk2",
    icon: "IconMicrophone",
    benefits: ["50 Transcription Hours"],
    allowance_units: {
      transcriptionUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "open-ends-pack-small",
    stripePriceId: "price_1RWEL3LABPmBqoeeRYFcKdsI",
    icon: "IconMessages",
    benefits: [
      "Nuanced Themes",
      "Works on Chatbot Data",
      "Simple export to SAV, SPSS Format",
      "Al Summaries",
    ],
    allowance_units: {
      openEndLabelUsage: { delta: 1000, direction: "increment" },
    },
    footer: `Need more than 200,000 credits? 
      Contact sales@coloop.ai for bulk pricing.`,
  },
  {
    id: "open-ends-pack-large",
    stripePriceId: "price_1RVutELABPmBqoeenYOEVn7y",
    icon: "IconMessages",
    benefits: [
      "Nuanced Themes",
      "Works on Chatbot Data",
      "Simple export to SAV, SPSS Format",
      "Al Summaries",
    ],
    allowance_units: {
      openEndLabelUsage: { delta: 10000, direction: "increment" },
    },
    footer: `Need more than 200,000 credits? 
      Contact sales@coloop.ai for bulk pricing.`,
  },
]
const GBPitemConfigs: ItemConfig[] = [
  {
    id: "project-pack",
    stripePriceId: "price_1RVulVLABPmBqoeeieDAeWmZ",
    icon: "IconClipboard",
    badge: "RECOMMENDED",
    benefits: [
      "50 Translation Hours",
      "50 Transcription Hours",
      "100 Analysis Grid Questions",
      "100 Chat Messages",
    ],
    allowance_units: {
      projectUsage: { delta: 1, direction: "increment" },
      chatMessageUsage: { delta: 100, direction: "increment" },
      gridQuestionUsage: { delta: 100, direction: "increment" },
      transcriptionUsage: { delta: 50, direction: "increment" },
      translationUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "grid-pack",
    stripePriceId: "price_1RVuzaLABPmBqoeerASWsURU",
    icon: "IconGrid4x4",
    benefits: ["50 Analysis Grid Questions"],
    allowance_units: {
      gridQuestionUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "chat-pack",
    stripePriceId: "price_1RVux9LABPmBqoee1UAAxnmN",
    icon: "IconMessageCircle",
    benefits: ["50 Chat Messages"],
    allowance_units: {
      chatMessageUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "translation-pack",
    stripePriceId: "price_1RVupTLABPmBqoeeedSjMTNk",
    icon: "IconLanguage",
    benefits: ["50 Translation Hours", "Multi-language support"],
    allowance_units: {
      translationUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "transcription-pack",
    stripePriceId: "price_1RVurRLABPmBqoeeezXFS2Qn",
    icon: "IconMicrophone",
    benefits: ["50 Transcription Hours"],
    allowance_units: {
      transcriptionUsage: { delta: 50, direction: "increment" },
    },
  },
  {
    id: "open-ends-pack-small",
    stripePriceId: "price_1RWEKfLABPmBqoeeHMd1Tmgo",
    icon: "IconMessages",
    benefits: [
      "Nuanced Themes",
      "Works on Chatbot Data",
      "Simple export to SAV, SPSS Format",
      "Al Summaries",
    ],
    allowance_units: {
      openEndLabelUsage: { delta: 1000, direction: "increment" },
    },
    footer: `Need more than 200,000 credits? 
      Contact sales@coloop.ai for bulk pricing.`,
  },
  {
    id: "open-ends-pack-large",
    stripePriceId: "price_1RVuswLABPmBqoeelIq4h7Du",
    icon: "IconMessages",
    benefits: [
      "Nuanced Themes",
      "Works on Chatbot Data",
      "Simple export to SAV, SPSS Format",
      "Al Summaries",
    ],
    allowance_units: {
      openEndLabelUsage: { delta: 10000, direction: "increment" },
    },
    footer: `Need more than 200,000 credits? 
      Contact sales@coloop.ai for bulk pricing.`,
  },
]

function getItemConfigs(currency: "USD" | "EUR" | "GBP"): ItemConfig[] {
  if (currency === "USD") {
    return USDitemConfigs
  }
  if (currency === "EUR") {
    return EURitemConfigs
  }
  if (currency === "GBP") {
    return GBPitemConfigs
  }
  if (currency === "TEST") {
    return testItemConfigs
  }
  return USDitemConfigs
}

export async function load({ url, locals }) {
  const id = url.searchParams.get("id")

  if (!id) {
    const { userId } = locals.auth()
    if (!userId) {
      // Not signed in, redirect to sign-in page.
      throw redirect(303, "/sign-in")
    }

    try {
      const memberships = await clerkClient.users.getOrganizationMembershipList(
        { userId },
      )
      const workspaces = memberships.data.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        imageUrl: membership.organization.imageUrl,
      }))

      return {
        workspaces,
        items: [],
        id: null,
        workspaceName: null,
        workspaceAvatarUrl: null,
      }
    } catch (clerkError: any) {
      console.warn(
        `Failed to fetch workspaces for user ${userId}:`,
        clerkError.errors || clerkError.message || clerkError,
      )
      return {
        error: "Could not fetch your workspaces.",
        workspaces: [],
        items: [],
        id: null,
        workspaceName: null,
        workspaceAvatarUrl: null,
      }
    }
  }

  let currency: "USD" | "EUR" | "GBP" =
    (url.searchParams.get("currency") as "USD" | "EUR" | "GBP") || "USD"
  if (
    currency !== "USD" &&
    currency !== "EUR" &&
    currency !== "GBP" &&
    currency !== "TEST"
  ) {
    currency = "USD"
  }
  let workspaceName = "Unknown Workspace" // Default workspace name
  let workspaceAvatarUrl: string | null = null // Variable to store avatar URL

  //   if (!id && !userId) {
  //     // Using svelteKitError for a more standard error handling approach
  //     // throw svelteKitError(400, 'Clerk Workspace ID is required.');
  //     // Returning an error state for the page to handle, consistent with original approach
  //     return {
  //       error: "Clerk Workspace ID is required.",
  //       items: [],
  //       id: null,
  //       workspaceName,
  //       workspaceAvatarUrl,
  //     }
  //   }

  try {
    // Fetch workspace details from Clerk
    try {
      const organization = await clerkClient.organizations.getOrganization({
        organizationId: id,
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
      // you might also want to check organization.slug or other fields
    } catch (clerkError: any) {
      console.warn(
        `Failed to fetch workspace details for ${id}:`,
        clerkError.errors || clerkError.message || clerkError,
      )
      // Decide if this is a critical error. For now, we'll proceed with a default name.
      // If workspace must be validated, you might want to return an error here:
      return {
        error: "Could not validate Clerk Workspace ID.",
        items: [],
        id,
        workspaceName: null,
        workspaceAvatarUrl: null,
        workspaces: null,
      }
    }

    const itemsDetails = await Promise.all(
      getItemConfigs(currency).map(async (config) => {
        try {
          const price = await stripe.prices.retrieve(config.stripePriceId, {
            expand: ["product"],
          })
          // Product can be a Stripe.Product or Stripe.DeletedProduct if it was deleted.
          const product = price.product as
            | Stripe.Product
            | Stripe.DeletedProduct

          if (!product || ("deleted" in product && product.deleted)) {
            console.warn(
              `Product not found or deleted for price ID: ${config.stripePriceId}`,
            )
            return {
              id: config.id,
              stripePriceId: config.stripePriceId,
              name: "Product Unavailable",
              description: "This product is currently not available.",
              unit_amount: 0,
              currency: "usd", // Default currency
              icon: config.icon,
              badge: config.badge,
              benefits: config.benefits,
              error: "Product details could not be fetched.",
              footer: config.footer,
              allowance_units: config.allowance_units,
            }
          }
          // If product is not deleted, it's a Stripe.Product
          const liveProduct = product as Stripe.Product

          return {
            id: config.id, // Use your internal ID
            stripePriceId: price.id,
            name: liveProduct.name,
            description: liveProduct.description || "No description available.",
            unit_amount: price.unit_amount || 0,
            currency: price.currency,
            icon: config.icon,
            badge: config.badge,
            benefits: config.benefits,
            footer: config.footer,
            allowance_units: config.allowance_units,
          }
        } catch (e) {
          console.error(`Error fetching price ${config.stripePriceId}:`, e)
          return {
            id: config.id,
            stripePriceId: config.stripePriceId,
            name: "Error Loading Product",
            description: "Could not load details for this product.",
            unit_amount: 0,
            currency: "usd",
            icon: config.icon,
            badge: config.badge,
            benefits: config.benefits,
            error: "Failed to fetch product details.",
            footer: config.footer,
            allowance_units: config.allowance_units,
          }
        }
      }),
    )

    return {
      items: itemsDetails,
      id,
      workspaceName,
      workspaceAvatarUrl,
      workspaces: null,
    }
  } catch (e) {
    console.error("Error loading product details for self-serve page:", e)
    // throw svelteKitError(500, 'Could not load product information from Stripe.');
    return {
      error: "Could not load product information from Stripe.",
      items: [],
      id,
      workspaceName,
      workspaceAvatarUrl: null,
      workspaces: null,
    }
  }
}

export const actions = {
  checkout: async ({ request, url }: { request: Request; url: URL }) => {
    const formData = await request.formData()
    const id = formData.get("id") as string
    const usage_adjustments_json = formData.get("usage_adjustments") as string
    const origin = url.origin

    console.log("formData", formData)
    console.log("usage_adjustments_json", usage_adjustments_json)

    let usage_adjustments = {}
    try {
      usage_adjustments = usage_adjustments_json
        ? JSON.parse(usage_adjustments_json)
        : {}
    } catch (e) {
      console.error("Failed to parse usage_adjustments:", e)
      usage_adjustments = {}
    }

    console.log("Parsed usage_adjustments:", usage_adjustments)

    if (!id) {
      // SvelteKit actions should return data that can be used by the page,
      // or throw an error/redirect.
      // Returning a specific shape for form errors is common.
      return { formError: "Clerk Workspace ID is missing.", success: false }
    }

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    const currency = formData.get("currency") as "USD" | "EUR" | "GBP" | "TEST"
    console.log("Checkout currency:", currency)

    // Validate currency and default to USD if invalid
    const validCurrency = ["USD", "EUR", "GBP", "TEST"].includes(currency)
      ? currency
      : "USD"
    console.log("Valid currency:", validCurrency)

    const itemConfigs = getItemConfigs(validCurrency as "USD" | "EUR" | "GBP")
    console.log("Item configs for currency:", itemConfigs)

    // Build a map for quick lookup of Stripe Price IDs using item IDs from itemConfigs.
    const itemIdToStripePriceIdMap = new Map<string, string>(
      itemConfigs.map((config) => [config.id, config.stripePriceId]),
    )
    console.log("itemIdToStripePriceIdMap", itemIdToStripePriceIdMap)

    // Process items directly from the form data.
    for (const [formDataKey, formDataValue] of formData.entries()) {
      console.log(`Processing form field: ${formDataKey} = ${formDataValue}`)

      const stripePriceId = itemIdToStripePriceIdMap.get(formDataKey)
      console.log(`Stripe Price ID for ${formDataKey}:`, stripePriceId)

      // Only process if the formDataKey is a known item ID with a corresponding Stripe Price ID.
      if (stripePriceId) {
        const quantityString = formDataValue as string
        const quantity = parseInt(quantityString, 10)

        if (!isNaN(quantity) && quantity > 0) {
          console.log(`Adding to line_items: ${stripePriceId} x ${quantity}`)
          line_items.push({
            price: stripePriceId,
            quantity: quantity,
          })
        } else {
          console.log(`Skipping ${formDataKey}: quantity is ${quantity}`)
        }
      } else {
        console.log(`Skipping ${formDataKey}: no matching price ID found`)
      }
    }

    console.log("Final line_items:", line_items)

    if (line_items.length === 0) {
      return { formError: "No items selected for checkout.", success: false }
    }

    // Validate that all price IDs exist and match the expected currency
    try {
      for (const item of line_items) {
        if (!item.price) {
          console.error("Missing price ID in line item:", item)
          return {
            formError: "Invalid product configuration. Please contact support.",
            success: false,
          }
        }

        const price = await stripe.prices.retrieve(item.price)
        console.log(
          `Price ${item.price}: currency=${price.currency}, amount=${price.unit_amount}`,
        )

        if (
          validCurrency !== "TEST" &&
          price.currency.toUpperCase() !== validCurrency
        ) {
          console.error(
            `Currency mismatch: Expected ${validCurrency}, got ${price.currency} for price ${item.price}`,
          )
          return {
            formError: `Currency mismatch: The selected items are not available in ${validCurrency}. Please contact support.`,
            success: false,
          }
        }
      }
    } catch (e) {
      console.error("Error validating prices:", e)
      return {
        formError:
          "Error validating product prices. Please try again or contact support.",
        success: false,
      }
    }

    // Invalid payment_method_types[1]: must be one of card, acss_debit, affirm, afterpay_clearpay,
    // alipay, au_becs_debit, bacs_debit, bancontact, blik, boleto, cashapp, customer_balance, eps,
    // fpx, giropay, grabpay, ideal, klarna, konbini, link, multibanco, oxxo, p24, pay_by_bank,
    // paynow, paypal, pix, promptpay, sepa_debit, sofort, swish, us_bank_account, wechat_pay,
    // revolut_pay, mobilepay, zip, amazon_pay, alma, twint, kr_card, naver_pay, kakao_pay, payco,
    // nz_bank_account, samsung_pay, billie, or satispay

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_configuration: "pmc_1RTRC6LABPmBqoeeLfXHJO8M",
        // payment_method_types: ["bacs_debit", "pay_by_bank"],
        line_items: line_items,
        allow_promotion_codes: true,
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `CoLoop Workspace Credits - ${id}`,
            metadata: {
              clerk_workspace_id: id,
              self_serve: "true",
              usage_adjustments: JSON.stringify(usage_adjustments),
            },
          },
        },
        success_url: `${origin}/self-serve/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/self-serve?id=${id}`,
        metadata: {
          clerk_workspace_id: id,
          items: JSON.stringify(
            line_items.map((li) => ({
              price: li.price,
              quantity: li.quantity,
            })),
          ),
          usage_adjustments: JSON.stringify(usage_adjustments),
        },
        payment_intent_data: {
          metadata: {
            clerk_workspace_id: id,
            self_serve: "true",
            items: JSON.stringify(
              line_items.map((li) => ({
                price: li.price,
                quantity: li.quantity,
              })),
            ),
            usage_adjustments: JSON.stringify(usage_adjustments),
          },
        },
      })
      console.log("Session", session)

      if (session.url) {
        console.log("Redirecting to Stripe session URL", session.url)
        throw redirect(303, session.url)
      }
      // This part should ideally not be reached if session.url is always present on success
      console.error("Stripe session URL not found", session)
      throw svelteKitError(500, "Could not create Stripe session.")
    } catch (e: any) {
      // Catch any type for broader error handling
      console.error("Error creating Stripe checkout session:", e)
      if (e.status && e.status === 303) {
        // Handle SvelteKit redirect
        throw e
      }
      // Return a form error to be displayed on the page
      return {
        formError: e.message || "Failed to create Stripe checkout session.",
        success: false,
      }
    }
  },
}
