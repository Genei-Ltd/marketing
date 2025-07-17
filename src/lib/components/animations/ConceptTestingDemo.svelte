<script lang="ts">
	import { onMount } from "svelte"
	import { fade, scale } from "svelte/transition"

	let show = $state(false)
	let conceptsVisible = $state(false)
	let feedbackVisible = $state(false)
	let keywordsVisible = $state(false)

	onMount(() => {
		show = true

		setTimeout(() => (conceptsVisible = true), 300)
		setTimeout(() => (feedbackVisible = true), 1200)
		setTimeout(() => (keywordsVisible = true), 2000)
	})
</script>

{#if show}
	<div in:fade={{ duration: 400 }} class="flex flex-col items-center space-y-8 p-8">
		<!-- Concepts Input -->
		{#if conceptsVisible}
			<div in:fade={{ duration: 600 }} class="flex gap-4">
				<div class="flex h-12 w-20 items-center justify-center rounded-lg bg-blue-200">
					<div class="h-3 w-3 rounded bg-blue-500"></div>
				</div>
				<div class="flex h-12 w-20 items-center justify-center rounded-lg bg-green-200">
					<div class="h-3 w-3 rounded bg-green-500"></div>
				</div>
				<div class="flex h-12 w-20 items-center justify-center rounded-lg bg-purple-200">
					<div class="h-3 w-3 rounded bg-purple-500"></div>
				</div>
			</div>
		{/if}

		<!-- Arrow Down -->
		{#if conceptsVisible}
			<div in:fade={{ duration: 400, delay: 200 }} class="text-gray-400">
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd" />
				</svg>
			</div>
		{/if}

		<!-- Feedback Responses -->
		{#if feedbackVisible}
			<div in:scale={{ duration: 500 }} class="flex flex-col items-center space-y-2">
				<div class="flex gap-2">
					<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
					<div class="h-2 w-2 animate-pulse rounded-full bg-green-400" style="animation-delay: 0.2s"></div>
					<div class="h-2 w-2 animate-pulse rounded-full bg-yellow-400" style="animation-delay: 0.4s"></div>
					<div class="h-2 w-2 animate-pulse rounded-full bg-green-400" style="animation-delay: 0.6s"></div>
				</div>
				<div class="text-xs text-gray-500">Live feedback</div>
			</div>
		{/if}

		<!-- Arrow Down -->
		{#if feedbackVisible}
			<div in:fade={{ duration: 400, delay: 300 }} class="text-gray-400">
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd" />
				</svg>
			</div>
		{/if}

		<!-- Auto-generated Keywords -->
		{#if keywordsVisible}
			<div in:scale={{ duration: 500, delay: 200 }} class="flex flex-wrap justify-center gap-2">
				<div class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">#tag1</div>
				<div class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">#tag2</div>
				<div class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">#tag3</div>
			</div>
		{/if}

		<!-- Auto-labeling indicator -->
		{#if keywordsVisible}
			<div in:fade={{ duration: 400, delay: 400 }} class="text-center text-xs text-gray-500">Auto-labeling</div>
		{/if}
	</div>
{/if}
