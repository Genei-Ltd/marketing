<script lang="ts">
	import { Button } from "$components/ui/button"
	import { page } from "$app/stores"
	import { fly } from "svelte/transition"
	import { cubicInOut } from "svelte/easing"

	let { categories }: { categories: string[] } = $props()

	function isActive(href: string): boolean {
		return $page.url.pathname === href
	}

	function getCategorySlug(category: string): string {
		return category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")
	}
</script>

<nav aria-label="Blog categories">
	<div
		class="min-h-6 scrollbar-hide flex flex-row gap-4 mb-8 overflow-x-scroll capitalize"
		in:fly={{ y: 10, duration: 300, easing: cubicInOut }}
		out:fly={{ y: -10, duration: 300, easing: cubicInOut }}>
		<div in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 50 }}>
			<Button
				variant="link"
				size="none"
				href="/blog"
				class={isActive("/blog")
					? "underline text-accent underline-offset-4 opacity-100 hover:opacity-80"
					: "opacity-100 hover:opacity-80"}>
				All
			</Button>
		</div>

		{#each categories as category, i (category)}
			{@const categoryHref = `/blog/category/${getCategorySlug(category)}`}
			<div in:fly={{ y: 5, duration: 300, easing: cubicInOut, delay: 50 + (i + 1) * 30 }}>
				<Button
					variant="link"
					size="none"
					href={categoryHref}
					class={isActive(categoryHref)
						? "underline text-accent underline-offset-4 opacity-100 hover:opacity-80"
						: "opacity-100 hover:opacity-80"}>
					{category}
				</Button>
			</div>
		{/each}
	</div>
</nav>
