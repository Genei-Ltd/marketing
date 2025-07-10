import { notionConnector } from "$lib/server/connectors/notion"

// Updated Testimonial interface to match Notion database schema
export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar?: string
  content: string
  rating?: number
  // Additional properties from Notion schema
  fullText?: string
  clientName?: string
  dateReceived?: string
  source?: string
  projectProduct?: string
  status?: string
  permissionToUse?: boolean
  clientContact?: string
  pagesToUseOn?: string[]
  marketingUsage?: string
  lastEditedBy?: string
  updatedAt?: string
  jobTitle?: string
  companyDomain?: string
  customerSegment?: string
}

// Notion database ID for testimonials
const TESTIMONIALS_DATABASE_ID = "21b6a3daa35a800d8352d08766490fdf"

// Static testimonials as fallback
export const testimonials: Testimonial[] = [
  {
    id: "1",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechFlow Inc",
    content:
      "CoLoop has revolutionized how we analyze customer feedback. The AI insights are incredibly accurate and save us hours every week.",
    rating: 5,
  },
  {
    id: "2",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Marcus Johnson",
    role: "Research Director",
    company: "DataVision Labs",
    content:
      "The translation and transcription features are game-changers. We can now process multilingual research data seamlessly.",
    rating: 5,
  },
  {
    id: "3",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Emily Rodriguez",
    role: "UX Researcher",
    company: "Innovation Co",
    content:
      "I love how CoLoop handles open-ended responses. The theme extraction is spot-on and the export formats work perfectly with our tools.",
    rating: 5,
  },
  {
    id: "4",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "David Kim",
    role: "Analytics Lead",
    company: "Growth Dynamics",
    content:
      "The chat interface makes collaborating with AI feel natural. Our team productivity has increased significantly since adopting CoLoop.",
    rating: 5,
  },
  {
    id: "5",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Jennifer Walsh",
    role: "Insights Manager",
    company: "Customer360",
    content:
      "CoLoop's analysis grid questions help us dive deeper into our data. The AI summaries are incredibly detailed and actionable.",
    rating: 5,
  },
  {
    id: "6",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "John Doe",
    role: "CEO",
    company: "Acme Inc",
    content:
      "CoLoop has been a game-changer for our team. The AI insights are incredibly accurate and save us hours every week.",
  },
  {
    id: "7",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechFlow Inc",
    content:
      "CoLoop has revolutionized how we analyze customer feedback. The AI insights are incredibly accurate and save us hours every week.",
    rating: 5,
  },
  {
    id: "8",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Marcus Johnson",
    role: "Research Director",
    company: "DataVision Labs",
    content:
      "The translation and transcription features are game-changers. We can now process multilingual research data seamlessly.",
    rating: 5,
  },
  {
    id: "9",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Emily Rodriguez",
    role: "UX Researcher",
    company: "Innovation Co",
    content:
      "I love how CoLoop handles open-ended responses. The theme extraction is spot-on and the export formats work perfectly with our tools.",
    rating: 5,
  },
  {
    id: "10",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "David Kim",
    role: "Analytics Lead",
    company: "Growth Dynamics",
    content:
      "The chat interface makes collaborating with AI feel natural. Our team productivity has increased significantly since adopting CoLoop.",
    rating: 5,
  },
  {
    id: "11",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "Jennifer Walsh",
    role: "Insights Manager",
    company: "Customer360",
    content:
      "CoLoop's analysis grid questions help us dive deeper into our data. The AI summaries are incredibly detailed and actionable.",
    rating: 5,
  },
  {
    id: "12",
    avatar:
      "https://framerusercontent.com/images/496244K8DOOo5AMocMEcURODaGQ.png?scale-down-to=512",
    name: "John Doe",
    role: "CEO",
    company: "Acme Inc",
    content:
      "CoLoop has been a game-changer for our team. The AI insights are incredibly accurate and save us hours every week.",
  },
]

/**
 * Convert a Notion database page to a Testimonial object
 */
function convertNotionPageToTestimonial(page: any): Testimonial {
  const properties = page.properties

  return {
    id: page.id,
    name:
      notionConnector.getPropertyValue(properties["Client Name"], "title") ||
      notionConnector.getPropertyValue(
        properties["Client Name"],
        "rich_text",
      ) ||
      "",
    role:
      notionConnector.getPropertyValue(properties["Job Title"], "rich_text") ||
      "",
    avatar:
      notionConnector.getPropertyValue(properties["Avatar"], "files")?.[0]?.file
        ?.url || undefined,
    company:
      notionConnector.getPropertyValue(properties["Company"], "rich_text") ||
      "",
    content:
      notionConnector.getPropertyValue(
        properties["Testimonial"],
        "rich_text",
      ) ||
      notionConnector.getPropertyValue(properties["Full Text"], "rich_text") ||
      "",
    rating:
      notionConnector.getPropertyValue(properties["Rating"], "number") ||
      undefined,
    // Additional properties from Notion schema
    fullText:
      notionConnector.getPropertyValue(properties["Full Text"], "rich_text") ||
      undefined,
    clientName:
      notionConnector.getPropertyValue(properties["Client Name"], "title") ||
      notionConnector.getPropertyValue(
        properties["Client Name"],
        "rich_text",
      ) ||
      undefined,
    dateReceived:
      notionConnector.getPropertyValue(properties["Date Received"], "date")
        ?.start || undefined,
    source:
      notionConnector.getPropertyValue(properties["Source"], "rich_text") ||
      undefined,
    projectProduct:
      notionConnector.getPropertyValue(
        properties["Project/Product"],
        "rich_text",
      ) || undefined,
    status:
      notionConnector.getPropertyValue(properties["Status"], "status") ||
      undefined,
    permissionToUse:
      notionConnector.getPropertyValue(
        properties["Permission to Use"],
        "checkbox",
      ) || undefined,
    clientContact:
      notionConnector.getPropertyValue(
        properties["Client Contact"],
        "rich_text",
      ) || undefined,
    pagesToUseOn:
      notionConnector.getPropertyValue(
        properties["Pages to Use On"],
        "multi_select",
      ) || undefined,
    marketingUsage:
      notionConnector.getPropertyValue(
        properties["Marketing Usage"],
        "rich_text",
      ) || undefined,
    lastEditedBy:
      notionConnector.getPropertyValue(
        properties["Last edited by"],
        "people",
      )?.[0]?.name || undefined,
    updatedAt:
      notionConnector.getPropertyValue(
        properties["Updated At"],
        "last_edited_time",
      ) || undefined,
    jobTitle:
      notionConnector.getPropertyValue(properties["Job Title"], "rich_text") ||
      undefined,
    companyDomain:
      notionConnector.getPropertyValue(properties["Company Domain"], "url") ||
      undefined,
    customerSegment:
      notionConnector.getPropertyValue(
        properties["Customer Segment"],
        "select",
      ) || undefined,
  }
}

/**
 * Get all testimonials from Notion database
 */
export async function getTestimonialsFromNotion(): Promise<Testimonial[]> {
  try {
    const response = await notionConnector.queryDatabase(
      TESTIMONIALS_DATABASE_ID,
    )

    return response.results.map(convertNotionPageToTestimonial)
  } catch (error) {
    console.error("Error fetching testimonials from Notion:", error)
    // Return static testimonials as fallback
    return testimonials
  }
}

/**
 * Get testimonials by status from Notion database
 */
export async function getTestimonialsByStatus(
  status: string,
): Promise<Testimonial[]> {
  try {
    const filter = {
      property: "Status",
      select: {
        equals: status,
      },
    }

    const response = await notionConnector.queryDatabase(
      TESTIMONIALS_DATABASE_ID,
      filter,
    )

    return response.results.map(convertNotionPageToTestimonial)
  } catch (error) {
    console.error("Error fetching testimonials by status from Notion:", error)
    // Fallback to static testimonials
    return testimonials
  }
}

/**
 * Get testimonials by pages to use on from Notion database
 */
export async function getTestimonialsByPages(
  pageNames: string[],
): Promise<Testimonial[]> {
  try {
    const filter = {
      property: "Pages to Use On",
      multi_select: {
        contains: pageNames[0], // Notion filter for multi-select with contains
      },
    }

    const response = await notionConnector.queryDatabase(
      TESTIMONIALS_DATABASE_ID,
      filter,
    )

    const testimonials = response.results.map(convertNotionPageToTestimonial)

    // Additional filtering for multiple pages if needed
    if (pageNames.length > 1) {
      return testimonials.filter((testimonial) =>
        testimonial.pagesToUseOn?.some((page) => pageNames.includes(page)),
      )
    }

    return testimonials
  } catch (error) {
    console.error("Error fetching testimonials by pages from Notion:", error)
    // Fallback to static testimonials
    return testimonials
  }
}

/**
 * Get testimonials that have permission to use and are approved
 */
export async function getApprovedTestimonialsByPage(
  pageName: string,
  randomize: boolean = false,
): Promise<Testimonial[]> {
  try {
    const filter = {
      and: [
        {
          property: "Permission to Use",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Status",
          status: {
            equals: "Published",
          },
        },
        {
          property: "Pages to Use On",
          multi_select: {
            contains: pageName,
          },
        },
      ],
    }

    const response = await notionConnector.queryDatabase(
      TESTIMONIALS_DATABASE_ID,
      filter,
    )

    // console.log("🔷", response)

    const testimonials = response.results.map(convertNotionPageToTestimonial)

    if (randomize) {
      return testimonials.sort(() => 0.5 - Math.random())
    }

    return testimonials
  } catch (error) {
    console.error("Error fetching approved testimonials from Notion:", error)
    return testimonials
  }
}

/**
 * Get testimonials for a specific page with permission to use
 */
export async function getTestimonialsForPage(
  pageName: string,
): Promise<Testimonial[]> {
  try {
    const filter = {
      and: [
        {
          property: "Pages to Use On",
          multi_select: {
            contains: pageName,
          },
        },
        {
          property: "Permission to Use",
          checkbox: {
            equals: true,
          },
        },
      ],
    }

    const response = await notionConnector.queryDatabase(
      TESTIMONIALS_DATABASE_ID,
      filter,
    )

    return response.results.map(convertNotionPageToTestimonial)
  } catch (error) {
    console.error(
      `Error fetching testimonials for page ${pageName} from Notion:`,
      error,
    )
    return testimonials
  }
}

// Function to get a random subset of testimonials
export function getRandomTestimonials(count: number = 3): Testimonial[] {
  const shuffled = [...testimonials].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Function to get testimonials by rating (works with both static and Notion data)
export function getTestimonialsByRating(
  testimonialList: Testimonial[],
  minRating: number = 4,
): Testimonial[] {
  return testimonialList.filter(
    (testimonial) => (testimonial.rating || 0) >= minRating,
  )
}

/**
 * Get random testimonials from Notion database
 */
export async function getRandomTestimonialsFromNotion(
  count: number = 3,
): Promise<Testimonial[]> {
  try {
    const allTestimonials = await getApprovedTestimonialsByPage("Homepage")
    const shuffled = [...allTestimonials].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  } catch (error) {
    console.error("Error fetching random testimonials from Notion:", error)
    return getRandomTestimonials(count)
  }
}
