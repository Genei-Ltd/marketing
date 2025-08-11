<script lang="ts">
	import { IconEye, IconChartPie, IconLoader, IconCheck } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale, fade } from "svelte/transition"
	import { quintOut, cubicInOut } from "svelte/easing"
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

	// Transcript auto-scroll container
	let transcriptRef = $state<HTMLElement | null>(null)

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
			// Show concepts all at once
			animationState.concepts = conceptsData.map((c) => ({ ...c, isHighlighted: false }))
			await controller.delay(400)

			// Reveal transcript and play it progressively
			animationState.showVideo = true
			animationState.subtitleWords = subtitleWordsData.map((w) => ({ ...w }))
			animationState.currentWordIndex = 0

			await controller.delay(600)

			for (let i = 0; i < animationState.subtitleWords.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.currentWordIndex = i
				animationState.subtitleWords[i].isHighlighted = true

				const word = animationState.subtitleWords[i]
				if (word.relatedConcept) {
					// Reset all highlights first
					animationState.concepts = animationState.concepts.map((c) => ({ ...c, isHighlighted: false }))
					// Then highlight the relevant concept
					const conceptIndex = animationState.concepts.findIndex((c) => c.id === word.relatedConcept)
					if (conceptIndex !== -1) {
						animationState.concepts[conceptIndex].isHighlighted = true
					}
				}

				// Smoother timing for better readability
				await controller.delay(word.relatedConcept ? 800 : 140)
			}

			await controller.delay(1000)
		} catch (err) {
			// Fallback
			animationState.concepts = conceptsData.map((c) => ({ ...c, isHighlighted: c.id === "concept-a" }))
			animationState.subtitleWords = subtitleWordsData.map((w) => ({ ...w, isHighlighted: true }))
			animationState.currentWordIndex = animationState.subtitleWords.length - 1
			animationState.showVideo = true
			throw err
		}
	}

	async function animateResultsAnalysis(controller: AnimationController): Promise<void> {
		try {
			// Show results table first
			await controller.delay(300)
			animationState.conceptResults = [...conceptResultsData]
			await controller.delay(1800)

			// Then show insights summary
			animationState.showChart = true
			await controller.delay(1200)
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
			completeText: "Analysis complete - Key insights identified",
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

	// Keep the transcript gently scrolled to the bottom as words reveal
	$effect(() => {
		void animationState.currentWordIndex
		if (transcriptRef) {
			transcriptRef.scrollTo({ top: transcriptRef.scrollHeight, behavior: "smooth" })
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
		<div class="w-full mt-6" in:fade={{ duration: 400 }} out:fade={{ duration: 200 }}>
			<div class="text-muted-foreground mb-4 text-sm font-medium">
				Testing {concepts.length} concept variants
			</div>

			<div class="grid w-full grid-cols-3 gap-3">
				{#each concepts as concept, i (concept.id)}
					<div
						class="group relative bg-card border border-border/50 hover:border-border transition-all duration-300 rounded-lg overflow-hidden {concept.isHighlighted
							? 'ring-2 ring-accent/30 border-accent/50'
							: ''}"
						in:fade={{ duration: 400, delay: i * 80 }}>
						<!-- Concept letter badge -->
						<div class="absolute top-3 left-3 z-10">
							<div
								class="bg-background/90 backdrop-blur-sm border border-border/50 text-foreground size-6 flex items-center justify-center rounded text-xs font-semibold">
								{concept.letter}
							</div>
						</div>

						<!-- Highlighted indicator -->
						{#if concept.isHighlighted}
							<div class="absolute top-3 right-3 z-10">
								<div
									class="bg-accent text-accent-foreground size-6 flex items-center justify-center rounded-full">
									<IconCheck class="size-3" />
								</div>
							</div>
						{/if}

						<!-- Product image -->
						<div class="aspect-square w-full bg-muted/20">
							<img
								src={concept.image}
								alt="Concept {concept.letter}: {concept.name}"
								class="object-cover w-full h-full" />
						</div>

						<!-- Concept name -->
						<div class="p-3 pt-2">
							<div class="text-sm font-medium text-foreground">{concept.name}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Live transcription display -->
{#snippet videoPlayer(showVideo: boolean, subtitleWords: SubtitleWord[])}
	{#if showVideo}
		<div class="mt-6" in:fade={{ duration: 400 }} out:fade={{ duration: 200 }}>
			<div class="bg-card border border-border/50 rounded-lg p-5">
				<div class="flex items-center gap-2 mb-4">
					<div class="size-2 bg-accent rounded-full animate-pulse"></div>
					<span class="text-muted-foreground text-sm font-medium">Live interview transcription</span>
				</div>

				<div class="max-h-32 overflow-y-auto" bind:this={transcriptRef}>
					{#if subtitleWords.length > 0}
						<div class="text-base leading-relaxed">
							{#each subtitleWords as word, i}
								<span
									class="transition-colors duration-300 {i <= animationState.currentWordIndex
										? word.relatedConcept
											? 'bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-md font-medium'
											: 'text-foreground'
										: 'text-transparent'}">{word.text}</span>
								{#if i < subtitleWords.length - 1}<span class="text-foreground/80"> </span>{/if}
							{/each}
							{#if animationState.currentWordIndex < subtitleWords.length - 1}
								<span class="inline-block w-1 h-4 ml-1 bg-accent rounded-sm animate-pulse"></span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- Analysis results display -->
{#snippet resultsTable(results: ConceptResult[])}
	{#if results.length > 0}
		<div class="mt-6" in:fade={{ duration: 400 }} out:fade={{ duration: 200 }}>
			<div class="text-muted-foreground mb-4 text-sm font-medium">Concept performance analysis</div>

			<div class="space-y-3">
				{#each results as result, i}
					{@const totalScore = result.clarity + result.impact + result.appeal}
					{@const averageScore = Math.round(totalScore / 3)}
					<div
						class="bg-card border border-border/50 rounded-lg p-4 transition-all duration-300 hover:border-border {i ===
						0
							? 'ring-2 ring-accent/20 border-accent/30'
							: ''}"
						in:fade={{ duration: 400, delay: i * 100 }}>
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-3">
								<div
									class="bg-background border border-border/50 text-foreground size-8 flex items-center justify-center rounded text-sm font-semibold">
									{result.letter}
								</div>
								<div>
									<div class="text-foreground font-medium">{result.concept}</div>
									<div class="text-muted-foreground text-sm">Overall score: {averageScore}%</div>
								</div>
							</div>
							{#if i === 0}
								<div class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
									Top performer
								</div>
							{/if}
						</div>

						<div class="grid grid-cols-3 gap-4">
							<!-- Clarity -->
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground text-xs font-medium">Clarity</span>
									<span class="text-foreground text-xs font-semibold">{result.clarity}%</span>
								</div>
								<div class="bg-muted/30 h-2 rounded-full overflow-hidden">
									<div
										class="bg-accent h-full transition-all duration-700"
										style="width: {result.clarity}%"
										in:fade={{ duration: 600, delay: 200 + i * 100 }}>
									</div>
								</div>
							</div>

							<!-- Impact -->
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground text-xs font-medium">Impact</span>
									<span class="text-foreground text-xs font-semibold">{result.impact}%</span>
								</div>
								<div class="bg-muted/30 h-2 rounded-full overflow-hidden">
									<div
										class="bg-accent-1 h-full transition-all duration-700"
										style="width: {result.impact}%"
										in:fade={{ duration: 600, delay: 300 + i * 100 }}>
									</div>
								</div>
							</div>

							<!-- Appeal -->
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground text-xs font-medium">Appeal</span>
									<span class="text-foreground text-xs font-semibold">{result.appeal}%</span>
								</div>
								<div class="bg-muted/30 h-2 rounded-full overflow-hidden">
									<div
										class="bg-accent-2 h-full transition-all duration-700"
										style="width: {result.appeal}%"
										in:fade={{ duration: 600, delay: 400 + i * 100 }}>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Insights summary -->
{#snippet pieChartDisplay(results: ConceptResult[], showChart: boolean)}
	{#if showChart && results.length > 0}
		{@const topConcept = results[0]}
		<div class="mt-6" in:fade={{ duration: 400, delay: 200 }} out:fade={{ duration: 200 }}>
			<div class="bg-accent/5 border border-accent/20 rounded-lg p-5">
				<div class="flex items-center gap-3 mb-4">
					<div class="bg-accent text-accent-foreground size-8 flex items-center justify-center rounded-full">
						<IconCheck class="size-4" />
					</div>
					<div>
						<div class="text-foreground font-semibold">Analysis Complete</div>
						<div class="text-muted-foreground text-sm">Key insights identified</div>
					</div>
				</div>

				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<div
							class="bg-background border border-border/50 text-foreground size-6 flex items-center justify-center rounded text-xs font-semibold">
							{topConcept.letter}
						</div>
						<span class="text-foreground font-medium">{topConcept.concept}</span>
						<span class="text-muted-foreground">emerges as the strongest concept</span>
					</div>

					<div class="grid grid-cols-3 gap-4 text-sm">
						<div class="flex items-center gap-2">
							<div class="size-2 bg-accent rounded-full"></div>
							<span class="text-muted-foreground">Clarity:</span>
							<span class="text-foreground font-medium">{topConcept.clarity}%</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="size-2 bg-accent-1 rounded-full"></div>
							<span class="text-muted-foreground">Impact:</span>
							<span class="text-foreground font-medium">{topConcept.impact}%</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="size-2 bg-accent-2 rounded-full"></div>
							<span class="text-muted-foreground">Appeal:</span>
							<span class="text-foreground font-medium">{topConcept.appeal}%</span>
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
					class="bg-accent text-accent-foreground flex items-center justify-center w-10 h-10 rounded-full shadow-lg">
					<IconEye class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-2">
				<h3 class="text-foreground text-xl font-semibold tracking-tight">Live Interview Analysis</h3>
				<div class="text-muted-foreground text-sm">
					Real-time concept preference analysis during user interviews
				</div>
			</div>

			{@render conceptsGrid(conceptsData.map((c, i) => ({ ...c, isHighlighted: i === 0 || i === 4 })))}
			{@render videoPlayer(
				true,
				subtitleWordsData.map((w) => ({ ...w, isHighlighted: true })),
			)}
		</div>

		<!-- STEP 2: Results Analysis -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 50rem;">
				<div
					class="bg-accent text-accent-foreground flex items-center justify-center w-10 h-10 rounded-full shadow-lg">
					<IconChartPie class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-2">
				<h3 class="text-foreground text-xl font-semibold tracking-tight">Multi-Dimensional Analysis</h3>
				<div class="text-muted-foreground text-sm">
					Comprehensive scoring across clarity, impact, and appeal dimensions
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
				class="bg-accent text-accent-foreground relative flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full shadow-lg">
				{#key currentStepIndex}
					<div
						in:scale={{ duration: 300, easing: quintOut, start: 0.8, delay: 100 }}
						out:scale={{ duration: 200, easing: cubicInOut, start: 0.8 }}
						class="absolute inset-0 flex items-center justify-center">
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
				class="transition-all duration-400"
				in:fly={{ y: 20, duration: 500, easing: quintOut }}
				out:fly={{ y: -20, duration: 400, easing: cubicInOut }}>
				<div class="mb-6 space-y-2">
					<div in:fly={{ x: -20, duration: 400, easing: quintOut }}>
						<h3 class="text-foreground text-xl font-semibold tracking-tight">{currentStep.title}</h3>
					</div>

					<div class="relative min-h-[1.25rem]">
						{#key `${currentStep.id}-${isLoading}-${isComplete}`}
							<div
								class="absolute inset-0"
								in:fly={{ x: -20, duration: 300, delay: 50, easing: quintOut }}
								out:fly={{ x: 20, duration: 200, easing: cubicInOut }}>
								<div class="text-sm leading-relaxed">
									{#if animationState.isComplete}
										<span class="text-accent flex items-center gap-2 font-medium">
											<IconCheck class="size-3 flex-shrink-0" />
											{currentStep.completeText}
										</span>
									{:else if isLoading}
										<span class="text-muted-foreground flex items-center gap-2">
											<div class="animate-spin flex-shrink-0">
												<IconLoader class="size-3" />
											</div>
											<span>{currentStep.loadingText}...</span>
										</span>
									{:else}
										<span class="text-muted-foreground">{currentStep.subtitle}</span>
									{/if}
								</div>
							</div>
						{/key}
					</div>
				</div>

				{#if isLoading || animationState.isComplete}
					{#if currentStep.id === "live-interview"}
						{@render conceptsGrid(animationState.concepts)}
						{@render videoPlayer(animationState.showVideo, animationState.subtitleWords)}
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
