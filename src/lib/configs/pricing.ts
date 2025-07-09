// Pricing configuration for pricing table component
export type UsageAdjustments = {
  projectUsage?: {
    delta: number
    direction: "increment"
    label: "Projects"
  }
  chatMessageUsage?: {
    delta: number
    direction: "increment"
    label: "Chat Messages"
  }
  gridQuestionUsage?: {
    delta: number
    direction: "increment"
    label: "Grid Questions"
  }
  transcriptionUsage?: {
    delta: number
    direction: "increment"
    label: "Transcription Hours"
  }
  translationUsage?: {
    delta: number
    direction: "increment"
    label: "Translation Hours"
  }
  openEndLabelUsage?: {
    delta: number
    direction: "increment"
    label: "Open Ended Labels"
  }
}

export interface PricingPlan {
  id: string
  stripeSubscriptionPriceId: string
  stripeOneTimePriceId: string
  name?: string // Will be overridden by Stripe product name if available
  description?: string // Will be overridden by Stripe product description if available
  icon: string
  badge?: string
  isPopular?: boolean
  features: string[]
  buttonText?: string
  allowance_units: UsageAdjustments
}

export interface PricingConfig {
  USD: PricingPlan[]
  EUR: PricingPlan[]
  GBP: PricingPlan[]
}

const standardTrialDescription =
  "30 day Unlimited trial for 125 USD, then 225 USD per month for 12 months, paid monthly."

const standardAllowanceUnits: UsageAdjustments = {
  projectUsage: { delta: 15, direction: "increment", label: "Projects" },
  translationUsage: {
    delta: 100,
    direction: "increment",
    label: "Translation Hours",
  },
  transcriptionUsage: {
    delta: 100,
    direction: "increment",
    label: "Transcription Hours",
  },
  gridQuestionUsage: {
    delta: 1000,
    direction: "increment",
    label: "Grid Questions",
  },
  chatMessageUsage: {
    delta: 1000,
    direction: "increment",
    label: "Chat Messages",
  },
}

const standardFeatures = [
  "Community Support",
  "Documentation",
  "All Qualitative Features",
  "All Limits per year",
]

const standardFeaturesWithPremiumSupport = [
  "Premium Support",
  "Documentation",
  "All Qualitative Features",
  "All Limits per year",
]
const defaultProDetails: PricingPlan = {
  id: "CLP-PRO-CS",
  name: "CoLoop Pro with Community Support",
  description: standardTrialDescription,
  icon: "IconRocket",
  features: standardFeatures,
  allowance_units: standardAllowanceUnits,
  badge: "MOST POPULAR",
  isPopular: true,
  buttonText: "Get Started",
  stripeSubscriptionPriceId: "",
  stripeOneTimePriceId: "",
}

const defaultProDetailsWithPremiumSupport: PricingPlan = {
  id: "CLP-PRO-PS",
  name: "CoLoop Pro with Premium Support",
  description: standardTrialDescription,
  icon: "IconBriefcase",
  features: standardFeaturesWithPremiumSupport,
  allowance_units: standardAllowanceUnits,
  buttonText: "Get Started (With Premium Support)",
  stripeSubscriptionPriceId: "",
  stripeOneTimePriceId: "",
}

export const pricingConfig: PricingConfig = {
  USD: [
    {
      ...defaultProDetails,
      stripeSubscriptionPriceId: "price_1RiAhGLABPmBqoeezgjomPUO", // 125 /month USD
      stripeOneTimePriceId: "price_1RiAiaLABPmBqoee3rjcYshq", // 125 trial one off
    },
    {
      ...defaultProDetailsWithPremiumSupport,
      stripeSubscriptionPriceId: "price_1RiCNULABPmBqoeepQpeIlra", // 225 /month USD+
      stripeOneTimePriceId: "price_1RiCMTLABPmBqoeeQ8Uzj1B4", // 225 one off USD+
    },
  ],
  EUR: [
    {
      ...defaultProDetails,
      stripeSubscriptionPriceId: "price_1RdrS0LABPmBqoee8ofYig6t",
      stripeOneTimePriceId: "price_1RdrTNLABPmBqoeefPmv968F",
    },
    {
      ...defaultProDetailsWithPremiumSupport,
      stripeSubscriptionPriceId: "price_1RdU9sLABPmBqoeenUI9p18w",
      stripeOneTimePriceId: "price_1RdrTNLABPmBqoeefPmv968F",
    },
  ],
  GBP: [
    {
      ...defaultProDetails,
      stripeSubscriptionPriceId: "price_1Rig5iLABPmBqoee3tIXZcNZ",
      stripeOneTimePriceId: "price_1Rig6kLABPmBqoeetTP85TT7",
    },
    {
      ...defaultProDetailsWithPremiumSupport,
      stripeOneTimePriceId: "price_1RdrU3LABPmBqoee39yRyQp9",
      stripeSubscriptionPriceId: "price_1RdU9sLABPmBqoeeogZq7k8b",
    },
  ],
}

export function getPricingPlans(currency: keyof PricingConfig): PricingPlan[] {
  return pricingConfig[currency] || pricingConfig.USD
}
