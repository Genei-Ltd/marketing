<script lang="ts">
	import NotionContent from "$components/NotionContent.svelte"
	import Button from "$components/ui/button/button.svelte"
	import type { NotionBlock, NotionPageWithProperties } from "$lib/types/notion"
	import { IconArrowLeft } from "@tabler/icons-svelte"
	import { Skeleton } from "$components/ui/skeleton"
	import { fly, scale, slide } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	import SEOHead from "$lib/components/SEOHead.svelte"
	import type { Article } from "$lib/types/articles"
	import type { SEOMetadata } from "$lib/utils/seo"

	interface PageData {
		// Immediate data (available on first render)
		article: Article
		seoMetadata: SEOMetadata
		structuredData: unknown[]
		// Streamed data (promises that resolve after page loads)
		// blogPostBlocks: Promise<NotionBlock[]>
		// blogPostMetadata: Promise<NotionPageWithProperties>
	}

	let { data }: { data: PageData } = $props()
</script>

<!-- SEO Meta Tags and Structured Data - Available immediately from server -->
<SEOHead metadata={data.seoMetadata} structuredData={data.structuredData} />

<div class="lg:mt-36 max-w-4xl px-4 mx-auto mt-16">
	<Button
		href="/blog"
		variant="link"
		size="none"
		class="group text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mt-4 mb-8">
		<IconArrowLeft class="group-hover:-translate-x-1 w-4 h-4 transition-transform duration-300" />
		Back
	</Button>
	<article class="space-y-8">
		{#await data.article}
			<div class="space-y-4">
				<Skeleton class="w-full h-4" />
				<Skeleton class="w-5/6 h-4" />
				<Skeleton class="w-4/5 h-4" />
			</div>
		{:then article}
			<div class="lg:mb-24 flex flex-col gap-4 mb-16 text-left">
				<h1
					class="lg:pr-32 text-balance pr-0 font-serif font-medium text-3xl"
					in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 200 }}
					out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
					{article.title}
				</h1>

				<div
					class="flex items-center justify-start gap-4"
					in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 400 }}
					out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
					{#if article.authorImage}
						<img
							src={article.authorImage}
							alt={article.author}
							class="bg-primary object-cover object-center w-10 h-10 rounded-full"
							in:scale={{ duration: 300, easing: cubicInOut, delay: 200, start: 0.8 }} />
					{:else}
						<div class="bg-muted w-10 h-10 overflow-hidden rounded-full"></div>
					{/if}
					<div>
						{#if article.author}
							<p
								class="text-foreground text-base font-medium"
								in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 250 }}>
								{article.author}
							</p>
						{/if}
						{#if article.publishedDate}
							<span
								class="text-muted-foreground text-sm"
								in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 250 }}>
								Published on {new Date(article.publishedDate).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
								{#if article.readingTime}
									• {article.readingTime} min read
								{/if}
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Cover image - Available immediately from server -->
			{#if article.coverImage}
				<div
					class="aspect-video bg-primary object-cover w-full overflow-hidden rounded relative"
					in:scale={{ duration: 400, easing: cubicInOut }}
					out:scale={{ duration: 500, easing: cubicInOut }}>
					<img
						src={article.coverImage}
						alt={article.title}
						class="aspect-video bg-primary object-cover w-full overflow-hidden rounded" />
					{#if article.companyLogo}
						<div
							class="bg-gradient-to-tl from-black/60 to-black/30 absolute inset-0 z-10 flex items-center justify-center p-4">
							<img
								src={article.companyLogo}
								alt={article.company}
								class="relative inset-0 w-1/2 h-1/2 object-contain brightness-0 contrast-200 invert" />
						</div>
					{/if}
				</div>
			{/if}
		{/await}

		{#await data.article.blocks}
			<div class="space-y-4">
				<div class="space-y-3">
					<Skeleton class="w-full h-4" />
					<Skeleton class="w-5/6 h-4" />
					<Skeleton class="w-4/5 h-4" />
				</div>
				<div class="space-y-3">
					<Skeleton class="w-full h-4" />
					<Skeleton class="w-3/4 h-4" />
					<Skeleton class="w-5/6 h-4" />
				</div>
				<div class="space-y-3">
					<Skeleton class="w-full h-4" />
					<Skeleton class="w-4/5 h-4" />
					<Skeleton class="w-3/5 h-4" />
				</div>
			</div>
		{:then articleBlocks}
			<div
				class="mx-auto prose"
				in:slide={{ axis: "y", duration: 500, easing: cubicInOut, delay: 700 }}
				out:slide={{ axis: "y", duration: 500, easing: cubicInOut }}>
				<NotionContent blocks={articleBlocks || []} />
			</div>
		{:catch}
			<div class="py-16 text-center" in:fly={{ y: 20, duration: 300, easing: cubicInOut }}>
				<p class="text-destructive text-lg">Failed to load article</p>
				<p class="text-muted-foreground mt-2 text-sm">Please try refreshing the page</p>
			</div>
		{/await}
	</article>
</div>
