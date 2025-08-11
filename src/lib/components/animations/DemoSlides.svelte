<!-- 

CONCEPT TESTING VISUAL ABSTRACTION ANIMATION
A visual abstraction representing concept testing workflow with product concepts and live transcription analysis.

=== CORE DESIGN PHILOSOPHY ===
This animation demonstrates concept testing methodology through a smooth, GIF-like looping sequence that shows:
- Product concept evaluation (crisp flavors A-F)  
- Live interview transcription with real-time highlighting
- Automated analysis with scoring visualization
- Winner selection and celebration

=== ANIMATION SEQUENCE (3 PHASES) ===
Phase 1 - CONCEPTS GRID (1.5s duration):
- Display 3x2 grid of product concepts (crisp flavors A-F)
- Each concept shows: image (w-12 h-12), letter ID, flavor name
- Staggered scale-in animations (400ms duration, 100ms delay per item)
- Uses concepts from /crisps/ directory (crisps-1.png through crisps-6.png)
- Concepts can be highlighted with ring-2 ring-accent and scale-105 transforms

Phase 2 - LIVE INTERVIEW (3.2s duration):
- Header with IconEye, "Live Interview" title, and REC indicator (animated red pulse)
- Concept thumbnails strip showing A-F options (w-8 h-8 compact format)
- Live transcript card with word-by-word typing animation (40ms per character)
- Real-time concept highlighting as they're mentioned in transcript
- Sample transcript: "I like option A it really stands out and looks tasty. I find option E pretty boring. But I would pick up option A first." make better transcript.
- circle typing cursor with animate-pulse effect during text animation

Phase 3 - RESULTS ANALYSIS (4.6s duration):
- Header with IconChartPie and "Analysis Results" title  
- Sequential reveal of 6 concept results with staggered fly-in animations
- Each result row shows: concept image, ID + name, animated score percentage, progress bar
- Score for each items appeal and clarity
- Score counting animation (0 to final score in 5-point increments, 20ms per step)
- Color-coded progress bars using primary and secondary colors
- Results ordered by performance: A(95%), C(72%), B(68%), D(45%), F(32%), E(28%)




-->

<script lang="ts">
	import { onMount } from "svelte"
	import { fly, scale, fade } from "svelte/transition"
	import { quintOut } from "svelte/easing"
	import { IconEye, IconChartPie, IconStar, IconTrendingUp } from "@tabler/icons-svelte"

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

	const controller = new AnimationController()

	// Animation states
	let phase = $state<"concepts" | "interview" | "results" | "winner" | "reset">("concepts")
	let highlightedConcept = $state<string | null>(null)
	let typedText = $state("")
	let showWinner = $state(false)
	let isTyping = $state(false)
	let conceptsVisible = $state<boolean[]>([false, false, false, false, false, false])
	let resultsVisible = $state<boolean[]>([false, false, false, false, false, false])

	// Concept data with reactive scores
	let concepts = $state([
		{ id: "A", name: "Summer", image: "/crisps/crisps-1.png", score: 0 },
		{ id: "B", name: "Original", image: "/crisps/crisps-2.png", score: 0 },
		{ id: "C", name: "Tropical", image: "/crisps/crisps-3.png", score: 0 },
		{ id: "D", name: "Cheese", image: "/crisps/crisps-4.png", score: 0 },
		{ id: "E", name: "Chili", image: "/crisps/crisps-5.png", score: 0 },
		{ id: "F", name: "Classic", image: "/crisps/crisps-6.png", score: 0 },
	])

	// Interview transcript
	const interviewText =
		"I like option A it really stands out and looks tasty. I find option E pretty boring. But I would definitely pick up option A first."

	// Results data with color coding
	const finalResults = [
		{ id: "A", name: "Summer", score: 95, color: "bg-accent" },
		{ id: "C", name: "Tropical", score: 72, color: "bg-accent-2" },
		{ id: "B", name: "Original", score: 68, color: "bg-accent-1" },
		{ id: "D", name: "Cheese", score: 45, color: "bg-accent-3" },
		{ id: "F", name: "Classic", score: 32, color: "bg-accent-4" },
		{ id: "E", name: "Chili", score: 28, color: "bg-primary" },
	]

	// ============================================================================
	// ANIMATION FUNCTIONS
	// ============================================================================

	async function typeText(text: string, ctrl: AnimationController): Promise<void> {
		typedText = ""
		isTyping = true

		highlightedConcept = null

		const BASE_DELAY = 40
		const WORD_GAP = 60
		const EMPHASIS_DELAY = 600

		const words = text.split(" ")

		for (let i = 0; i < words.length; i++) {
			if (ctrl.signal.aborted) break

			const word = words[i]
			// Append word-by-word
			typedText += (i === 0 ? "" : " ") + word

			// Check for concept mentions and highlight dynamically
			const currentText = typedText.toLowerCase()
			if (currentText.includes("option a first")) {
				highlightedConcept = "A"
			} else if (currentText.includes("option e")) {
				highlightedConcept = "E"
			} else if (currentText.includes("option a")) {
				highlightedConcept = "A"
			}

			// Pause timing: brief gap between words, longer when highlighting a concept
			const isConceptMention = /option\s+[a-f]/i.test(word) || /option\s+[a-f]/i.test(currentText)
			await ctrl.delay(isConceptMention ? EMPHASIS_DELAY : BASE_DELAY + WORD_GAP)
		}

		isTyping = false
		await ctrl.delay(800)

		// Final highlight of option A with stronger emphasis
		if (typedText.toLowerCase().includes("option a first")) {
			highlightedConcept = "A"
			await ctrl.delay(1200)
		}

		highlightedConcept = null
	}

	async function animateConceptsIn(ctrl: AnimationController): Promise<void> {
		// Staggered scale-in animations for concepts
		for (let i = 0; i < concepts.length; i++) {
			if (ctrl.signal.aborted) break
			conceptsVisible[i] = true
			await ctrl.delay(100)
		}
	}

	async function animateResultsIn(ctrl: AnimationController): Promise<void> {
		// Sequential reveal of results with score counting
		for (let i = 0; i < finalResults.length; i++) {
			if (ctrl.signal.aborted) break

			const result = finalResults[i]
			const concept = concepts.find((c) => c.id === result.id)

			if (concept) {
				// Show the result row
				resultsVisible[i] = true
				await ctrl.delay(150)

				// Animate score counting up in 5-point increments
				for (let score = 0; score <= result.score; score += 5) {
					if (ctrl.signal.aborted) break
					concept.score = Math.min(score, result.score)
					await ctrl.delay(20)
				}

				await ctrl.delay(200)
			}
		}
	}

	async function resetAnimation(ctrl: AnimationController): Promise<void> {
		// Clean state reset
		showWinner = false
		highlightedConcept = null
		typedText = ""
		isTyping = false

		// Reset visibility arrays
		conceptsVisible = [false, false, false, false, false, false]
		resultsVisible = [false, false, false, false, false, false]

		// Reset scores
		concepts.forEach((c) => (c.score = 0))

		await ctrl.delay(400)
	}

	// ============================================================================
	// MAIN ANIMATION SEQUENCE
	// ============================================================================

	async function runAnimation() {
		try {
			await controller.execute(async (ctrl) => {
				// Phase 1: CONCEPTS GRID (1.5s duration)
				phase = "concepts"
				await animateConceptsIn(ctrl)
				await ctrl.delay(1000) // Let concepts be visible longer

				// Phase 2: LIVE INTERVIEW (3.2s duration)
				phase = "interview"
				await ctrl.delay(500) // Brief transition pause
				await typeText(interviewText, ctrl)
				await ctrl.delay(600)

				// Phase 3: RESULTS ANALYSIS (4.6s duration)
				phase = "results"
				await ctrl.delay(400)
				await animateResultsIn(ctrl)
				await ctrl.delay(1000)

				// Phase 4: WINNER CELEBRATION (2.5s duration)
				phase = "winner"
				showWinner = true
				await ctrl.delay(2500)

				// Phase 5: SEAMLESS LOOP RESET (0.4s duration)
				phase = "reset"
				await resetAnimation(ctrl)
				await ctrl.delay(400)
			})

			// Restart animation loop
			if (controller.state === "completed") {
				setTimeout(runAnimation, 800)
			}
		} catch (err) {
			if (!controller.signal.aborted) {
				console.error("Animation error:", err)
			}
		}
	}

	// ============================================================================
	// LIFECYCLE
	// ============================================================================

	onMount(() => {
		// Respect user's motion preferences
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

		if (!prefersReducedMotion) {
			runAnimation()
		} else {
			// Show static final state for accessibility
			phase = "winner"
			showWinner = true
			concepts[0].score = 95 // Show winner concept
		}

		return () => {
			controller.cancel()
		}
	})
</script>

<!-- Main container with proper aspect ratio -->
<div class="relative w-full aspect-square bg-background border border-border rounded-lg overflow-hidden">
	<!-- Phase 1: Concepts Grid -->
	{#if phase === "concepts"}
		<div class="absolute inset-4" in:fade={{ duration: 300 }} out:fade={{ duration: 250 }}>
			<div class="text-center mb-6">
				<h3 class="text-lg font-semibold text-foreground">Product Concepts</h3>
				<p class="text-sm text-muted-foreground mt-1">Which flavor appeals to you most?</p>
			</div>

			<div class="grid grid-cols-3 gap-4 h-4/5">
				{#each concepts as concept, i}
					{#if conceptsVisible[i]}
						<div
							class={`bg-card/70 backdrop-blur-sm border border-border rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg ${highlightedConcept === concept.id ? "ring-2 ring-primary/15 scale-105 bg-primary/90 text-primary-foreground" : ""}`}
							in:scale={{ duration: 400, delay: 0, easing: quintOut }}>
							<img src={concept.image} alt={concept.name} class="w-12 h-12 object-cover rounded mb-2" />
							<div class="text-center">
								<div class="font-semibold text-sm">{concept.id}</div>
								<div class="text-xs opacity-75">{concept.name}</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Phase 2: Live Interview -->
	{#if phase === "interview"}
		<div class="absolute inset-4 flex flex-col" in:fade={{ duration: 300 }} out:fade={{ duration: 250 }}>
			<div class="flex items-center gap-2 mb-4">
				<IconEye size={20} class="text-accent-2" />
				<h3 class="text-lg font-semibold text-foreground">Live Interview</h3>
				<div class="ml-auto flex items-center gap-1">
					<div class="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
					<span class="text-xs text-muted-foreground">REC</span>
				</div>
			</div>

			<!-- Concept thumbnails strip -->
			<div class="flex gap-2 mb-4">
				{#each concepts as concept}
					<div
						class="w-8 h-8 bg-card border border-border rounded flex items-center justify-center text-xs font-semibold transition-all duration-300"
						class:bg-primary={highlightedConcept === concept.id}
						class:text-primary-foreground={highlightedConcept === concept.id}
						class:scale-110={highlightedConcept === concept.id}
						class:ring-2={highlightedConcept === concept.id}
						class:ring-primary={highlightedConcept === concept.id}>
						{concept.id}
					</div>
				{/each}
			</div>

			<!-- Live transcript card -->
			<div class="flex-1 bg-card border border-border rounded-lg p-4 shadow-sm">
				<div class="text-sm text-card-foreground leading-relaxed">
					{typedText}
					{#if isTyping}
						<span class="animate-pulse text-primary font-bold">|</span>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Phase 3: Results Analysis -->
	{#if phase === "results"}
		<div class="absolute inset-4" in:fade={{ duration: 300 }} out:fade={{ duration: 250 }}>
			<div class="flex items-center gap-2 mb-4">
				<IconChartPie size={20} class="text-accent-3" />
				<h3 class="text-lg font-semibold text-foreground">Analysis Results</h3>
			</div>

			<div class="space-y-2 max-h-[calc(100%-3rem)] overflow-hidden">
				{#each finalResults as result, i}
					{@const concept = concepts.find((c) => c.id === result.id)}
					{#if concept && resultsVisible[i]}
						<div
							class="bg-card/70 backdrop-blur-sm border border-border rounded-lg p-3"
							in:fly={{ x: -20, duration: 400, delay: 0, easing: quintOut }}>
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<img src={concept.image} alt={concept.name} class="w-6 h-6 object-cover rounded" />
									<span class="font-semibold text-sm text-foreground"
										>{concept.id} - {concept.name}</span>
								</div>
								<span class="text-sm font-bold text-foreground">{concept.score}%</span>
							</div>

							<!-- Progress bar with semantic colors -->
							<div class="w-full bg-muted rounded-full h-2">
								<div
									class={`h-2 rounded-full transition-all duration-500 ease-out ${result.color}`}
									style="width: {concept.score}%">
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Phase 4: Winner Celebration -->
	{#if phase === "winner" && showWinner}
		<div class="absolute inset-4 flex flex-col items-center justify-center" in:fade={{ duration: 300 }}>
			<div class="text-center" in:scale={{ duration: 600, easing: quintOut }}>
				<IconStar size={48} class="text-accent-3 mx-auto mb-4 animate-pulse" />
				<h2 class="text-2xl font-bold text-foreground mb-4">Winner!</h2>
				<div class="bg-card border border-border rounded-lg p-6 shadow-lg max-w-xs">
					<img
						src="/crisps/crisps-1.png"
						alt="Summer"
						class="w-20 h-20 object-cover rounded-lg mx-auto mb-3" />
					<div class="text-xl font-bold text-foreground">A - Summer</div>
					<div class="text-lg text-accent-3 font-semibold">95% Score</div>
					<div class="flex items-center justify-center gap-1 mt-2">
						<IconTrendingUp size={16} class="text-accent-2" />
						<span class="text-sm text-muted-foreground">Top performer</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Phase 5: Reset phase (invisible transition) -->
	{#if phase === "reset"}
		<div class="absolute inset-4 flex items-center justify-center">
			<div class="text-center text-muted-foreground">
				<div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto">
				</div>
			</div>
		</div>
	{/if}
</div>
