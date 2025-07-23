<script lang="ts">
	import { Button } from "$components/ui/button"
	import { page } from "$app/stores"

	let { categories }: { categories: string[] } = $props()

	function isActive(href: string): boolean {
		return $page.url.pathname === href
	}

	function getCategorySlug(category: string): string {
		return category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")
	}
</script>

<nav aria-label="Blog categories">
	<div class="flex flex-row gap-4 mb-8 capitalize">
		<Button
			variant="link"
			size="none"
			href="/blog"
			class={isActive("/blog") ? "underline text-accent underline-offset-4" : "opacity-80 hover:opacity-100"}>
			All
		</Button>

		{#each categories as category (category)}
			{@const categoryHref = `/blog/category/${getCategorySlug(category)}`}
			<Button
				variant="link"
				size="none"
				href={categoryHref}
				class={isActive(categoryHref)
					? "underline text-accent underline-offset-4"
					: "opacity-80 hover:opacity-100"}>
				{category}
			</Button>
		{/each}
	</div>
</nav>
