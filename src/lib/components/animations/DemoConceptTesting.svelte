<!--
ANIMATED CONCEPT TESTING WORKFLOW
Shows live interview analysis and multi-dimensional concept evaluation
Clean, professional design for corporate audiences - keeping original functionality
-->

<script lang="ts">
	import { onMount } from "svelte"
	import { IconEye, IconChartPie, IconCheck } from "@tabler/icons-svelte"
	import { fade, fly, scale, slide } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"
	import Box from "./Box.svelte"

	// ============================================================================
	// LAYER 1: ANIMATION PRIMITIVES (from DemoCoreValue)
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
	// LAYER 2: CENTRALIZED STATE MANAGEMENT
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
		clarity: number
		impact: number
		appeal: number
	}

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
			animationState.conceptResults = []
			animationState.showChart = false
		}
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION (Original data preserved)
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

			if (lowerWord === "option" && i + 1 < words.length) {
				const nextWord = words[i + 1].toLowerCase()
				if (nextWord === "a") {
					result.push({ text: `${word} ${words[i + 1]}`, isHighlighted: false, relatedConcept: "concept-a" })
					i++
					continue
				} else if (nextWord === "e") {
					result.push({ text: `${word} ${words[i + 1]}`, isHighlighted: false, relatedConcept: "concept-e" })
					i++
					continue
				}
			}

			result.push({ text: word, isHighlighted: false, relatedConcept: undefined })
		}

		return result
	})()

	const conceptResultsData: ConceptResult[] = [
		{ concept: "Summer", letter: "A", clarity: 80, impact: 90, appeal: 95 },
		{ concept: "Tropical", letter: "C", clarity: 65, impact: 30, appeal: 70 },
		{ concept: "Original", letter: "B", clarity: 82, impact: 25, appeal: 30 },
		{ concept: "Cheese", letter: "D", clarity: 45, impact: 78, appeal: 62 },
		{ concept: "Chili", letter: "E", clarity: 80, impact: 45, appeal: 85 },
		{ concept: "Classic", letter: "F", clarity: 25, impact: 35, appeal: 30 },
	]

	// ============================================================================
	// LAYER 3: STEP ANIMATION FUNCTIONS (Original logic preserved)
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
			await controller.delay(300)
			animationState.conceptResults = [...conceptResultsData]
			await controller.delay(1800)

			animationState.showChart = true
			await controller.delay(1200)
		} catch (err) {
			animationState.conceptResults = [...conceptResultsData]
			animationState.showChart = true
			throw err
		}
	}

	// ============================================================================
	// LAYER 4: STEP DEFINITIONS
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
			subtitle: "Real-time concept preference analysis during interviews",
			loadingText: "Processing concept feedback",
			completeText: "Interview analysis completed",
			execute: animateLiveInterview,
		},
		{
			id: "results-analysis",
			icon: IconChartPie,
			title: "Multi-Dimensional Analysis",
			subtitle: "Analyzing concepts across clarity, impact, and appeal dimensions",
			loadingText: "Compiling dimensional analysis",
			completeText: "Analysis complete - Key insights identified",
			execute: animateResultsAnalysis,
		},
	]

	// ============================================================================
	// LAYER 5: EXECUTION ENGINE (from DemoCoreValue)
	// ============================================================================

	let currentStepIndex = $state(0)
	let isLoading = $state(false)
	let isComplete = $state(false)
	let restart = $state(false)
	let showCard = $state(true)
	let currentController: AnimationController | null = $state(null)
	let isAnimationStarted = $state(false)

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
			}, 150)
		}, 400)
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
			}, 150)
		}, 400)
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
		setTimeout(() => {
			startAnimation()
		}, 500)
	})
</script>

<!-- ============================================================================ -->
<!-- CLEAN CONCEPT TESTING UI - Original functionality with DemoCoreValue styling -->
<!-- ============================================================================ -->

<div class="w-full h-full flex items-center justify-center">
	{#if showCard}
		<div
			class="transition-all duration-500"
			in:slide={{ axis: "y", duration: 300, easing: quintOut }}
			out:fade={{ duration: 200, delay: 100, easing: cubicInOut }}>
			<!-- LIVE INTERVIEW STEP -->
			{#if currentStep?.id === "live-interview"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full flex w-full items-center justify-center">
						<div class="space-y-4 w-full h-full relative">
							<div class="text-left">
								<h2 class="text-lg text-black leading-tight">Concept Testing Session</h2>
								<p class="text-gray-600 text-sm">Live Interview Analysis</p>
							</div>

							<!-- Concepts Grid -->
							{#if animationState.concepts.length > 0}
								<div class="grid grid-cols-6 gap-2" in:fade={{ duration: 400 }}>
									{#each animationState.concepts as concept, i (concept.id)}
										<div
											class="relative bg-white border border-gray-300 hover:border-gray-800 transition-all duration-300 rounded-lg overflow-hidden {concept.isHighlighted
												? 'ring-2 ring-black border-black'
												: ''}"
											in:fade={{ duration: 400, delay: i * 80 }}>
											<!-- Concept letter badge -->
											<div class="absolute top-2 left-2 z-10">
												<div
													class="bg-white border border-gray-300 text-black size-6 flex items-center justify-center rounded text-xs font-semibold">
													{concept.letter}
												</div>
											</div>

											<!-- Highlighted indicator -->
											{#if concept.isHighlighted}
												<div class="absolute top-2 right-2 z-10">
													<div
														class="bg-black text-white size-6 flex items-center justify-center rounded-full">
														<IconCheck class="size-3" />
													</div>
												</div>
											{/if}

											<!-- Product image -->
											<div class="aspect-square w-full bg-gray-50">
												<img
													src={concept.image}
													alt="Concept {concept.letter}: {concept.name}"
													class="object-cover w-full h-full" />
											</div>

											<!-- Concept name -->
											<div class="p-2">
												<div class="text-xs font-medium text-black">{concept.name}</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Live Transcription - Evidence Style -->
							{#if animationState.showVideo}
								<div class="mt-4">
									<div class="text-left border-l-4 border-black pl-4" in:fade={{ duration: 400 }}>
										<div class="flex items-center gap-2 mb-3">
											<div class="size-2 bg-red-500 rounded-full animate-pulse"></div>
											<span class="text-gray-600 text-xs font-medium"
												>Live Interview Transcript</span>
										</div>

										<div class="text-sm leading-relaxed text-black">
											<p class="mb-2">
												<span class="bg-black text-white text-xs px-1.5 py-0.5 mr-2 rounded"
													>P1</span>
												<span class="font-bold text-black">Participant:</span>
											</p>
											<p class="ml-6 text-gray-800">
												{#if animationState.subtitleWords.length > 0}
													{#each animationState.subtitleWords as word, i}
														<span
															class="transition-colors duration-300 {i <=
															animationState.currentWordIndex
																? word.relatedConcept
																	? 'bg-black text-white px-1.5 py-0.5 rounded-md font-medium'
																	: 'text-gray-800'
																: 'text-transparent'}">{word.text}</span>
														{#if i < animationState.subtitleWords.length - 1}<span
																class="text-gray-800">
															</span>{/if}
													{/each}
													{#if animationState.currentWordIndex < animationState.subtitleWords.length - 1}
														<span
															class="inline-block w-1 h-4 ml-1 bg-black rounded-sm animate-pulse"
														></span>
													{/if}
												{/if}
											</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</Box>
				</div>
			{/if}

			<!-- RESULTS ANALYSIS STEP -->
			{#if currentStep?.id === "results-analysis"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full flex w-full items-center justify-center">
						<div class="space-y-4 w-full h-full relative">
							<div class="text-left">
								<h2 class="text-lg text-black leading-tight">Multi-Dimensional Analysis</h2>
								<p class="text-gray-600 text-sm">Concept performance analysis</p>
							</div>

							<!-- Results Table -->
							{#if animationState.conceptResults.length > 0}
								<div class="space-y-2" in:fade={{ duration: 400 }}>
									{#each animationState.conceptResults as result, i}
										{@const totalScore = result.clarity + result.impact + result.appeal}
										{@const averageScore = Math.round(totalScore / 3)}
										<div
											class="bg-white border border-gray-300 rounded-lg p-3 transition-all duration-300 hover:border-gray-800 {i ===
											0
												? 'ring-2 ring-black border-black'
												: ''}"
											in:fade={{ duration: 400, delay: i * 100 }}>
											<div class="flex items-center justify-between mb-2">
												<div class="flex items-center gap-2">
													<div
														class="bg-white border border-gray-300 text-black size-6 flex items-center justify-center rounded text-xs font-semibold">
														{result.letter}
													</div>
													<div>
														<div class="text-black text-sm font-medium">
															{result.concept}
														</div>
														<div class="text-gray-600 text-xs">
															Score: {averageScore}%
														</div>
													</div>
												</div>
												{#if i === 0}
													<div
														class="bg-black text-white px-2 py-1 rounded text-xs font-medium">
														Winner
													</div>
												{/if}
											</div>

											<div class="grid grid-cols-3 gap-3">
												<!-- Clarity -->
												<div class="space-y-1">
													<div class="flex items-center justify-between">
														<span class="text-gray-600 text-xs font-medium">Clarity</span>
														<span class="text-black text-xs font-semibold"
															>{result.clarity}%</span>
													</div>
													<div class="bg-gray-200 h-2 rounded-full overflow-hidden">
														<div
															class="bg-black h-full transition-all duration-700"
															style="width: {result.clarity}%"
															in:fade={{ duration: 600, delay: 200 + i * 100 }}>
														</div>
													</div>
												</div>

												<!-- Impact -->
												<div class="space-y-1">
													<div class="flex items-center justify-between">
														<span class="text-gray-600 text-xs font-medium">Impact</span>
														<span class="text-black text-xs font-semibold"
															>{result.impact}%</span>
													</div>
													<div class="bg-gray-200 h-2 rounded-full overflow-hidden">
														<div
															class="bg-gray-700 h-full transition-all duration-700"
															style="width: {result.impact}%"
															in:fade={{ duration: 600, delay: 300 + i * 100 }}>
														</div>
													</div>
												</div>

												<!-- Appeal -->
												<div class="space-y-1">
													<div class="flex items-center justify-between">
														<span class="text-gray-600 text-xs font-medium">Appeal</span>
														<span class="text-black text-xs font-semibold"
															>{result.appeal}%</span>
													</div>
													<div class="bg-gray-200 h-2 rounded-full overflow-hidden">
														<div
															class="bg-gray-500 h-full transition-all duration-700"
															style="width: {result.appeal}%"
															in:fade={{ duration: 600, delay: 400 + i * 100 }}>
														</div>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Insights Summary -->
							{#if animationState.showChart && animationState.conceptResults.length > 0}
								{@const topConcept = animationState.conceptResults[0]}
								<div
									class="bg-gray-100 border border-gray-800 rounded-lg p-4"
									in:fade={{ duration: 400, delay: 200 }}>
									<div class="flex items-center gap-2 mb-3">
										<div
											class="bg-black text-white size-6 flex items-center justify-center rounded-full">
											<IconCheck class="size-3" />
										</div>
										<div>
											<div class="text-black text-sm font-semibold">Analysis Complete</div>
											<div class="text-gray-600 text-xs">Key insights identified</div>
										</div>
									</div>

									<div class="space-y-2">
										<div class="flex items-center gap-2">
											<div
												class="bg-white border border-gray-300 text-black size-6 flex items-center justify-center rounded text-xs font-semibold">
												{topConcept.letter}
											</div>
											<span class="text-black font-medium">{topConcept.concept}</span>
											<span class="text-gray-600">emerges as the strongest concept</span>
										</div>

										<div class="grid grid-cols-3 gap-2 text-xs">
											<div class="flex items-center gap-2">
												<div class="size-2 bg-black rounded-full"></div>
												<span class="text-gray-600">Clarity:</span>
												<span class="text-black font-medium">{topConcept.clarity}%</span>
											</div>
											<div class="flex items-center gap-2">
												<div class="size-2 bg-gray-700 rounded-full"></div>
												<span class="text-gray-600">Impact:</span>
												<span class="text-black font-medium">{topConcept.impact}%</span>
											</div>
											<div class="flex items-center gap-2">
												<div class="size-2 bg-gray-500 rounded-full"></div>
												<span class="text-gray-600">Appeal:</span>
												<span class="text-black font-medium">{topConcept.appeal}%</span>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</Box>
				</div>
			{/if}
		</div>
	{/if}
</div>
