<script lang="ts">
	import type { PageData } from "./$types"
	import BlogGrid from "./BlogGrid.svelte"

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="CoLoop Blog" content="Latest blog posts and articles" />
</svelte:head>

<div class="max-w-7xl px-4 py-8 mx-auto">
	<BlogGrid articles={data.articles} />
</div>
