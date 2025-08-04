<script lang="ts">
	import { IconHighlight, IconPlayerPlay, IconLoader, IconCheck } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

	// ============================================================================
	// ANIMATION CONTROLLER (Standard Pattern)
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
	// CENTRALIZED STATE MANAGEMENT
	// ============================================================================

	let animationState = $state({
		// Text content
		transcriptText: "",
		highlightedIndices: <number[]>[],

		// UI state
		showGenerateButton: false,
		buttonClicked: false,
		showClip: false,

		// Universal state
		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState(stepId?: string) {
		if (stepId === "highlight-generate") {
			animationState.transcriptText = ""
			animationState.highlightedIndices = []
			animationState.showGenerateButton = false
			animationState.buttonClicked = false
		} else if (stepId === "generated-clip") {
			// Keep transcript data, reset clip data
			animationState.showClip = false
		}

		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const fullTranscript =
		"Interviewer: What do you think about concept A? Respondent: I really love concept A - the design is fantastic and the messaging is very clear. It definitely stands out from the other options and I think it would appeal to our target market."

	// Highlight range for positive feedback about concept A
	const highlightStart = 62 // Start of "I really love concept A..."
	const highlightEnd = 140 // End of "...messaging is very clear."

	// ============================================================================
	// STEP ANIMATIONS
	// ============================================================================

	async function animateHighlightGenerate(controller: AnimationController): Promise<void> {
		try {
			// Show transcript immediately
			animationState.transcriptText = fullTranscript
			await controller.delay(800)

			// Animate highlighting character by character
			const indices = []
			for (let i = highlightStart; i <= highlightEnd; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				indices.push(i)
				animationState.highlightedIndices = [...indices]
				await controller.delay(30)
			}

			await controller.delay(200)

			// Show generate button
			animationState.showGenerateButton = true
			await controller.delay(1500)

			// Simulate button click
			animationState.buttonClicked = true
			await controller.delay(800)
		} catch (err) {
			// Graceful fallback
			animationState.transcriptText = fullTranscript
			animationState.highlightedIndices = Array.from(
				{ length: highlightEnd - highlightStart + 1 },
				(_, i) => highlightStart + i,
			)
			animationState.showGenerateButton = true
			animationState.buttonClicked = true
			throw err
		}
	}

	async function animateGeneratedClip(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(800)
			animationState.showClip = true
			await controller.delay(2000)
		} catch (err) {
			// Graceful fallback
			animationState.showClip = true
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
			id: "highlight-generate",
			icon: IconHighlight,
			title: "Select Feedback",
			subtitle: "Highlighting relevant feedback about concept A...",
			loadingText: "Analyzing transcript",
			completeText: "Clip generated successfully",
			execute: animateHighlightGenerate,
		},
		{
			id: "generated-clip",
			icon: IconPlayerPlay,
			title: "Generated Clip",
			subtitle: "Your concept A feedback clip is ready...",
			loadingText: "Generating video clip",
			completeText: "Clip ready for sharing",
			execute: animateGeneratedClip,
		},
	]

	// ============================================================================
	// EXECUTION ENGINE (Standard Pattern)
	// ============================================================================

	let currentStepIndex = $state(0)
	let isLoading = $state(false)
	let isComplete = $state(false)
	let restart = $state(false)
	let showCard = $state(true)
	let currentController: AnimationController | null = $state(null)
	let isAnimationStarted = $state(false)

	// Static design mode toggle
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
<!-- REUSABLE VISUAL SNIPPETS
<!-- ============================================================================ -->

<!-- Transcript display with highlighting -->
{#snippet transcriptBubble(text: string, highlightedIndices: number[])}
	{#if text}
		<div
			class="card max-w-2xl p-4"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<div class="text-card-foreground text-md mb-3 font-semibold tracking-wider uppercase">
				Interview Transcript
			</div>

			<div class="text-card-foreground space-y-2 text-sm leading-relaxed">
				<!-- Split into interviewer and respondent -->
				<div class="flex flex-col">
					<span class="text-secondary font-semibold">Interviewer:</span>
					<span class="ml-2">What do you think about concept A?</span>
				</div>

				<div class="flex flex-col">
					<span class="text-secondary font-semibold">Respondent:</span>
					<span class="ml-2">
						{#each text.slice(100) as char, i}
							<span
								class="transition-all duration-200 {highlightedIndices.includes(i + 20)
									? 'bg-primary text-primary-foreground '
									: ''}">
								{char}
							</span>
						{/each}
					</span>
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- Generate clip button -->
{#snippet generateButton(showButton: boolean, buttonClicked: boolean)}
	{#if showButton}
		<div
			class="flex justify-start mt-4"
			in:fly={{ y: 20, duration: 400, easing: elasticOut }}
			out:fly={{ y: -20, duration: 400, easing: cubicInOut }}>
			<button
				class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all duration-200
					   {buttonClicked ? 'bg-primary/50 pointer-events-none' : 'shadow-lg hover:shadow-xl'}"
				disabled={buttonClicked}>
				<div class="flex items-center gap-2">
					{#if buttonClicked}
						<IconCheck class="size-4" />
						<span>Generating Clip</span>
					{:else}
						<IconPlayerPlay class="size-4" />
						<span>Generate Clip</span>
					{/if}
				</div>
			</button>
		</div>
	{/if}
{/snippet}

<!-- Generated video clip -->
{#snippet videoClip(showClip: boolean)}
	{#if showClip}
		<div
			class="flex items-start max-w-2xl gap-4"
			in:fly={{ y: 20, duration: 600, easing: elasticOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<!-- Coloop icon -->
			<div
				class="bg-primary flex items-center justify-center flex-shrink-0 w-8 h-8 overflow-hidden rounded-full shadow-lg">
				<img src="/logos/CoLoop_Icon.svg" alt="Coloop" class="contrast-100 saturate-0 w-full h-full" />
			</div>

			<div class="flex-1">
				<div class="text-card-foreground flex items-center gap-2 mb-2 text-sm font-medium">
					<div class="size-2 bg-primary rounded-full"></div>
					Clip generated • Concept A feedback
				</div>

				<!-- Video player mockup -->
				<div
					class="bg-gradient-to-br from-primary to-primary/80 border-border overflow-hidden border rounded-lg"
					in:fly={{ y: 20, duration: 500, delay: 200, easing: elasticOut }}>
					<div class="aspect-[16/9] bg-gradient-to-br from-slate-700/50 to-slate-800/50 relative">
						<img
							src="/images/interviewer-crisps.png"
							alt="Video"
							class="opacity-60 absolute inset-0 object-cover w-full h-full" />

						<div class="absolute inset-0 flex items-center justify-center">
							<div class="space-y-2 text-center">
								<div
									class="bg-white/10 backdrop-blur-sm hover:bg-white/20 group border-white/20 inline-flex p-3 transition-all duration-300 border rounded-full shadow-lg cursor-pointer">
									<IconPlayerPlay
										class="group-hover:scale-110 w-5 h-5 text-white transition-transform duration-300" />
								</div>
								<div class="space-y-1">
									<div class="text-md font-medium text-white">Concept A • Positive Feedback</div>
								</div>
							</div>
						</div>

						<!-- Progress bar -->
						<div
							class="bg-gradient-to-t from-black/60 via-black/20 to-transparent absolute bottom-0 left-0 right-0 p-3">
							<div class="flex items-center gap-3">
								<div class="w-2 h-2 bg-white rounded-full"></div>
								<div class="bg-white/20 backdrop-blur-sm flex-1 h-1 overflow-hidden rounded-full">
									<div class="w-0 h-full bg-white rounded-full"></div>
								</div>
								<div class="text-white/90 font-mono text-xs">0:00 / 0:08</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI - STATIC/ANIMATED MODE
<!-- ============================================================================ -->

{#if staticDesignMode}
	<!-- STATIC DESIGN MODE - All steps visible with full data -->
	<div class="relative flex flex-col w-full pl-12 space-y-12">
		<!-- STEP 1: Highlight & Generate -->
		<div class="space-y-4">
			<div class="absolute top-0 left-0 z-10">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconHighlight class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Select Feedback</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Clip generated successfully
					</span>
				</div>
			</div>

			{@render transcriptBubble(
				fullTranscript,
				Array.from({ length: highlightEnd - highlightStart + 1 }, (_, i) => highlightStart + i),
			)}
			{@render generateButton(true, true)}
		</div>

		<!-- STEP 2: Generated Clip -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 20rem;">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconPlayerPlay class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Generated Clip</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Clip ready for sharing
					</span>
				</div>
			</div>

			{@render videoClip(true)}
		</div>
	</div>
{:else}
	<!-- ANIMATED MODE - Standard step-by-step animation -->
	<div class="relative flex flex-col w-full pl-12 space-y-4">
		<!-- Fixed icon -->
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
				<!-- Step header -->
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
										<span class="text-primary flex items-center gap-2 font-medium">
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

				<!-- Dynamic content based on current step -->
				{#if isLoading || animationState.isComplete}
					{#if currentStep.id === "highlight-generate"}
						{@render transcriptBubble(animationState.transcriptText, animationState.highlightedIndices)}
						{@render generateButton(animationState.showGenerateButton, animationState.buttonClicked)}
					{/if}

					{#if currentStep.id === "generated-clip"}
						{@render videoClip(animationState.showClip)}
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
