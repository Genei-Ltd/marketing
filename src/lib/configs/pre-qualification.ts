export interface PreQualificationData {
  email: string
  discoverySource: string
  productInterest: "qualification" | "open-ends"
}

export interface PreQualificationFormData extends PreQualificationData {
  webhookSent: boolean
  isValid: boolean
}

export interface PreQualificationQuestion {
  label: string
  placeholder: string
  required: boolean
  maxLength?: number
}

export interface ProductInterestOption {
  value: "qualification" | "open-ends"
  label: string
  description: string
  icon: string
}

export interface PreQualificationConfig {
  webhookUrl: string
  questions: {
    email: PreQualificationQuestion
    discoverySource: PreQualificationQuestion
    productInterest: {
      label: string
      options: ProductInterestOption[]
    }
  }
  validation: {
    emailRegex: RegExp
    minDiscoveryLength: number
    maxDiscoveryLength: number
  }
}

// Default pre-qualification configuration
export const defaultPreQualificationConfig: PreQualificationConfig = {
  webhookUrl: "",
  questions: {
    email: {
      label: "What's your email?",
      placeholder: "your.email@company.com",
      required: true,
    },
    discoverySource: {
      label: "Where did you discover CoLoop?",
      placeholder: "e.g., Google search, LinkedIn, referral...",
      required: true,
      maxLength: 200,
    },
    productInterest: {
      label: "What product are you interested in?",
      options: [
        {
          value: "qualification",
          label: "Qualitative Analysis",
          description: "Generate and analyze survey qualification questions",
          icon: "IconClipboardList",
        },
        {
          value: "open-ends",
          label: "Open Ends Analysis",
          description: "Analyze and categorize open-ended survey responses",
          icon: "IconMessages",
        },
      ],
    },
  },
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minDiscoveryLength: 0,
    maxDiscoveryLength: 200,
  },
}

export function getPreQualificationConfig(
  webhookUrl?: string,
): PreQualificationConfig {
  return {
    ...defaultPreQualificationConfig,
    webhookUrl: webhookUrl || defaultPreQualificationConfig.webhookUrl,
  }
}

export function validateEmail(email: string): boolean {
  return defaultPreQualificationConfig.validation.emailRegex.test(email.trim())
}

export function validateDiscoverySource(source: string): boolean {
  const trimmed = source.trim()
  return (
    trimmed.length >=
      defaultPreQualificationConfig.validation.minDiscoveryLength &&
    trimmed.length <=
      defaultPreQualificationConfig.validation.maxDiscoveryLength
  )
}

export function validatePreQualificationData(
  data: Partial<PreQualificationData>,
): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!data.email || !validateEmail(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  if (data.discoverySource && !validateDiscoverySource(data.discoverySource)) {
    errors.discoverySource = `Discovery source must be between ${defaultPreQualificationConfig.validation.minDiscoveryLength} and ${defaultPreQualificationConfig.validation.maxDiscoveryLength} characters`
  }

  if (!data.productInterest) {
    errors.productInterest = "Please select a product interest"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
