import { notionConnector } from "$lib/server/connectors/notion"

// Updated Testimonial interface to match Notion database schema
export interface Testimonial {
	id: string
	name?: string
	role?: string
	company?: string
	avatar?: string
	content?: string
	rating?: number
	companyLogo?: string

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

/**
 * Convert a Notion database page to a Testimonial object
 */
function convertNotionPageToTestimonial(page: any): Testimonial {
	const properties = page.properties

	return {
		id: page.id,
		name:
			notionConnector.getPropertyValue(properties["Client Name"], "title") ||
			notionConnector.getPropertyValue(properties["Client Name"], "rich_text") ||
			"",
		role: notionConnector.getPropertyValue(properties["Job Title"], "rich_text") || "",
		companyLogo: (notionConnector.getPropertyValue(properties["Logo"], "files") as string[])?.[0] || undefined,
		avatar: (notionConnector.getPropertyValue(properties["Avatar"], "files") as string[])?.[0] || undefined,
		company: notionConnector.getPropertyValue(properties["Company"], "rich_text") || "",
		content:
			notionConnector.getPropertyValue(properties["Testimonial"], "rich_text") ||
			notionConnector.getPropertyValue(properties["Full Text"], "rich_text") ||
			"",
		rating: notionConnector.getPropertyValue(properties["Rating"], "number") || undefined,
		// Additional properties from Notion schema
		fullText: notionConnector.getPropertyValue(properties["Full Text"], "rich_text") || undefined,
		clientName:
			notionConnector.getPropertyValue(properties["Client Name"], "title") ||
			notionConnector.getPropertyValue(properties["Client Name"], "rich_text") ||
			undefined,
		dateReceived: notionConnector.getPropertyValue(properties["Date Received"], "date")?.start || undefined,
		source: notionConnector.getPropertyValue(properties["Source"], "rich_text") || undefined,
		projectProduct: notionConnector.getPropertyValue(properties["Project/Product"], "rich_text") || undefined,
		status: notionConnector.getPropertyValue(properties["Status"], "status") || undefined,
		permissionToUse: notionConnector.getPropertyValue(properties["Permission to Use"], "checkbox") || undefined,
		clientContact: notionConnector.getPropertyValue(properties["Client Contact"], "rich_text") || undefined,
		pagesToUseOn: notionConnector.getPropertyValue(properties["Pages to Use On"], "multi_select") || undefined,
		marketingUsage: notionConnector.getPropertyValue(properties["Marketing Usage"], "rich_text") || undefined,
		lastEditedBy: notionConnector.getPropertyValue(properties["Last edited by"], "people")?.[0]?.name || undefined,
		updatedAt: notionConnector.getPropertyValue(properties["Updated At"], "last_edited_time") || undefined,
		jobTitle: notionConnector.getPropertyValue(properties["Job Title"], "rich_text") || undefined,
		companyDomain: notionConnector.getPropertyValue(properties["Company Domain"], "url") || undefined,
		customerSegment: notionConnector.getPropertyValue(properties["Customer Segment"], "select") || undefined,
	}
}

/**
 * Get all testimonials from Notion database
 */
export async function getTestimonialsFromNotion(): Promise<Testimonial[]> {
	try {
		const response = await notionConnector.queryDatabase(TESTIMONIALS_DATABASE_ID)

		console.log("🔷", response)

		return response.results.map(convertNotionPageToTestimonial)
	} catch (error) {
		console.error("Error fetching testimonials from Notion:", error)
		// Return static testimonials as fallback
		return []
	}
}

/**
 * Get testimonials by status from Notion database
 */
export async function getTestimonialsByStatus(status: string): Promise<Testimonial[]> {
	try {
		const filter = {
			property: "Status",
			select: {
				equals: status,
			},
		}

		const response = await notionConnector.queryDatabase(TESTIMONIALS_DATABASE_ID, filter)

		return response.results.map(convertNotionPageToTestimonial)
	} catch (error) {
		console.error("Error fetching testimonials by status from Notion:", error)
		// Fallback to static testimonials
		return []
	}
}

/**
 * Get testimonials by pages to use on from Notion database
 */
export async function getTestimonialsByPages(pageNames: string[]): Promise<Testimonial[]> {
	try {
		const filter = {
			property: "Pages to Use On",
			multi_select: {
				contains: pageNames[0], // Notion filter for multi-select with contains
			},
		}

		const response = await notionConnector.queryDatabase(TESTIMONIALS_DATABASE_ID, filter)

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
		return []
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

		const response = await notionConnector.queryDatabase(TESTIMONIALS_DATABASE_ID, filter)

		const testimonials = response.results.map(convertNotionPageToTestimonial)

		if (randomize) {
			return testimonials.sort(() => 0.5 - Math.random())
		} else {
			return testimonials.sort((a, b) => a.name.localeCompare(b.name))
		}
	} catch (error) {
		console.error("Error fetching approved testimonials from Notion:", error)
		return []
	}
}

/**
 * Get testimonials for a specific page with permission to use
 */
export async function getTestimonialsForPage(pageName: string): Promise<Testimonial[]> {
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

		const response = await notionConnector.queryDatabase(TESTIMONIALS_DATABASE_ID, filter)

		return response.results.map(convertNotionPageToTestimonial)
	} catch (error) {
		console.error(`Error fetching testimonials for page ${pageName} from Notion:`, error)
		return []
	}
}

// Function to get a random subset of testimonials
// export function getRandomTestimonials(count: number = 3): Testimonial[] {
// 	const shuffled = [...testimonials].sort(() => 0.5 - Math.random())
// 	return shuffled.slice(0, count)
// }

// Function to get testimonials by rating (works with both static and Notion data)
export function getTestimonialsByRating(testimonialList: Testimonial[], minRating: number = 4): Testimonial[] {
	return testimonialList.filter((testimonial) => (testimonial.rating || 0) >= minRating)
}

/**
 * Get random testimonials from Notion database
 */
export async function getRandomTestimonialsFromNotion(count: number = 3): Promise<Testimonial[]> {
	try {
		const allTestimonials = await getApprovedTestimonialsByPage("Homepage")
		const shuffled = [...allTestimonials].sort(() => 0.5 - Math.random())
		return shuffled.slice(0, count)
	} catch (error) {
		console.error("Error fetching random testimonials from Notion:", error)
		// return getRandomTestimonials(count)
		return []
	}
}
