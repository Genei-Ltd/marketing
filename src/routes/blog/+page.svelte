<script lang="ts">
	import type { PageData } from "./$types"
	import BlogGrid from "./BlogGrid.svelte"
	import BlogNav from "./BlogNav.svelte"
	import BlogEndArtCard from "$components/blocks/BlogEndArtCard.svelte"
	import { slide } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"
	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="description" content="Latest blog posts and articles" />
</svelte:head>

<div
	class="bg-primary text-primary-foreground flex flex-col gap-4 py-8 mx-auto mt-16"
	in:slide={{ duration: 600, easing: cubicInOut, axis: "y" }}
	out:slide={{ duration: 400, easing: cubicInOut, axis: "y" }}>
	<div class="w-full max-w-6xl px-4 mx-auto my-12">
		<h1 class=" mb-2 font-serif font-medium capitalize">All articles</h1>
		<p class=" opacity-60 text-base">Latest articles and insights from our team</p>
		<!-- <BlogNav categories={data.categories} /> -->
	</div>
</div>

<div class=" max-w-6xl px-4 py-8 mx-auto mt-16">
	<BlogNav categories={data.categories} />

	<BlogGrid articles={data.articles} />
</div>

<BlogEndArtCard />
