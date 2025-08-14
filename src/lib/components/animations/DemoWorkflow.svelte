<script lang="ts">
	import {
		IconFileText,
		IconLanguage,
		IconTags,
		IconUsers,
		IconMessageQuestion,
		IconPlayerPlay,
		IconMicrophone,
		IconLoader,
	} from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

	// ============================================================================
	// LAYER 1: ANIMATION PRIMITIVES
	// ============================================================================

	// Animation state management
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

	// Promise-based animation primitives with perfect cleanup
	class TextAnimator {
		static async animateWordByWord(
			controller: AnimationController,
			text: string,
			onUpdate: (progress: string) => void,
			options: { baseDelay?: number; randomness?: number } = {},
		): Promise<void> {
			const { baseDelay = 80, randomness = 100 } = options
			const words = text.split(" ")

			for (let i = 0; i < words.length; i++) {
				if (controller.signal.aborted) {
					throw new Error("Animation cancelled")
				}

				const currentText = words.slice(0, i + 1).join(" ")
				onUpdate(currentText)

				if (i < words.length - 1) {
					const delay = baseDelay + Math.random() * randomness
					await controller.delay(delay)
				}
			}
		}

		static async animateHighlighting(
			controller: AnimationController,
			highlights: Array<{ start: number; end: number; theme: string }>,
			onUpdate: (indices: number[]) => void,
			options: { delay?: number; interval?: number } = {},
		): Promise<void> {
			const { delay = 1000, interval = 800 } = options
			let allIndices: number[] = []

			if (delay > 0) {
				await controller.delay(delay)
			}

			for (const highlight of highlights) {
				if (controller.signal.aborted) {
					throw new Error("Animation cancelled")
				}

				const indices = []
				for (let i = highlight.start; i <= highlight.end; i++) {
					indices.push(i)
				}

				// Animate character by character with small delays
				for (const charIndex of indices) {
					if (controller.signal.aborted) {
						throw new Error("Animation cancelled")
					}

					allIndices = [...allIndices, charIndex]
					onUpdate([...allIndices])
					await controller.delay(80)
				}

				await controller.delay(interval)
			}
		}

		static async animateSegments<T>(
			controller: AnimationController,
			segments: T[],
			onUpdate: (segments: T[]) => void,
			options: { delay?: number; interval?: number } = {},
		): Promise<void> {
			const { delay = 1000, interval = 800 } = options
			let currentSegments: T[] = []

			if (delay > 0) {
				await controller.delay(delay)
			}

			for (const segment of segments) {
				if (controller.signal.aborted) {
					throw new Error("Animation cancelled")
				}

				currentSegments = [...currentSegments, segment]
				onUpdate([...currentSegments])

				await controller.delay(interval)
			}
		}
	}

	// ============================================================================
	// LAYER 2: CENTRALIZED STATE MANAGEMENT
	// ============================================================================

	// Speaker segment type
	type SpeakerSegment = {
		text: string
		speaker: string
		color: string
		name: string
	}

	// ALL animation state in one reactive object
	let animationState = $state({
		// Text animations
		transcriptText: "",
		originalText: "",
		translationText: "",

		// Complex animations
		highlightedIndices: <number[]>[],
		speakerSegments: <SpeakerSegment[]>[],

		// UI state
		isComplete: false,
		currentStepId: "",
	})

	// Helper to reset state between steps
	function resetAnimationState() {
		animationState.transcriptText = ""
		animationState.originalText = ""
		animationState.translationText = ""
		animationState.highlightedIndices = []
		animationState.speakerSegments = []
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const fullTranscript =
		"Well, I think the pricing is really concerning for us. The features look absolutely fantastic, but we need better value for money. Our team is quite worried about the long-term costs and ongoing support requirements."
	const spanishText =
		"Bueno, creo que el precio es realmente preocupante para nosotros. Las características se ven geniales pero necesitamos mejor valor por dinero."

	const taggedWords = [
		{ word: "pricing", start: 23, end: 30, theme: "pricing" },
		{ word: "concerning", start: 41, end: 51, theme: "concerns" },
		{ word: "features", start: 65, end: 73, theme: "features" },
		{ word: "fantastic", start: 89, end: 98, theme: "positive" },
		{ word: "value", start: 122, end: 127, theme: "pricing" },
		{ word: "worried", start: 154, end: 161, theme: "concerns" },
		{ word: "costs", start: 185, end: 190, theme: "pricing" },
		{ word: "support", start: 213, end: 220, theme: "support" },
	]

	const speakerData: SpeakerSegment[] = [
		{
			text: "Well, I think the pricing is really concerning for us.",
			speaker: "A",
			color: "text-primary",
			name: "Sarah Chen • Decision Maker",
		},
		{
			text: "The features look absolutely fantastic, but we need better value for money.",
			speaker: "B",
			color: "text-primary",
			name: "Mike Johnson • Technical Lead",
		},
		{
			text: "Our team is quite worried about the long-term costs and ongoing support requirements.",
			speaker: "A",
			color: "text-primary",
			name: "Sarah Chen • Decision Maker",
		},
	]

	// ============================================================================
	// LAYER 3: STEP ANIMATION FUNCTIONS
	// ============================================================================

	// TRANSCRIPTION STEP - Simple word-by-word
	async function animateTranscription(controller: AnimationController): Promise<void> {
		try {
			await TextAnimator.animateWordByWord(controller, fullTranscript, (progress) => {
				animationState.transcriptText = progress
			})
		} catch (err) {
			// Graceful fallback
			animationState.transcriptText = fullTranscript
			throw err
		}
	}

	// TRANSLATION STEP - Parallel with slight offset
	async function animateTranslation(controller: AnimationController): Promise<void> {
		try {
			// Start both animations in parallel with English slightly delayed
			const spanishAnimation = TextAnimator.animateWordByWord(
				controller,
				spanishText,
				(progress) => {
					animationState.originalText = progress
				},
				{ baseDelay: 100 },
			)

			// Start English animation with a slight delay
			const englishAnimation = (async () => {
				await controller.delay(200) // Small delay before English starts
				return TextAnimator.animateWordByWord(
					controller,
					fullTranscript,
					(progress) => {
						animationState.translationText = progress
					},
					{ baseDelay: 100 },
				)
			})()

			// Wait for both to complete
			await Promise.all([spanishAnimation, englishAnimation])
		} catch (err) {
			// Graceful fallback
			animationState.originalText = spanishText
			animationState.translationText = fullTranscript
			throw err
		}
	}

	// TAGGING STEP - Text first, then highlighting
	async function animateTagging(controller: AnimationController): Promise<void> {
		try {
			// Show full text immediately
			await controller.delay(800)
			animationState.transcriptText = fullTranscript

			// Then animate highlighting
			await TextAnimator.animateHighlighting(controller, taggedWords, (indices) => {
				animationState.highlightedIndices = indices
			})
		} catch (err) {
			// Graceful fallback
			animationState.transcriptText = fullTranscript
			animationState.highlightedIndices = taggedWords.flatMap((tag) => {
				const indices = []
				for (let i = tag.start; i <= tag.end; i++) {
					indices.push(i)
				}
				return indices
			})
			throw err
		}
	}

	// SPEAKERS STEP - Progressive segments
	async function animateSpeakers(controller: AnimationController): Promise<void> {
		try {
			await TextAnimator.animateSegments(controller, speakerData, (segments) => {
				animationState.speakerSegments = segments
			})
		} catch (err) {
			// Graceful fallback
			animationState.speakerSegments = speakerData
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
		colors: { bg: string; icon: string; text: string }
		execute: (controller: AnimationController) => Promise<void>
	}

	const steps: StepDefinition[] = [
		{
			id: "transcription",
			icon: IconFileText,
			title: "Audio Transcription",
			subtitle: "Converting speech to text with precision...",
			loadingText: "Processing audio file",
			completeText: "Transcription completed successfully",
			colors: { bg: "bg-primary/10", icon: "text-primary", text: "text-primary" },
			execute: animateTranscription,
		},
		{
			id: "translation",
			icon: IconLanguage,
			title: "Translation",
			subtitle: "Translating to English with context awareness...",
			loadingText: "Detecting language and context",
			completeText: "Translation completed successfully",
			colors: { bg: "bg-secondary/10", icon: "text-secondary", text: "text-secondary" },
			execute: animateTranslation,
		},
		{
			id: "tagging",
			icon: IconTags,
			title: "Coding Open Ends",
			subtitle: "Coding open ends with context...",
			loadingText: "Analyzing open ends samples...",
			completeText: "Open ends coded",
			colors: { bg: "bg-accent-1/20", icon: "text-accent-1", text: "text-accent-1" },
			execute: animateTagging,
		},
		{
			id: "speakers",
			icon: IconUsers,
			title: "Speaker Identification",
			subtitle: "Analyzing voice patterns and separating speakers...",
			loadingText: "Processing voice recognition",
			completeText: "3 unique speakers identified",
			colors: { bg: "bg-accent-2/20", icon: "text-accent-2", text: "text-accent-2" },
			execute: animateSpeakers,
		},
		{
			id: "question",
			icon: IconMessageQuestion,
			title: "AI Analysis",
			subtitle: "What concerns do customers have about our pricing?",
			loadingText: "Analyzing responses and generating insights",
			completeText: "Analysis complete - Video clips generated",
			colors: { bg: "bg-primary/10", icon: "text-primary", text: "text-primary" },
			execute: async (controller) => {
				await controller.delay(2000) // Analysis simulation
			},
		},
	]

	// ============================================================================
	// LAYER 5: EXECUTION ENGINE
	// ============================================================================

	// Current execution state
	let currentStepIndex = $state(0)
	let isLoading = $state(false)
	let isComplete = $state(false)
	let restart = $state(false)
	let showCard = $state(true)
	let currentController: AnimationController | null = $state(null)
	let isAnimationStarted = $state(false)

	// Derived state
	let currentStep = $derived(steps[currentStepIndex])

	// Main execution function
	async function executeStep(stepIndex: number): Promise<void> {
		const step = steps[stepIndex]
		if (!step) return

		// Cancel any existing animation
		if (currentController) {
			currentController.cancel()
		}

		// Reset state for new step
		resetAnimationState()
		animationState.currentStepId = step.id

		// Create new controller
		const controller = new AnimationController()
		currentController = controller

		// Update UI state
		isLoading = true
		isComplete = false

		try {
			// Execute the step's animation
			await controller.execute(step.execute)

			if (!controller.signal.aborted) {
				// Mark complete
				animationState.isComplete = true
				isLoading = false
				isComplete = true

				// Special handling for video step
				if (step.id === "question") {
					setTimeout(() => {
						if (!controller.signal.aborted) {
							// showVideoClip = true // This variable was removed
						}
					}, 2500)
				}

				// Pause before next step
				await controller.delay(3000)

				if (!controller.signal.aborted) {
					// Move to next step or restart
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
				// Graceful fallback - show final state
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
				// Start next step animation
				executeStep(currentStepIndex)
			}, 100)
		}, 500)
	}

	function resetAnimation() {
		// Cancel current animation first
		if (currentController) {
			currentController.cancel()
		}

		// First trigger exit animations by hiding card
		showCard = false

		setTimeout(() => {
			currentStepIndex = 0
			isLoading = false
			isComplete = false
			// showVideoClip = false // This variable was removed
			isAnimationStarted = false

			setTimeout(() => {
				showCard = true
				restart = false
				// Start the animation sequence again
				startAnimation()
			}, 100) // Brief pause for clean restart
		}, 500) // Wait for exit animations to complete
	}

	function startAnimation() {
		if (!isAnimationStarted) {
			isAnimationStarted = true
			executeStep(currentStepIndex)
		}
	}

	// Handle restart effect separately
	$effect(() => {
		if (restart) {
			resetAnimation()
		}
	})

	onMount(() => {
		// Start the animation workflow after a brief delay
		setTimeout(() => {
			startAnimation()
		}, 500)
	})
</script>

<!-- ============================================================================ -->
<!-- LAYER 6: REUSABLE VISUAL SNIPPETS -->
<!-- ============================================================================ -->

<!-- Core animated text display -->
{#snippet animateText(currentText: string, showLoadingDot: boolean = true)}
	<span
		in:fly={{ x: -10, duration: 50, easing: cubicInOut }}
		out:fly={{ x: 10, duration: 50, easing: cubicInOut }}
		class="text-foreground inline-block mr-1 transition-all duration-300">
		{currentText}
		{#if showLoadingDot}
			{@render loadingDot()}
		{/if}
	</span>
{/snippet}

<!-- Loading dot animation -->
{#snippet loadingDot()}
	<span
		class="bg-foreground transform-gpu size-4 inline-block translate-y-1 rounded-full"
		in:scale={{ duration: 400, easing: elasticOut }}
		out:scale={{ duration: 400, easing: elasticOut }}></span>
{/snippet}

<!-- Core text bubble component -->
{#snippet animatedTextBubble(config: { header: string; text: string; showLoadingDot?: boolean })}
	<div
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}
		class="card max-w-2xl p-4 mb-3">
		<div class="text-card-foreground opacity-70 mb-2 text-xs font-medium tracking-wide uppercase">
			{config.header}
		</div>
		<div class="text-card-foreground font-sans text-sm leading-relaxed">
			{#if config.text}
				{@render animateText(config.text, config.showLoadingDot)}
			{:else}
				<!-- Empty state -->
			{/if}
		</div>
	</div>
{/snippet}

<!-- Speaker segments display -->
{#snippet speakerSegments(segments: SpeakerSegment[])}
	<div
		class="space-y-3"
		in:fly={{ y: 20, duration: 400, easing: quintOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
		{#each segments as segment, i (`speaker-segment-${i}`)}
			<div
				class="flex items-start gap-3"
				in:fly={{ y: 20, duration: 400, delay: i * 150, easing: quintOut }}
				out:fly={{ y: -20, duration: 400, easing: cubicInOut }}>
				<div
					class="w-6 h-6 rounded-full {segment.speaker === 'A'
						? 'bg-gradient-to-br from-primary to-primary/80'
						: 'bg-gradient-to-br from-secondary to-secondary/80'} flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ring-2 ring-white/10">
					<span class="text-xs font-bold text-white">{segment.speaker}</span>
				</div>
				<div
					class="bg-card/60 backdrop-blur-sm rounded-xl border-border/20 flex-1 max-w-2xl p-4 border rounded-tl shadow-sm">
					<div class="text-card-foreground/70 mb-2 text-xs font-medium">{segment.name}</div>
					<div class="text-card-foreground font-mono text-sm leading-relaxed">
						{segment.text}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/snippet}

<!-- Tag completion display -->
{#snippet tagCompletion(tags: Array<{ theme: string }>)}
	<div
		in:fly={{ y: 15, duration: 400, delay: 300, easing: quintOut }}
		out:fly={{ y: -15, duration: 400, easing: cubicInOut }}
		class="flex flex-col gap-2 mt-4">
		{#each tags as tag, i (`tag-${i}`)}
			<span
				class="bg-card/60 backdrop-blur-sm rounded-xl border-border/20 px-3 py-1 text-xs font-semibold border shadow-sm"
				in:scale={{ duration: 300, delay: i * 100, easing: elasticOut }}
				out:scale={{ duration: 300, easing: cubicInOut }}>
				{tag.theme}
			</span>
		{/each}
	</div>
{/snippet}

<!-- Video result display -->
{#snippet videoResult(config: { title: string; description: string })}
	<div
		in:fly={{ y: 20, duration: 600, easing: quintOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}
		class="flex items-start gap-4">
		<div
			class="bg-primary flex items-center justify-center flex-shrink-0 w-8 h-8 overflow-hidden rounded-full shadow-lg">
			<img src="/logos/CoLoop_Icon.svg" alt="Coloop" class="contrast-100 saturate-0 w-full h-full" />
			<!-- <IconCheck class="w-4 h-4 text-white" /> -->
		</div>
		<div class="flex-1 max-w-2xl">
			<div
				class="text-foreground flex items-center gap-2 mb-3 text-xs font-medium"
				in:fly={{ x: -20, duration: 400, delay: 100, easing: quintOut }}
				out:fly={{ x: 20, duration: 400, easing: cubicInOut }}>
				<div class="size-2 bg-green-500 rounded-full"></div>
				Analysis complete • Video clip generated
			</div>
			<div
				class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-slate-700/50 overflow-hidden border shadow-xl"
				in:fly={{ y: 20, duration: 500, delay: 200, easing: elasticOut }}
				out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
				<div class="aspect-[16/10] bg-gradient-to-br from-slate-700/50 to-slate-800/50 relative">
					<img
						src="/images/interviewer-crisps.png"
						alt="Video"
						class="opacity-60 absolute inset-0 object-cover w-full h-full" />
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="space-y-3 text-center">
							<div
								class="bg-white/10 backdrop-blur-sm hover:bg-white/20 group border-white/20 inline-flex p-3 transition-all duration-300 border rounded-full shadow-lg cursor-pointer">
								<IconPlayerPlay
									class="group-hover:scale-110 w-5 h-5 text-white transition-transform duration-300" />
							</div>
							<div
								class="space-y-1"
								in:fly={{ y: 10, duration: 400, delay: 500, easing: quintOut }}
								out:fly={{ y: -10, duration: 400, easing: cubicInOut }}>
								<div class="text-sm font-medium text-white">{config.title}</div>
								<div class="text-white/70 text-xs">{config.description}</div>
							</div>
						</div>
					</div>
					<div
						class="bg-gradient-to-t from-black/60 via-black/20 to-transparent absolute bottom-0 left-0 right-0 p-3"
						in:fly={{ y: 10, duration: 400, delay: 600, easing: quintOut }}
						out:fly={{ y: 10, duration: 400, easing: cubicInOut }}>
						<div class="flex items-center gap-3">
							<div class="w-2 h-2 bg-white rounded-full"></div>
							<div class="bg-white/20 backdrop-blur-sm flex-1 h-1 overflow-hidden rounded-full">
								<div class="w-1/4 h-full bg-white rounded-full"></div>
							</div>
							<div class="text-white/90 font-mono text-xs">0:12 / 1:45</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<!-- ============================================================================ -->
<!-- LAYER 7: UI INTEGRATION -->
<!-- ============================================================================ -->

<div class="relative flex flex-col w-full pl-12 space-y-4">
	<!-- Fixed icon that stays in position -->
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
				<!-- Title animation -->
				<div
					in:fly={{ x: -30, duration: 500, easing: quintOut }}
					out:fly={{ x: 30, duration: 400, easing: cubicInOut }}>
					<h3 class="text-foreground text-lg font-semibold tracking-tight">{currentStep.title}</h3>
				</div>

				<!-- Status animation -->
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
										{#if currentStep.id === "transcription"}
											<div
												class="size-4 flex items-center justify-center flex-shrink-0 bg-red-500 rounded-full">
												<IconMicrophone class="size-2 text-white" />
											</div>
										{:else}
											<div class="animate-spin flex-shrink-0">
												<IconLoader class="size-4 text-foreground" />
											</div>
										{/if}
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

			<!-- Dynamic content based on current step and animation state -->
			{#if isLoading || animationState.isComplete}
				<!-- TRANSCRIPTION STEP -->
				{#if currentStep.id === "transcription"}
					{@render animatedTextBubble({
						header: "Audio Transcription • Processing",
						text: animationState.transcriptText,
						showLoadingDot: !!(animationState.transcriptText && !animationState.isComplete),
					})}
				{/if}

				<!-- TRANSLATION STEP -->
				{#if currentStep.id === "translation"}
					{#if animationState.originalText}
						{@render animatedTextBubble({
							header: "Original • Italian",
							text: animationState.originalText,
						})}
					{/if}

					{#if animationState.translationText}
						{@render animatedTextBubble({
							header: "Translation • English",
							text: animationState.translationText,
							showLoadingDot: !!(animationState.translationText && !animationState.isComplete),
						})}
					{/if}
				{/if}

				<!-- TAGGING STEP -->
				{#if currentStep.id === "tagging"}
					{@render animatedTextBubble({
						header: "Coding Open Ends • Analyzing themes",
						text: animationState.transcriptText,
					})}

					{#if animationState.isComplete}
						{@render tagCompletion(taggedWords)}
					{/if}
				{/if}

				<!-- SPEAKERS STEP -->
				{#if currentStep.id === "speakers"}
					{#if animationState.speakerSegments.length > 0}
						{@render speakerSegments(animationState.speakerSegments)}
					{/if}
				{/if}

				<!-- QUESTION STEP -->
				{#if currentStep.id === "question"}
					{@render animatedTextBubble({
						header: "Analysis Query",
						text: '"What concerns do customers have about our pricing?"',
					})}

					{@render videoResult({
						title: "Customer Feedback Analysis",
						description: "Pricing concerns identified • 1:45 duration",
					})}
				{/if}
			{/if}
		</div>
	{/if}
</div>

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
