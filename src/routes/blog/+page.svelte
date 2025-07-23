<script lang="ts">
	import type { PageData } from "./$types"
	import BlogGrid from "./BlogGrid.svelte"
	import BlogNav from "./BlogNav.svelte"
	import BlogEndArtCard from "$components/blocks/BlogEndArtCard.svelte"

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="description" content="Latest blog posts and articles" />
</svelte:head>

<div class="py-8 mx-auto mt-16 flex flex-col gap-4 bg-primary text-primary-foreground">
	<div class="my-12 px-4 max-w-6xl w-full mx-auto">
		<h1 class="  mb-2 font-serif font-medium capitalize">All articles</h1>
		<p class=" opacity-60 text-base">Latest articles and insights from our team</p>
		<!-- <BlogNav categories={data.categories} /> -->
	</div>
</div>

<div class=" max-w-6xl px-4 py-8 mx-auto mt-16">
	<BlogNav categories={data.categories} />

	<BlogGrid articles={data.articles} />
</div>

<BlogEndArtCard />
