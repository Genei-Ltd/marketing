<script lang="ts">
	import { IconCalendar, IconClock } from "@tabler/icons-svelte"
	import type { Article } from "$lib/types/articles"
	import { fly } from "svelte/transition"
	import { elasticOut } from "svelte/easing"
	import { Skeleton } from "$components/ui/skeleton"
	let { articles }: { articles: Promise<Article[]> } = $props()

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

{#await articles}
	<div
		class="gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3 min-h-96 lg:max-h-full max-h-96 grid grid-cols-1 overflow-hidden transition-all duration-500 ease-out">
		{#each Array.from({ length: 6 }, (_, i) => i) as i}
			<div
				class="group animate-fade-in block opacity-0 h-full"
				style="animation-delay: {250 + i * 100}ms"
				in:fly={{ y: 40, duration: 600, delay: 200 + i * 100, easing: elasticOut }}>
				<div class="bg-card overflow-hidden rounded-md">
					<div class="aspect-[16/9] bg-muted w-full overflow-hidden rounded-lg">
						<Skeleton class="w-full h-full" />
					</div>
				</div>
				<div class="mt-4 h-full">
					<div class="mb-2 space-y-1">
						<Skeleton class="w-full h-4" />
						<Skeleton class="w-3/4 h-4" />
					</div>
					<div class="flex items-center mt-2">
						<Skeleton class="w-3 h-3 mr-1" />
						<Skeleton class="w-24 h-3" />
					</div>
				</div>
			</div>
		{/each}
	</div>
{:then articles}
	{#if articles.length === 0}
		<div class="max-h-64 py-32 overflow-hidden text-center transition-all duration-500 ease-out">
			<p class="text-muted-foreground text-lg">New articles coming soon.</p>
			<p class="text-muted-foreground mt-2 text-sm">No articles available yet.</p>
		</div>
	{:else}
		<div
			class="gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 max-h-none grid grid-cols-1 overflow-visible transition-all duration-500 ease-out">
			{#each articles as post, i}
				<a
					href={post.externalUrl || `/blog/${post.slug}`}
					class="block"
					target={post.externalUrl ? "_blank" : "_self"}
					rel={post.externalUrl ? "noopener noreferrer" : undefined}>
					<div
						class="group animate-fade-in block transition-all duration-300 opacity-0"
						style="animation-delay: {150 + i * 80}ms"
						in:fly={{ y: 50, duration: 700, delay: 100 + i * 80, easing: elasticOut }}>
						<div class="block">
							<div class="bg-card overflow-hidden rounded-md">
								<!-- {#if post.coverImage} -->
								<div class="aspect-[16/9] w-full overflow-hidden rounded-lg relative">
									{#if isNew(post.publishedDate)}
										<span
											class="text-xs absolute shadow tracking-wider top-2 left-2 uppercase font-semibold bg-accent text-white px-1.5 py-0.5 rounded-sm z-20">
											New
										</span>
									{/if}
									{#if post.companyLogo}
										<div
											class="bg-gradient-to-tl from-black/50 to-black/30 absolute inset-0 z-10 flex items-center justify-center">
											<img
												src={post.companyLogo}
												alt={post.title}
												loading="lazy"
												class="h-fit z-20 w-auto max-w-xl brightness-0 contrast-200 invert drop-shadow-[0_0_0_white]" />
										</div>
									{:else if post.externalUrl}
										<div
											class="bg-gradient-to-tl from-black/50 to-black/30 absolute inset-0 z-10 flex items-end justify-start p-3 h-full overflow-hidden">
											<h1
												class="text-white text-[1.6rem] text-balance justify-end items-end font-thin capitalize font-serif text-left line-clamp-5 leading-tight">
												{post.title}
											</h1>
										</div>
									{/if}
									<img
										src={post.externalUrl
											? "/images/article-fallback.png"
											: post.coverImage || "/images/fallback.png"}
										alt={post.title}
										loading="lazy"
										class="group-hover:scale-110 animate-fade-in object-cover w-full h-full transition-all duration-500 ease-out opacity-0"
										style="animation-delay: {300 + i * 80}ms" />
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
							<div class="mt-6">
								<h3 class="text-foreground line-clamp-2 text-base font-medium">
									{post.title}
								</h3>
								{#if post.publishedDate}
									<div class="text-muted-foreground flex items-center mt-2 capitalize">
										<IconCalendar class="text-muted-foreground w-3 h-3 mr-1.5" stroke={0.8} />
										<span class="text-xs font-medium">
											{formatDate(post.publishedDate)}
										</span>
										{#if post.readingTime}
											<span class="text-muted-foreground mx-1.5">&bull;</span>
											<IconClock class="text-muted-foreground w-3 h-3 mr-1.5" stroke={0.8} />
											<span class="text-xs font-medium">
												{post.readingTime} min read
											</span>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
{/await}
