<script lang="ts">
	import NotionContent from "$components/NotionContent.svelte"
	import Button from "$components/ui/button/button.svelte"
	import type { NotionBlock, NotionPageWithProperties } from "$lib/types/notion"
	import { IconArrowLeft } from "@tabler/icons-svelte"
	import { Skeleton } from "$components/ui/skeleton"
	import { fly, scale } from "svelte/transition"
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
		blogPostBlocks: Promise<NotionBlock[]>
		blogPostMetadata: Promise<NotionPageWithProperties>
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
		<!-- Article header - Available immediately from server -->
		<div class="lg:mb-24 flex flex-col gap-4 mb-16 text-left">
			<h1
				class="lg:pr-32 text-balance pr-0 font-serif font-medium text-3xl"
				in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 200 }}
				out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
				{data.article.title}
			</h1>

			<div
				class="flex items-center justify-start gap-4"
				in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 400 }}
				out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
				{#if data.article.authorImage}
					<img
						src={data.article.authorImage}
						alt={data.article.author}
						class="bg-primary object-cover object-center w-10 h-10 rounded-full"
						in:scale={{ duration: 300, easing: cubicInOut, delay: 200, start: 0.8 }} />
				{:else}
					<div class="bg-muted w-10 h-10 overflow-hidden rounded-full"></div>
				{/if}
				<div>
					{#if data.article.author}
						<p
							class="text-foreground text-base font-medium"
							in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 250 }}>
							{data.article.author}
						</p>
					{/if}
					{#if data.article.publishedDate}
						<span
							class="text-muted-foreground text-sm"
							in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 250 }}>
							Published on {new Date(data.article.publishedDate).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
							{#if data.article.readingTime}
								• {data.article.readingTime} min read
							{/if}
						</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Cover image - Available immediately from server -->
		{#if data.article.coverImage}
			<img
				src={data.article.coverImage}
				alt={data.article.title}
				class="aspect-video bg-primary object-cover w-full overflow-hidden rounded"
				in:fly={{ y: 20, duration: 400, easing: cubicInOut, delay: 600 }}
				out:fly={{ y: -20, duration: 500, easing: cubicInOut }} />
		{/if}

		{#await data.blogPostBlocks}
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
		{:then blogPostBlocks}
			<div
				class="mx-auto prose"
				in:fly={{ y: 30, duration: 500, easing: cubicInOut, delay: 700 }}
				out:fly={{ y: -30, duration: 500, easing: cubicInOut }}>
				<NotionContent blocks={blogPostBlocks || []} />
			</div>
		{:catch}
			<div class="py-16 text-center" in:fly={{ y: 20, duration: 300, easing: cubicInOut }}>
				<p class="text-destructive text-lg">Failed to load article</p>
				<p class="text-muted-foreground mt-2 text-sm">Please try refreshing the page</p>
			</div>
		{/await}
	</article>
</div>
