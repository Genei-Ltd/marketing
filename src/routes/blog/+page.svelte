<script lang="ts">
	import type { PageData } from "./$types"
	import BlogGrid from "./BlogGrid.svelte"

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="CoLoop Blog" content="Latest blog posts and articles" />
</svelte:head>

<div class="max-w-6xl lg:px-10 px-6 py-8 mx-auto">
	<BlogGrid articles={data.articles} />
</div>
