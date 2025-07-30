<script lang="ts">
	import { IconMicrophone, IconLanguage, IconLoader } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

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
	// TEXT ANIMATION HELPER
	// ============================================================================

	class TextAnimator {
		static async animateWordByWord(
			controller: AnimationController,
			text: string,
			onUpdate: (progress: string) => void,
			options: { baseDelay?: number; randomness?: number } = {},
		): Promise<void> {
			const { baseDelay = 120, randomness = 80 } = options
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
	}

	// ============================================================================
	// SIMPLE STATE MANAGEMENT
	// ============================================================================

	let animationState = $state({
		transcriptionText: "",
		originalText: "",
		translationText: "",
		isComplete: false,
		currentStepId: "",
	})

	function resetAnimationState() {
		animationState.transcriptionText = ""
		animationState.originalText = ""
		animationState.translationText = ""
		animationState.isComplete = false
	}

	// ============================================================================
	// SAMPLE DATA
	// ============================================================================

	const sampleAudio = "El producto es bueno pero el precio es muy alto para nosotros"
	const englishTranslation = "The product is good but the price is too high for us"

	// ============================================================================
	// STEP ANIMATIONS
	// ============================================================================

	async function animateTranscription(controller: AnimationController): Promise<void> {
		try {
			await TextAnimator.animateWordByWord(controller, sampleAudio, (progress) => {
				animationState.transcriptionText = progress
			})
		} catch (err) {
			animationState.transcriptionText = sampleAudio
			throw err
		}
	}

	async function animateTranslation(controller: AnimationController): Promise<void> {
		try {
			// Show original text first
			animationState.originalText = sampleAudio
			await controller.delay(800)

			// Then animate English translation
			await TextAnimator.animateWordByWord(controller, englishTranslation, (progress) => {
				animationState.translationText = progress
			})
		} catch (err) {
			animationState.originalText = sampleAudio
			animationState.translationText = englishTranslation
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
			id: "transcription",
			icon: IconMicrophone,
			title: "Audio Transcription",
			subtitle: "Converting speech to text...",
			loadingText: "Processing audio",
			completeText: "Transcription completed",
			execute: animateTranscription,
		},
		{
			id: "translation",
			icon: IconLanguage,
			title: "Translation",
			subtitle: "Translating to English...",
			loadingText: "Translating content",
			completeText: "Translation completed",
			execute: animateTranslation,
		},
	]

	// ============================================================================
	// EXECUTION ENGINE
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
						}, 2000)
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
<!-- VISUAL COMPONENTS -->
<!-- ============================================================================ -->

<!-- Simple text bubble component -->
{#snippet textBubble(config: { header: string; text: string; showLoadingDot?: boolean })}
	<div
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}
		class="bg-card/85 backdrop-blur-sm border-border/10 max-w-2xl p-4 mb-3 border rounded-lg shadow-sm">
		<div class="text-card-foreground/70 mb-2 text-xs font-medium tracking-wide uppercase">
			{config.header}
		</div>
		<div class="text-card-foreground font-sans text-sm leading-relaxed">
			{#if config.text}
				<span in:fly={{ x: -10, duration: 300, easing: cubicInOut }} class="text-foreground inline-block mr-1">
					{config.text}
				</span>
				{#if config.showLoadingDot}
					<span
						class="bg-foreground/70 size-2 animate-pulse inline-block ml-1 rounded-full"
						in:scale={{ duration: 400, easing: elasticOut }}></span>
				{/if}
			{/if}
		</div>
	</div>
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI -->
<!-- ============================================================================ -->

{#if staticDesignMode}
	<!-- STATIC DESIGN MODE - Show both steps with full data -->
	<div class="relative flex flex-col w-full pl-12 space-y-8">
		<!-- STEP 1: Transcription -->
		<div class="space-y-4">
			<div class="absolute top-0 left-0 z-10">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconMicrophone class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Audio Transcription</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Transcription completed
					</span>
				</div>
			</div>

			{@render textBubble({
				header: "Audio Transcription • Spanish",
				text: sampleAudio,
			})}
		</div>

		<!-- STEP 2: Translation -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 12rem;">
				<div
					class="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground ring-2 ring-secondary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconLanguage class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Translation</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Translation completed
					</span>
				</div>
			</div>

			{@render textBubble({
				header: "Original • Spanish",
				text: sampleAudio,
			})}

			{@render textBubble({
				header: "Translation • English",
				text: englishTranslation,
			})}
		</div>
	</div>
{:else}
	<!-- ANIMATED MODE - Step-by-step animation -->
	<div class="relative flex flex-col w-full pl-12 space-y-4">
		<!-- Fixed icon that changes per step -->
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

					<!-- Status indicator -->
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

				<!-- Dynamic content based on current step -->
				{#if isLoading || animationState.isComplete}
					<!-- TRANSCRIPTION STEP -->
					{#if currentStep.id === "transcription"}
						{@render textBubble({
							header: "Audio Transcription • Spanish",
							text: animationState.transcriptionText,
							showLoadingDot: !!(animationState.transcriptionText && !animationState.isComplete),
						})}
					{/if}

					<!-- TRANSLATION STEP -->
					{#if currentStep.id === "translation"}
						{#if animationState.originalText}
							{@render textBubble({
								header: "Original • Spanish",
								text: animationState.originalText,
							})}
						{/if}

						{#if animationState.translationText}
							{@render textBubble({
								header: "Translation • English",
								text: animationState.translationText,
								showLoadingDot: !!(animationState.translationText && !animationState.isComplete),
							})}
						{/if}
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
