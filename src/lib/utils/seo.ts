import {
	MARKETING_BASE_URL,
	WEBSITE_NAME,
	DEFAULT_OG_IMAGE,
	BLOG_OG_IMAGE,
	BLOG_CATEGORY_OG_IMAGE,
	BLOG_POST_OG_IMAGE,
} from "../../config"
import type { Article } from "$lib/types/articles"
import type { SectionSlugPage } from "$lib/types/section-slug"

export interface SEOMetadata {
	title: string
	description: string
	canonical?: string
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
	ogType?: "website" | "article" | "product"
	twitterCard?: "summary" | "summary_large_image"
	twitterTitle?: string
	twitterDescription?: string
	twitterImage?: string
	keywords?: string[]
	author?: string
	publishedDate?: string
	modifiedDate?: string
	articleSection?: string
	articleTags?: string[]
	noindex?: boolean
	nofollow?: boolean
}

export interface StructuredData {
	"@context": string
	"@type": string
	[key: string]: unknown
}

export function generateSectionSlugPageMetadata(sectionSlugPage: SectionSlugPage): SEOMetadata {
	return {
		title: `${sectionSlugPage.title} - ${WEBSITE_NAME}`,
		description: sectionSlugPage.seoDescription || "",
		canonical: `${MARKETING_BASE_URL}/${sectionSlugPage.slug}`,
		ogTitle: sectionSlugPage.title,
		ogDescription: sectionSlugPage.seoDescription || "",
		ogImage: sectionSlugPage.coverImage || `${MARKETING_BASE_URL}${DEFAULT_OG_IMAGE}`,
		ogType: "website",
		twitterCard: "summary_large_image",
		keywords: [sectionSlugPage.title, "AI research", "insights", "articles"],
	}
}

/**
 * Generate SEO metadata for the homepage
 */
export function generateHomepageMetadata(): SEOMetadata {
	return {
		title: `${WEBSITE_NAME} | AI-Powered Research & Insights Platform`,
		description:
			"Transform your research with AI-powered analysis. CoLoop helps insights teams analyze qualitative data, transcripts, and feedback faster with specialized AI agents and workflows.",
		canonical: MARKETING_BASE_URL,
		ogTitle: `${WEBSITE_NAME} | AI-Powered Research & Insights Platform`,
		ogDescription:
			"Transform your research with AI-powered analysis. CoLoop helps insights teams analyze qualitative data, transcripts, and feedback faster with specialized AI agents and workflows.",
		ogImage: `${MARKETING_BASE_URL}${DEFAULT_OG_IMAGE}`,
		ogType: "website",
		twitterCard: "summary_large_image",
		keywords: [
			"AI research",
			"qualitative analysis",
			"insights platform",
			"research automation",
			"data analysis",
			"market research",
		],
	}
}

/**
 * Generate SEO metadata for blog listing page
 */
export function generateBlogMetadata(): SEOMetadata {
	return {
		title: `Blog - ${WEBSITE_NAME} | AI Research Insights & Best Practices`,
		description:
			"Discover the latest insights on AI-powered research, qualitative analysis techniques, and best practices for modern insights teams. Expert articles from CoLoop.",
		canonical: `${MARKETING_BASE_URL}/blog`,
		ogTitle: `Blog - ${WEBSITE_NAME} | AI Research Insights & Best Practices`,
		ogDescription:
			"Discover the latest insights on AI-powered research, qualitative analysis techniques, and best practices for modern insights teams.",
		ogImage: `${MARKETING_BASE_URL}${BLOG_OG_IMAGE}`,
		ogType: "website",
		twitterCard: "summary_large_image",
		keywords: [
			"AI research blog",
			"insights articles",
			"research methodology",
			"qualitative analysis",
			"market research",
		],
	}
}

/**
 * Generate SEO metadata for blog category pages
 */
export function generateBlogCategoryMetadata(category: string): SEOMetadata {
	const categoryDisplay = category.replaceAll("-", " ").replaceAll("and", "&")
	const capitalizedCategory = categoryDisplay.charAt(0).toUpperCase() + categoryDisplay.slice(1)

	return {
		title: `${capitalizedCategory} Articles - ${WEBSITE_NAME} Blog`,
		description: `Explore ${categoryDisplay} articles and insights from CoLoop. Learn about AI-powered research techniques, best practices, and industry trends.`,
		canonical: `${MARKETING_BASE_URL}/blog/category/${category}`,
		ogTitle: `${capitalizedCategory} Articles - ${WEBSITE_NAME} Blog`,
		ogDescription: `Explore ${categoryDisplay} articles and insights from CoLoop. Learn about AI-powered research techniques, best practices, and industry trends.`,
		ogImage: `${MARKETING_BASE_URL}${BLOG_CATEGORY_OG_IMAGE}`,
		ogType: "website",
		twitterCard: "summary_large_image",
		keywords: [categoryDisplay, "AI research", "insights", "articles"],
	}
}

/**
 * Generate SEO metadata for blog posts
 */
export function generateBlogPostMetadata(article: Article): SEOMetadata {
	// Truncate title if too long for SEO
	const seoTitle = article.title.length > 55 ? `${article.title.substring(0, 52)}...` : article.title

	// Use SEO description from Notion, or generate from excerpt, or fallback
	const description = article.seoDescription || article.excerpt || `${article.title.substring(0, 150)}...`

	// Truncate description if too long
	const seoDescription = description.length > 155 ? `${description.substring(0, 152)}...` : description

	return {
		title: `${seoTitle} - ${WEBSITE_NAME}`,
		description: seoDescription,
		canonical: `${MARKETING_BASE_URL}/blog/${article.slug}`,
		ogTitle: article.title,
		ogDescription: seoDescription,
		ogImage: article.coverImage || `${MARKETING_BASE_URL}${BLOG_POST_OG_IMAGE}`,
		ogType: "article",
		twitterCard: "summary_large_image",
		twitterTitle: article.title,
		twitterDescription: seoDescription,
		twitterImage: article.coverImage || `${MARKETING_BASE_URL}${BLOG_POST_OG_IMAGE}`,
		keywords: [...(article.tags || []), ...(article.category || []), "AI research", "insights"],
		author: article.author,
		publishedDate: article.publishedDate,
		articleSection: article.category?.[0],
		articleTags: article.tags,
	}
}

/**
 * Generate SEO metadata for static pages
 */
export function generatePageMetadata(
	title: string,
	description: string,
	path: string,
	options: Partial<SEOMetadata> = {},
): SEOMetadata {
	return {
		title: `${title} - ${WEBSITE_NAME}`,
		description,
		canonical: `${MARKETING_BASE_URL}${path}`,
		ogTitle: title,
		ogDescription: description,
		ogImage: `${MARKETING_BASE_URL}${DEFAULT_OG_IMAGE}`,
		ogType: "website",
		twitterCard: "summary_large_image",
		...options,
	}
}

/**
 * Utility function to truncate text for SEO limits
 */
export function truncateForSEO(text: string, limit: number): string {
	if (text.length <= limit) return text
	return `${text.substring(0, limit - 3)}...`
}

/**
 * Generate keywords string for meta tag
 */
export function generateKeywordsString(keywords?: string[]): string | undefined {
	if (!keywords || keywords.length === 0) return undefined
	return keywords.join(", ")
}

/**
 * Validate and clean URL for canonical tags
 */
export function cleanCanonicalUrl(url: string): string {
	// Remove trailing slash and query parameters for canonical URLs
	return url.replace(/\/$/, "").split("?")[0]
}
