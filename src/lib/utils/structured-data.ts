import { MARKETING_BASE_URL, WEBSITE_NAME, WebsiteDescription, DEFAULT_OG_IMAGE } from "../../config"
import type { Article } from "$lib/types/articles"
import type { StructuredData } from "./seo"

/**
 * Generate Organization structured data (for site-wide use)
 */
export function generateOrganizationSchema(): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: WEBSITE_NAME,
		description: WebsiteDescription,
		url: MARKETING_BASE_URL,
		logo: {
			"@type": "ImageObject",
			url: `${MARKETING_BASE_URL}/logos/CoLoop_Icon.svg`,
			width: "60",
			height: "60",
		},
		foundingDate: "2023",
		founders: [
			{
				"@type": "Person",
				name: "CoLoop Team",
			},
		],
		address: {
			"@type": "PostalAddress",
			addressCountry: "GB",
		},
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer support",
			email: "support@coloop.ai",
			availableLanguage: ["English"],
		},
		sameAs: ["https://twitter.com/coloop_ai", "https://linkedin.com/company/coloop-ai"],
		industry: "Artificial Intelligence",
		numberOfEmployees: {
			"@type": "QuantitativeValue",
			minValue: 1,
			maxValue: 50,
		},
	}
}

/**
 * Generate Website structured data (for homepage)
 */
export function generateWebsiteSchema(): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: WEBSITE_NAME,
		description: WebsiteDescription,
		url: MARKETING_BASE_URL,
		publisher: generateOrganizationSchema(),
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${MARKETING_BASE_URL}/blog?search={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
		mainEntity: {
			"@type": "SoftwareApplication",
			name: WEBSITE_NAME,
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web Browser",
			description: "AI-powered research and insights platform for qualitative data analysis",
			offers: {
				"@type": "Offer",
				category: "SaaS",
				businessFunction: "Research and Analysis",
			},
		},
	}
}

/**
 * Generate BlogPosting structured data for blog posts
 */
export function generateBlogPostSchema(article: Article): StructuredData {
	const schema: StructuredData = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.seoDescription || article.excerpt || article.title,
		url: `${MARKETING_BASE_URL}/blog/${article.slug}`,
		datePublished: article.publishedDate,
		dateModified: article.publishedDate, // Use published date if no modified date available
		author: {
			"@type": "Person",
			name: article.author || "CoLoop Team",
			url: `${MARKETING_BASE_URL}/about`,
		},
		publisher: generateOrganizationSchema(),
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${MARKETING_BASE_URL}/blog/${article.slug}`,
		},
		articleSection: article.category?.[0] || "Insights",
		wordCount: estimateWordCount(article.excerpt || article.title),
		inLanguage: "en-US",
	}

	// Add image if available
	if (article.coverImage) {
		schema.image = {
			"@type": "ImageObject",
			url: article.coverImage,
			width: "1200",
			height: "630",
		}
	}

	// Add keywords if available
	if (article.tags && article.tags.length > 0) {
		schema.keywords = article.tags.join(", ")
	}

	// Add article body (if we had full content, we'd use that)
	if (article.excerpt) {
		schema.articleBody = article.excerpt
	}

	return schema
}

/**
 * Generate Blog structured data for blog listing pages
 */
export function generateBlogSchema(): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: `${WEBSITE_NAME} Blog`,
		description: "AI research insights, best practices, and industry trends from CoLoop",
		url: `${MARKETING_BASE_URL}/blog`,
		publisher: generateOrganizationSchema(),
		inLanguage: "en-US",
		about: {
			"@type": "Thing",
			name: "AI Research and Insights",
			description: "Artificial intelligence applications in market research and data analysis",
		},
	}
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: crumb.url,
		})),
	}
}

/**
 * Generate CollectionPage structured data for category pages
 */
export function generateCategoryPageSchema(category: string): StructuredData {
	const categoryDisplay = category.replaceAll("-", " ").replaceAll("and", "&")
	const capitalizedCategory = categoryDisplay.charAt(0).toUpperCase() + categoryDisplay.slice(1)

	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: `${capitalizedCategory} Articles`,
		description: `Collection of ${categoryDisplay} articles and insights from CoLoop`,
		url: `${MARKETING_BASE_URL}/blog/category/${category}`,
		isPartOf: {
			"@type": "Blog",
			name: `${WEBSITE_NAME} Blog`,
			url: `${MARKETING_BASE_URL}/blog`,
		},
		about: {
			"@type": "Thing",
			name: capitalizedCategory,
			description: `${capitalizedCategory} related to AI research and insights`,
		},
		publisher: generateOrganizationSchema(),
	}
}

/**
 * Generate SoftwareApplication structured data for product pages
 */
export function generateSoftwareApplicationSchema(): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: WEBSITE_NAME,
		description: WebsiteDescription,
		url: MARKETING_BASE_URL,
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web Browser",
		softwareVersion: "1.0",
		releaseNotes: "AI-powered research platform for insights teams",
		screenshot: `${MARKETING_BASE_URL}${DEFAULT_OG_IMAGE}`,
		author: generateOrganizationSchema(),
		offers: {
			"@type": "Offer",
			category: "SaaS",
			businessFunction: "Research and Analysis",
			priceSpecification: {
				"@type": "PriceSpecification",
				price: "0",
				priceCurrency: "USD",
				description: "Free trial available",
			},
		},
		featureList: [
			"AI-powered qualitative analysis",
			"Automated transcription",
			"Insight extraction",
			"Collaborative research workspace",
			"Data visualization",
		],
		requirements: "Web browser with internet connection",
	}
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	}
}

/**
 * Generate Person structured data for author pages
 */
export function generatePersonSchema(name: string, role?: string): StructuredData {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name,
		jobTitle: role || "Content Author",
		worksFor: generateOrganizationSchema(),
		url: `${MARKETING_BASE_URL}/about`,
		knowsAbout: ["Artificial Intelligence", "Market Research", "Data Analysis", "Qualitative Research"],
	}
}

/**
 * Utility function to estimate word count
 */
function estimateWordCount(text: string): number {
	return text.trim().split(/\s+/).length
}

/**
 * Generate combined structured data for homepage
 */
export function generateHomepageSchemas(): StructuredData[] {
	return [generateOrganizationSchema(), generateWebsiteSchema(), generateSoftwareApplicationSchema()]
}

/**
 * Generate combined structured data for blog post pages
 */
export function generateBlogPostSchemas(article: Article): StructuredData[] {
	const breadcrumbs = [
		{ name: "Home", url: MARKETING_BASE_URL },
		{ name: "Blog", url: `${MARKETING_BASE_URL}/blog` },
		{ name: article.title, url: `${MARKETING_BASE_URL}/blog/${article.slug}` },
	]

	return [generateOrganizationSchema(), generateBlogPostSchema(article), generateBreadcrumbSchema(breadcrumbs)]
}

/**
 * Generate combined structured data for blog listing page
 */
export function generateBlogListingSchemas(): StructuredData[] {
	const breadcrumbs = [
		{ name: "Home", url: MARKETING_BASE_URL },
		{ name: "Blog", url: `${MARKETING_BASE_URL}/blog` },
	]

	return [generateOrganizationSchema(), generateBlogSchema(), generateBreadcrumbSchema(breadcrumbs)]
}

/**
 * Generate combined structured data for category pages
 */
export function generateCategoryPageSchemas(category: string): StructuredData[] {
	const categoryDisplay = category.replaceAll("-", " ").replaceAll("and", "&")
	const capitalizedCategory = categoryDisplay.charAt(0).toUpperCase() + categoryDisplay.slice(1)

	const breadcrumbs = [
		{ name: "Home", url: MARKETING_BASE_URL },
		{ name: "Blog", url: `${MARKETING_BASE_URL}/blog` },
		{ name: capitalizedCategory, url: `${MARKETING_BASE_URL}/blog/category/${category}` },
	]

	return [generateOrganizationSchema(), generateCategoryPageSchema(category), generateBreadcrumbSchema(breadcrumbs)]
}
