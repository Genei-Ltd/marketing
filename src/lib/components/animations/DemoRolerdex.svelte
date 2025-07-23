<script lang="ts" module>
	import { cn } from "$lib/utils.js"
	import type { Snippet } from "svelte"

	export type RolodexProps = {
		items: unknown[]
		children: Snippet<[item: unknown, index: number]>
		class?: string
		autoPlay?: boolean
		interval?: number
		showControls?: boolean
	}
</script>

<script lang="ts">
	import { onMount } from "svelte"
	import { IconChevronLeft, IconChevronRight } from "@tabler/icons-svelte"

	let {
		items = [],
		children,
		class: className,
		autoPlay = true,
		interval = 3000,
		showControls = true,
	}: RolodexProps = $props()

	let currentIndex = $state(0)
	let isFlipping = $state(false)
	let intervalId: number | null = null
	let rolodexElement: HTMLDivElement

	let totalItems = $derived(items.length)

	function nextItem() {
		if (isFlipping || totalItems <= 1) return

		isFlipping = true
		currentIndex = (currentIndex + 1) % totalItems

		setTimeout(() => {
			isFlipping = false
		}, 600)
	}

	function prevItem() {
		if (isFlipping || totalItems <= 1) return

		isFlipping = true
		currentIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1

		setTimeout(() => {
			isFlipping = false
		}, 600)
	}

	function startAutoPlay() {
		if (autoPlay && totalItems > 1) {
			intervalId = setInterval(nextItem, interval)
		}
	}

	function stopAutoPlay() {
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
	}

	onMount(() => {
		startAutoPlay()

		return () => {
			stopAutoPlay()
		}
	})

	// Handle hover to pause auto-play
	function handleMouseEnter() {
		stopAutoPlay()
	}

	function handleMouseLeave() {
		startAutoPlay()
	}
</script>

<div
	bind:this={rolodexElement}
	class={cn("relative w-full h-full perspective-1000 overflow-hidden", className)}
	role="region"
	aria-label="Rolodex carousel"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	style="perspective-origin: center center;">
	<!-- Card Container -->
	<div class="relative w-full h-full preserve-3d" style="transform-origin: center center;">
		{#each items as item, index}
			<div
				class="absolute left-0 right-0 transition-all duration-800 ease-in-out"
				style="
					width: 60%;
					height: 40%;
					top: 10%;
					left: 20%;
					transform-origin: center bottom;
					transform: rotateX({(index - currentIndex) * 20}deg) rotateX({index === currentIndex
					? 0
					: index - currentIndex < 0
						? -75
						: 20}deg) translateZ(0px) scale({index === currentIndex ? 1.05 : 1});
					opacity: {Math.abs(index - currentIndex) <= 8 ? Math.max(0.3, 1 - Math.abs(index - currentIndex) * 0.2) : 0};
					filter: {index === currentIndex ? 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.5))' : 'none'};
					z-index: {index === currentIndex ? 100 : Math.max(0, 50 - Math.abs(index - currentIndex))};
				">
				{@render children?.(item, index)}
			</div>
		{/each}
	</div>

	<!-- Navigation Controls -->
	{#if showControls && totalItems > 1}
		<div class="absolute inset-0 flex items-center justify-between pointer-events-none z-20">
			<button
				class="ml-4 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200 pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={prevItem}
				disabled={isFlipping}
				aria-label="Previous item">
				<IconChevronLeft size={20} class="text-white drop-shadow-sm" />
			</button>

			<button
				class="mr-4 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200 pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={nextItem}
				disabled={isFlipping}
				aria-label="Next item">
				<IconChevronRight size={20} class="text-white drop-shadow-sm" />
			</button>
		</div>
	{/if}

	<!-- Indicators -->
	{#if totalItems > 1}
		<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
			{#each Array.from({ length: totalItems }, (_, i) => i) as i}
				<button
					class="w-2 h-2 rounded-full transition-all duration-200 {i === currentIndex
						? 'bg-white'
						: 'bg-white/50'} hover:bg-white/80"
					onclick={() => {
						if (!isFlipping && i !== currentIndex) {
							isFlipping = true
							currentIndex = i
							setTimeout(() => {
								isFlipping = false
							}, 600)
						}
					}}
					disabled={isFlipping}
					aria-label="Go to item {i + 1}"></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.perspective-1000 {
		perspective: 1000px;
	}

	.preserve-3d {
		transform-style: preserve-3d;
	}

	.backface-hidden {
		backface-visibility: hidden;
	}

	.duration-600 {
		transition-duration: 600ms;
	}
</style>
