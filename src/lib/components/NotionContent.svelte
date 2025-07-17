<script lang="ts">
	import type { NotionBlock } from "$lib/types/notion"
	import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

	interface Props {
		blocks?: NotionBlock[]
	}

	let { blocks = [] }: Props = $props()

	const typedBlocks = blocks as NotionBlock[]

	function extractRichText(richText: RichTextItemResponse[]): string {
		return richText?.map((item) => item.plain_text || "").join("") || ""
	}

	function getRichTextWithFormatting(richText: RichTextItemResponse[]): RichTextItemResponse[] {
		return richText || []
	}

	function getEmbedUrl(url: string): string {
		// Convert various video URLs to embed format
		if (url.includes("youtube.com/watch")) {
			const videoId = url.split("v=")[1]?.split("&")[0]
			return `https://www.youtube.com/embed/${videoId}`
		}
		if (url.includes("youtube.com/watch")) {
			const videoId = url.split("v=")[1]?.split("&")[0]
			return `https://www.youtube.com/embed/${videoId}`
		}
		if (url.includes("youtu.be/")) {
			const videoId = url.split("youtu.be/")[1]?.split("?")[0]
			return `https://www.youtube.com/embed/${videoId}`
		}
		if (url.includes("vimeo.com/")) {
			const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
			return `https://player.vimeo.com/video/${videoId}`
		}
		if (url.includes("loom.com/share/")) {
			const videoId = url.split("loom.com/share/")[1]?.split("?")[0]
			return `https://www.loom.com/embed/${videoId}`
		}
		if (url.includes("veed.io/")) {
			const videoId = url.split("veed.io/view/")[1]?.split("?")[0]
			return `https://www.veed.io/embed/${videoId}`
		}
		return url
	}
</script>

<div class="notion-content">
	{#each typedBlocks as block}
		{#if block.type === "paragraph"}
			<p class="mb-4 leading-relaxed">
				{#each getRichTextWithFormatting(block.paragraph?.rich_text || []) as textItem}
					{#if textItem.annotations?.bold}
						<strong class="font-semibold">{textItem.plain_text}</strong>
					{:else if textItem.annotations?.italic}
						<em>{textItem.plain_text}</em>
					{:else if textItem.annotations?.code}
						<code class="bg-gray-200 text-sm px-1 py-0.5 rounded font-mono">{textItem.plain_text}</code>
					{:else if textItem.annotations?.underline}
						<u>{textItem.plain_text}</u>
					{:else if textItem.annotations?.strikethrough}
						<s>{textItem.plain_text}</s>
					{:else if textItem.href}
						<a
							href={textItem.href}
							class="hover:text-blue-800 text-blue-600 underline"
							target="_blank"
							rel="noopener noreferrer">
							{textItem.plain_text}
						</a>
					{:else}
						{textItem.plain_text}
					{/if}
				{/each}
			</p>
		{:else if block.type === "heading_1"}
			<h1 class="mt-12 mb-4 font-serif text-2xl font-semibold">
				{extractRichText(block.heading_1?.rich_text || [])}
			</h1>
		{:else if block.type === "heading_2"}
			<h2 class="pb-2 mt-10 mb-4 font-serif text-lg font-semibold">
				{extractRichText(block.heading_2?.rich_text || [])}
			</h2>
		{:else if block.type === "heading_3"}
			<h3 class="mt-8 mb-2 text-xl font-bold">
				{extractRichText(block.heading_3?.rich_text || [])}
			</h3>
		{:else if block.type === "bulleted_list_item"}
			<ul class="pl-5 mb-4 space-y-2 list-disc">
				<li>{extractRichText(block.bulleted_list_item?.rich_text || [])}</li>
			</ul>
		{:else if block.type === "numbered_list_item"}
			<ol class="pl-5 mb-4 space-y-2 list-decimal">
				<li>{extractRichText(block.numbered_list_item?.rich_text || [])}</li>
			</ol>
		{:else if block.type === "to_do"}
			<div class="flex items-start gap-3 my-2">
				<input type="checkbox" checked={block.to_do?.checked || false} disabled class="w-4 h-4 mt-1" />
				<span class:line-through={block.to_do?.checked}>
					{extractRichText(block.to_do?.rich_text || [])}
				</span>
			</div>
		{:else if block.type === "toggle"}
			<details class="p-4 my-4 border rounded-lg">
				<summary class="font-semibold cursor-pointer select-none">
					{extractRichText(block.toggle?.rich_text || [])}
				</summary>
				<div class="pl-6 mt-2">
					<!-- Nested blocks need to be rendered here -->
				</div>
			</details>
		{:else if block.type === "quote"}
			<blockquote class="pl-4 my-6 italic border-l-4 border-gray-400">
				{extractRichText(block.quote?.rich_text || [])}
			</blockquote>
		{:else if block.type === "callout"}
			<div class="flex gap-4 p-4 my-4 bg-gray-100 rounded-lg">
				{#if block.callout?.icon}
					<span class="text-xl">
						{#if block.callout.icon.type === "emoji"}
							{block.callout.icon.emoji}
						{/if}
					</span>
				{/if}
				<div>{extractRichText(block.callout?.rich_text || [])}</div>
			</div>
		{:else if block.type === "code"}
			<div class="my-6">
				<pre class="p-4 overflow-x-auto text-white bg-gray-800 rounded-lg"><code class="font-mono text-sm"
						>{extractRichText(block.code?.rich_text || [])}</code></pre>
			</div>
		{:else if block.type === "divider"}
			<hr class="my-8" />
		{:else if block.type === "image"}
			<div class="my-6">
				<img
					src={block.image.type === "external" ? block.image.external.url : block.image.file.url}
					alt={extractRichText(block.image?.caption || [])}
					class="rounded-lg shadow-md" />
				{#if extractRichText(block.image?.caption).length > 0}
					<p class="mt-2 text-sm text-center text-gray-500">
						{extractRichText(block.image.caption)}
					</p>
				{/if}
			</div>
		{:else if block.type === "video"}
			<div class="aspect-video my-6">
				<iframe
					src={getEmbedUrl(
						block.video.type === "external" ? block.video.external.url : block.video.file.url || "",
					)}
					title="Video content"
					class="w-full h-full rounded-lg"
					allowfullscreen></iframe>
			</div>
		{:else if block.type === "embed"}
			<div class="aspect-video my-6">
				<iframe
					src={getEmbedUrl(block.embed?.url || "")}
					title="Embedded content"
					class="w-full h-full border rounded-lg"
					allowfullscreen></iframe>
			</div>
		{:else}
			<div class="p-2 my-4 text-sm text-gray-500">
				<!-- Unsupported block type: {block.type} -->
			</div>
		{/if}
	{/each}
</div>
