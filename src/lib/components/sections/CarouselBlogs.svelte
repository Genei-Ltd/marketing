<script lang="ts">
	import { quintOut } from "svelte/easing"
	import { Button } from "$lib/components/ui/button/index.js"
	import * as Carousel from "$lib/components/ui/carousel/index.js"
	import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
	import type { Article } from "$lib/types/articles"

	let { articles: articles }: { articles: Article[] } = $props()
	console.log("blogs in the carousel component :", articles)

	// Use the actual blogs data instead of hardcoded posts
	const blogPosts = articles && articles.length > 0 ? articles : []

	let api: CarouselAPI | undefined = $state()
	const count = $derived(api ? api.scrollSnapList().length : 0)
	const dots = $derived(Array.from({ length: count }, (_, i) => i))
	let current = $state(0)

	$effect(() => {
		if (!api) return

		current = api.selectedScrollSnap()
		api.on("select", () => {
			current = api!.selectedScrollSnap()
		})
	})
</script>

<div class="md:py-24 bg-muted w-full py-16">
	<Carousel.Root
		opts={{
			loop: true,
			align: "center",
		}}
		setApi={(emblaApi) => (api = emblaApi)}
		class=" w-full mx-auto h-full  mask-l-from-95% mask-r-from-95%">
		<Carousel.Content class="flex">
			{#each blogPosts as post, index}
				<Carousel.Item
					class="flex-[0_0_80%] h-full max-w-4xl md:flex-[0_0_70%] lg:flex-[0_0_60%] px-2 {index === current
						? 'opacity-100'
						: 'opacity-20'} transition-opacity  duration-500 ease-in-out"
					onclick={() => api?.scrollTo(index)}>
					<div
						class="relative h-full w-full overflow-hidden rounded-xl shadow-2xl select-none aspect-[16/10]">
						<img
							src={post.coverImage || "/images/fallback.png"}
							alt={post.title}
							class="absolute inset-0 object-cover w-full h-full" />
						<div class="bg-gradient-to-t from-muted/90 via-muted/40 to-transparent absolute inset-0"></div>
						<!-- Company Logo -->
						<div class="text-card absolute inset-0 z-20 flex items-center justify-center flex-shrink-0 p-4">
							{#if post.companyLogo}
								<img
									src={post.companyLogo}
									alt={post.company || "Company"}
									class="w-auto h-12 brightness-0 contrast-200 invert drop-shadow-[0_0_0_white]" />
							{:else if post.company}
								<div class="md:text-3xl text-2xl font-bold tracking-tight lowercase">
									{post.company}
								</div>
							{/if}
						</div>
					</div>
					<div class="relative z-10">
						<div class=" text-background relative flex flex-col justify-start h-full px-2">
							<!-- Content -->
							<div class="flex flex-col justify-center flex-1 mt-4 mb-1">
								<blockquote class=" text-background line-clamp-2 text-lg font-medium">
									{post.title}
								</blockquote>
							</div>

							<!-- Footer -->
							<div class="flex items-end justify-between flex-shrink-0 gap-6">
								<div class="flex-1">
									<p class=" text-muted-foreground text-sm font-semibold">{post.company}</p>
									<div class="flex flex-row gap-3">
										{#if post.category}
											{#each post.category as category}
												<p class="text-muted-foreground text-sm capitalize">{category}</p>
											{/each}
										{/if}
									</div>
								</div>
								<div class="flex-shrink-0">
									<Button href={"/blog/" + post.slug} variant="secondary" class=""
										>Read Article</Button>
								</div>
							</div>
						</div>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>

	<div class="text-muted-foreground py-2 mt-8 text-sm text-center">
		<div class="flex items-center justify-center gap-2 py-2">
			{#each dots as i (i)}
				<span
					onclick={() => api?.scrollTo(i)}
					onkeydown={(e) => e.key === "Enter" && api?.scrollTo(i)}
					role="button"
					tabindex={i === current ? 0 : -1}
					aria-current={i === current}
					class={`
						transition-all duration-300 ease-in-out rounded-full cursor-pointer
						${i === current ? "bg-background w-8 h-2 scale-110 shadow-lg" : "bg-secondary w-2 h-2 scale-90 opacity-60"}
					`}
					style="transition-property: width, background, box-shadow, opacity, transform;"></span>
			{/each}
		</div>
	</div>
</div>
