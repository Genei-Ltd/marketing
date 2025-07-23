<script lang="ts">
	import BlogNav from "../../BlogNav.svelte"

	import type { PageData } from "./$types"
	import BlogEndArtCard from "$components/blocks/BlogEndArtCard.svelte"
	import BlogGrid from "../../BlogGrid.svelte"

	let { data }: { data: PageData } = $props()

	const categoryDisplay = $derived(data.category.replaceAll("-", " ").replaceAll("and", "&").toLowerCase())
</script>

<svelte:head>
	<title>{categoryDisplay} Blog Posts</title>
	<meta name="description" content="Latest blog posts and articles" />
</svelte:head>

<div class=" max-w-6xl px-4 py-8 mx-auto mt-16">
	<div class="my-12">
		<h1 class=" text-foreground font- mb-2 font-serif capitalize">{categoryDisplay}</h1>
		<p class="text-foreground opacity-60 text-base">Latest {categoryDisplay} articles and insights from our team</p>
	</div>

	<BlogNav categories={data.categories} />

	<BlogGrid articles={data.articles} />
</div>

<BlogEndArtCard />
