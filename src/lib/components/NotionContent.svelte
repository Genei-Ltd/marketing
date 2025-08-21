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
			<h1 class="mt-12 mb-4 font-serif text-2xl font-medium">
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
					class="rounded-lg shadow-md bg-black"
					loading="lazy" />
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
		{:else if block.type === "table"}
			<div class="my-8 overflow-x-auto">
				{#if block.has_children && block.table}
					{@const directChildren = (block as NotionBlock & { children?: NotionBlock[] }).children || []}
					{@const tableRowsFromChildren = directChildren.filter(
						(child: NotionBlock) => child.type === "table_row",
					)}
					{@const tableRows = typedBlocks.filter(
						(b) =>
							b.type === "table_row" &&
							b.parent &&
							"block_id" in b.parent &&
							b.parent.block_id === block.id,
					)}
					{@const finalTableRows = tableRowsFromChildren.length > 0 ? tableRowsFromChildren : tableRows}
					<div class="border border-border rounded-lg overflow-hidden bg-background shadow-sm">
						<table class="w-full border-collapse">
							{#if block.table.has_column_header && finalTableRows.length > 0}
								{@const firstRow = finalTableRows[0]}
								{#if firstRow.type === "table_row"}
									<thead>
										<tr class="bg-muted/60 border-b border-border">
											{#each firstRow.table_row?.cells || [] as cell}
												<th
													class="px-6 py-4 text-left font-semibold text-foreground border-r border-border/50 last:border-r-0 tracking-wide text-sm uppercase">
													{#each getRichTextWithFormatting(cell || []) as textItem}
														{#if textItem.annotations?.bold}
															<strong class="font-bold">{textItem.plain_text}</strong>
														{:else if textItem.annotations?.italic}
															<em>{textItem.plain_text}</em>
														{:else if textItem.annotations?.code}
															<code
																class="bg-accent/20 text-accent-foreground text-xs px-2 py-1 rounded font-mono border border-border/30"
																>{textItem.plain_text}</code>
														{:else if textItem.annotations?.underline}
															<u>{textItem.plain_text}</u>
														{:else if textItem.annotations?.strikethrough}
															<s>{textItem.plain_text}</s>
														{:else if textItem.href}
															<a
																href={textItem.href}
																class="text-brand hover:text-accent underline decoration-2 underline-offset-2 transition-colors duration-200"
																target="_blank"
																rel="noopener noreferrer">
																{textItem.plain_text}
															</a>
														{:else}
															{textItem.plain_text}
														{/if}
													{/each}
												</th>
											{/each}
										</tr>
									</thead>
								{/if}
							{/if}
							<tbody>
								{#each finalTableRows as row, rowIndex}
									{#if row.type === "table_row" && !(rowIndex === 0 && block.table.has_column_header)}
										<tr
											class={`border-b border-border/30 last:border-b-0 hover:bg-muted/20 transition-colors duration-150 ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
											{#each row.table_row?.cells || [] as cell, cellIndex}
												{#if cellIndex === 0 && block.table.has_row_header}
													<td
														class="px-6 py-4 font-semibold text-foreground bg-muted/40 border-r border-border/50 first:font-medium">
														{#each getRichTextWithFormatting(cell || []) as textItem}
															{#if textItem.annotations?.bold}
																<strong class="font-bold">{textItem.plain_text}</strong>
															{:else if textItem.annotations?.italic}
																<em>{textItem.plain_text}</em>
															{:else if textItem.annotations?.code}
																<code
																	class="bg-accent/20 text-accent-foreground text-xs px-2 py-1 rounded font-mono border border-border/30"
																	>{textItem.plain_text}</code>
															{:else if textItem.annotations?.underline}
																<u>{textItem.plain_text}</u>
															{:else if textItem.annotations?.strikethrough}
																<s>{textItem.plain_text}</s>
															{:else if textItem.href}
																<a
																	href={textItem.href}
																	class="text-brand hover:text-accent underline decoration-2 underline-offset-2 transition-colors duration-200"
																	target="_blank"
																	rel="noopener noreferrer">
																	{textItem.plain_text}
																</a>
															{:else}
																{textItem.plain_text}
															{/if}
														{/each}
													</td>
												{:else}
													<td
														class="px-6 py-4 text-foreground border-r border-border/50 last:border-r-0 align-top">
														{#each getRichTextWithFormatting(cell || []) as textItem}
															{#if textItem.annotations?.bold}
																<strong class="font-semibold text-foreground"
																	>{textItem.plain_text}</strong>
															{:else if textItem.annotations?.italic}
																<em>{textItem.plain_text}</em>
															{:else if textItem.annotations?.code}
																<code
																	class="bg-accent/20 text-accent-foreground text-xs px-2 py-1 rounded font-mono border border-border/30"
																	>{textItem.plain_text}</code>
															{:else if textItem.annotations?.underline}
																<u>{textItem.plain_text}</u>
															{:else if textItem.annotations?.strikethrough}
																<s>{textItem.plain_text}</s>
															{:else if textItem.href}
																<a
																	href={textItem.href}
																	class="text-brand hover:text-accent underline decoration-2 underline-offset-2 transition-colors duration-200"
																	target="_blank"
																	rel="noopener noreferrer">
																	{textItem.plain_text}
																</a>
															{:else}
																{textItem.plain_text}
															{/if}
														{/each}
													</td>
												{/if}
											{/each}
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-border">
						<p class="text-sm font-medium">Table has no content</p>
					</div>
				{/if}
			</div>
		{:else}
			<div class="p-2 my-4 text-sm text-gray-500">
				<!-- Unsupported block type: {block.type} -->
			</div>
		{/if}
	{/each}
</div>
