export interface QualificationOption {
  id: string
  title: string
  description: string
  icon: string // Tabler icon name
  resultTitle?: string
  resultDescription?: string
  showPricing?: boolean
  calComEmbed?: string
  externalLink?: {
    url: string
    text: string
    external: boolean
  }
}

export interface QualificationConfig {
  question: string
  subtitle: string
  options: QualificationOption[]
  calComLink: string
  humanContactText?: string
  calComButtonText?: string
}

// Default qualification configuration
export const defaultQualificationConfig: QualificationConfig = {
  question: "What best describes you?",
  subtitle: "Help us recommend the right solution for your needs",
  calComLink: "https://cal.com/your-username", // Replace with your actual cal.com link
  humanContactText: "Prefer to speak with someone?",
  calComButtonText: "Schedule a call",
  options: [
    {
      id: "independent",
      title: "I'm an Independent",
      description: "Solo consultant or freelancer working independently",
      icon: "IconUser",
      resultTitle: "Perfect! Here's our self-serve solution",
      resultDescription:
        "Get started immediately with our independent plan designed for solo professionals.",
      externalLink: {
        url: "/demo/independents",
        text: "Explore Independent Solutions",
        external: false,
      },
    },
    {
      id: "academic",
      title: "I'm an Academic",
      description: "Academic researcher or professor",
      icon: "IconUser",
      resultTitle: "Perfect! Here's our academic plan",
      resultDescription:
        "Get started immediately with our academic plan designed for academic researchers and professors.",
      externalLink: {
        url: "/demo/independents",
        text: "Explore Academic Solutions",
        external: false,
      },
    },
    {
      id: "icg",
      title: "I'm part of ICG",
      description: "Member of the Independent Consultants Group",
      icon: "IconUsers",
      resultTitle: "Perfect! Here's our ICG plan",
      resultDescription:
        "Get started immediately with our ICG plan designed for members of the Independent Consultants Group.",
      externalLink: {
        url: "/demo/independents",
        text: "Explore ICG Solutions",
        external: false,
      },
    },
    {
      id: "agency",
      title: "I'm an Agency",
      description: "Marketing agency or consultancy with multiple clients",
      icon: "IconBuilding",
      resultTitle: "Excellent! Let's discuss your agency needs",
      resultDescription:
        "Our agency solutions are tailored for teams managing multiple client accounts.",
      externalLink: {
        url: "/agency-demo", // Or external URL
        text: "Explore Agency Solutions",
        external: false,
      },
    },
    {
      id: "inhouse",
      title: "I'm part of an In-house Team",
      description: "Part of an internal team at a company or organization",
      icon: "IconBriefcase",
      resultTitle: "Perfect! Enterprise solutions await",
      resultDescription:
        "Our enterprise platform is built for internal teams and large organizations.",
      calComEmbed: "https://coloop.cal.com/coloop-ai/in-house-demo", // Replace with your cal.com embed
    },
  ],
}

export function getQualificationConfig(): QualificationConfig {
  return defaultQualificationConfig
}
