import { getAllPublishedBlogPosts, transformDBRowsToArticles } from "$lib/server/connectors/notion"
import { MARKETING_BASE_URL } from "../../config"
import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async () => {
	// Get all published blog posts
	const DATABASE_ID = "2326a3daa35a80a19eaae5366b3b2a1d"

	try {
		const blogPosts = await getAllPublishedBlogPosts(DATABASE_ID)
		const articles = await transformDBRowsToArticles(blogPosts)

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
		<loc>${MARKETING_BASE_URL}/about</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/careers</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/support</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/values</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/mission</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/manifesto</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
	
	<!-- Product Pages -->
	<url>
		<loc>${MARKETING_BASE_URL}/products/qualitative</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/products/quantitative</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/products/agentic-ai-chat</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>
	
	<!-- Use Case Pages -->
	<url>
		<loc>${MARKETING_BASE_URL}/use-cases/pharmaceutical</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/use-cases/biotechnology</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/use-cases/healthcare</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	
	<url>
		<loc>${MARKETING_BASE_URL}/use-cases/consumer-goods</loc>
		<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	
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
