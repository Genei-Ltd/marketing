<script lang="ts" module>
	import type { SEOMetadata } from "$lib/utils/seo.js"
	import { MARKETING_BASE_URL } from "../../config.js"

	export interface SEOHeadProps {
		metadata: SEOMetadata
		structuredData?: unknown[]
	}
</script>

<script lang="ts">
	import { page } from "$app/stores"

	let { metadata, structuredData = [] }: SEOHeadProps = $props()

	// Clean canonical URL - use provided or current page URL
	const canonicalUrl = $derived(metadata.canonical || `${MARKETING_BASE_URL}${$page.url.pathname}`)
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{metadata.title}</title>
	<meta name="title" content={metadata.title} />
	<meta name="description" content={metadata.description} />
	<link rel="canonical" href={canonicalUrl} />

	{#if metadata.keywords}
		<meta name="keywords" content={metadata.keywords.join(", ")} />
	{/if}

	{#if metadata.author}
		<meta name="author" content={metadata.author} />
	{/if}

	{#if metadata.noindex}
		<meta name="robots" content="noindex{metadata.nofollow ? ', nofollow' : ''}" />
	{:else if metadata.nofollow}
		<meta name="robots" content="nofollow" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={metadata.ogType || "website"} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={metadata.ogTitle || metadata.title} />
	<meta property="og:description" content={metadata.ogDescription || metadata.description} />
	<meta property="og:site_name" content="CoLoop" />

	{#if metadata.ogImage}
		<meta property="og:image" content={metadata.ogImage} />
		<meta property="og:image:alt" content={metadata.ogTitle || metadata.title} />
	{/if}

	<!-- Article specific Open Graph tags -->
	{#if metadata.ogType === "article"}
		{#if metadata.author}
			<meta property="article:author" content={metadata.author} />
		{/if}
		{#if metadata.publishedDate}
			<meta property="article:published_time" content={metadata.publishedDate} />
		{/if}
		{#if metadata.modifiedDate}
			<meta property="article:modified_time" content={metadata.modifiedDate} />
		{/if}
		{#if metadata.articleSection}
			<meta property="article:section" content={metadata.articleSection} />
		{/if}
		{#if metadata.articleTags}
			{#each metadata.articleTags as tag}
				<meta property="article:tag" content={tag} />
			{/each}
		{/if}
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content={metadata.twitterCard || "summary_large_image"} />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={metadata.twitterTitle || metadata.title} />
	<meta property="twitter:description" content={metadata.twitterDescription || metadata.description} />

	{#if metadata.twitterImage || metadata.ogImage}
		<meta property="twitter:image" content={metadata.twitterImage || metadata.ogImage} />
	{/if}

	<!-- Structured Data -->
	{#each structuredData as structuredSchema}
		<script type="application/ld+json">
			{JSON.stringify(structuredSchema)}
		</script>
	{/each}
</svelte:head>
