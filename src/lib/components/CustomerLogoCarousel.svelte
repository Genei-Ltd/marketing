<script lang="ts">
	import { onMount, onDestroy } from "svelte"
	import { fade, fly, scale } from "svelte/transition"

	// Total number of logos available (1-12)
	const TOTAL_LOGOS = 12
	const VISIBLE_LOGOS = 8
	const CYCLE_INTERVAL = 3000 // 3 seconds

	// Generate array of logo indices [1, 2, 3, ..., 12]
	const allLogoIndices = Array.from({ length: TOTAL_LOGOS }, (_, i) => i + 1)

	// State for currently visible logos - now using a fixed array
	let visibleLogos = $state<number[]>(new Array(VISIBLE_LOGOS).fill(0))
	let intervalId: ReturnType<typeof setInterval> | null = null

	// Function to shuffle array
	function shuffleArray(array: number[]): number[] {
		const shuffled = [...array]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled
	}

	// Initialize with 8 random logos
	function initializeLogos() {
		const shuffled = shuffleArray(allLogoIndices)
		visibleLogos = shuffled.slice(0, VISIBLE_LOGOS)
	}

	// Cycle one logo randomly
	function cycleOneLogo() {
		if (visibleLogos.length === 0) return

		// Get logos not currently visible
		const availableLogos = allLogoIndices.filter((logo) => !visibleLogos.includes(logo))

		if (availableLogos.length === 0) {
			// If all logos are visible (shouldn't happen with 12 total and 8 visible), reinitialize
			initializeLogos()
			return
		}

		// Pick a random available logo
		const randomAvailableLogo = availableLogos[Math.floor(Math.random() * availableLogos.length)]

		// Pick a random position to replace
		const randomPosition = Math.floor(Math.random() * visibleLogos.length)

		// Create new array with the replacement
		const newVisibleLogos = [...visibleLogos]
		newVisibleLogos[randomPosition] = randomAvailableLogo

		visibleLogos = newVisibleLogos
	}

	// Start the cycling interval
	function startCycling() {
		if (intervalId) return // Already running
		intervalId = setInterval(cycleOneLogo, CYCLE_INTERVAL)
	}

	// Stop the cycling interval
	function stopCycling() {
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
	}

	onMount(() => {
		initializeLogos()
		startCycling()
	})

	onDestroy(() => {
		stopCycling()
	})
</script>

<div class="relative w-full lg:h-24 h-48">
	<div class="grid grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center h-full">
		{#each Array(VISIBLE_LOGOS)
			.fill(null)
			.map((_, i) => i) as index}
			<div class="relative w-24 h-24">
				{#if visibleLogos[index]}
					{#key visibleLogos[index]}
						<img
							src={`/customer-logos/${visibleLogos[index]}.png`}
							alt={`Customer Logo ${visibleLogos[index]}`}
							class="opacity-80 px-1 min-w-18 brightness-200 contrast-0 grayscale absolute inset-0 dark:brightness-0 dark:contrast-0 dark:invert-0 object-contain w-24 h-24 transition-all duration-300 ease-in-out hover:scale-110 hover:opacity-90"
							in:fly={{ duration: 400, delay: 100, y: 100 }}
							out:fade={{ duration: 200 }} />
					{/key}
				{/if}
			</div>
		{/each}
	</div>
</div>
