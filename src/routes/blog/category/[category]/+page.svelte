<script lang="ts">
	import type { PageData } from "./$types"

	import BlogGrid from "../../BlogGrid.svelte"
	import SEOHead from "$lib/components/SEOHead.svelte"
	import { generateBlogCategoryMetadata } from "$lib/utils/seo"
	import { generateCategoryPageSchemas } from "$lib/utils/structured-data"

	let { data }: { data: PageData } = $props()

	const categoryDisplay = $derived(data.category.replaceAll("-", " ").replaceAll("and", "&").toLowerCase())

	// Generate SEO metadata and structured data
	const seoMetadata = $derived(generateBlogCategoryMetadata(data.category))
	const structuredData = $derived(generateCategoryPageSchemas(data.category))
</script>

<!-- SEO Meta Tags and Structured Data -->
<SEOHead metadata={seoMetadata} {structuredData} />

<div class="max-w-6xl lg:px-10 relative px-6 py-8 mx-auto">
	<BlogGrid articles={data.articles} />
</div>
