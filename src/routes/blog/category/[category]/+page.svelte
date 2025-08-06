<script lang="ts">
	import type { PageData } from "./$types"

	import BlogGrid from "../../BlogGrid.svelte"

	let { data }: { data: PageData } = $props()

	const categoryDisplay = $derived(data.category.replaceAll("-", " ").replaceAll("and", "&").toLowerCase())
</script>

<svelte:head>
	<title>{categoryDisplay} Blog Posts</title>
	<meta name="description" content="Latest blog posts and articles" />
</svelte:head>

<div class="max-w-7xl relative px-4 py-8 mx-auto">
	<BlogGrid articles={data.articles} />
</div>
