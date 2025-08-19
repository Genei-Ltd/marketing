<script lang="ts">
	//   import { ModeWatcher } from "mode-watcher"
	import type { Snippet } from "svelte"
	import type { LayoutData } from "./$types"

	import "../app.css"
	import EndReveal from "./EndReveal.svelte"
	import Footer from "./Footer.svelte"
	import Header from "./Header.svelte"

	import { page } from "$app/state"
	// import { ModeWatcher } from "mode-watcher"

	interface Props {
		children?: Snippet
		data: LayoutData
	}

	let { children, data }: Props = $props()
</script>

<!-- <ModeWatcher /> -->

<div class="bg-background relative flex flex-col w-full min-h-screen">
	<div class=" z-20 w-full bg-transparent">
		<div class="bg-background z-20 w-full">
			<Header />
			<main class=" flex-1 w-full">
				{@render children?.()}
			</main>
			{#if page.url.pathname === "/"}
				<div class="lg:snap-end">
					<Footer {data} />
				</div>
			{:else}
				<Footer {data} />
			{/if}
		</div>

		{#if page.url.pathname === "/"}
			<div class=" h-0">
				<div class="from-background to-background/0 bg-gradient-to-b h-32"></div>
			</div>
		{/if}
	</div>

	{#if page.url.pathname === "/"}
		<EndReveal />
	{/if}
</div>
