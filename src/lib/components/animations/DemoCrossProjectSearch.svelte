<!--
ANIMATED CROSS PROJECT SEARCH
Shows search query across multiple projects with cited results
Clean, professional design for corporate audiences
-->

<script lang="ts">
	import { onMount } from "svelte"
	import { IconSearch, IconFileSearch, IconLocation } from "@tabler/icons-svelte"
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

	class TextAnimator {
		static async animateTyping(
			controller: AnimationController,
			text: string,
			onUpdate: (progress: string) => void,
			options: { delay?: number } = {},
		): Promise<void> {
			const { delay = 30 } = options

			for (let i = 0; i <= text.length; i++) {
				if (controller.signal.aborted) {
					throw new Error("Animation cancelled")
				}

				const currentText = text.slice(0, i)
				onUpdate(currentText)

				if (i < text.length) {
					await controller.delay(delay)
				}
			}
		}
	}

	// ============================================================================
	// LAYER 2: CENTRALIZED STATE MANAGEMENT
	// ============================================================================

	type SearchResult = {
		id: string
		text: string
		projectName: string
		projectType: string
		speaker?: string
		isHighlighted: boolean
	}

	let animationState = $state({
		typedQuery: "",
		summaryWords: <string[]>[],
		visibleWords: 0,
		showCitations: false,
		showCursor: false,
		cursorTargetId: "",
		activeCitationId: "",
		searchResults: <SearchResult[]>[],
		showResults: false,
		highlightedResultId: "",
		isComplete: false,
		currentStepId: "",
	})

	function resetAnimationState() {
		animationState.typedQuery = ""
		animationState.summaryWords = []
		animationState.visibleWords = 0
		animationState.showCitations = false
		animationState.showCursor = false
		animationState.cursorTargetId = ""
		animationState.activeCitationId = ""
		animationState.searchResults = []
		animationState.showResults = false
		animationState.highlightedResultId = ""
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const searchQuery = "How have opinions on AI-powered features changed over time across our projects?"

	const searchResultsData: SearchResult[] = [
		{
			id: "result-1",
			text: "Users were skeptical about AI recommendations, calling them 'creepy' and preferring manual control.",
			projectName: "E-commerce AI Study Q1 2023",
			projectType: "User Research",
			speaker: "Participant P12",
			isHighlighted: false,
		},
		{
			id: "result-2",
			text: "Users now appreciate AI suggestions but want transparency and the ability to override them.",
			projectName: "Product Discovery Q3 2023",
			projectType: "Usability Study",
			speaker: "User U8",
			isHighlighted: false,
		},
		{
			id: "result-3",
			text: "Users actively seek AI features but expect them to be contextual and non-intrusive.",
			projectName: "Feature Adoption Q1 2024",
			projectType: "Customer Research",
			isHighlighted: false,
		},
	]

	// Combined summary text with inline citations
	const summaryWithCitations =
		"User attitudes toward AI features have evolved significantly over time. Early studies showed users were skeptical about AI recommendations, preferring manual control. Recent research indicates a shift toward acceptance, with users appreciating AI suggestions while emphasizing transparency. Latest findings reveal users actively seek AI-powered features when contextual and seamlessly integrated."

	// ============================================================================
	// LAYER 3: STEP ANIMATION FUNCTIONS
	// ============================================================================

	async function animateSearchQuery(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(200)
			await TextAnimator.animateTyping(controller, searchQuery, (progress) => {
				animationState.typedQuery = progress
			})
			await controller.delay(1000)
		} catch (err) {
			animationState.typedQuery = searchQuery
			throw err
		}
	}

	async function animateSearchResults(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(500)
			animationState.showResults = true
			animationState.searchResults = [...searchResultsData]

			// Initialize summary words
			animationState.summaryWords = summaryWithCitations.split(" ")
			animationState.visibleWords = 0

			// Animate summary word by word
			for (let i = 0; i < animationState.summaryWords.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.visibleWords = i + 1
				await controller.delay(50)
			}

			// Show citations after summary is complete
			await controller.delay(800)
			animationState.showCitations = true

			// Wait a moment then show cursor and hover over second citation
			await controller.delay(1000)
			animationState.showCursor = true
			animationState.cursorTargetId = "result-2" // Target the second citation

			// Move cursor to position and highlight the citation
			await controller.delay(900)
			animationState.activeCitationId = "result-2"

			// Hold the hover state
			await controller.delay(2000)

			// Move cursor away and remove highlight
			animationState.showCursor = false
			animationState.activeCitationId = ""

			await controller.delay(100)
		} catch (err) {
			animationState.showResults = true
			animationState.searchResults = [...searchResultsData]
			animationState.summaryWords = summaryWithCitations.split(" ")
			animationState.visibleWords = animationState.summaryWords.length
			animationState.showCitations = true
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
			id: "search-query",
			icon: IconSearch,
			title: "Cross-Project Search",
			subtitle: "Search across all your research projects",
			loadingText: "Preparing search interface",
			completeText: "Search query entered",
			execute: animateSearchQuery,
		},
		{
			id: "search-results",
			icon: IconFileSearch,
			title: "Search Results",
			subtitle: "Finding relevant insights across projects",
			loadingText: "Searching across projects",
			completeText: "Results found from 3 projects",
			execute: animateSearchResults,
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

		resetAnimationState()
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

				await controller.delay(2000)

				if (!controller.signal.aborted) {
					if (stepIndex < steps.length - 1) {
						transitionToNextStep()
					} else {
						setTimeout(() => {
							restart = true
						}, 3000)
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
<!-- CLEAN CROSS PROJECT SEARCH UI -->
<!-- ============================================================================ -->

{#if showCard}
	<div class="w-full h-full flex items-center justify-center mx-auto min-w-full">
		<div
			class="transition-all duration-500 flex items-center justify-center mx-auto w-full"
			in:slide={{ axis: "y", duration: 300, easing: quintOut }}
			out:fade={{ duration: 200, delay: 100, easing: cubicInOut }}>
			<!-- SEARCH QUERY STEP -->
			{#if currentStep?.id === "search-query"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center rounded-xl"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full flex items-center justify-center min-w-96 w-full lg:max-w-96 mx-auto">
						<div class="space-y-6 w-full h-full relative transition-all duration-500">
							<div class="text-left">
								<h2 class="text-xl text-black leading-tight font-semibold">Search Across Projects</h2>
								<p class="text-md text-gray-600 mt-1">Query all research projects</p>
							</div>

							<!-- Search Input -->
							<div class="space-y-4">
								<div class="relative">
									<div
										class="flex items-start gap-3 p-3 border border-gray-800 rounded-lg bg-white h-16 w-full">
										<div
											class="flex-1 text-sm text-gray-800 min-h-[1.25rem] leading-relaxed line-clamp-2 text-left">
											{animationState.typedQuery}
											{#if animationState.typedQuery && !animationState.isComplete}
												<span class="animate-pulse">|</span>
											{/if}
										</div>
									</div>
								</div>

								<!-- Search Button -->
								<div class="relative">
									<div
										class={`w-full bg-black text-white px-6 py-3 rounded-lg font-medium transition-all text-center cursor-pointer ${
											animationState.isComplete ? "animate-clicked" : ""
										}`}>
										<div class="flex items-center justify-center gap-2">
											<IconSearch class="size-4" />
											<span>Search Projects</span>
										</div>
									</div>

									<!-- Search Button -->
									{#if animationState.isComplete}
										<!-- Pointer animation -->
										<div class="absolute -bottom-2 right-2 slide-in-pointer">
											<div class="animate-click-pointer">
												<IconLocation
													fill="white"
													class="size-8 text-black drop-shadow-lg rotate-270" />
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</Box>
				</div>
			{/if}

			<!-- SEARCH RESULTS STEP -->
			{#if currentStep?.id === "search-results"}
				<div
					class="w-full h-full flex items-start justify-start transition-all duration-300 min-w-112"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<div
						class="transition-all transform w-full min-w-full flex items-center justify-center bg-white rounded-xl shadow-md duration-500"
						transition:slide={{ axis: "y", duration: 300, easing: quintOut }}>
						<div class="h-full flex items-start justify-start w-full p-6 transition-height duration-500">
							<div class="space-y-3 w-full h-full relative transition-all duration-500">
								<div class="text-left">
									<h2
										class={`text-lg text-black font-semibold leading-tight transition-all duration-800 ${
											animationState.summaryWords.length > 0 ? "text-sm" : "text-sm"
										}`}>
										Query: {searchQuery}
									</h2>
								</div>

								<!-- Summary with Citations -->
								{#if animationState.showResults}
									<div
										class="bg-gray-200 rounded-lg p-3"
										in:slide={{ axis: "y", duration: 300, easing: quintOut }}>
										<div class="text-gray-800 leading-relaxed text-sm">
											<!-- Word-by-word animated summary -->
											{#if animationState.summaryWords.length > 0}
												<div class="min-h-[3rem]">
													{#each animationState.summaryWords as word, index}
														<span
															class="transition-opacity duration-200 {index <
															animationState.visibleWords
																? 'opacity-100'
																: 'opacity-0'}">
															{word}
															<!-- Add citation 1 after "control." -->
															{#if index === 9}
																<span
																	class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded ml-1"
																	>1</span>
															{/if}
															<!-- Add citation 2 after "transparency." -->
															{#if index === 21}
																<span
																	class="relative bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded mx-1">
																	2
																	<!-- Animated cursor that moves over citation 2 -->
																	{#if animationState.showCursor}
																		<span
																			class="absolute ease-in-out top-1 left-1 z-50 -translate-y-[100px] -translate-x-[500px] animate-slideInFiles">
																			<IconLocation
																				fill="white"
																				class="size-8 text-black drop-shadow-lg rotate-270" />
																		</span>
																	{/if}
																</span>
															{/if}
															<!-- Add citation 3 after "integrated." -->
															{#if index === 36}
																<span
																	class=" bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded ml-1"
																	>3
																</span>
															{/if}
															{#if index < animationState.summaryWords.length - 1}{" "}{/if}
														</span>
													{/each}
												</div>
											{/if}
										</div>
									</div>

									<!-- Citations -->
									{#if animationState.showCitations}
										<div
											class="space-y-1.5 relative"
											in:slide={{ axis: "y", duration: 400, delay: 200, easing: quintOut }}>
											<div class="text-sm font-semibold text-gray-800 mb-1">Sources:</div>
											{#each animationState.searchResults as result, index}
												<div
													id="citation-{result.id}"
													class="border-l-2 border-gray-400 pl-2 transition-all duration-300 {animationState.activeCitationId ===
													result.id
														? 'bg-gray-100 rounded-r-lg pr-2 py-1 border-black'
														: ''}"
													in:fly={{
														x: -10,
														duration: 300,
														delay: 200 + index * 200,
														easing: quintOut,
													}}>
													<div class="flex items-start gap-2">
														<span
															class="bg-black text-white text-xs px-1 py-0.5 rounded font-bold flex-shrink-0 {animationState.activeCitationId ===
															result.id
																? 'ring-1 ring-black/30 bg-gray-800'
																: ''}">
															{index + 1}
														</span>
														<div class="flex-1">
															<div class="text-xs text-gray-800 leading-tight mb-1">
																"{result.text}"
															</div>
															<div class="flex items-center justify-between">
																<div class="text-xs text-gray-600 truncate">
																	<span class="font-medium text-gray-800"
																		>{result.projectName}</span>
																</div>
																<span
																	class="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
																	{result.projectType}
																</span>
															</div>
														</div>
													</div>
												</div>
											{/each}
										</div>
									{/if}
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.animate-slideInFiles {
		animation: slideInFiles 1.2s ease-out forwards;
	}
	@keyframes slideInFiles {
		0% {
			transform: translateX(0px) translateY(0px);
		}
		90% {
			transform: translateX(500px) translateY(100px);
		}
		100% {
			transform: translateX(500px) translateY(100px);
		}
	}
</style>
