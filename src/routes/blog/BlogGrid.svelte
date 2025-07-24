<script lang="ts">
	import { IconCalendar } from "@tabler/icons-svelte"
	import type { Article } from "$lib/types/articles"
	import { fly } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	let { articles }: { articles: Article[] } = $props()

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
	function isNew(dateString: string | undefined): boolean {
		if (!dateString) return false
		const date = new Date(dateString)
		return date.getTime() > Date.now() - 1000 * 60 * 60 * 24 * 30 // 30 days
	}
</script>

{#if articles.length === 0}
	<div class="py-32 text-center">
		<p class="text-muted-foreground text-lg">New articles coming soon.</p>
		<p class="text-muted-foreground mt-2 text-sm">No articles available yet.</p>
	</div>
{:else}
	<div class="gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
		{#each articles as post, i}
			<div
				class="group block"
				in:fly={{ y: 50, duration: 600, delay: i * 100, easing: cubicInOut }}
				out:fly={{ y: -50, duration: 400, easing: cubicInOut }}>
				<a href={`/blog/${post.slug}`} class="block">
					<div class="bg-card overflow-hidden rounded-md">
						<!-- {#if post.coverImage} -->
						<div class="aspect-[5/3] w-full overflow-hidden rounded-lg relative">
							{#if isNew(post.publishedDate)}
								<span
									class="text-xs absolute shadow tracking-wider top-2 left-2 uppercase font-semibold bg-accent text-white px-1.5 py-0.5 rounded-sm z-20">
									New
								</span>
							{/if}
							{#if post.companyLogo}
								<div
									class="bg-gradient-to-tl from-primary/50 to-primary/30 absolute inset-0 z-10 flex items-center justify-center">
									<img
										src={post.companyLogo}
										alt={post.title}
										loading="lazy"
										class="h-fit z-20 w-auto max-w-xl brightness-0 contrast-200 invert drop-shadow-[0_0_0_white]" />
								</div>
							{/if}
							<img
								src={post.coverImage || "/images/fallback.png"}
								alt={post.title}
								loading="lazy"
								class="group-hover:scale-105 object-cover w-full h-full transition-transform duration-300" />
						</div>
						<!-- {:else}
							<div class="aspect-[5/3] bg-card flex items-center justify-center w-full rounded-lg">
								<p
									class="text-muted-foreground opacity-60 text-balance text-md line-clamp-2 text-center">
									{post.title}
								</p>
							</div>
						{/if} -->
					</div>
					<div class="mt-4">
						<h3 class="text-foreground line-clamp-2 text-base font-semibold">
							{post.title}
						</h3>
						{#if post.publishedDate}
							<div class="text-foreground opacity-60 flex items-center mt-2 uppercase">
								<IconCalendar class="opacity-60 w-3 h-3 mr-1" />
								<span class="text-xs font-medium">
									{formatDate(post.publishedDate)}
								</span>
							</div>
						{/if}
					</div>
				</a>
			</div>
		{/each}
	</div>
{/if}
