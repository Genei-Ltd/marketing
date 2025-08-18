import {
	getAllPublishedBlogPosts,
	getAllSectionsSlugPages,
	transformDBRowsToArticles,
} from "$lib/server/connectors/notion"
import { MARKETING_BASE_URL } from "../../config"
import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async () => {
	// Get all published blog posts
	// https://www.notion.so/genei/2326a3daa35a80a19eaae5366b3b2a1d?v=2326a3daa35a8009953f000ce317ee31&source=copy_link
	const BLOG_DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	// https://www.notion.so/genei/24f6a3daa35a803c92a8d70b526b2466?v=24f6a3daa35a81c4b104000c4e8ee5e2&source=copy_link
	const SECTIONS_SLUG_DATABASE_ID = "24f6a3daa35a803c92a8d70b526b2466"

	try {
		const blogPosts = await getAllPublishedBlogPosts(BLOG_DATABASE_ID)
		const articles = await transformDBRowsToArticles(blogPosts)
		const sections = await getAllSectionsSlugPages(SECTIONS_SLUG_DATABASE_ID)

		// Get unique categories for category pages
		const categories = [...new Set(articles.flatMap((article) => article.category || []))]

		// Build sitemap XML https://www.sitemaps.org/protocol.html
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<!-- Homepage -->
	<url>
		<loc>${MARKETING_BASE_URL}</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>
	
	<!-- Static Pages -->
	<url>
		<loc>${MARKETING_BASE_URL}/blog</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/careers</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/book-a-demo</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>


	<!-- Section Pages -->	
	${sections
		.map((section) => {
			return `	<url>
		<loc>${MARKETING_BASE_URL}/${section.section}/${section.slug}</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.6</priority>
	</url>`
		})
		.join("\n")}
	
	<!-- Blog Category Pages -->
	${categories
		.map((category) => {
			const categorySlug = category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")
			return `	<url>
		<loc>${MARKETING_BASE_URL}/blog/category/${categorySlug}</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>`
		})
		.join("\n")}
	
	<!-- Blog Posts -->
	${articles
		.map((article) => {
			const lastmod = article.publishedDate
				? new Date(article.publishedDate).toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0]

			return `	<url>
		<loc>${MARKETING_BASE_URL}/blog/${article.slug}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>`
		})
		.join("\n")}
</urlset>`

		return new Response(sitemap, {
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "max-age=3600", // Cache for 1 hour
			},
		})
	} catch (error) {
		console.error("Error generating sitemap:", error)
		return new Response("Error generating sitemap", { status: 500 })
	}
}
