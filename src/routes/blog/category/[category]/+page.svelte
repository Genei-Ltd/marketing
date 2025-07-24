<script lang="ts">
	import BlogNav from "../../BlogNav.svelte"

	import type { PageData } from "./$types"
	import BlogEndArtCard from "$components/blocks/BlogEndArtCard.svelte"
	import BlogGrid from "../../BlogGrid.svelte"
	import { fly } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	let { data }: { data: PageData } = $props()

	const categoryDisplay = $derived(data.category.replaceAll("-", " ").replaceAll("and", "&").toLowerCase())
</script>

<svelte:head>
	<title>{categoryDisplay} Blog Posts</title>
	<meta name="description" content="Latest blog posts and articles" />
</svelte:head>

<div class=" relative max-w-6xl px-4 py-8 mx-auto mt-16 transition-all duration-500">
	{#key data.category}
		<div
			class=" my-12 transition-all duration-500"
			in:fly={{ x: -10, duration: 300, easing: cubicInOut, delay: 500 }}
			out:fly={{ x: 10, duration: 500, easing: cubicInOut }}>
			<h1 class=" text-foreground mb-2 font-serif font-medium capitalize">{categoryDisplay}</h1>
			<p class="text-foreground opacity-60 text-base">
				Latest {categoryDisplay} articles and insights from our team
			</p>
		</div>
	{/key}

	<BlogNav categories={data.categories} />

	<BlogGrid articles={data.articles} />
</div>

<BlogEndArtCard />
