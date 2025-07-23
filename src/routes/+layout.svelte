<script lang="ts">
	//   import { ModeWatcher } from "mode-watcher"
	import type { Snippet } from "svelte"

	import "../app.css"
	import EndReveal from "./EndReveal.svelte"
	import Footer from "./Footer.svelte"
	import Header from "./Header.svelte"

	import { page } from "$app/state"
	// import { ModeWatcher } from "mode-watcher"

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props()
</script>

<!-- <ModeWatcher /> -->

<div class="bg-background relative flex flex-col min-h-screen">
	<div class="z-20 bg-transparent">
		<div class="bg-background z-20">
			<Header />
			<main class="flex-1">
				{@render children?.()}
			</main>
			<Footer />
		</div>
		<div class="from-background to-background/0 bg-gradient-to-b h-16"></div>
	</div>
	{#if page.url.pathname === "/"}
		<EndReveal />
	{/if}
</div>
