<script lang="ts">
	import { IconEye, IconChartPie, IconCheck, IconLoader } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

	// ============================================================================
	// ANIMATION CONTROLLER (unchanged)
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
	// CONCEPT TESTING DATA MODELS
	// ============================================================================

	type Concept = {
		id: string
		letter: string
		name: string
		image: string
		isHighlighted: boolean
	}

	type SubtitleWord = {
		text: string
		isHighlighted: boolean
		relatedConcept?: string
	}

	type ConceptResult = {
		concept: string
		letter: string
		clarity: number // Score out of 100
		impact: number // Score out of 100
		appeal: number // Score out of 100
		color: string
	}

	// Animation state
	let animationState = $state({
		// Step 1: Live Interview
		concepts: <Concept[]>[],
		subtitleWords: <SubtitleWord[]>[],
		currentWordIndex: 0,
		showVideo: false,

		// Step 2: Results Analysis
		conceptResults: <ConceptResult[]>[],
		showChart: false,

		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState(stepId?: string) {
		if (stepId === "live-interview") {
			animationState.concepts = []
			animationState.subtitleWords = []
			animationState.currentWordIndex = 0
			animationState.showVideo = false
			animationState.conceptResults = []
			animationState.showChart = false
		} else if (stepId === "results-analysis") {
			// Keep concepts, reset only results data
			animationState.conceptResults = []
			animationState.showChart = false
		}

		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const conceptsData: Concept[] = [
		{ id: "concept-a", letter: "A", name: "Summer", image: "/crisps/crisps-1.png", isHighlighted: false },
		{ id: "concept-b", letter: "B", name: "Original", image: "/crisps/crisps-2.png", isHighlighted: false },
		{ id: "concept-c", letter: "C", name: "Tropical", image: "/crisps/crisps-3.png", isHighlighted: false },
		{ id: "concept-d", letter: "D", name: "Cheese", image: "/crisps/crisps-4.png", isHighlighted: false },
		{ id: "concept-e", letter: "E", name: "Chili", image: "/crisps/crisps-5.png", isHighlighted: false },
		{ id: "concept-f", letter: "F", name: "Classic", image: "/crisps/crisps-6.png", isHighlighted: false },
	]

	const subtitleText =
		"I like option A it really stands out and looks tasty. I find option E pretty boring. But i would pick up option A first."
	const subtitleWordsData: SubtitleWord[] = (() => {
		const words = subtitleText.split(" ")
		const result: SubtitleWord[] = []

		for (let i = 0; i < words.length; i++) {
			const word = words[i]
			const lowerWord = word.toLowerCase()

			// Check if this word is "option" and the next word is a letter
			if (lowerWord === "option" && i + 1 < words.length) {
				const nextWord = words[i + 1].toLowerCase()
				if (nextWord === "a") {
					// Combine "option" and "A" into one word
					result.push({ text: `${word} ${words[i + 1]}`, isHighlighted: false, relatedConcept: "concept-a" })
					i++ // Skip the next word since we've combined it
					continue
				} else if (nextWord === "e") {
					// Combine "option" and "E" into one word
					result.push({ text: `${word} ${words[i + 1]}`, isHighlighted: false, relatedConcept: "concept-e" })
					i++ // Skip the next word since we've combined it
					continue
				}
			}

			// If not a combined option, add as regular word
			result.push({ text: word, isHighlighted: false, relatedConcept: undefined })
		}

		return result
	})()

	const conceptResultsData: ConceptResult[] = [
		{ concept: "Summer", letter: "A", clarity: 80, impact: 90, appeal: 95, color: "#000" },
		{ concept: "Tropical", letter: "C", clarity: 65, impact: 30, appeal: 70, color: "#333" },
		{ concept: "Original", letter: "B", clarity: 82, impact: 25, appeal: 30, color: "#555" },
		{ concept: "Cheese", letter: "D", clarity: 45, impact: 78, appeal: 62, color: "#888" },
		{ concept: "Chili", letter: "E", clarity: 80, impact: 45, appeal: 85, color: "#aaa" },
		{ concept: "Classic", letter: "F", clarity: 25, impact: 35, appeal: 30, color: "#ccc" },
	]

	// ============================================================================
	// STEP ANIMATIONS
	// ============================================================================

	async function animateLiveInterview(controller: AnimationController): Promise<void> {
		try {
			// Sub-step 1a: Show concepts grid
			for (let i = 0; i < conceptsData.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.concepts = [
					...animationState.concepts,
					{ ...conceptsData[i] },
				]
				await controller.delay(200)
			}

			await controller.delay(800)

			// Sub-step 1b: Show video and animate subtitles
			animationState.showVideo = true
			await controller.delay(1000)

			animationState.subtitleWords = [...subtitleWordsData]

			// Animate subtitle words
			for (let i = 0; i < animationState.subtitleWords.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.currentWordIndex = i
				animationState.subtitleWords[i].isHighlighted = true

				// Sub-step 1c & 1d: Highlight related concepts
				const word = animationState.subtitleWords[i]
				if (word.relatedConcept) {
					// Reset all concept highlights
					animationState.concepts = animationState.concepts.map((c) => ({ ...c, isHighlighted: false }))

					// Highlight the mentioned concept
					const conceptIndex = animationState.concepts.findIndex((c) => c.id === word.relatedConcept)
					if (conceptIndex !== -1) {
						animationState.concepts[conceptIndex].isHighlighted = true
					}
				}

				await controller.delay(word.text === "A" || word.text === "E" ? 800 : 200)
			}

			await controller.delay(1500)
		} catch (err) {
			// Fallback
			animationState.concepts = conceptsData.map((c) => ({ ...c }))
			animationState.subtitleWords = subtitleWordsData.map((w) => ({ ...w, isHighlighted: true }))
			animationState.currentWordIndex = animationState.subtitleWords.length - 1
			animationState.showVideo = true
			throw err
		}
	}

	async function animateResultsAnalysis(controller: AnimationController): Promise<void> {
		try {
			// Show results table
			await controller.delay(500)
			animationState.conceptResults = [...conceptResultsData]

			await controller.delay(1000)

			// Show pie chart
			animationState.showChart = true

			await controller.delay(2000)
		} catch (err) {
			// Fallback
			animationState.conceptResults = [...conceptResultsData]
			animationState.showChart = true
			throw err
		}
	}

	// ============================================================================
	// STEP DEFINITIONS
	// ============================================================================

	type StepDefinition = {
		id: string
		icon: ComponentType
		title: string
		subtitle: string
		loadingText: string
		completeText: string
		execute: (controller: AnimationController) => Promise<void>
	}

	const steps: StepDefinition[] = [
		{
			id: "live-interview",
			icon: IconEye,
			title: "Live Interview Analysis",
			subtitle: "Analyzing real-time concept preferences...",
			loadingText: "Processing concept feedback",
			completeText: "Interview analysis completed",
			execute: animateLiveInterview,
		},
		{
			id: "results-analysis",
			icon: IconChartPie,
			title: "Multi-Dimensional Analysis",
			subtitle: "Analyzing concepts across clarity, impact, and appeal dimensions...",
			loadingText: "Compiling dimensional analysis",
			completeText: "Multi-dimensional insights generated - Concept C leads in appeal",
			execute: animateResultsAnalysis,
		},
	]

	// ============================================================================
	// EXECUTION ENGINE (same as other demos)
	// ============================================================================

	let currentStepIndex = $state(0)
	let isLoading = $state(false)
	let isComplete = $state(false)
	let restart = $state(false)
	let showCard = $state(true)
	let currentController: AnimationController | null = $state(null)
	let isAnimationStarted = $state(false)

	// STATIC DESIGN MODE - Set to true to disable animations and show all steps
	// Perfect for design work: shows concepts grid, video player, results table, and pie charts
	// all at once without any animations or delays
	let staticDesignMode = $state(false) // Set to true for design work

	let currentStep = $derived(steps[currentStepIndex])

	async function executeStep(stepIndex: number): Promise<void> {
		const step = steps[stepIndex]
		if (!step) return

		if (currentController) {
			currentController.cancel()
		}

		resetAnimationState(step.id)
		animationState.currentStepId = step.id

		const controller = new AnimationController()
		currentController = controller

		isLoading = true
		isComplete = false

		try {
			await controller.execute(step.execute)

			if (!controller.signal.aborted) {
				animationState.isComplete = true
				isLoading = false
				isComplete = true

				await controller.delay(3000)

				if (!controller.signal.aborted) {
					if (stepIndex < steps.length - 1) {
						transitionToNextStep()
					} else {
						setTimeout(() => {
							restart = true
						}, 4000)
					}
				}
			}
		} catch (err) {
			if (!controller.signal.aborted) {
				console.warn("Animation failed:", err)
				animationState.isComplete = true
				isLoading = false
				isComplete = true
			}
		}
	}

	function transitionToNextStep() {
		showCard = false
		setTimeout(() => {
			currentStepIndex += 1
			setTimeout(() => {
				showCard = true
				executeStep(currentStepIndex)
			}, 100)
		}, 500)
	}

	function resetAnimation() {
		if (currentController) {
			currentController.cancel()
		}

		showCard = false

		setTimeout(() => {
			currentStepIndex = 0
			isLoading = false
			isComplete = false
			isAnimationStarted = false

			setTimeout(() => {
				showCard = true
				restart = false
				startAnimation()
			}, 100)
		}, 500)
	}

	function startAnimation() {
		if (!isAnimationStarted) {
			isAnimationStarted = true
			executeStep(currentStepIndex)
		}
	}

	$effect(() => {
		if (restart) {
			resetAnimation()
		}
	})

	onMount(() => {
		if (!staticDesignMode) {
			setTimeout(() => {
				startAnimation()
			}, 500)
		}
	})
</script>

<!-- ============================================================================ -->
<!-- VISUAL COMPONENTS
<!-- ============================================================================ -->

<!-- Concepts grid display -->
{#snippet conceptsGrid(concepts: Concept[])}
	{#if concepts.length > 0}
		<div
			class=" backdrop-blur-sm border-border w-full p-4 mt-2 border rounded"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<div class="text-card-foreground/70 mb-4 text-xs font-medium tracking-wide uppercase">
				Concept Testing • {concepts.length} Variants
			</div>

			<div class="grid w-full grid-cols-3 gap-4">
				{#each concepts as concept, i (concept.id)}
					<div
						class="relative w-full grayscale overflow-hidden bg-card/20 border border-border text-card-foreground flex flex-row items-center justify-center rounded transition-all duration-300 {concept.isHighlighted
							? 'bg-primary grayscale-0 shadow ring-4 ring-primary/50 text-primary-foreground border border-secondary scale-105'
							: 'hover:border-border/20 hover:bg-primary/10 border border-border/20'}"
						in:fly={{ y: -20, duration: 400, delay: i * 150, easing: elasticOut }}>
						{#if concept.isHighlighted}
							<div
								class="top-2 right-2 bg-muted text-muted-foreground absolute flex items-center justify-center w-6 h-6 rounded-full shadow-lg"
								in:scale={{ duration: 300, easing: elasticOut }}>
								<IconCheck class="size-3" />
							</div>
						{/if}

						<div
							class="bg-primary text-primary-foreground absolute top-0 left-0 inline-flex p-1 px-2 mb-3 rounded-br">
							<span class="text-sm font-bold">{concept.letter}</span>
						</div>

						<div class=" px-2 text-sm font-medium text-left">
							{concept.name}
						</div>

						<div class="aspect-square max-h-21 overflow-hidden">
							<img
								src={concept.image}
								alt="Concept {concept.letter}"
								class=" object-cover w-full h-full" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Video player with subtitles -->
{#snippet videoPlayer(showVideo: boolean, subtitleWords: SubtitleWord[], currentWordIndex: number)}
	{#if showVideo}
		<div
			class=" flex flex-col gap-4 mt-4"
			in:fly={{ y: 20, duration: 500, easing: elasticOut }}
			out:fly={{ y: -20, duration: 400, easing: cubicInOut }}>
			<!-- Zoom-style video grid -->
			<!-- Recording indicator -->
			<!-- <div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="size-2 animate-pulse bg-red-500 rounded-full"></div>
					<span class="text-card-foreground/70 text-xs font-medium tracking-wide uppercase">
						Live Interview
					</span>
				</div>
				<div class="text-card-foreground/50 text-xs">2 participants</div>
			</div> -->
			<!-- <div class="bg-primary flex-0 h-fit flex-grow-0 border rounded shadow-sm">
					<div class="flex flex-row gap-2 aspect-[16/9] w-64 p-2 relative overflow-hidden">
						<div
							class="bg-secondary/10 relative flex items-center justify-center w-full h-full overflow-hidden rounded">
							<div
								class="animate-breathe size-12 bg-secondary ring-4 ring-secondary absolute z-10 rounded-full opacity-50">
							</div>
							<div
								class="bg-secondary ring-4 ring-secondary/50 size-12 z-20 flex items-center justify-center rounded-full">
								<span class="text-secondary-foreground p-3 text-base font-bold rounded">IV</span>
							</div>
						</div>
						<div class="bg-secondary/10 flex items-center justify-center w-full overflow-hidden rounded">
							<div
								class="bg-secondary ring-4 ring-secondary/50 size-12 flex items-center justify-center rounded-full">
								<span class="text-secondary-foreground p-3 text-base font-bold rounded">RE</span>
							</div>
						</div>
					</div>
				</div> -->

			<!-- Live transcription panel -->
			<div class=" backdrop-blur-sm border-border/20 border rounded shadow">
				<!-- Transcription header
						<div class="border-border/10 p-3 pb-2 border-b">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div class="size-2 bg-green-400 rounded-full"></div>
									<span class="text-card-foreground/70 text-xs font-medium tracking-wide uppercase">
										Live Transcription
									</span>
								</div>
								<div class="text-card-foreground/50 text-xs">Auto-detecting concepts</div>
							</div>
						</div> -->

				<!-- Transcription content -->
				<div class=" p-4 space-y-2 overflow-y-auto">
					{#if subtitleWords.length > 0}
						<div class="flex flex-row items-start justify-between gap-2">
							<!-- Speaker label -->
							<div class="flex items-start gap-2">
								<div class="flex-shrink-0 mt-0.5">
									<div
										class="size-5 bg-secondary border-secondary/30 flex items-center justify-center border rounded-full">
										<span class="text-secondary-foreground text-xs font-bold">R</span>
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-card-foreground my-1 text-xs font-medium">Speaker 1:</div>
									<div class="text-card-foreground flex flex-wrap text-sm leading-relaxed">
										{#each subtitleWords as word, i}
											<span
												class="transition-all duration-200 mr-1 {i <= currentWordIndex
													? word.relatedConcept
														? 'bg-muted/20 text-muted font-bold px-1 rounded border border-muted/30'
														: word.isHighlighted
															? 'text-card-foreground'
															: 'text-card-foreground/70'
													: 'hidden'}">
												{word.text}
											</span>
										{/each}
										{#if currentWordIndex < subtitleWords.length - 1}
											<div
												class="bg-primary animate-pulse size-2 self-center inline-block ml-1 rounded-full">
											</div>
										{/if}
									</div>
								</div>
							</div>

							<!-- Concept detection indicators
									{#if subtitleWords.some((w) => w.relatedConcept && subtitleWords.indexOf(w) <= currentWordIndex)}
										<div class="max-w-24 flex-col self-start flex-grow-0 flex-shrink-0 w-24">
											<div class="text-card-foreground mb-1 text-xs font-medium">
												Concepts Detected:
											</div>
											<div class="flex flex-wrap gap-1">
												{#each subtitleWords.filter((w) => w.relatedConcept && subtitleWords.indexOf(w) <= currentWordIndex) as word}
													{@const concept = conceptsData.find(
														(c) => c.id === word.relatedConcept,
													)}
													{#if concept}
														<div
															class="bg-muted/10 text-muted border border-muted/20 px-2 py-0.5 text-xs font-medium rounded-full">
															Option {concept.letter}
														</div>
													{/if}
												{/each}
											</div>
										</div>
									{/if} -->
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- Multi-dimensional results table -->
{#snippet resultsTable(results: ConceptResult[])}
	{#if results.length > 0}
		<div
			class=" backdrop-blur-sm border-border/10 p-4 border rounded shadow"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<!-- Table Header -->
			<div class="border-border/20 grid grid-cols-5 gap-4 px-2 pb-2 mb-1 border-b">
				<div class="text-card-foreground/70 text-xs font-medium uppercase">Concept</div>
				<div class="text-card-foreground/70 text-xs font-medium uppercase">Clarity</div>
				<div class="text-card-foreground/70 text-xs font-medium uppercase">Impact</div>
				<div class="text-card-foreground/70 text-xs font-medium uppercase">Appeal</div>
				<div class="text-card-foreground/70 text-xs font-medium uppercase">Best At</div>
			</div>

			<!-- Table Rows -->
			<div class="space-y-1">
				{#each results as result, i}
					{@const bestDimension =
						result.clarity >= result.impact && result.clarity >= result.appeal
							? "clarity"
							: result.impact >= result.clarity && result.impact >= result.appeal
								? "impact"
								: "appeal"}
					<div
						class="grid grid-cols-5 gap-4 px-2 py-1 items-center {i < results.length - 1
							? 'border-b border-border/5'
							: ''} {i === 0 ? 'bg-primary/5 rounded' : ''}"
						in:fly={{ y: -20, duration: 400, delay: i * 100, easing: quintOut }}>
						<!-- Concept -->
						<div class="flex items-center gap-2">
							<div class="bg-primary text-primary-foreground px-1.5 py-0.5 text-xs font-bold rounded">
								{result.letter}
							</div>
							<div class="flex flex-col">
								<span class="text-card-foreground text-xs font-medium">{result.concept}</span>
							</div>
						</div>

						<!-- Clarity Score -->
						<div class="max-w-32 flex items-center w-full gap-2">
							<div class="bg-muted/30 flex-1 h-1.5 overflow-hidden rounded-full">
								<div
									class="bg-primary h-full transition-all"
									style="width: {result.clarity}%"
									in:fly={{ x: 20, duration: 800, delay: 200 + i * 100, easing: quintOut }}>
								</div>
							</div>
						</div>

						<!-- Impact Score -->
						<div class="max-w-32 flex items-center w-full gap-2">
							<div class="bg-muted/30 flex-1 h-1.5 rounded-full overflow-hidden">
								<div
									class="bg-primary h-full transition-all duration-1000 ease-out"
									style="width: {result.impact}%"
									in:fly={{ x: 20, duration: 800, delay: 300 + i * 100, easing: quintOut }}>
								</div>
							</div>
							<!-- <span class="text-card-foreground min-w-4 text-xs font-bold text-right">
								{result.impact}
							</span> -->
						</div>

						<!-- Appeal Score -->
						<div class="max-w-32 flex items-center w-full gap-2">
							<div class="bg-muted/30 flex-1 h-1.5 rounded-full overflow-hidden">
								<div
									class="bg-muted h-full transition-all duration-1000 ease-out"
									style="width: {result.appeal}%"
									in:fly={{ x: 20, duration: 800, delay: 400 + i * 100, easing: quintOut }}>
								</div>
							</div>
							<!-- <span class="text-card-foreground min-w-4 text-xs font-bold text-right">
								{result.appeal}
							</span> -->
						</div>

						<!-- Best At -->
						<div class="text-xs">
							<!-- {#if i === 0}
								<span
									class="border text-primary-foreground px-1.5 py-0.5 text-xs font-bold rounded min-w-max mb-1">
									Top Performer
								</span>
							{/if} -->
							{#if bestDimension === "clarity"}
								<span class="bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium">
									Clarity
								</span>
							{:else if bestDimension === "impact"}
								<span class="bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-medium">
									Impact
								</span>
							{:else}
								<span class="bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
									Appeal
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Three pie charts for dimensions -->
{#snippet pieChartDisplay(results: ConceptResult[], showChart: boolean)}
	{#if showChart && results.length > 0}
		<div
			class="w-fit flex items-start max-w-5xl gap-4 mt-4"
			in:fly={{ y: 20, duration: 600, delay: 300, easing: elasticOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<!-- Coloop icon chathead -->
			<div
				class="bg-primary flex items-center justify-center flex-shrink-0 w-8 h-8 overflow-hidden rounded-full shadow-lg">
				<img src="/logos/CoLoop_Icon.svg" alt="Coloop" class="contrast-100 saturate-0 w-full h-full" />
			</div>

			<div class="w-fit flex-1 max-w-5xl">
				<div
					class="text-card-foreground flex items-center gap-2 mb-2 text-sm font-medium"
					in:fly={{ x: -20, duration: 400, delay: 100, easing: quintOut }}>
					<div class="size-2 bg-muted rounded-full"></div>
					Leading concepts identified
				</div>

				<div
					class=" backdrop-blur-sm border-border/10 p-2 border rounded shadow"
					in:fly={{ y: 20, duration: 500, delay: 200, easing: elasticOut }}>
					<!-- Three pie charts side by side -->
					<div class="grid grid-cols-3 gap-2">
						<!-- Clarity Chart -->
						<div class="text-center">
							<div class="w-28 h-28 relative mx-auto">
								<svg viewBox="0 0 200 200" class="w-full h-full">
									{#each results as result, i}
										{@const total = results.reduce((sum, r) => sum + r.clarity, 0)}
										{@const previousResults = results.slice(0, i)}
										{@const startAngle = previousResults.reduce(
											(sum, r) => sum + (r.clarity / total) * 360,
											0,
										)}
										{@const angle = (result.clarity / total) * 360}
										{@const endAngle = startAngle + angle}
										{@const largeArc = angle > 180 ? 1 : 0}
										{@const x1 = 100 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180)}
										{@const y1 = 100 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180)}
										{@const x2 = 100 + 70 * Math.cos(((endAngle - 90) * Math.PI) / 180)}
										{@const y2 = 100 + 70 * Math.sin(((endAngle - 90) * Math.PI) / 180)}

										<path
											d="M 100 100 L {x1} {y1} A 70 70 0 {largeArc} 1 {x2} {y2} Z"
											fill={result.color}
											stroke="white"
											stroke-width="2"
											in:scale={{ duration: 800, delay: i * 100, easing: elasticOut }} />
									{/each}
								</svg>
							</div>
							<div class="grid items-center justify-start grid-cols-3 gap-1 mt-2">
								{#each results as result, i}
									{#if i === 0}
										<div
											class="flex items-center justify-between text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium">
											<span class="">{result.letter}: {result.clarity}</span>
										</div>
									{:else}
										<div class="flex items-center justify-between text-xs">
											<span class="text-card-foreground">{result.letter}: {result.clarity}</span>
										</div>
									{/if}
								{/each}
							</div>
							<h5
								class="text-card-foreground flex items-center justify-start gap-2 mt-2 text-sm font-semibold">
								<div class="bg-primary w-3 h-3 rounded-full"></div>
								Clarity Scores
							</h5>
						</div>

						<!-- Impact Chart -->
						<div class="text-center">
							<div class="w-28 h-28 relative mx-auto">
								<svg viewBox="0 0 200 200" class="w-full h-full">
									{#each results as result, i}
										{@const total = results.reduce((sum, r) => sum + r.impact, 0)}
										{@const previousResults = results.slice(0, i)}
										{@const startAngle = previousResults.reduce(
											(sum, r) => sum + (r.impact / total) * 360,
											0,
										)}
										{@const angle = (result.impact / total) * 360}
										{@const endAngle = startAngle + angle}
										{@const largeArc = angle > 180 ? 1 : 0}
										{@const x1 = 100 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180)}
										{@const y1 = 100 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180)}
										{@const x2 = 100 + 70 * Math.cos(((endAngle - 90) * Math.PI) / 180)}
										{@const y2 = 100 + 70 * Math.sin(((endAngle - 90) * Math.PI) / 180)}

										<path
											d="M 100 100 L {x1} {y1} A 70 70 0 {largeArc} 1 {x2} {y2} Z"
											fill={result.color}
											stroke="white"
											stroke-width="2"
											in:scale={{ duration: 800, delay: 200 + i * 100, easing: elasticOut }} />
									{/each}
								</svg>
							</div>
							<div class="grid items-center justify-start grid-cols-3 gap-1 mt-2">
								{#each results as result, i}
									{#if i === 0}
										<div
											class="flex items-center justify-between text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium">
											<span class="">{result.letter}: {result.clarity}</span>
										</div>
									{:else}
										<div class="flex items-center justify-between text-xs">
											<span class="text-card-foreground">{result.letter}: {result.clarity}</span>
										</div>
									{/if}
								{/each}
							</div>
							<h5
								class="text-card-foreground flex items-center justify-start gap-2 mt-2 text-sm font-semibold">
								<div class="bg-secondary w-3 h-3 rounded-full"></div>
								Impact Scores
							</h5>
						</div>

						<!-- Appeal Chart -->
						<div class="text-center">
							<div class="w-28 h-28 relative mx-auto">
								<svg viewBox="0 0 200 200" class="w-full h-full">
									{#each results as result, i}
										{@const total = results.reduce((sum, r) => sum + r.appeal, 0)}
										{@const previousResults = results.slice(0, i)}
										{@const startAngle = previousResults.reduce(
											(sum, r) => sum + (r.appeal / total) * 360,
											0,
										)}
										{@const angle = (result.appeal / total) * 360}
										{@const endAngle = startAngle + angle}
										{@const largeArc = angle > 180 ? 1 : 0}
										{@const x1 = 100 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180)}
										{@const y1 = 100 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180)}
										{@const x2 = 100 + 70 * Math.cos(((endAngle - 90) * Math.PI) / 180)}
										{@const y2 = 100 + 70 * Math.sin(((endAngle - 90) * Math.PI) / 180)}

										<path
											d="M 100 100 L {x1} {y1} A 70 70 0 {largeArc} 1 {x2} {y2} Z"
											fill={result.color}
											stroke="white"
											stroke-width="2"
											in:scale={{ duration: 800, delay: 400 + i * 100, easing: elasticOut }} />
									{/each}
								</svg>
							</div>
							<div class="grid items-center justify-start grid-cols-3 gap-1 mt-2">
								{#each results as result, i}
									{#if i === 0}
										<div
											class="flex items-center justify-between text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium">
											<span class="">{result.letter}: {result.clarity}</span>
										</div>
									{:else}
										<div class="flex items-center justify-between text-xs">
											<span class="text-card-foreground">{result.letter}: {result.clarity}</span>
										</div>
									{/if}
								{/each}
							</div>
							<h5
								class="text-card-foreground flex items-center justify-start gap-2 mt-2 text-sm font-semibold">
								<div class="bg-muted w-3 h-3 rounded-full"></div>
								Appeal Scores
							</h5>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI - SIMPLIFIED STATIC/ANIMATED MODE
<!-- ============================================================================ -->

<!-- 
SIMPLE TOGGLE: Change 'staticDesignMode' to 'true' on line ~330 to see all steps without animations
Perfect for design work - shows fully populated concepts, video, results table, and charts
-->

{#if staticDesignMode}
	<!-- STATIC DESIGN MODE - All steps visible with full data -->
	<div class="relative flex flex-col w-full pl-12 space-y-12">
		<!-- STEP 1: Live Interview Analysis -->
		<div class="space-y-4">
			<div class="absolute top-0 left-0 z-10">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconEye class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Live Interview Analysis</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Interview analysis completed
					</span>
				</div>
			</div>

			{@render conceptsGrid(conceptsData.map((c, i) => ({ ...c, isHighlighted: i === 0 || i === 4 })))}
			{@render videoPlayer(
				true,
				subtitleWordsData.map((w) => ({ ...w, isHighlighted: true })),
				subtitleWordsData.length - 1,
			)}
		</div>

		<!-- STEP 2: Results Analysis -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 40rem;">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconChartPie class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Multi-Dimensional Analysis</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Multi-dimensional insights generated - Concept A leads in appeal
					</span>
				</div>
			</div>

			{@render resultsTable(conceptResultsData)}
			{@render pieChartDisplay(conceptResultsData, true)}
		</div>
	</div>
{:else}
	<!-- ANIMATED MODE - Standard step-by-step animation -->
	<div class="relative flex flex-col w-full pl-12 space-y-4">
		<div class="absolute top-0 left-0 z-10">
			<div
				class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 relative flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full shadow-lg">
				{#key currentStepIndex}
					<div
						in:scale={{ duration: 300, easing: elasticOut, start: 0.5, delay: 150 }}
						out:scale={{ duration: 150, easing: cubicInOut, start: 0.5 }}
						class="transform-gpu absolute inset-0 flex items-center justify-center">
						{#if currentStep.icon}
							{@const IconComponent = currentStep.icon}
							<IconComponent class="size-4" />
						{:else}
							<IconLoader class="size-4" />
						{/if}
					</div>
				{/key}
			</div>
		</div>

		{#if showCard}
			<div
				class="transition-all duration-500"
				in:fly={{ y: 30, duration: 600, easing: quintOut }}
				out:fly={{ y: -30, duration: 500, easing: cubicInOut }}>
				<div class="mb-4 space-y-3">
					<div in:fly={{ x: -30, duration: 500, easing: quintOut }}>
						<h3 class="text-foreground text-lg font-semibold tracking-tight">{currentStep.title}</h3>
					</div>

					<div class="relative min-h-[1.25rem]">
						{#key `${currentStep.id}-${isLoading}-${isComplete}`}
							<div
								class="absolute inset-0"
								in:fly={{ x: -30, duration: 400, delay: 100, easing: quintOut }}
								out:fly={{ x: 30, duration: 300, easing: cubicInOut }}>
								<div class="text-foreground text-sm leading-relaxed">
									{#if animationState.isComplete}
										<span class="text-primary flex items-center gap-2 mb-2 font-medium">
											<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
											{currentStep.completeText}
										</span>
									{:else if isLoading}
										<span class="text-foreground opacity-80 flex items-center gap-2 font-semibold">
											<div class="animate-spin flex-shrink-0">
												<IconLoader class="size-4 text-foreground" />
											</div>
											<span class="animate-shimmer-once text-foreground bg-foreground">
												{currentStep.loadingText}...
											</span>
										</span>
									{:else}
										<span>{currentStep.subtitle}</span>
									{/if}
								</div>
							</div>
						{/key}
					</div>
				</div>

				{#if isLoading || animationState.isComplete}
					{#if currentStep.id === "live-interview"}
						{@render conceptsGrid(animationState.concepts)}
						{@render videoPlayer(
							animationState.showVideo,
							animationState.subtitleWords,
							animationState.currentWordIndex,
						)}
					{/if}

					{#if currentStep.id === "results-analysis"}
						{@render resultsTable(animationState.conceptResults)}
						{@render pieChartDisplay(animationState.conceptResults, animationState.showChart)}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.animate-shimmer-once {
		background:
			linear-gradient(-45deg, #0000 40%, #fff5, #0000 60%) right/300% 100%,
			linear-gradient(45deg, var(--foreground), var(--foreground));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: #000;
		animation: shine 1.5s infinite;
	}

	@keyframes shine {
		to {
			background-position: left;
		}
	}
</style>
