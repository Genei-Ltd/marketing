<script lang="ts">
	import NotionContent from "$components/NotionContent.svelte"
	import Button from "$components/ui/button/button.svelte"
	import type { NotionBlock, NotionPageWithProperties } from "$lib/types/notion"
	import { IconArrowLeft } from "@tabler/icons-svelte"
	import { Skeleton } from "$components/ui/skeleton"
	import { fly, scale } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	interface PageData {
		blogPostBlocks: NotionBlock[]
		blogPostMetadata: NotionPageWithProperties
	}

	let { data }: { data: PageData } = $props()
</script>

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
		<div class="lg:mb-24 flex flex-col gap-4 mb-16 text-left">
			{#await data.blogPostMetadata}
				<div class="lg:pr-32 text-balance min-h-16 pr-0 space-y-2 font-serif font-medium">
					<Skeleton class="w-full h-6" />
					<Skeleton class="w-4/5 h-6" />
				</div>
			{:then blogPostMetadata}
				<h1
					class="lg:pr-32 text-balance pr-0 font-serif font-medium"
					in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 200 }}
					out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
					{blogPostMetadata?.properties?.Title?.title[0]?.plain_text || "Loading article..."}
				</h1>
			{/await}
			{#await data.blogPostMetadata}
				<div class="min-h-10 flex items-center justify-start gap-4">
					<div class="w-10 h-10 overflow-hidden rounded-full">
						<Skeleton class="w-full h-full" />
					</div>
					<div class="space-y-1">
						<Skeleton class="w-20 h-4" />
						<Skeleton class="w-32 h-3" />
					</div>
				</div>
			{:then blogPostMetadata}
				<div
					class="flex items-center justify-start gap-4"
					in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 400 }}
					out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
					{#if blogPostMetadata?.properties?.["Author Image"]?.files[0]?.file.url}
						<img
							src={blogPostMetadata?.properties?.["Author Image"]?.files[0]?.file.url}
							alt={blogPostMetadata?.properties?.Author?.rich_text[0]?.plain_text}
							class="bg-primary object-cover object-center w-10 h-10 rounded-full"
							in:scale={{ duration: 300, easing: cubicInOut, delay: 200, start: 0.8 }} />
					{:else}
						<div class="bg-muted w-10 h-10 overflow-hidden rounded-full"></div>
					{/if}
					<div>
						{#if blogPostMetadata?.properties?.Author?.rich_text[0]?.plain_text}
							<p
								class="text-foreground text-base font-medium"
								in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 250 }}>
								{blogPostMetadata?.properties?.Author?.rich_text[0]?.plain_text}
							</p>
						{/if}
						{#if blogPostMetadata?.properties?.["Published Date"]?.date.start}
							<span
								class="text-muted-foreground text-sm"
								in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 250 }}>
								Published on {new Date(
									blogPostMetadata?.properties?.["Published Date"]?.date.start || "",
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						{/if}
					</div>
				</div>
			{/await}
		</div>

		{#await data.blogPostMetadata}
			<div class="aspect-video bg-muted w-full overflow-hidden rounded">
				<Skeleton class="w-full h-full" />
			</div>
		{:then blogPostMetadata}
			{#if blogPostMetadata?.properties?.["Cover Image"]?.files[0]?.file.url}
				<img
					src={blogPostMetadata?.properties?.["Cover Image"]?.files[0]?.file.url}
					alt={blogPostMetadata?.properties?.Title?.title[0]?.plain_text}
					class="aspect-video bg-primary object-cover w-full overflow-hidden rounded"
					in:fly={{ y: 20, duration: 400, easing: cubicInOut, delay: 600 }}
					out:fly={{ y: -20, duration: 500, easing: cubicInOut }} />
			{/if}
		{/await}

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
