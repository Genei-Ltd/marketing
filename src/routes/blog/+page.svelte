<script lang="ts">
	import type { PageData } from "./$types"
	import BlogGrid from "./BlogGrid.svelte"
	import SEOHead from "$lib/components/SEOHead.svelte"
	import { generateBlogMetadata } from "$lib/utils/seo"
	import { generateBlogListingSchemas } from "$lib/utils/structured-data"

	let { data }: { data: PageData } = $props()

	// Generate SEO metadata and structured data
	const seoMetadata = generateBlogMetadata()
	const structuredData = generateBlogListingSchemas()
</script>

<!-- SEO Meta Tags and Structured Data -->
<SEOHead metadata={seoMetadata} {structuredData} />

<div class="max-w-6xl lg:px-10 px-6 py-8 mx-auto">
	<BlogGrid articles={data.articles} />
</div>
