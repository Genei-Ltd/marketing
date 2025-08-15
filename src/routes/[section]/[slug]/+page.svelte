<script lang="ts">
	import type { PageData } from "./$types"

	import SEOHead from "$lib/components/SEOHead.svelte"
	import NotionContent from "$components/NotionContent.svelte"
	import { Skeleton } from "$components/ui/skeleton"

	let { data }: { data: PageData } = $props()

	// Generate SEO metadata and structured data
	const seoMetadata = $derived(data.seoMetadata)
	const structuredData = $derived(data.structuredData)
</script>

<!-- SEO Meta Tags and Structured Data -->
<SEOHead metadata={seoMetadata} {structuredData} />

<div class="flex flex-col gap-2 w-full lg:px-10 relative px-6 py-8 mx-auto bg-primary text-primary-foreground mt-14">
	<div class="max-w-6xl lg:px-10 relative px-6 py-8 mx-auto w-full">
		{#await data.sectionSlugPage}
			<div class="flex flex-col gap-2">
				<Skeleton class="h-96 w-full" />
			</div>
		{:then sectionSlugPage}
			<div class="flex flex-col gap-2">
				<div class="flex flex-col gap-2">
					<h1 class="text-2xl font-bold">{sectionSlugPage.title}</h1>
					<p class="text-sm text-gray-500">{sectionSlugPage.seoDescription}</p>
				</div>
				<div class="flex items-center gap-2">
					{#if sectionSlugPage.authorImage}
						<img
							src={sectionSlugPage.authorImage}
							alt={sectionSlugPage.author}
							class="w-10 h-10 rounded-full" />
					{:else}
						<p class="text-sm text-gray-500">{sectionSlugPage.author}</p>
					{/if}
				</div>
				<p class="text-sm text-gray-500">{sectionSlugPage.publishedDate}</p>
			</div>
		{/await}
	</div>
</div>

<div class="max-w-6xl lg:px-10 relative px-6 py-8 mx-auto flex flex-col gap-4">
	{#await data.sectionSlugPageBlocks}
		<div class="flex flex-col gap-2">
			<Skeleton class="h-96 w-full" />
		</div>
	{:then sectionSlugPageBlocks}
		<div class="flex flex-col gap-2">
			<NotionContent blocks={sectionSlugPageBlocks} />
		</div>
	{/await}
</div>
