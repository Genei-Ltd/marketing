<script lang="ts">
	import { slide } from "svelte/transition"
	import type { PageData } from "./$types"

	import SEOHead from "$lib/components/SEOHead.svelte"
	import NotionContent from "$components/NotionContent.svelte"
	import { Skeleton } from "$components/ui/skeleton"
	import { cubicInOut, quintOut } from "svelte/easing"
	import { Button } from "$components/ui/button"
	import { IconArrowLeft } from "@tabler/icons-svelte"

	let { data }: { data: PageData } = $props()

	// Generate SEO metadata and structured data
	const seoMetadata = $derived(data.seoMetadata)
	const structuredData = $derived(data.structuredData)
</script>

<!-- SEO Meta Tags and Structured Data -->
<SEOHead metadata={seoMetadata} {structuredData} />

<div class="flex flex-col gap-2 w-full lg:px-10 relative px-6 py-8 mx-auto bg-primary text-primary-foreground mt-14">
	<div class="max-w-6xl lg:px-10 relative px-6 py-8 mx-auto w-full">
		<Button
			href="/"
			variant="link"
			size="none"
			class="group text-muted-foreground hover:text-primary-foreground inline-flex items-center self-start   gap-2  mb-16">
			<IconArrowLeft class="group-hover:-translate-x-1 w-4 h-4 transition-transform duration-300" />
			Back
		</Button>
		{#await data.sectionSlugPage}
			<div class="flex flex-col gap-2">
				<Skeleton class="h-96 w-full" />
			</div>
		{:then sectionSlugPage}
			<div class="flex flex-col gap-2">
				<!-- Cover image - Available immediately from server -->
				{#if sectionSlugPage.coverImage}
					<div class="aspect-video bg-primary object-cover w-full overflow-hidden rounded relative">
						<img
							src={sectionSlugPage.coverImage}
							alt={sectionSlugPage.title}
							class="aspect-video bg-primary object-cover w-full overflow-hidden rounded"
							in:slide={{ duration: 400, easing: cubicInOut, delay: 600, axis: "y" }}
							out:slide={{ duration: 500, easing: cubicInOut, axis: "y" }} />
						{#if sectionSlugPage.companyLogo}
							<div
								class="bg-gradient-to-tl from-black/60 to-black/30 absolute inset-0 z-10 flex items-center justify-center p-4">
								<img
									src={sectionSlugPage.companyLogo}
									alt={sectionSlugPage.slug}
									class="relative inset-0 w-1/2 h-1/2 object-contain brightness-0 contrast-200 invert" />
							</div>
						{/if}
					</div>
					<div class="flex flex-col gap-2 text-center mt-16">
						<h1 class="text-2xl font-bold font-serif text-balance">{sectionSlugPage.title}</h1>
						<p class="text-sm text-muted-foreground">{sectionSlugPage.seoDescription}</p>
					</div>
				{:else}
					<div class="flex flex-col gap-2 text-center my-16">
						<h1 class="text-2xl font-bold font-serif text-balance">{sectionSlugPage.title}</h1>
						<p class="text-sm text-muted-foreground">{sectionSlugPage.seoDescription}</p>
					</div>
				{/if}

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

<div class="max-w-4xl lg:px-10 relative px-6 py-8 mx-auto flex flex-col gap-4 mt-16 mb-16">
	{#await data.sectionSlugPageBlocks}
		<div class="flex flex-col gap-2">
			<Skeleton class="h-96 w-full" />
			<Skeleton class="h-12 w-full" />
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-10 w-full" />
		</div>
	{:then sectionSlugPageBlocks}
		<div class="flex flex-col gap-2">
			<NotionContent blocks={sectionSlugPageBlocks} />
		</div>
	{/await}
</div>
