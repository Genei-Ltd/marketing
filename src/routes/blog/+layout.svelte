<script lang="ts">
	import type { Snippet } from "svelte"
	import BlogNav from "./BlogNav.svelte"
	import { page } from "$app/state"
	import { slide, fly } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	import { Skeleton } from "$lib/components/ui/skeleton"
	import BlogEndArtCard from "$components/blocks/BlogEndArtCard.svelte"

	interface Props {
		children?: Snippet
		data?: {
			categories?: Promise<string[]>
		}
	}

	let { children, data }: Props = $props()

	// Check specific blog routes
	const isBlogHome = $derived(page.url.pathname === "/blog")
	const isCategoryPage = $derived(page.url.pathname.startsWith("/blog/category/"))
	const isBlogPostPage = $derived(
		page.url.pathname.startsWith("/blog/") &&
			!page.url.pathname.startsWith("/blog/category/") &&
			page.url.pathname !== "/blog",
	)

	// Extract category from URL for category pages
	const currentCategory = $derived(() => {
		if (isCategoryPage) {
			const pathParts = page.url.pathname.split("/")
			return pathParts[pathParts.length - 1]
		}
		return null
	})

	const categoryDisplay = $derived.by(() => {
		const category = currentCategory()
		if (category) {
			return category.replaceAll("-", " ").replaceAll("and", "&").toLowerCase()
		}
		return null
	})
</script>

<!-- Blog Title Section -->
{#if isBlogHome && !isBlogPostPage}
	<!-- Fixed height wrapper to prevent layout shift -->
	<div class="mx-auto mt-14 min-h-[225px]">
		<!-- Animated primary background container -->
		<div
			class="bg-primary text-primary-foreground flex flex-col gap-4 py-8"
			in:slide={{ duration: 400, easing: cubicInOut, axis: "y", delay: 100 }}>
			<div
				class="max-w-6xl lg:px-10 w-full px-6 mx-auto my-12"
				in:fly={{ y: -30, duration: 400, easing: cubicInOut, delay: 250 }}>
				<h1 class="mb-2 font-serif text-2xl font-light capitalize">All articles</h1>
				<p class="opacity-60 text-balance text-md">Latest articles and insights from our team</p>
			</div>
		</div>
	</div>
{:else if isCategoryPage && categoryDisplay}
	<!-- Fixed height container to prevent layout shift -->
	<div class="max-w-6xl lg:px-10 px-6 relative py-8 mx-auto mt-16 min-h-[225px] transition-all duration-500">
		{#key page.url.pathname}
			<div
				in:fly={{ x: -30, duration: 400, easing: cubicInOut, delay: 250 }}
				class="mt-12 transition-all duration-500">
				<h1 class="text-foreground mb-2 font-serif text-2xl font-light capitalize">{categoryDisplay}</h1>
				<p class="text-foreground opacity-60 text-balance text-md">
					Latest {categoryDisplay} articles and insights from our team
				</p>
			</div>
		{/key}
	</div>
{/if}

<!-- Blog Navigation -->
{#if !isBlogPostPage}
	<div class="max-w-6xl lg:px-10 px-6 mx-auto">
		{#if data?.categories}
			{#await data.categories}
				<div class="flex flex-row gap-4 mb-8">
					<Skeleton class="w-8 h-6" />
					<Skeleton class="w-16 h-6" />
					<Skeleton class="w-20 h-6" />
					<Skeleton class="w-14 h-6" />
					<Skeleton class="w-18 h-6" />
				</div>
			{:then categories}
				<div
					class="mt-12"
					in:fly={{ x: -20, duration: 300, easing: cubicInOut, delay: 300 }}
					out:fly={{ x: 20, duration: 300, easing: cubicInOut }}>
					<BlogNav {categories} />
				</div>
			{:catch}
				<div class="flex flex-row items-center h-6 gap-4 mb-8">
					<p class="text-muted-foreground text-sm">Failed to load navigation</p>
				</div>
			{/await}
		{/if}
	</div>
{/if}

<!-- Blog content -->
{@render children?.()}

<div class="lg:px-10 w-full px-6 mx-auto mt-32 mb-32">
	<div class="max-w-6xl w-full mx-auto">
		<BlogEndArtCard />
	</div>
</div>
