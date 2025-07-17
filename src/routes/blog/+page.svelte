<script lang="ts">
	import { IconCalendar } from "@tabler/icons-svelte"
	import type { PageData } from "./$types"
	import BlogEndArtCard from "$components/blocks/BlogEndArtCard.svelte"
	import { Button } from "$components/ui/button"

	let { data }: { data: PageData } = $props()

	function getPublishDate(publishDate: string | { start: string } | null): string | null {
		if (!publishDate) return null
		if (typeof publishDate === "object" && "start" in publishDate) {
			return publishDate.start
		}
		if (typeof publishDate === "string") {
			return publishDate
		}
		return null
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return "No date"
		try {
			const date = new Date(dateString)
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		} catch {
			return "Invalid date"
		}
	}
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="description" content="Latest blog posts and articles" />
</svelte:head>

<div class=" max-w-6xl px-4 py-8 mx-auto mt-16">
	<div class="mb-8">
		<h1 class=" text-foreground mb-2 font-serif text-xl font-bold">All articles</h1>
		<p class="text-foreground opacity-60 text-base">Latest articles and insights from our team</p>
	</div>

	<div class="flex flex-row gap-4 mb-8 capitalize">
		{#each data.categories as category}
			<Button
				variant="link"
				size="none"
				href={`/blog/category/${category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")}`}>
				{category}
			</Button>
		{/each}
	</div>

	{#if data.blogPosts.length === 0}
		<div class="py-12 text-center">
			<p class="text-muted-foreground text-lg">
				No blog posts available. Please check your Notion database configuration.
			</p>
			<p class="text-muted-foreground mt-2 text-sm">
				Make sure to set your Notion database ID in the server file.
			</p>
		</div>
	{:else}
		<div class="gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
			{#each data.blogPosts as post}
				<a href={`/blog/${post.slug}`} class="group block">
					<div class="overflow-hidden rounded-md">
						{#if post.coverImage}
							<div class="aspect-[5/3] w-full overflow-hidden rounded-lg">
								<img
									src={post.coverImage}
									alt={post.title}
									class="group-hover:scale-105 object-cover w-full h-full transition-transform duration-300" />
							</div>
						{:else}
							<div class="aspect-[5/3] bg-card flex items-center justify-center w-full rounded-lg">
								<p class="text-muted-foreground opacity-60 text-balance text-md text-center">
									{post.title}
								</p>
							</div>
						{/if}
					</div>
					<div class="mt-4">
						<h3 class="text-foreground text-base font-semibold">
							{post.title}
						</h3>
						{#if post.publishDate}
							<div class="text-foreground opacity-60 flex items-center mt-2 uppercase">
								<IconCalendar class="opacity-60 w-3 h-3 mr-1" />
								<span class="text-xs font-medium">
									{formatDate(getPublishDate(post.publishDate))}
								</span>
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<BlogEndArtCard />
