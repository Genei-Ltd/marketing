<!--
ANIMATED CLIP CREATION WORKFLOW
Shows the process of creating video clips from interview transcripts and assembling them into reels
Clean, professional design for corporate audiences

ANIMATION STEPS:
1. "Highlight Moment" - Show transcript, highlight compelling quote, show Generate Clip button, pointer clicks it
2. "Clip Library" - Show existing clips, loading spinner for new clip, then new clip replaces spinner
3. "Assemble Reel" - Select and arrange multiple clips into a connected sequence/reel with timeline view
-->

<script lang="ts">
	import { IconLoader } from "@tabler/icons-svelte"

	import { onMount } from "svelte"
	import {
		IconHighlight,
		IconVideo,
		IconFolder,
		IconPlaylist,
		IconCheck,
		IconPlayerPlay,
		IconSquare,
		IconSquareCheck,
		IconLocation,
	} from "@tabler/icons-svelte"
	import { fade, fly, scale, slide } from "svelte/transition"
	import { quintOut, cubicInOut } from "svelte/easing"
	import type { ComponentType } from "svelte"
	import Box from "./Box.svelte"

	// ============================================================================
	// LAYER 1: ANIMATION PRIMITIVES
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
	// LAYER 2: STATE MANAGEMENT
	// ============================================================================

	type ClipData = {
		id: string
		title: string
		duration: string
		speaker: string
		text: string
		isNew: boolean
		isSelected: boolean
	}

	let animationState = $state({
		transcriptText: "",
		highlightedIndices: <number[]>[],
		showGenerateButton: false,
		showGeneratingClip: false,
		generatedClip: <ClipData | null>null,
		showLoadingNewClip: false,

		// Step 3: Clip Library
		allClips: <ClipData[]>[],
		showLibrary: false,

		// Step 4: Assemble Reel
		selectedClipIds: <string[]>[],
		showPointer: false,
		pointerPosition: { x: 0, y: 0 },
		currentPointerTarget: "",
		showCreateReelButton: false,
		createReelClicked: false,
		showFinalReel: false,
		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState(stepId?: string) {
		if (stepId === "highlight-moment") {
			animationState.transcriptText = ""
			animationState.highlightedIndices = []
			animationState.showGenerateButton = false
		} else if (stepId === "clip-library") {
			animationState.showGeneratingClip = false
			animationState.generatedClip = null
			animationState.showLoadingNewClip = false
			animationState.allClips = []
			animationState.showLibrary = false
		} else if (stepId === "assemble-reel") {
			animationState.selectedClipIds = []
			animationState.showPointer = false
			animationState.pointerPosition = { x: 0, y: 0 }
			animationState.currentPointerTarget = ""
			animationState.showCreateReelButton = false
			animationState.createReelClicked = false
			animationState.showFinalReel = false
		}
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const transcriptText =
		"What are your thoughts on the product concept? I think this concept is absolutely brilliant - it solves the key pain points we identified in previous research. The user experience feels intuitive and the value proposition is crystal clear."

	const highlightedQuote =
		"I think this concept is absolutely brilliant - it solves the key pain points we identified"
	const highlightStartIndex = 48 // Start of highlighted quote
	const highlightEndIndex = highlightStartIndex + highlightedQuote.length

	const existingClips: ClipData[] = [
		{
			id: "clip-existing-1",
			title: "User Experience Insight",
			duration: "0:12",
			speaker: "P08",
			text: "The user experience feels intuitive...",
			isNew: false,
			isSelected: false,
		},
		{
			id: "clip-existing-2",
			title: "Value Proposition",
			duration: "0:09",
			speaker: "P14",
			text: "The value proposition is crystal clear...",
			isNew: false,
			isSelected: false,
		},
		{
			id: "clip-existing-3",
			title: "Market Positioning",
			duration: "0:14",
			speaker: "P03",
			text: "This positions us perfectly in the market...",
			isNew: false,
			isSelected: false,
		},
	]

	const newClipData: ClipData = {
		id: "clip-new-1",
		title: "Concept Validation",
		duration: "0:08",
		speaker: "P12",
		text: highlightedQuote,
		isNew: true,
		isSelected: false,
	}

	// ============================================================================
	// LAYER 3: STEP ANIMATION FUNCTIONS
	// ============================================================================

	async function animateHighlightMoment(controller: AnimationController): Promise<void> {
		try {
			animationState.transcriptText = transcriptText
			await controller.delay(800)

			// Animate highlighting character by character
			const indices = []
			for (let i = highlightStartIndex; i <= highlightEndIndex; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				indices.push(i)
				animationState.highlightedIndices = [...indices]
				await controller.delay(30)
			}

			await controller.delay(800)

			// Show pointer and animate to button click
			animationState.showPointer = true
			animationState.currentPointerTarget = "generate-clip-button"
			animationState.pointerPosition = { x: 0, y: 40 } // Position over the button
			await controller.delay(600)

			// Click the button (pointer disappears, button gets clicked effect)
			animationState.showPointer = false
			await controller.delay(200)
		} catch (err) {
			animationState.transcriptText = transcriptText
			animationState.highlightedIndices = Array.from(
				{ length: highlightEndIndex - highlightStartIndex + 1 },
				(_, i) => highlightStartIndex + i,
			)
			animationState.showGenerateButton = true
			throw err
		}
	}

	async function animateClipLibrary(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(300)

			// Show existing clips first
			animationState.allClips = existingClips
			animationState.showLibrary = true

			await controller.delay(800)

			// Show loading state for new clip
			animationState.showLoadingNewClip = true
			await controller.delay(1500)

			// Replace loading with actual new clip at the beginning
			animationState.showLoadingNewClip = false
			animationState.allClips = [...existingClips, newClipData]
			animationState.generatedClip = newClipData

			await controller.delay(1000)
		} catch (err) {
			animationState.allClips = [...existingClips, newClipData]
			animationState.showLibrary = true
			animationState.generatedClip = newClipData
			animationState.showLoadingNewClip = false
			throw err
		}
	}

	async function animateAssembleReel(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(600)

			// Show pointer and select checkboxes one by one
			const clipsToSelect = [newClipData.id, existingClips[1].id, existingClips[2].id]

			// Define positions for each checkbox (relative to container, 2x2 grid)
			const checkboxPositions = [
				{ x: 20, y: -320 }, // Top-left clip checkbox position
				{ x: 20, y: -170 }, // Top-right clip checkbox position
				{ x: 20, y: -90 }, // Bottom-left clip checkbox position
			]

			// Show pointer at first position
			animationState.showPointer = true
			animationState.pointerPosition = checkboxPositions[0]
			animationState.currentPointerTarget = clipsToSelect[0]

			for (let i = 0; i < clipsToSelect.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				// Move pointer to this checkbox position
				animationState.pointerPosition = checkboxPositions[i]
				await controller.delay(200)
				animationState.currentPointerTarget = clipsToSelect[i]
				await controller.delay(500)

				// Click (select the checkbox)
				animationState.selectedClipIds = [...animationState.selectedClipIds, clipsToSelect[i]]
				await controller.delay(400)
			}

			// Show create reel button
			await controller.delay(800)
			animationState.showCreateReelButton = true

			// Move pointer to create reel button
			await controller.delay(600)
			animationState.pointerPosition = { x: 200, y: -50 } // Button position
			animationState.currentPointerTarget = "create-button"

			// Click create reel button
			await controller.delay(600)
			animationState.createReelClicked = true

			// Hide pointer and show final reel
			await controller.delay(1200)
			animationState.showPointer = false
			animationState.showFinalReel = true

			await controller.delay(2000)
		} catch (err) {
			animationState.selectedClipIds = [newClipData.id, existingClips[0].id, existingClips[2].id]
			animationState.showCreateReelButton = true
			animationState.createReelClicked = true
			animationState.showFinalReel = true
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
			id: "highlight-moment",
			icon: IconHighlight,
			title: "Select Key Moment",
			subtitle: "Identifying compelling feedback in transcript",
			loadingText: "Analyzing interview transcript",
			completeText: "Key moment identified",
			execute: animateHighlightMoment,
		},
		{
			id: "clip-library",
			icon: IconFolder,
			title: "Clip Library",
			subtitle: "New clip added to existing library",
			loadingText: "Updating clip library",
			completeText: "Library updated with new clip",
			execute: animateClipLibrary,
		},
		{
			id: "assemble-reel",
			icon: IconPlaylist,
			title: "Create Clip Reel",
			subtitle: "Assembling clips into shareable reel",
			loadingText: "Creating clip reel",
			completeText: "Reel created successfully",
			execute: animateAssembleReel,
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
<!-- PROFESSIONAL CLIP CREATION UI -->
<!-- ============================================================================ -->

<div class="w-full h-full flex items-center justify-center">
	{#if showCard}
		<div
			class="transition-all duration-500 max-h-min w-full flex items-center justify-center"
			in:slide={{ axis: "y", duration: 300, easing: quintOut }}
			out:fade={{ duration: 200, delay: 100, easing: cubicInOut }}>
			<!-- HIGHLIGHT MOMENT STEP -->
			{#if currentStep?.id === "highlight-moment"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 300, easing: cubicInOut, start: 0.5 }}>
					<Box class="h-full flex w-[500px] min-h-[400px] items-center justify-center">
						<div class="space-y-6 w-full">
							<div class="text-left">
								<h2 class="text-2xl text-black leading-tight font-medium">Create a Clip</h2>
								<p class="text-gray-600 text-sm mt-1">Select a key moment from the transcript</p>
							</div>

							<!-- Transcript Display -->
							{#if animationState.transcriptText}
								<div
									class="border-l-4 border-black pl-4 py-3 bg-gray-100 rounded-r"
									in:fade={{ duration: 400 }}>
									<div class="text-sm text-gray-600 leading-relaxed">
										<span class="text-black text-sm font-semibold">Participant:</span>
										{#each animationState.transcriptText as char, i}
											<span
												class="transition-all duration-200 {animationState.highlightedIndices.includes(
													i,
												)
													? 'bg-black text-white  font-medium'
													: ''}">
												{char}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Generate Clip Button -->
							<div class="flex justify-center" in:scale={{ duration: 300, easing: cubicInOut }}>
								<div
									id="generate-clip-button"
									class={`flex items-center gap-2 bg-black text-white w-full py-3 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors duration-200 shadow-lg ${
										animationState.isComplete ? "animate-clicked " : ""
									}`}
									in:scale={{ duration: 300, easing: cubicInOut }}>
									<div class="flex items-center justify-center gap-2 w-full relative">
										<IconVideo class="size-4" />
										Generate Clip
										<!-- Search Button -->
										{#if animationState.isComplete}
											<!-- Pointer animation -->
											<div class="absolute top-4 right-2 slide-in-pointer">
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
						</div>
					</Box>
				</div>
			{/if}

			<!-- CLIP LIBRARY STEP -->
			{#if currentStep?.id === "clip-library"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 300, easing: cubicInOut }}>
					<Box class="h-full flex w-[480px] min-h-[400px] items-center justify-center">
						<div class="space-y-6 w-full min-h-[400px]">
							<div class="text-left">
								<h2 class="text-2xl text-black leading-tight font-medium">Clip Library</h2>
								<p class="text-gray-600 text-sm mt-1">
									{animationState.allClips.length} clips available
								</p>
							</div>

							<!-- Loading New Clip Placeholder -->
							{#if animationState.showLoadingNewClip}
								<div class="grid grid-cols-2 gap-4">
									<!-- Existing clips -->
									{#each animationState.allClips as clip, index (clip.id)}
										<div
											class="overflow-hidden bg-white transition-all duration-200 relative"
											in:fly={{
												duration: 300,
												delay: (index + 1) * 150,
												easing: quintOut,
											}}>
											<!-- Video Thumbnail - EXACTLY like Pepsi layout -->
											<div
												class="aspect-video bg-black relative rounded-lg overflow-hidden shadow-sm">
												<!-- Subtle texture overlay -->
												<div class="absolute inset-0 bg-black/50">
													<!-- Play button center -->
													<div class="absolute inset-0 flex items-center justify-center">
														<div class="bg-white/90 text-black p-2 rounded-full shadow-lg">
															<IconPlayerPlay class="size-4" />
														</div>
													</div>

													<!-- Duration badge -->
													<div class="absolute bottom-2 right-2">
														<span
															class="bg-black/70 text-white px-2 py-1 text-xs rounded font-mono">
															{clip.duration}
														</span>
													</div>
												</div>
											</div>

											<!-- Title and Info Below - Like Pepsi layout -->
											<div class="p-1">
												<h4 class="text-black font-semibold text-sm leading-tight mb-1">
													{clip.title}
												</h4>
												<div class="flex items-center justify-start text-xs text-gray-600">
													<span class="text-gray-400">{clip.speaker} • {clip.duration}</span>
												</div>
											</div>
										</div>
									{/each}
									<!-- Loading placeholder as first card -->
									<div
										class="overflow-hidden bg-white transition-all duration-200 relative"
										in:scale={{ duration: 300, easing: quintOut }}>
										<div
											class="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 relative rounded-lg overflow-hidden shadow-sm">
											<div class="absolute inset-0 bg-black/20 flex items-center justify-center">
												<div class="animate-spin">
													<IconLoader class="size-6 text-white" />
												</div>
											</div>
											<div class="absolute bottom-2 right-2">
												<span
													class="bg-black/70 text-white px-2 py-1 text-xs rounded font-mono">
													Processing...
												</span>
											</div>
										</div>
										<div class="p-1">
											<h4 class="text-black font-semibold text-sm leading-tight mb-1">
												Generating clip...
											</h4>
											<div class="flex items-center justify-start text-xs text-gray-600">
												<span class="text-gray-400">Loading...</span>
											</div>
										</div>
									</div>
								</div>
							{:else}
								<!-- Thumbnail Grid - 2x2 Layout -->
								<div class="grid grid-cols-2 gap-4">
									{#each animationState.allClips as clip, index (clip.id)}
										<div
											class="  overflow-hidden bg-white transition-all duration-200 relative"
											in:scale={{ duration: 300, delay: index * 150, easing: quintOut }}>
											<!-- Video Thumbnail - EXACTLY like Pepsi layout -->
											<div
												class="aspect-video bg-black relative rounded-lg overflow-hidden shadow-sm">
												<!-- Subtle texture overlay -->
												<div class="absolute inset-0 bg-black/50">
													<!-- Play button center -->
													<div class="absolute inset-0 flex items-center justify-center">
														<div class="bg-white/90 text-black p-2 rounded-full shadow-lg">
															<IconPlayerPlay class="size-4" />
														</div>
													</div>

													<!-- Duration badge -->
													<div class="absolute bottom-2 right-2">
														<span
															class="bg-black/70 text-white px-2 py-1 text-xs rounded font-mono">
															{clip.duration}
														</span>
													</div>
												</div>

												{#if clip.isNew}
													<div
														class="absolute top-2 left-2 z-10"
														in:slide={{
															axis: "y",
															duration: 200,
															easing: cubicInOut,
															delay: 100,
														}}>
														<span
															class="bg-white text-black px-2 py-1 text-xs rounded font-bold shadow-lg">
															NEW
														</span>
													</div>
												{/if}
											</div>

											<!-- Title and Info Below - Like Pepsi layout -->
											<div class="p-1">
												<h4 class="text-black font-semibold text-sm leading-tight mb-1">
													{clip.title}
												</h4>
												<div class="flex items-center justify-start text-xs text-gray-600">
													<span class="text-gray-400">{clip.speaker} • {clip.duration}</span>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</Box>
				</div>
			{/if}

			<!-- ASSEMBLE REEL STEP -->
			{#if currentStep?.id === "assemble-reel"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 300, easing: cubicInOut }}
					out:slide={{ axis: "y", duration: 300, easing: cubicInOut, delay: 100 }}>
					<Box class="h-full flex w-[500px] min-h-[400px] items-center justify-center relative">
						<div class=" w-full flex flex-col transition-all duration-300 ease-in-out">
							<div class="text-left">
								<h2 class="text-2xl text-black leading-tight font-medium">Assemble Reel</h2>
								<p class="text-gray-600 text-sm mt-1">Select clips for your reel</p>
							</div>

							{#if !animationState.showFinalReel}
								<!-- Clip Selection Interface -->
								<div class="space-y-2 mt-6">
									{#each [animationState.generatedClip, ...existingClips].filter(Boolean) as clip, index (clip?.id)}
										{#if clip}
											{@const isSelected = animationState.selectedClipIds.includes(clip.id)}
											{@const isTargeted = animationState.currentPointerTarget === clip.id}
											<div
												id="clip-{clip.id}"
												class="flex items-center gap-3 p-2 border border-gray-300 rounded-lg bg-white transition-all duration-200 relative {isSelected
													? 'border-black bg-gray-50'
													: isTargeted
														? 'scale-95'
														: ''}"
												in:fade={{ duration: 300, delay: index * 200, easing: cubicInOut }}>
												<!-- Checkbox -->
												<div class="relative">
													{#if isSelected}
														<IconSquareCheck class="size-5 text-black" />
													{:else}
														<IconSquare class="size-5 text-gray-400" />
													{/if}
												</div>

												<!-- Clip Thumbnail -->
												<div
													class="h-9 aspect-video bg-black rounded flex items-center justify-center relative">
													<div class="bg-white/90 text-black p-1 rounded-full">
														<IconPlayerPlay class="size-2" />
													</div>
												</div>

												<!-- Clip Info -->
												<div class="flex-1 min-w-0">
													<h4 class="text-black font-semibold text-sm mb-0.5">
														{clip.title}
													</h4>
													<p class="text-gray-600 text-xs">
														{clip.speaker} • {clip.duration}
													</p>
												</div>

												{#if clip.isNew}
													<span
														class="bg-black text-white px-2 py-1 text-xs rounded font-bold">
														NEW
													</span>
												{/if}
											</div>
										{/if}
									{/each}
								</div>

								<!-- Create Reel Button -->
								<div class="relative mt-6" in:scale={{ duration: 300, easing: cubicInOut }}>
									<div
										id="create-reel-button"
										class={`w-full bg-black text-white px-6 py-3 rounded-lg font-medium text-center transition-all duration-200 ${
											animationState.createReelClicked ||
											animationState.currentPointerTarget === "create-button"
												? "animate-clicked"
												: ""
										}`}>
										{#if animationState.createReelClicked || animationState.currentPointerTarget === "create-button"}
											<div
												class="flex items-center justify-center gap-2"
												in:scale={{ duration: 300, easing: cubicInOut, delay: 300 }}>
												<IconLoader class="size-4 animate-spin" />
												<span>Creating Reel...</span>
											</div>
										{:else}
											<div class="flex items-center justify-center gap-2">
												<IconPlaylist class="size-4" />
												<span>Create Reel ({animationState.selectedClipIds.length} clips)</span>
											</div>
										{/if}
									</div>
								</div>
							{/if}

							{#if animationState.showFinalReel}
								<!-- Final Reel Player -->
								<div
									class="border border-black rounded-lg bg-black text-white p-4 mt-6 transition-all duration-300 ease-in-out"
									in:slide={{ axis: "y", duration: 400, easing: cubicInOut, delay: 300 }}>
									<div class="flex items-center justify-between mb-3">
										<div class="flex items-center gap-2">
											<IconVideo class="size-5" />
											<span class="font-semibold">Product Feedback Reel</span>
										</div>
										<div class="text-sm opacity-75">0:34</div>
									</div>
									<div class="text-center py-6">
										<div class="bg-white/10 inline-flex p-3 rounded-full mb-2">
											<IconPlayerPlay class="size-6" />
										</div>
										<p class="text-sm opacity-90">Ready to share</p>
									</div>
								</div>
							{/if}
						</div>

						<!-- Animated Pointer -->
						{#if animationState.showPointer}
							<div
								class="absolute pointer-events-none z-50 transition-all duration-500 ease-out"
								style="transform: translate({animationState.pointerPosition.x}px, {animationState
									.pointerPosition.y}px)">
								<div
									class={animationState.createReelClicked ||
									animationState.currentPointerTarget === "create-button"
										? "animate-click-pointer"
										: ""}>
									<IconLocation fill="white" class="size-8 text-black drop-shadow-lg rotate-270" />
								</div>
							</div>
						{/if}
					</Box>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.slide-in-pointer {
		animation: slide-in-pointer 1.2s ease-in-out forwards;
	}

	@keyframes slide-in-pointer {
		0% {
			transform: translateX(300px);
		}
		20% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(0);
		}
		80% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(300px);
		}
	}
</style>
