<!--
ANIMATED CORE VALUE USER FLOW
Shows the core user loop: Ask questions and get cited answers
Clean, professional design for corporate audiences
-->

<script lang="ts">
	import { onMount } from "svelte"
	import {
		IconFilePlus,
		IconFileText,
		IconVideo,
		IconMessageQuestion,
		IconAnalyze,
		IconCheck,
	} from "@tabler/icons-svelte"
	import { fade, fly, scale, slide } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"
	import Box from "./Box.svelte"

	// ============================================================================
	// LAYER 1: ANIMATION PRIMITIVES (from DemoWorkflow)
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
			const { delay = 20 } = options

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

		static async animateWordByWord(
			controller: AnimationController,
			text: string,
			onUpdate: (progress: string) => void,
			options: { delay?: number } = {},
		): Promise<void> {
			const { delay = 100 } = options
			const words = text.split(" ")

			for (let i = 0; i < words.length; i++) {
				if (controller.signal.aborted) {
					throw new Error("Animation cancelled")
				}

				const currentText = words.slice(0, i + 1).join(" ")
				onUpdate(currentText)

				if (i < words.length - 1) {
					await controller.delay(delay)
				}
			}
		}
	}

	// ============================================================================
	// LAYER 2: CENTRALIZED STATE MANAGEMENT
	// ============================================================================

	let animationState = $state({
		typedQuestion: "",
		summaryText: "",
		summaryWords: <string[]>[],
		visibleWords: 0,
		isComplete: false,
		currentStepId: "",
	})

	function resetAnimationState() {
		animationState.typedQuestion = ""
		animationState.summaryText = ""
		animationState.summaryWords = []
		animationState.visibleWords = 0
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const questionText = "Which of the participants found the fifth option to be the more appealing?"
	const summaryText =
		"The fifth option was found to be the most appealing by 10 participants, while the fourth option was found to be the least appealing by 10 participants in the segment of women.  While the second option was found to be the least appealing by 10 participants. The first option was found to be the most appealing by 10 participants, while the sixth option was found to be the least appealing by 10 participants."

	// ============================================================================
	// LAYER 3: STEP ANIMATION FUNCTIONS
	// ============================================================================

	async function animateUpload(controller: AnimationController): Promise<void> {
		await controller.delay(1500) // Show upload UI for 2.5s
	}

	async function animateFileList(controller: AnimationController): Promise<void> {
		await controller.delay(1000) // Show file list for 2.5s
	}

	async function animateQuestion(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(300) // Brief pause before typing
			await TextAnimator.animateTyping(controller, questionText, (progress) => {
				animationState.typedQuestion = progress
			})
			await controller.delay(1500) // Show complete question for 2s
		} catch (err) {
			animationState.typedQuestion = questionText
			throw err
		}
	}

	async function animateAnalysis(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(500) // Brief pause

			// Initialize words array
			animationState.summaryWords = summaryText.split(" ")
			animationState.visibleWords = 0

			// Animate word by word
			for (let i = 0; i < animationState.summaryWords.length; i++) {
				if (controller.signal.aborted) {
					throw new Error("Animation cancelled")
				}

				animationState.visibleWords = i + 1
				await controller.delay(50) // Show each word every 100ms
			}

			await controller.delay(2000) // Show complete summary
		} catch (err) {
			// Graceful fallback
			animationState.summaryWords = summaryText.split(" ")
			animationState.visibleWords = animationState.summaryWords.length
			animationState.summaryText = summaryText
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
			id: "upload",
			icon: IconFilePlus,
			title: "Upload Documents",
			subtitle: "Upload your interviews and discussion guide",
			loadingText: "Preparing upload interface",
			completeText: "Ready for file upload",
			colors: { bg: "bg-primary/10", icon: "text-primary", text: "text-primary" },
			execute: animateUpload,
		},
		{
			id: "files",
			icon: IconFileText,
			title: "File Processing",
			subtitle: "Processing uploaded files and detecting speakers",
			loadingText: "Analyzing uploaded files",
			completeText: "87 Speakers detected • 2 Researchers selected",
			colors: { bg: "bg-secondary/10", icon: "text-secondary", text: "text-secondary" },
			execute: animateFileList,
		},
		{
			id: "question",
			icon: IconMessageQuestion,
			title: "Query Input",
			subtitle: "Enter your research question for analysis",
			loadingText: "Preparing question interface",
			completeText: "Question submitted successfully",
			colors: { bg: "bg-accent-1/20", icon: "text-accent-1", text: "text-accent-1" },
			execute: animateQuestion,
		},
		{
			id: "analysis",
			icon: IconAnalyze,
			title: "AI Analysis",
			subtitle: "CoLoop is analyzing your data and generating insights",
			loadingText: "Analyzing documents and generating response",
			completeText: "Analysis complete with citations",
			colors: { bg: "bg-accent-2/20", icon: "text-accent-2", text: "text-accent-2" },
			execute: animateAnalysis,
		},
	]

	// ============================================================================
	// LAYER 5: EXECUTION ENGINE
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

				// Pause before next step
				await controller.delay(1500)

				if (!controller.signal.aborted) {
					// Move to next step or restart
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
			}, 150)
		}, 400)
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
			isAnimationStarted = false

			setTimeout(() => {
				showCard = true
				restart = false
				// Start the animation sequence again
				startAnimation()
			}, 150) // Brief pause for clean restart
		}, 400) // Wait for exit animations to complete
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
<!-- CLEAN WORKFLOW UI - Content Only -->
<!-- ============================================================================ -->

<div class="w-full h-full flex items-center justify-center">
	{#if showCard}
		<div
			class="transition-all duration-500"
			in:slide={{ axis: "y", duration: 300, easing: quintOut }}
			out:fade={{ duration: 200, delay: 100, easing: cubicInOut }}>
			<!-- Dynamic content based on current step -->
			<!-- Always show content, no loading states needed -->
			<!-- UPLOAD STEP -->
			{#if currentStep?.id === "upload"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 300, easing: cubicInOut, start: 0.5 }}>
					<Box class="h-full flex min-w-86 max-w-86 items-center justify-center">
						<div class="space-y-8 w-full h-full relative">
							<div class="text-left">
								<h2 class="text-xl text-black leading-tight max-w-full mx-auto">
									Upload your Interviews & Discussion Guide
								</h2>
							</div>
							<div class="relative w-full h-full min-h-36 overflow-hidden">
								<!-- Initial drag & drop state -->
								{#if !animationState.isComplete}
									<div
										class="flex flex-col items-center justify-center gap-2 bg-gray-100 p-6 border border-dashed border-gray-800 rounded-lg transition-colors cursor-pointer w-full min-h-36">
										<span
											class="inline-flex items-center justify-center rounded-full p-3 border border-gray-800">
											<IconFilePlus stroke="1" class="size-8 text-gray-800" />
										</span>
										<span class="text-gray-600 font-medium text-base"
											>Drag & Drop your files here</span>
									</div>
								{:else}
									<!-- Upload complete state - appears when file animation is halfway -->
									<div
										class="flex flex-col items-center justify-center gap-3 p-6 border border-black bg-black rounded-lg w-full min-h-36 relative"
										in:fade={{ duration: 200, delay: 200 }}>
										<div class="flex items-center gap-2">
											<div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
												<IconCheck class="size-4 text-black" />
											</div>
											<span class="text-white font-semibold text-base">Upload Complete!</span>
										</div>
										<div class="text-center">
											<span class="text-white text-sm">36 files uploaded successfully</span>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</Box>
				</div>

				<!-- Animated group of 3 files sliding in from left as a cohesive stack, Mac-style drag behavior -->
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
					<div class="relative w-full h-full flex items-center justify-center">
						<!-- File stack container with slide-in animation -->
						<div class="animate-slideInFiles translate-y-[150px] -translate-x-[500px]">
							<div class="relative">
								<!-- File 3 (bottom/back) - slightly offset and darker -->
								<div
									class="absolute w-30 h-40 rounded-lg bg-white border border-gray-300 shadow-lg"
									style="transform: translate(-8px, 8px) rotate(-10deg); z-index: 1; ">
									<div class="flex items-center flex-col justify-center px-4 h-full truncate">
										<div
											class="w-full h-full bg-gray-200 rounded flex items-center m-4 justify-center shadow-sm">
											<IconVideo class="size-20 text-gray-600" />
										</div>
										<span class="text-black text-sm font-semibold m-2 w-full text-ellipsis"
											>Interview_3.mp4</span>
									</div>
								</div>

								<!-- File 2 (middle) - medium offset -->
								<div
									class="absolute w-30 h-40 rounded-lg bg-white border border-gray-300 shadow-lg"
									style="transform: translate(4px, 4px) rotate(12deg); z-index: 2;">
									<div class="flex items-center flex-col justify-center px-4 h-full truncate">
										<div
											class="w-full h-full bg-gray-200 rounded flex items-center m-4 justify-center shadow-sm">
											<IconVideo class="size-20 text-gray-600" />
										</div>
										<span class="text-black text-sm font-semibold m-2 w-full text-ellipsis"
											>Interview.mov</span>
									</div>
								</div>

								<!-- File 1 (top/front) - no offset, cleanest -->
								<div
									class="relative w-30 h-40 rounded-lg border-2 border-gray-300 bg-white shadow-lg"
									style="z-index: 3;">
									<div class="flex items-center flex-col justify-center px-4 h-full truncate">
										<div
											class="w-full h-full bg-gray-200 rounded flex items-center m-4 justify-center shadow-sm">
											<IconFileText class="size-20 text-gray-600" />
										</div>
										<span
											class="text-black text-sm font-semibold -mt-2 text-center p-2 w-full text-ellipsis"
											>Guide.pdf</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<style>
					@keyframes slideInFiles {
						0% {
							transform: translateX(0px) translateY(0px);
							scale: 1;
						}
						90% {
							transform: translateX(510px) translateY(-100px);
							scale: 0.95;
							opacity: 1;
						}
						100% {
							transform: translateX(540px) translateY(-100px);
							scale: 0.9;
							opacity: 0;
						}
					}

					.animate-slideInFiles {
						animation: slideInFiles 1.1s ease-out 0.8s forwards;
					}
				</style>
			{/if}

			<!-- FILES STEP -->
			{#if currentStep?.id === "files"}
				<div
					class="w-full max-w-4xl"
					in:slide={{ axis: "x", duration: 200, easing: cubicInOut }}
					out:scale={{ duration: 300, easing: cubicInOut }}>
					<Box class="h-full flex items-center justify-center min-h-64 min-w-64 flex-1">
						<div class="w-full">
							<div class="text-left">
								<p class="text-xl font-medium text-black">87 Speakers Detected</p>
								<p class="text-lg text-gray-600 mt-2">2 Researchers Selected</p>
							</div>
							<div class="flex flex-row items-center justify-center w-full mt-6">
								<div class="space-y-3 max-w-full mx-auto w-full">
									<div
										class="flex items-center gap-3 p-4 border border-gray-800 rounded-lg hover:bg-gray-50 transition-colors">
										<IconFileText class="size-5 text-gray-800 flex-shrink-0" />
										<span class="text-gray-800 font-medium">Discussion Guide.pdf</span>
									</div>
									<div
										class="flex items-center gap-3 p-4 border border-gray-800 rounded-lg hover:bg-gray-50 transition-colors">
										<IconVideo class="size-5 text-gray-800 flex-shrink-0" />
										<span class="text-gray-800 font-medium">Expert Interview (French).mov</span>
									</div>
									<div
										class="flex items-center gap-3 p-4 border border-gray-800 rounded-lg hover:bg-gray-50 transition-colors">
										<IconVideo class="size-5 text-gray-800 flex-shrink-0" />
										<span class="text-gray-800 font-medium">Expert Interview.mp4</span>
									</div>
								</div>
							</div>
						</div>
					</Box>
				</div>
			{/if}

			<!-- QUESTION STEP -->
			{#if currentStep?.id === "question"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full flex items-center justify-center min-h-64 w-full flex-1 flex-shrink-0">
						<div
							class="space-y-4 w-full h-full relative min-h-64 min-w-96 max-w-96 flex-1 flex flex-col justify-between">
							<div class="text-left w-full flex-1">
								<h2
									class="text-xl text-black leading-tight w-full mx-auto flex items-center gap-2 min-h-[2.5rem]">
									{animationState.typedQuestion} |
								</h2>
							</div>
							<div class="flex justify-left w-full">
								<div
									class={`bg-black text-white px-8 py-3 rounded font-medium transition-colors w-full min-w-full text-center ${animationState.isComplete ? "bg-black/70 scale-95" : ""}`}>
									Ask CoLoop
								</div>
							</div>
						</div>
					</Box>
				</div>
			{/if}

			<!-- ANALYSIS STEP -->
			{#if currentStep?.id === "analysis"}
				<div
					class="transition-all duration-300 w-full h-full flex-1 flex items-center justify-center"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full w-full flex items-center justify-center">
						<div class="relative mx-auto w-full h-full min-w-96 max-w-96 min-h-96 max-h-96">
							<h2 class="text-xl text-black font-semibold mb-6 leading-tight w-full">CoLoop Summary</h2>
							<div class="text-black leading-relaxed text-sm space-y-4 min-h-[12rem]">
								<!-- Word-by-word animation with citations -->
								{#if animationState.summaryWords.length > 0}
									{#each animationState.summaryWords as word, index}
										<span
											class="transition-opacity duration-200 {index < animationState.visibleWords
												? 'opacity-100'
												: 'opacity-0'}">
											{word}
											{#if index === 15}
												<span
													class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded"
													>1</span>
											{/if}
											{#if index === 32 && animationState.isComplete}
												<!-- Only show highlighting and popup after animation complete -->
												<span class="relative inline">
													<span
														class="bg-yellow-200/60 px-1"
														in:fly={{ x: -10, duration: 400, delay: 100, easing: quintOut }}
														>while the fourth option was found to be the least appealing by
														10 participants.</span>
													<!-- Citation Number -->
													<sup class="relative">
														<span
															class="bg-black animate-pulse font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded"
															in:scale={{ duration: 300, delay: 100, easing: quintOut }}
															>2</span>
														<!-- Citation Tooltip -->
														<div
															class="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full"
															in:scale={{
																duration: 300,
																delay: 200,
																easing: quintOut,
															}}>
															<div
																class="bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
																Expert Interview.mp4
																<div
																	class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black">
																</div>
															</div>
														</div>
													</sup>
												</span>
											{:else if index === 32}
												<!-- Show plain text during animation -->
												while the fourth option was found to be the least appealing by 10 participants.
												<span
													class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded ml-1"
													>2</span>
											{/if}
											{#if index === 45}
												<span
													class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded"
													>3</span>
											{/if}
											{#if index < animationState.summaryWords.length - 1}{" "}{/if}
										</span>
									{/each}
								{/if}

								<div class="min-h-24 mt-6">
									<!-- Referenced Quote -->
									{#if animationState.isComplete && animationState.visibleWords >= animationState.summaryWords.length}
										<div
											class="text-left border-l-4 border-black pl-2"
											in:fly={{ x: -20, duration: 400, delay: 100, easing: quintOut }}
											out:fly={{ x: 20, duration: 300, easing: cubicInOut }}>
											<p class="text-sm text-black">
												<span class="font-medium text-gray-700 flex items-center gap-1">
													<span class="bg-black text-white text-xs px-1.5 py-0.5 mr-1 rounded"
														>2</span>
													<span class="font-bold text-black">Researcher:</span>
												</span>
												<span class="font-medium text-gray-800 ml-4">
													What do you think of the 4th option?
												</span>
											</p>
											<p class="text-sm text-black">
												<span class="font-medium text-gray-700">
													<span class="bg-black text-white text-xs px-1.5 py-0.5 mr-1 rounded"
														>2</span>
													<span class="font-bold text-black">Speaker AB:</span>
												</span>

												<span class="font-medium text-gray-800 ml-4">
													I think its great, very much my favorite.
												</span>
											</p>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</Box>
				</div>
			{/if}
		</div>
	{/if}
</div>
