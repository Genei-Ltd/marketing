<!--
CONCEPT TESTING FLOW ANIMATION
A smooth, gif-like animation demonstrating concept testing workflow that scales properly in any square container.
Follows the established animation pattern used by other demo components.
-->

<script lang="ts">
	import { onMount } from "svelte"
	import { fly, scale, fade } from "svelte/transition"
	import { quintOut, elasticOut } from "svelte/easing"

	// ============================================================================
	// ANIMATION CONTROLLER
	// ============================================================================

	type AnimationState = "idle" | "running" | "completed" | "cancelled" | "error"

	class AnimationController {
		private abortController = new AbortController()
		private cleanupFunctions: Array<() => void> = []
		public state: AnimationState = "idle"

		get signal() {
			return this.abortController.signal
		}

		get isActive() {
			return this.state === "running"
		}

		addCleanup(cleanup: () => void) {
			this.cleanupFunctions.push(cleanup)
		}

		cancel() {
			this.state = "cancelled"
			this.abortController.abort()
			this.cleanup()
		}

		private cleanup() {
			this.cleanupFunctions.forEach((fn) => {
				try {
					fn()
				} catch (err) {
					console.warn("Cleanup function failed:", err)
				}
			})
			this.cleanupFunctions = []
		}

		async execute<T>(animationFn: (controller: this) => Promise<T>): Promise<T> {
			if (this.state === "running") {
				throw new Error("Animation already running")
			}

			this.state = "running"

			try {
				const result = await animationFn(this)
				this.state = "completed"
				return result
			} catch (err) {
				if (this.signal.aborted) {
					this.state = "cancelled"
				} else {
					this.state = "error"
				}
				throw err
			} finally {
				this.cleanup()
			}
		}

		delay(ms: number): Promise<void> {
			return new Promise((resolve, reject) => {
				if (this.signal.aborted) {
					reject(new Error("Animation cancelled"))
					return
				}

				const timeoutId = setTimeout(resolve, ms)
				this.addCleanup(() => clearTimeout(timeoutId))
				this.signal.addEventListener("abort", () => {
					clearTimeout(timeoutId)
					reject(new Error("Animation cancelled"))
				})
			})
		}
	}

	// ============================================================================
	// DATA & STATE
	// ============================================================================

	const concepts = [
		{ id: "A", name: "Summer", image: "/crisps/crisps-1.png" },
		{ id: "B", name: "Original", image: "/crisps/crisps-2.png" },
		{ id: "C", name: "Tropical", image: "/crisps/crisps-3.png" },
		{ id: "D", name: "Cheese", image: "/crisps/crisps-4.png" },
		{ id: "E", name: "Chili", image: "/crisps/crisps-5.png" },
		{ id: "F", name: "Classic", image: "/crisps/crisps-6.png" },
	]

	const feedbackText = "I like option A it really stands out and looks tasty. I find option E pretty boring."

	const results = [
		{ concept: "A", name: "Summer", score: 85 },
		{ concept: "C", name: "Tropical", score: 72 },
		{ concept: "B", name: "Original", score: 68 },
	]

	// Animation state
	let currentController: AnimationController | null = null
	let phase = $state<"concepts" | "feedback" | "results">("concepts")
	let highlightedConcept = $state<string | null>(null)
	let typedText = $state("")
	let showResults = $state(false)
	let showWinner = $state(false)
	let isTyping = $state(false)

	// ============================================================================
	// ANIMATION LOGIC
	// ============================================================================

	async function typeText(text: string, controller: AnimationController): Promise<void> {
		typedText = ""
		isTyping = true

		for (let i = 0; i < text.length; i++) {
			if (controller.signal.aborted) break

			typedText += text[i]

			// Highlight concepts as they're mentioned
			if (typedText.toLowerCase().includes("option a")) {
				highlightedConcept = "A"
			} else if (typedText.toLowerCase().includes("option e")) {
				highlightedConcept = "E"
			}

			await controller.delay(30)
		}

		isTyping = false
		await controller.delay(800)
		highlightedConcept = null
	}

	async function runAnimation(controller: AnimationController): Promise<void> {
		// Reset state
		phase = "concepts"
		highlightedConcept = null
		typedText = ""
		showResults = false
		showWinner = false
		isTyping = false

		// Phase 1: Show concepts
		await controller.delay(1500)

		// Phase 2: Live feedback
		phase = "feedback"
		await controller.delay(500)
		await typeText(feedbackText, controller)
		await controller.delay(500)

		// Phase 3: Results
		phase = "results"
		await controller.delay(300)
		showResults = true
		await controller.delay(1000)
		showWinner = true
		await controller.delay(2000)

		// Loop back
		if (!controller.signal.aborted) {
			await runAnimation(controller)
		}
	}

	function startAnimation() {
		if (currentController) {
			currentController.cancel()
		}

		currentController = new AnimationController()
		currentController.execute(runAnimation).catch((err) => {
			if (!currentController?.signal.aborted) {
				console.warn("Animation error:", err)
			}
		})
	}

	onMount(() => {
		startAnimation()

		return () => {
			if (currentController) {
				currentController.cancel()
			}
		}
	})
</script>

<!-- Main container - scales to any square container using percentages -->
<div class="w-full h-full p-[4%] flex flex-col gap-[3%] bg-background">
	<!-- Concepts Grid - takes up ~60% of height -->
	<div class="flex-1 grid grid-cols-3 gap-[2%] max-h-[60%]">
		{#each concepts as concept, i}
			<div
				class="bg-card rounded-[8%] flex flex-col relative transition-all duration-500 {highlightedConcept ===
				concept.id
					? 'ring-2 ring-primary/40 scale-105 bg-primary/5'
					: ''}"
				in:fade={{ duration: 400, delay: i * 80, easing: quintOut }}>
				<!-- Letter badge -->
				<div
					class="absolute -top-[8%] -left-[8%] bg-foreground text-background w-[25%] h-[25%] rounded-full flex items-center justify-center text-[60%] font-bold z-10 transition-all duration-300 {highlightedConcept ===
					concept.id
						? 'scale-110 bg-primary text-primary-foreground'
						: ''}">
					{concept.id}
				</div>

				<!-- Product image -->
				<div class="flex-1 p-[8%] pt-[15%]">
					<div class="h-full rounded-[6%] overflow-hidden bg-muted/30">
						<img src={concept.image} alt="Concept {concept.name}" class="w-full h-full object-cover" />
					</div>
				</div>

				<!-- Name -->
				<div class="p-[6%] text-center">
					<div class="text-[70%] font-medium text-foreground/90">
						{concept.name}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Feedback/Results Section - takes up ~35% of height -->
	{#if phase !== "concepts"}
		<div
			class="bg-card rounded-[4%] p-[5%] h-[35%] flex flex-col"
			in:fly={{ y: 20, duration: 500, easing: quintOut }}>
			{#if phase === "feedback"}
				<!-- Live Feedback -->
				<div class="flex items-center gap-[3%] mb-[4%]">
					<div class="w-[3%] h-[3%] bg-green-500 rounded-full animate-pulse"></div>
					<h2 class="text-muted-foreground text-[60%] font-medium tracking-wide">Live Interview Feedback</h2>
				</div>

				<div class="flex-1 text-foreground text-[70%] leading-relaxed overflow-hidden">
					{#if typedText}
						{#each typedText.split(/(\boption\s+[AE]\b)/gi) as segment}
							{#if segment.toLowerCase().match(/^option\s+[ae]$/)}
								<span
									class="bg-primary/20 px-[2%] py-[1%] rounded-[2%] font-medium text-primary"
									in:scale={{ duration: 200, easing: elasticOut }}>
									{segment}
								</span>
							{:else}
								<span>{segment}</span>
							{/if}
						{/each}
					{/if}
					{#if isTyping}
						<span class="bg-primary inline-block w-[1%] h-[80%] ml-[1%] animate-pulse rounded-full"></span>
					{/if}
				</div>
			{:else if phase === "results"}
				<!-- Results -->
				<div class="flex items-center gap-[3%] mb-[4%]">
					<div class="w-[3%] h-[3%] bg-blue-500 rounded-full"></div>
					<h2 class="text-muted-foreground text-[60%] font-medium tracking-wide">Analysis Results</h2>
				</div>

				<div class="flex-1 space-y-[3%] overflow-hidden">
					{#each results as result, i}
						<div
							class="flex items-center gap-[4%] p-[3%] rounded-[3%] transition-all duration-500 {i ===
								0 && showWinner
								? 'bg-primary/10 scale-105'
								: 'bg-muted/30'}"
							in:fly={{ x: -20, duration: 400, delay: showResults ? i * 150 : 0, easing: quintOut }}>
							<div
								class="bg-foreground text-background w-[15%] h-[15%] rounded-full flex items-center justify-center text-[60%] font-bold transition-all duration-300 {i ===
									0 && showWinner
									? 'scale-110 bg-primary text-primary-foreground'
									: ''}">
								{result.concept}
							</div>

							<div class="flex-1 min-w-0">
								<div class="text-[60%] font-medium text-foreground mb-[2%]">
									{result.name}
								</div>
								<div class="bg-muted/60 h-[20%] rounded-full overflow-hidden">
									<div
										class="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
										style="width: {showResults ? result.score : 0}%">
									</div>
								</div>
							</div>

							<div class="text-[60%] font-bold text-foreground">
								{result.score}%
							</div>
						</div>
					{/each}

					{#if showWinner}
						<div class="text-center pt-[3%]" in:scale={{ duration: 400, easing: elasticOut }}>
							<div class="inline-flex items-center gap-[2%] bg-primary/15 px-[4%] py-[2%] rounded-[3%]">
								<div class="w-[3%] h-[3%] bg-primary rounded-full animate-pulse"></div>
								<span class="text-[60%] text-primary font-medium">Concept A wins</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
