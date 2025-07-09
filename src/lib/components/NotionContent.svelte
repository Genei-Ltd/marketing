<script lang="ts">
  interface Props {
    blocks?: any[];
  }

  let { blocks = [] }: Props = $props();

  function extractRichText(richText: any[]): string {
    return richText?.map((item) => item.plain_text || "").join("") || ""
  }

  function getRichTextWithFormatting(richText: any[]): any[] {
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

<div class="notion-content w-full mx-auto px-0 py-8">
  {#each blocks as block}
    <div class="notion-block mb-4" data-block-type={block.type}>
      {#if block.type === "paragraph"}
        <p class="text-foreground leading-relaxed mb-4">
          {#each getRichTextWithFormatting(block.paragraph?.rich_text || []) as textItem}
            {#if textItem.annotations?.bold}
              <strong>{textItem.plain_text}</strong>
            {:else if textItem.annotations?.italic}
              <em>{textItem.plain_text}</em>
            {:else if textItem.annotations?.code}
              <code class="bg-gray-100 px-1 py-0.5 text-sm font-mono"
                >{textItem.plain_text}</code
              >
            {:else if textItem.annotations?.underline}
              <u>{textItem.plain_text}</u>
            {:else if textItem.annotations?.strikethrough}
              <s>{textItem.plain_text}</s>
            {:else if textItem.href}
              <a
                href={textItem.href}
                class="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {textItem.plain_text}
              </a>
            {:else}
              {textItem.plain_text}
            {/if}
          {/each}
        </p>
      {:else if block.type === "heading_1"}
        <h1 class="text-4xl font-bold text-foreground mb-6 mt-8">
          {extractRichText(block.heading_1?.rich_text || [])}
        </h1>
      {:else if block.type === "heading_2"}
        <h2 class="text-3xl font-semibold text-foreground mb-5 mt-7">
          {extractRichText(block.heading_2?.rich_text || [])}
        </h2>
      {:else if block.type === "heading_3"}
        <h3 class="text-2xl font-semibold text-foreground mb-4 mt-6">
          {extractRichText(block.heading_3?.rich_text || [])}
        </h3>
      {:else if block.type === "bulleted_list_item"}
        <ul class="list-disc list-inside text-foreground mb-2">
          <li class="leading-relaxed">
            {extractRichText(block.bulleted_list_item?.rich_text || [])}
          </li>
        </ul>
      {:else if block.type === "numbered_list_item"}
        <ol class="list-decimal list-inside text-foreground mb-2">
          <li class="leading-relaxed">
            {extractRichText(block.numbered_list_item?.rich_text || [])}
          </li>
        </ol>
      {:else if block.type === "to_do"}
        <div class="flex items-start mb-2">
          <input
            type="checkbox"
            checked={block.to_do?.checked || false}
            disabled
            class="mt-1 mr-3 h-4 w-4 text-secondary-foreground border-border focus:ring-primary"
          />
          <span
            class="text-foreground leading-relaxed"
            class:line-through={block.to_do?.checked}
          >
            {extractRichText(block.to_do?.rich_text || [])}
          </span>
        </div>
      {:else if block.type === "toggle"}
        <details class="mb-4" open={false}>
          <summary
            class="font-medium text-foreground cursor-pointer hover:text-foreground/80 py-2 select-none flex items-center"
          >
            <span class="mr-2 text-muted-foreground">▶</span>
            {extractRichText(block.toggle?.rich_text || [])}
          </summary>
          <div class="ml-6 mt-2 space-y-2">
            {#if block.children && block.children.length > 0}
              {#each block.children as childBlock}
                <div class="notion-nested-block">
                  {#if childBlock.type === "paragraph"}
                    <p class="text-foreground leading-relaxed">
                      {#each getRichTextWithFormatting(childBlock.paragraph?.rich_text || []) as textItem}
                        {#if textItem.annotations?.bold}
                          <strong>{textItem.plain_text}</strong>
                        {:else if textItem.annotations?.italic}
                          <em>{textItem.plain_text}</em>
                        {:else if textItem.annotations?.code}
                          <code
                            class="bg-gray-100 px-1 py-0.5 text-sm font-mono"
                            >{textItem.plain_text}</code
                          >
                        {:else if textItem.href}
                          <a
                            href={textItem.href}
                            class="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {textItem.plain_text}
                          </a>
                        {:else}
                          {textItem.plain_text}
                        {/if}
                      {/each}
                    </p>
                  {:else if childBlock.type === "bulleted_list_item"}
                    <ul class="list-disc list-inside text-foreground ml-4">
                      <li class="leading-relaxed">
                        {extractRichText(
                          childBlock.bulleted_list_item?.rich_text || [],
                        )}
                      </li>
                    </ul>
                  {:else if childBlock.type === "numbered_list_item"}
                    <ol class="list-decimal list-inside text-foreground ml-4">
                      <li class="leading-relaxed">
                        {extractRichText(
                          childBlock.numbered_list_item?.rich_text || [],
                        )}
                      </li>
                    </ol>
                  {:else if childBlock.type === "heading_3"}
                    <h4 class="text-lg font-semibold text-foreground mb-2">
                      {extractRichText(childBlock.heading_3?.rich_text || [])}
                    </h4>
                  {:else if childBlock.type === "code"}
                    <div class="my-2">
                      <pre
                        class="bg-muted text-muted-foreground p-3 overflow-x-auto text-sm">
                        <code class="font-mono"
                          >{extractRichText(
                            childBlock.code?.rich_text || [],
                          )}</code
                        >
                      </pre>
                    </div>
                  {:else if childBlock.type === "quote"}
                    <blockquote
                      class="border-l-3 border-border pl-3 italic text-muted-foreground my-2"
                    >
                      {extractRichText(childBlock.quote?.rich_text || [])}
                    </blockquote>
                  {:else if childBlock.type === "image"}
                    <div class="my-3">
                      <img
                        src={childBlock.image?.external?.url ||
                          childBlock.image?.file?.url}
                        alt={extractRichText(childBlock.image?.caption || [])}
                        class="max-w-full h-auto shadow-sm"
                      />
                      {#if childBlock.image?.caption && childBlock.image.caption.length > 0}
                        <div
                          class="text-xs text-muted-foreground mt-1 text-center"
                        >
                          {extractRichText(childBlock.image.caption)}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <div class="text-sm text-muted-foreground bg-muted p-2">
                      {childBlock.type}: {extractRichText(
                        childBlock[childBlock.type]?.rich_text || [],
                      )}
                    </div>
                  {/if}
                </div>
              {/each}
            {:else}
              <p class="text- italic text-sm">Empty toggle</p>
            {/if}
          </div>
        </details>
      {:else if block.type === "quote"}
        <blockquote
          class="border-l-4 border-border pl-4 italic text-muted-foreground mb-4"
        >
          {extractRichText(block.quote?.rich_text || [])}
        </blockquote>
      {:else if block.type === "callout"}
        <div class="bg-muted border border-border p-4 mb-4">
          <div class="flex items-start">
            {#if block.callout?.icon}
              <span class="text-2xl mr-3 mt-0.5">
                {#if block.callout.icon.type === "emoji"}
                  {block.callout.icon.emoji}
                {:else if block.callout.icon.type === "external"}
                  <img
                    src={block.callout.icon.external.url}
                    alt=""
                    class="w-6 h-6"
                  />
                {/if}
              </span>
            {/if}
            <div class="flex-1 text-foreground">
              {extractRichText(block.callout?.rich_text || [])}
            </div>
          </div>
        </div>
      {:else if block.type === "code"}
        <div class="mb-4">
          <pre class="bg-muted text-muted-foreground p-4 overflow-x-auto">
            <code class="text-sm font-mono"
              >{extractRichText(block.code?.rich_text || [])}</code
            >
          </pre>
          {#if block.code?.language}
            <div class="text-xs text-muted-foreground mt-1">
              Language: {block.code.language}
            </div>
          {/if}
        </div>
      {:else if block.type === "divider"}
        <hr class="border-border my-8" />
      {:else if block.type === "image"}
        <div class="mb-6">
          <img
            src={block.image?.external?.url || block.image?.file?.url}
            alt={extractRichText(block.image?.caption || [])}
            class="max-w-full h-auto shadow-sm"
          />
          {#if block.image?.caption && block.image.caption.length > 0}
            <div class="text-sm text-muted-foreground mt-2 text-center italic">
              {extractRichText(block.image.caption)}
            </div>
          {/if}
        </div>
      {:else if block.type === "video"}
        <div class="mb-6">
          <div
            class="relative w-full bg-muted overflow-hidden"
            style="aspect-ratio: 16/9;"
          >
            <iframe
              src={getEmbedUrl(
                block.video?.external?.url || block.video?.file?.url || "",
              )}
              title="Video content"
              class="absolute inset-0 w-full h-full border-0"
              allowfullscreen
            ></iframe>
          </div>
          {#if block.video?.caption && block.video.caption.length > 0}
            <div class="text-sm text-muted-foreground mt-2 text-center italic">
              {extractRichText(block.video.caption)}
            </div>
          {/if}
        </div>
      {:else if block.type === "embed"}
        <div class="mb-6">
          <div
            class="relative w-full bg-muted overflow-hidden"
            style="aspect-ratio: 16/9;"
          >
            <iframe
              src={getEmbedUrl(block.embed?.url || "")}
              title="Embedded content"
              class="absolute inset-0 w-full h-full border-0"
              allowfullscreen
            ></iframe>
          </div>
          {#if block.embed?.caption && block.embed.caption.length > 0}
            <div class="text-sm text-muted-foreground mt-2 text-center italic">
              {extractRichText(block.embed.caption)}
            </div>
          {/if}
        </div>
      {:else if block.type === "bookmark"}
        <div class="border border-border p-4 mb-4 hover:bg-muted">
          <a
            href={block.bookmark?.url}
            target="_blank"
            rel="noopener noreferrer"
            class="block"
          >
            <div class="text-blue-600 hover:text-blue-800 font-medium">
              {block.bookmark?.url}
            </div>
            {#if block.bookmark?.caption && block.bookmark.caption.length > 0}
              <div class="text-sm text-muted-foreground mt-1">
                {extractRichText(block.bookmark.caption)}
              </div>
            {/if}
          </a>
        </div>
      {:else if block.type === "table"}
        <div class="overflow-x-auto mb-6">
          <table class="min-w-full border border-border">
            <!-- Table rendering would need the table rows from child blocks -->
            <tbody>
              <tr>
                <td class="border border-border px-4 py-2 text-foreground">
                  Table content (requires nested block processing)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      {:else}
        <!-- Fallback for unknown block types -->
        <div class="bg-muted border border-border p-3 mb-4">
          <div class="text-sm text-muted-foreground">
            Block type: <code class="font-mono">{block.type}</code>
          </div>
          {#if block[block.type]?.rich_text}
            <div class="mt-2 text-foreground">
              {extractRichText(block[block.type].rich_text)}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .notion-content {
    font-family:
      ui-sans-serif,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Helvetica,
      "Apple Color Emoji",
      Arial,
      sans-serif,
      "Segoe UI Emoji",
      "Segoe UI Symbol";
    line-height: 1.6;
  }

  .notion-content h1,
  .notion-content h2,
  .notion-content h3 {
    line-height: 1.2;
  }

  .notion-content ul,
  .notion-content ol {
    margin-left: 1rem;
  }

  .notion-content code {
    font-family:
      "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  }

  /* Toggle styling */
  details > summary {
    list-style: none;
  }

  details > summary::-webkit-details-marker {
    display: none;
  }

  details[open] > summary span:first-child {
    transform: rotate(90deg);
    transition: transform 0.2s ease-in-out;
  }

  details > summary span:first-child {
    transition: transform 0.2s ease-in-out;
    display: inline-block;
  }

  details > summary:hover {
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
  }

  .notion-nested-block {
    border-left: 2px solid var(--border);
    padding-left: 0.75rem;
  }
</style>
