<script lang="ts">
	import BlogEndArtCard from "$lib/components/blocks/BlogEndArtCard.svelte"

	import NotionContent from "$components/NotionContent.svelte"
	import Button from "$components/ui/button/button.svelte"
	import type { NotionBlock, NotionPageWithProperties } from "$lib/types/notion"
	import { IconArrowLeft } from "@tabler/icons-svelte"
	interface PageData {
		blogPostBlocks: NotionBlock[]
		blogPostMetadata: NotionPageWithProperties
	}

	let { data }: { data: PageData } = $props()

	const coverImage = $derived(data.blogPostMetadata.properties["Cover Image"].files[0]?.file.url)
	const title = $derived(data.blogPostMetadata.properties.Title.title[0]?.plain_text)
	const publishedDate = $derived(data.blogPostMetadata.properties["Published Date"].date.start)
	const author = $derived(data.blogPostMetadata.properties.Author.rich_text[0]?.plain_text)
	const authorImage = $derived(data.blogPostMetadata.properties["Author Image"].files[0]?.file.url)
</script>

<div class="mt-36 max-w-4xl px-4 mx-auto">
	<Button
		href="/blog"
		variant="link"
		size="none"
		class="group text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-16">
		<IconArrowLeft class="group-hover:-translate-x-1 w-4 h-4 transition-transform duration-300" />
		Back
	</Button>
	<article class="space-y-8">
		<div class="flex flex-col gap-4 mb-24 text-left">
			<h1 class=" pr-32 font-serif font-medium">{title}</h1>
			<div class="flex items-center justify-start gap-4">
				{#if authorImage}
					<img src={authorImage} alt={author} class="w-10 h-10 rounded-full" />
				{/if}
				<div>
					<p class="font-medium">{author}</p>
					<span class="text-muted-foreground text-xs">
						Published on {new Date(publishedDate).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
				</div>
			</div>
		</div>

		{#if coverImage}
			<img src={coverImage} alt={title} class="aspect-video object-cover w-full overflow-hidden rounded" />
		{/if}

		<div class=" mx-auto prose">
			<NotionContent blocks={data.blogPostBlocks} />
		</div>
	</article>
</div>
<div class="w-full px-4 mx-auto">
	<BlogEndArtCard />
</div>
