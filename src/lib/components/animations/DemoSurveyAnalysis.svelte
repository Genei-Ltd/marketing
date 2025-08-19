<!--
ANIMATED OPEN-ENDED SURVEY ANALYSIS WORKFLOW
Shows the journey from raw survey responses to coded insights

STEP 1: Raw Survey Responses
- Display incoming open-ended customer feedback responses
- Show unstructured text data appearing progressively
- Demonstrates the "messy data" challenge

STEP 2: AI Coding Process  
- Automated theme detection and categorization
- Show responses being tagged with color-coded themes
- Group similar responses together visually

STEP 3: Insights Dashboard
- Clean summary with top themes and frequencies
- Key representative quotes highlighted
- Actionable business insights from 487 responses
-->

<script lang="ts">
	import { onMount } from "svelte"
	import { IconMessage, IconBrain, IconChartBar, IconCheck, IconTag } from "@tabler/icons-svelte"
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

	type SurveyResponse = {
		id: string
		text: string
		isVisible: boolean
		theme?: string
		themeColor?: string
		isHighlighted: boolean
	}

	type Theme = {
		id: string
		name: string
		color: string
		count: number
		percentage: number
		representative: string
		positive: number
		negative: number
		positivePercentage: number
		negativePercentage: number
	}

	let animationState = $state({
		// Step 1: Raw responses
		responses: <SurveyResponse[]>[],
		visibleResponseCount: 0,

		// Step 2: Coding process
		showThemes: false,
		responsesCoded: false,
		visibleThemes: <string[]>[],
		showAIProcessing: false,
		codingProgress: 0,

		// Step 3: Results
		themes: <Theme[]>[],
		showResults: false,
		totalResponses: 487,

		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState(stepId?: string) {
		if (stepId === "raw-responses") {
			animationState.responses = []
			animationState.visibleResponseCount = 0
			animationState.showThemes = false
			animationState.responsesCoded = false
			animationState.visibleThemes = []
			animationState.showAIProcessing = false
			animationState.codingProgress = 0
			animationState.themes = []
			animationState.showResults = false
		} else if (stepId === "coding-process") {
			animationState.showThemes = false
			animationState.responsesCoded = false
			animationState.visibleThemes = []
			animationState.showAIProcessing = false
			animationState.codingProgress = 0
			animationState.themes = []
			animationState.showResults = false
		} else if (stepId === "insights-dashboard") {
			animationState.themes = []
			animationState.showResults = false
		}
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const surveyResponsesData: SurveyResponse[] = [
		{
			id: "resp-1",
			text: "The interface is confusing and hard to navigate. I get lost trying to find basic features.",
			isVisible: false,
			theme: "usability",
			themeColor: "bg-gray-100 text-gray-800 border-gray-200",
			isHighlighted: false,
		},
		{
			id: "resp-2",
			text: "Love the new dashboard! Much cleaner and easier to understand than before.",
			isVisible: false,
			theme: "features",
			themeColor: "bg-gray-100 text-gray-800 border-gray-200",
			isHighlighted: false,
		},
		{
			id: "resp-3",
			text: "Pricing is too high for small businesses. We need more affordable tiers.",
			isVisible: false,
			theme: "pricing",
			themeColor: "bg-gray-200 text-gray-800 border-gray-300",
			isHighlighted: false,
		},
		{
			id: "resp-4",
			text: "Customer support was incredibly helpful when I had setup issues.",
			isVisible: false,
			theme: "support",
			themeColor: "bg-gray-50 text-gray-800 border-gray-200",
			isHighlighted: false,
		},
		{
			id: "resp-5",
			text: "Would love to see better integration with Slack and other tools we use daily.",
			isVisible: false,
			theme: "features",
			themeColor: "bg-gray-200 text-gray-900 border-gray-300",
			isHighlighted: false,
		},
		{
			id: "resp-6",
			text: "The mobile app is slow and crashes frequently. Needs major improvements.",
			isVisible: false,
			theme: "performance",
			themeColor: "bg-gray-100 text-gray-900 border-gray-300",
			isHighlighted: false,
		},
	]

	const themesData: Theme[] = [
		{
			id: "usability",
			name: "Usability & UX",
			color: "bg-gray-100 text-gray-800",
			count: 134,
			percentage: 28,
			positive: 67,
			negative: 67,
			positivePercentage: 50,
			negativePercentage: 50,
			representative:
				"The interface is confusing and hard to navigate. I get lost trying to find basic features.",
		},
		{
			id: "pricing",
			name: "Pricing & Value",
			color: "bg-gray-200 text-gray-800",
			count: 97,
			percentage: 20,
			positive: 24,
			negative: 73,
			positivePercentage: 25,
			negativePercentage: 75,
			representative: "Pricing is too high for small businesses. We need more affordable tiers.",
		},
		{
			id: "features",
			name: "Feature Requests",
			color: "bg-gray-200 text-gray-900",
			count: 89,
			percentage: 18,
			positive: 71,
			negative: 18,
			positivePercentage: 80,
			negativePercentage: 20,
			representative: "Would love to see better integration with Slack and other tools we use daily.",
		},
		{
			id: "performance",
			name: "Performance Issues",
			color: "bg-gray-100 text-gray-900",
			count: 76,
			percentage: 16,
			positive: 15,
			negative: 61,
			positivePercentage: 20,
			negativePercentage: 80,
			representative: "The mobile app is slow and crashes frequently. Needs major improvements.",
		},
		{
			id: "support",
			name: "Customer Support",
			color: "bg-gray-50 text-gray-800",
			count: 91,
			percentage: 19,
			positive: 82,
			negative: 9,
			positivePercentage: 90,
			negativePercentage: 10,
			representative: "Customer support was incredibly helpful when I had setup issues.",
		},
	]

	// ============================================================================
	// LAYER 3: STEP ANIMATION FUNCTIONS
	// ============================================================================

	async function animateRawResponses(controller: AnimationController): Promise<void> {
		try {
			// Show all responses at once with staggered animations
			animationState.responses = surveyResponsesData.map((r) => ({
				...r,
				isVisible: true,
				isHighlighted: false,
			}))
			animationState.visibleResponseCount = animationState.responses.length

			await controller.delay(2000) // Show the messy data for a moment
		} catch (err) {
			animationState.responses = surveyResponsesData.map((r) => ({ ...r, isVisible: true, isHighlighted: false }))
			animationState.visibleResponseCount = animationState.responses.length
			throw err
		}
	}

	async function animateCodingProcess(controller: AnimationController): Promise<void> {
		try {
			// Show AI processing with loading bar
			await controller.delay(400)
			animationState.showAIProcessing = true

			// Animate loading progress bar
			for (let i = 0; i <= 105; i += 2) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.codingProgress = i
				await controller.delay(15)
			}

			await controller.delay(600)

			// Show themes appearing one by one
			const themeNames = [
				"Usability",
				"Pricing",
				"Features",
				"Performance",
				"Support",
				"Storage",
				"Security",
				"Other",
			]
			for (let i = 0; i < themeNames.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.visibleThemes = themeNames.slice(0, i + 1)
				await controller.delay(600)
			}

			await controller.delay(800)

			// Rapidly tag all responses with themes
			for (let i = 0; i < animationState.responses.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				const response = animationState.responses[i]
				response.isHighlighted = true
				await controller.delay(200)
			}

			// Show final coded state
			await controller.delay(400)
			animationState.responsesCoded = true

			// Remove individual highlights
			animationState.responses.forEach((r) => (r.isHighlighted = false))

			await controller.delay(1000)
		} catch (err) {
			animationState.showAIProcessing = true
			animationState.codingProgress = 100
			animationState.visibleThemes = [
				"Usability",
				"Pricing",
				"Features",
				"Performance",
				"Support",
				"Storage",
				"Security",
				"Other",
			]
			animationState.responsesCoded = true
			throw err
		}
	}

	async function animateInsightsDashboard(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(400)
			animationState.showResults = true

			// Show themes progressively
			for (let i = 0; i < themesData.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.themes = themesData.slice(0, i + 1)
				await controller.delay(600)
			}

			await controller.delay(2000)
		} catch (err) {
			animationState.showResults = true
			animationState.themes = [...themesData]
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
			id: "raw-responses",
			icon: IconMessage,
			title: "Survey Responses",
			subtitle: "Collecting open-ended customer feedback",
			loadingText: "Processing survey responses",
			completeText: "6 responses collected",
			execute: animateRawResponses,
		},
		{
			id: "coding-process",
			icon: IconBrain,
			title: "Automated Coding",
			subtitle: "AI identifying themes and patterns",
			loadingText: "Analyzing response patterns",
			completeText: "5 themes identified",
			execute: animateCodingProcess,
		},
		{
			id: "insights-dashboard",
			icon: IconChartBar,
			title: "Analysis Complete",
			subtitle: "Key insights from 487 survey responses",
			loadingText: "Generating insights dashboard",
			completeText: "Top themes identified with confidence scores",
			execute: animateInsightsDashboard,
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
<!-- DEVELOPMENT CONTROLS - Manual Step Selection -->
<!-- ============================================================================ -->

{#if false}
	<div class="absolute top-0 right-0 z-50 bg-white/50 border border-gray-300 rounded-lg p-2 shadow-lg">
		<div class="text-xs font-semibold text-gray-700 mb-2">Dev Controls</div>
		<div class="flex flex-wrap gap-1">
			{#each steps as step}
				<button
					onclick={() => {
						const stepIndex = steps.findIndex((s) => s.id === step.id)
						if (stepIndex !== -1) {
							currentStepIndex = stepIndex
							resetAnimationState(step.id)
							executeStep(stepIndex)
							animationState.currentStepId = step.id
						}
					}}
					class="text-xs px-3 py-1 rounded-full border transition-all duration-200 {animationState.currentStepId ===
					step.id
						? 'bg-black text-white border-black'
						: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}">
					{step.title}
				</button>
			{/each}
		</div>
	</div>
{/if}

<!-- ============================================================================ -->
<!-- CLEAN SURVEY ANALYSIS UI - Matches established patterns -->
<!-- ============================================================================ -->

<div class="w-full h-full flex items-start justify-start">
	{#if showCard}
		<div
			class="transition-all duration-500"
			in:slide={{ axis: "y", duration: 300, easing: quintOut }}
			out:fade={{ duration: 200, delay: 100, easing: cubicInOut }}>
			<!-- RAW RESPONSES STEP -->
			{#if currentStep?.id === "raw-responses"}
				<div
					class="transition-all duration-300 w-full h-full flex items-start justify-start"
					in:scale={{ duration: 300, easing: cubicInOut, start: 0.5 }}>
					<Box class="h-full w-full max-w-full flex items-start justify-start">
						<div class="space-y-4 w-full h-full relative min-h-[500px]">
							<div class="text-left mb-8">
								<h2 class="text-xl text-black leading-tight font-semibold">
									Open-Ended Survey Responses
								</h2>
								<p class="text-md text-gray-600 mt-1">
									Customer feedback collection • {animationState.totalResponses} responses
								</p>
							</div>

							<!-- Survey Responses Feed - Fixed Height Container -->
							<div class="min-h-80 overflow-y-auto space-y-2">
								{#each animationState.responses as response, i (response.id)}
									{#if response.isVisible}
										<div
											class="border-b border-gray-200 pb-2 text-sm leading-relaxed transition-all duration-300"
											in:slide={{ axis: "y", duration: 300, delay: i * 100, easing: quintOut }}>
											<div class="flex items-start justify-between gap-4">
												<div class="flex-1">
													<div class="text-gray-500 text-xs mb-1">
														#{i + 1}
													</div>
													<div class="text-gray-900">
														"{response.text}"
													</div>
												</div>
											</div>
										</div>
									{/if}
								{/each}
							</div>

							{#if animationState.isComplete}{/if}
						</div>
					</Box>
				</div>
			{/if}

			<!-- CODING PROCESS STEP -->
			{#if currentStep?.id === "coding-process"}
				<div
					class="transition-all duration-300 w-full h-full flex items-start justify-start"
					in:slide={{ axis: "y", duration: 500, easing: quintOut }}>
					<Box class="h-full w-full max-w-full flex items-start justify-start">
						<!-- {#if animationState.responsesCoded}
							<div class="text-center pt-2" in:slide={{ axis: "y", duration: 300, delay: 400 }}>
								<div
									class="flex items-center justify-center rounded-lg gap-2 bg-black text-sm text-white">
									<IconCheck class="size-4 " />
									<span>Themes coded • {animationState.totalResponses} responses coded</span>
								</div>
							</div>
						{/if} -->
						<div class="space-y-4 w-full h-full relative min-h-[500px] self-start">
							<div class="text-left w-full mb-8">
								<h2 class="text-xl text-black leading-tight font-semibold">Coding Open Ends</h2>
								<p class="text-md text-gray-600 mt-1">
									{animationState.totalResponses} responses
								</p>
							</div>

							<div class="h-26 mb-4 w-full rounded-lg bg-gray-100 p-2">
								<!-- AI Processing Animation -->
								{#if animationState.showAIProcessing}
									<div class="space-y-3" in:fade={{ duration: 400, delay: 200 }}>
										{#if animationState.codingProgress <= 100}
											<!-- Loading Bar Phase -->
											<div
												class="flex"
												in:fade={{ duration: 400, delay: 200 }}
												out:fade={{ duration: 400, delay: 200 }}>
												<div
													class="flex-1 flex flex-col mt-4 items-center gap-3 w-full h-full justify-center px-4">
													<div class="flex items-center justify-center mb-1 w-full">
														<span
															class="text-sm w-full text-center font-medium text-gray-800"
															>Analyzing themes...</span>
													</div>
													<div class="w-full bg-gray-200 rounded-full h-2">
														<div
															class="bg-black h-2 rounded-full transition-all duration-100"
															style="width: {animationState.codingProgress}%">
														</div>
													</div>
												</div>
											</div>
										{:else if animationState.visibleThemes.length > 0}
											<!-- Themes Appearing Phase -->
											<div class="space-y-2">
												<div class="text-sm font-medium text-gray-800">Themes Identified:</div>
												<div class="flex flex-wrap gap-2">
													{#each animationState.visibleThemes as theme, i}
														<div
															in:fly={{
																x: 20,
																duration: 400,
																delay: 100 + i * 100,
																easing: cubicInOut,
															}}
															class="flex items-center gap-1 px-2 py-1 rounded-full bg-black text-white text-xs">
															<IconTag class="size-3 hidden lg:block" />
															<span>{theme}</span>
														</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Coded Responses - Fixed Height Container -->
							<div class=" min-h-60 overflow-y-auto">
								{#each animationState.responses as response, i (response.id)}
									<div
										class="py-3 border-b-1 border-gray-300 text-sm leading-relaxed transition-all duration-300 {response.isHighlighted
											? 'text-gray-700 '
											: 'text-gray-900'}"
										in:slide={{
											axis: "y",
											duration: 300,
											delay: i * 100,
											easing: cubicInOut,
										}}>
										<div class="flex items-start gap-2 justify-between">
											<div class="flex-1">
												<div
													class="text-xs text-gray-600 mb-1 flex-row flex items-center gap-1 justify-between h-3">
													#{i + 1}
													{#if animationState.responsesCoded || response.isHighlighted}
														<div
															class="flex items-center gap-1 px-2 py-1 rounded-full text-xs flex-shrink-0 bg-black text-white"
															in:fly={{
																x: 20,
																duration: 300,
																easing: cubicInOut,
															}}>
															<IconTag class="size-3" />
															<span class="capitalize">{response.theme}</span>
														</div>
													{/if}
												</div>
												<div class="">"{response.text}"</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</Box>
				</div>
			{/if}

			<!-- INSIGHTS DASHBOARD STEP -->
			{#if currentStep?.id === "insights-dashboard"}
				<div
					class="transition-all duration-300 w-full max-w-full min-w-full h-full flex items-start justify-start"
					in:slide={{ axis: "x", duration: 500, easing: quintOut }}>
					<Box class="h-full w-full max-w-full min-w-full flex items-start justify-start">
						<div class="space-y-4 w-full h-full relative min-h-[500px]">
							<div class="text-left w-full mb-8">
								<h2 class="text-xl text-black leading-tight w-full font-semibold">
									Survey Analysis Complete
								</h2>
								<p class="text-md text-gray-600 mt-1">
									{animationState.totalResponses} responses analyzed
								</p>
							</div>

							{#if animationState.showResults}
								<!-- Top Themes Chart with Positive/Negative Split -->
								<div class="space-y-4" in:fade={{ duration: 400, delay: 200 }}>
									{#each animationState.themes as theme, i (theme.id)}
										<div
											class="space-y-1"
											in:fly={{ x: -20, duration: 400, delay: i * 200, easing: quintOut }}>
											<!-- Theme Header -->
											<div class="flex items-center justify-between">
												<div class="flex items-center gap-2 text-sm">
													<div class="flex items-center">
														<span class="font-medium text-black">{theme.name}</span>
													</div>
												</div>
												<span class=" text-gray-600 text-sm font-medium"
													>{theme.count} mentions</span>
											</div>

											<!-- Positive/Negative Split Bar -->
											<div class="relative w-full overflow-hidden">
												<div
													class="bg-gray-100 h-4 rounded-full overflow-hidden w-full relative">
													<!-- Positive Bar (Left side) -->
													<div
														class="absolute left-0 top-0 h-full bg-black transition-all duration-1000 flex items-center justify-start pl-2"
														style="width: {theme.positivePercentage / 2}%"
														in:slide={{
															axis: "x",
															duration: 800,
															delay: 300 + i * 200,
														}}>
														{#if theme.positivePercentage >= 25 && i === 0}
															<span class="text-white text-xs font-bold">Positive</span>
														{/if}
													</div>
													<!-- Negative Bar (Right side) -->
													<div
														class="absolute right-0 top-0 h-full bg-gray-600 transition-all duration-1000 flex items-center justify-end pr-2"
														style="width: {theme.negativePercentage / 2}%"
														in:slide={{
															axis: "x",
															duration: 800,
															delay: 400 + i * 200,
														}}>
														{#if theme.negativePercentage >= 25 && i === 0}
															<span class="text-white text-xs font-bold">Negative</span>
														{/if}
													</div>
												</div>
												<!-- Sentiment Legend -->
												<!-- <div
													class="flex items-center justify-between mt-1 text-xs text-gray-600">
													<span class="flex items-center gap-1">
														<div class="w-2 h-2 bg-black rounded-full"></div>
														{theme.positive} positive
													</span>
													<span class="flex items-center gap-1">
														<div class="w-2 h-2 bg-gray-600 rounded-full"></div>
														{theme.negative} negative
													</span>
												</div> -->
											</div>

											<!-- Representative Quote -->
											{#if i === 0}
												<div
													class="hidden lg:block text-sm text-gray-600 italic py-1 p-2 mx-2 border-l-3 border-gray-400"
													in:fade={{ duration: 400, delay: 600 + i * 200 }}>
													<div class="font-medium text-gray-700 mb-1">Quote:</div>
													"{theme.representative}"
												</div>
											{/if}
										</div>
									{/each}
								</div>

								<!-- Summary Stats -->
								<!-- {#if animationState.isComplete}
									<div class="text-center pt-2" in:fade={{ duration: 300, delay: 400 }}>
										<div class="flex items-center justify-center gap-2 text-gray-600 text-sm">
											<IconCheck class="size-4 text-black" />
											<span
												>Themes detected • {animationState.responses.length} responses coded</span>
										</div>
									</div>
								{/if} -->
							{/if}
						</div>
					</Box>
				</div>
			{/if}
		</div>
	{/if}
</div>
