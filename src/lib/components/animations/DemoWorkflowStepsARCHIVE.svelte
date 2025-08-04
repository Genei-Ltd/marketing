<script lang="ts">
	import {
		IconFileText,
		IconLanguage,
		IconTags,
		IconUsers,
		IconMessageQuestion,
		IconCheck,
		IconPlayerPlay,
		IconMicrophone,
		IconLoader,
	} from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

	type WorkflowStep = {
		id: string
		icon: ComponentType
		title: string
		subtitle: string
		loadingText: string
		completeText: string
		duration: number
		transitionDuration: number
		hasProgress?: boolean
		isVideo?: boolean
		colors: {
			bg: string
			icon: string
			text: string
		}
	}

	const workflowSteps: WorkflowStep[] = [
		{
			id: "transcription",
			icon: IconFileText,
			title: "Audio Transcription",
			subtitle: "Converting speech to text with precision...",
			loadingText: "Processing audio file",
			completeText: "Transcription completed successfully",
			duration: 6000, // Increased for calmer pace
			transitionDuration: 600, // Quick transition for simple text
			hasProgress: true,
			colors: {
				bg: "bg-primary/10",
				icon: "text-primary",
				text: "text-primary",
			},
		},
		{
			id: "translation",
			icon: IconLanguage,
			title: "Translation",
			subtitle: "Translating to English with context awareness...",
			loadingText: "Detecting language and context",
			completeText: "Translation completed successfully",
			duration: 9000, // Increased for calmer pace
			transitionDuration: 1000, // Longer for two-phase animation
			hasProgress: true,
			colors: {
				bg: "bg-secondary/10",
				icon: "text-secondary",
				text: "text-secondary",
			},
		},
		{
			id: "tagging",
			icon: IconTags,
			title: "Smart Tagging",
			subtitle: "Identifying key themes and insights...",
			loadingText: "Analyzing content for patterns",
			completeText: "Themes identified and tagged",
			duration: 6500, // Increased for calmer pace
			transitionDuration: 800, // Medium for highlighting + completion tags
			colors: {
				bg: "bg-accent-1/20",
				icon: "text-accent-1",
				text: "text-accent-1",
			},
		},
		{
			id: "speakers",
			icon: IconUsers,
			title: "Speaker Identification",
			subtitle: "Analyzing voice patterns and separating speakers...",
			loadingText: "Processing voice recognition",
			completeText: "3 unique speakers identified",
			duration: 6000, // Increased for calmer pace
			transitionDuration: 1200, // Longest for multiple speaker segments
			colors: {
				bg: "bg-accent-2/20",
				icon: "text-accent-2",
				text: "text-accent-2",
			},
		},
		{
			id: "question",
			icon: IconMessageQuestion,
			title: "AI Analysis",
			subtitle: "What concerns do customers have about our pricing?",
			loadingText: "Analyzing responses and generating insights",
			completeText: "Analysis complete - Video clips generated",
			duration: 600, // Increased for calmer pace
			transitionDuration: 400, // Quick for final step
			isVideo: true,
			colors: {
				bg: "bg-primary/10",
				icon: "text-primary",
				text: "text-primary",
			},
		},
	]

	let currentStepIndex = $state(0)
	let isLoading = $state(false)
	let isComplete = $state(false)

	let showVideoClip = $state(false)
	let restart = $state(false)
	let showCard = $state(true)

	// Animation-specific states
	let transcriptText = $state("")
	let translationText = $state("")
	let originalText = $state("")
	let highlightedIndices = $state<number[]>([])
	let speakerSegments = $state<{ text: string; speaker: string; color: string; name: string }[]>([])

	let isTranslating = $state(false)

	let currentStep = $derived(workflowSteps[currentStepIndex])
	let isLastStep = $derived(currentStepIndex === workflowSteps.length - 1)

	// Enhanced sample data for animations
	const fullTranscript =
		"Well, I think the pricing is really concerning for us. The features look absolutely fantastic, but we need better value for money. Our team is quite worried about the long-term costs and ongoing support requirements."

	const spanishText =
		"Bueno, creo que el precio es realmente preocupante para nosotros. Las características se ven geniales pero necesitamos mejor valor por dinero."

	const spanishWords = spanishText.split(" ")
	const englishWords = fullTranscript.split(" ")

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

	const speakerData = [
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

	// Animation sequence controller
	$effect(() => {
		if (!restart) {
			runWorkflowStep()
		} else {
			resetAnimation()
		}
	})

	function resetAnimation() {
		// First trigger exit animations by hiding card
		showCard = false

		setTimeout(() => {
			currentStepIndex = 0
			isLoading = false
			isComplete = false
			showVideoClip = false

			// Reset animation states
			transcriptText = ""
			translationText = ""
			originalText = ""
			highlightedIndices = []
			speakerSegments = []
			isTranslating = false

			setTimeout(() => {
				showCard = true
				restart = false
			}, 100) // Brief pause for clean restart
		}, 500) // Wait for exit animations to complete
	}

	function runWorkflowStep() {
		isLoading = true
		isComplete = false
		showVideoClip = false

		// Reset animation states
		transcriptText = ""
		translationText = ""
		originalText = ""
		highlightedIndices = []
		speakerSegments = []
		isTranslating = false

		// Start custom animations based on step
		if (currentStep.id === "transcription") {
			animateTranscription()
		} else if (currentStep.id === "translation") {
			animateTranslation()
		} else if (currentStep.id === "tagging") {
			animateTagging()
		} else if (currentStep.id === "speakers") {
			animateSpeakers()
		} else {
			// For AI analysis, just use time-based completion
			setTimeout(() => {
				isLoading = false
				isComplete = true

				if (currentStep.isVideo) {
					setTimeout(() => {
						showVideoClip = true
					}, 2500) // Extended delay to show completion state
				}
			}, currentStep.duration)
		}

		// Complete the step (except for AI analysis which handles its own timing)
		if (currentStep.id !== "question") {
			setTimeout(() => {
				isLoading = false
				isComplete = true

				// Move to next step or restart with precise timing
				setTimeout(() => {
					if (isLastStep) {
						setTimeout(() => {
							restart = true
						}, 4000) // Extended pause before restart for video viewing
					} else {
						transitionToNextStep()
					}
				}, 3000) // Extended pause to showcase completion state
			}, currentStep.duration)
		} else {
			// For AI analysis, handle restart after video is shown
			setTimeout(() => {
				if (isLastStep) {
					setTimeout(() => {
						restart = true
					}, 6000) // Extra time to view video + completion
				}
			}, currentStep.duration)
		}
	}

	function animateTranscription() {
		const words = fullTranscript.split(" ")
		const baseInterval = Math.max(currentStep.duration / words.length, 80)

		words.forEach((word, index) => {
			setTimeout(
				() => {
					transcriptText = words.slice(0, index + 1).join(" ")
				},
				index * baseInterval + Math.random() * 100,
			)
		})
	}

	function animateTranslation() {
		// First show original Spanish text with word-by-word animation
		originalText = spanishText

		// Start translation after Spanish is complete
		setTimeout(
			() => {
				isTranslating = true
				translationText = ""

				englishWords.forEach((word, index) => {
					setTimeout(() => {
						translationText = englishWords.slice(0, index + 1).join(" ")
					}, index * 100)
				})
			},
			spanishWords.length * 100 + 100,
		)
	}

	function animateTagging() {
		// First show the full transcript with a gentle fade in
		setTimeout(() => {
			transcriptText = fullTranscript
		}, 800) // Delay for more sophisticated entrance

		// Then highlight tagged themes with more sophisticated timing
		const interval = (currentStep.duration - 2000) / taggedWords.length

		taggedWords.forEach((theme, index) => {
			setTimeout(
				() => {
					// Create a smooth highlighting effect
					const indices = []
					for (let i = theme.start; i <= theme.end; i++) {
						indices.push(i)
					}
					// Animate highlighting with gentle stagger
					indices.forEach((charIndex, i) => {
						setTimeout(() => {
							highlightedIndices = [...highlightedIndices, charIndex]
						}, i * 80) // Slower, more elegant highlighting
					})
				},
				1000 + index * interval, // Longer initial delay
			)
		})
	}

	function animateSpeakers() {
		const interval = (currentStep.duration - 1000) / speakerData.length

		speakerData.forEach((segment, index) => {
			setTimeout(
				() => {
					speakerSegments = [...speakerSegments, segment]
				},
				1000 + index * interval, // Longer initial delay for sophistication
			)
		})
	}

	function transitionToNextStep() {
		// First trigger the exit animations by hiding card
		showCard = false

		// Wait for exit animations to complete, then transition
		setTimeout(() => {
			currentStepIndex += 1
			setTimeout(() => {
				showCard = true
			}, 100) // Brief pause for content to settle
		}, 500) // Wait for exit animations to complete
	}

	onMount(() => {
		// Start the workflow
	})
</script>

{#snippet translationLoadingDot()}
	<span
		class="bg-foreground transform-gpu size-4 inline-block translate-y-1 rounded-full"
		in:scale={{ duration: 400, easing: elasticOut }}
		out:scale={{ duration: 400, easing: elasticOut }}></span>
{/snippet}

{#snippet textMessageBubble(header: string, fullText: string, currentText: string, showLoadingDot: boolean = false)}
	<div
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}
		class="bg-card/60 backdrop-blur-sm rounded-xl border-border/20 max-w-2xl p-4 mb-3 border rounded-tl shadow-sm">
		<div class="text-card-foreground opacity-70 mb-2 text-xs font-medium tracking-wide uppercase">
			{header}
		</div>
		<div class="text-card-foreground font-sans text-sm leading-relaxed">
			{#if currentText}
				{@render animatedText(fullText, currentText)}
				{#if showLoadingDot}
					{@render translationLoadingDot()}
				{/if}
			{:else}
				{currentText || fullText}
			{/if}
		</div>
	</div>
{/snippet}

{#snippet animatedText(fullText: string, currentText: string)}
	{#each fullText.split(" ") as word, i}
		{#if i < currentText.split(" ").length}
			<span
				in:fly={{ x: -10, duration: 50, easing: cubicInOut }}
				out:fly={{ x: 10, duration: 50, easing: cubicInOut }}
				class="inline-block mr-1 transition-all duration-300 {i === currentText.split(' ').length - 1
					? 'text-primary'
					: 'text-foreground'}">
				{word}
			</span>
		{/if}
	{/each}
{/snippet}

<div class="relative flex flex-col w-full pl-12 space-y-4">
	<!-- Fixed icon that stays in position -->
	<div class="absolute top-0 left-0 z-10">
		<div
			class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 transition-all duration-300 rounded-full shadow-lg">
			{#key currentStepIndex}
				<div in:scale={{ duration: 500, easing: elasticOut }} out:scale={{ duration: 500, easing: elasticOut }}>
					{#if currentStep.icon === IconFileText}
						<IconFileText class="size-4" />
					{:else if currentStep.icon === IconLanguage}
						<IconLanguage class="size-4" />
					{:else if currentStep.icon === IconTags}
						<IconTags class="size-4" />
					{:else if currentStep.icon === IconUsers}
						<IconUsers class="size-4" />
					{:else if currentStep.icon === IconMessageQuestion}
						<IconMessageQuestion class="size-4" />
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
			<!-- Enhanced chat-style step header -->
			<div class="mb-4 space-y-3">
				<!-- Heading animation -->
				<div
					in:fly={{ x: -30, duration: 500, easing: quintOut }}
					out:fly={{ x: 30, duration: 400, easing: cubicInOut }}>
					<h3 class="text-foreground text-lg font-semibold tracking-tight">{currentStep.title}</h3>
				</div>

				<!-- Subheading animation with delay - Fixed layout shift -->
				<div class="relative min-h-[1.25rem]">
					{#key `${currentStep.id}-${isLoading}-${isComplete}`}
						<div
							class="absolute inset-0"
							in:fly={{ x: -30, duration: 400, delay: 100, easing: quintOut }}
							out:fly={{ x: 30, duration: 300, easing: cubicInOut }}>
							<div class="text-foreground text-sm leading-relaxed">
								{#if isComplete}
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
										{:else if isLoading}
											<div class="animate-spin flex-shrink-0">
												<IconLoader class="size-4 text-foreground" />
											</div>
										{/if}
										<span class="animate-shimmer-once text-foreground bg-foreground">
											{currentStep.loadingText}...
										</span>
									</span>
								{:else}
									<span>
										{currentStep.subtitle}
									</span>
								{/if}
							</div>
						</div>
					{/key}
				</div>
			</div>

			<!-- Enhanced ChatGPT-style message bubbles -->
			{#if isLoading || isComplete}
				{#if currentStep.id === "transcription"}
					{#key `transcription-${currentStepIndex}`}
						{@render textMessageBubble(
							"Audio Transcription • Processing",
							fullTranscript,
							transcriptText,
							transcriptText.length > 0 && !isComplete,
						)}
					{/key}
				{:else if currentStep.id === "translation"}
					{#key `translation-original-${currentStepIndex}`}
						{@render textMessageBubble(
							"Original • Italian",
							spanishText,
							originalText,
							originalText.length > 0 && originalText.length < spanishText.length && !isComplete,
						)}
					{/key}

					{#if isTranslating || isComplete}
						{#key `translation-english-${currentStepIndex}`}
							{@render textMessageBubble(
								"Translation • English",
								fullTranscript,
								translationText,
								translationText.length > 0 && !isComplete,
							)}
						{/key}
					{/if}
				{:else if currentStep.id === "tagging"}
					{#key `tagging-${currentStepIndex}`}
						{@render textMessageBubble(
							"Coding Open Ends • Analyzing themes",
							fullTranscript,
							transcriptText,
							false,
						)}
					{/key}
				{:else if currentStep.id === "speakers"}
					<div
						class="space-y-3"
						in:fly={{ y: 20, duration: 400, easing: quintOut }}
						out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
						{#each speakerSegments as segment, i (`speaker-${currentStepIndex}-${i}`)}
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
				{/if}
			{/if}

			<!-- Enhanced AI Analysis question -->
			{#if currentStep.id === "question" && (isLoading || isComplete)}
				{#key `question-${currentStepIndex}`}
					{@render textMessageBubble(
						"Analysis Query",
						`"${currentStep.subtitle}"`,
						`"${currentStep.subtitle}"`,
						false,
					)}
				{/key}
			{/if}

			<!-- Enhanced completion states -->
			{#if isComplete && currentStep.id === "tagging"}
				<div
					in:fly={{ y: 15, duration: 400, delay: 300, easing: quintOut }}
					out:fly={{ y: -15, duration: 400, easing: cubicInOut }}
					class="flex flex-wrap gap-2 mt-4">
					{#each taggedWords as tag, i (`tag-${currentStepIndex}-${i}`)}
						<span
							class="bg-card/60 backdrop-blur-sm rounded-xl border-border/20 px-3 py-1 text-xs font-semibold border shadow-sm"
							in:scale={{ duration: 300, delay: i * 100, easing: elasticOut }}
							out:scale={{ duration: 300, easing: cubicInOut }}>
							#{tag.theme}
						</span>
					{/each}
				</div>
			{/if}

			{#if isComplete && currentStep.id === "speakers"}
				<div
					in:fly={{ y: 15, duration: 400, delay: 300, easing: quintOut }}
					out:fly={{ y: -15, duration: 400, easing: cubicInOut }}
					class="bg-card/60 backdrop-blur-sm rounded-xl border-border/20 flex items-center gap-3 p-3 mt-4 border">
					<span class="text-card-foreground text-xs font-medium">Identified speakers:</span>
					<div class="flex -space-x-2">
						{#each speakerData as speaker, i (`speaker-badge-${currentStepIndex}-${i}`)}
							<div
								class="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 border-background ring-1 ring-white/20 flex items-center justify-center border-2 rounded-full shadow-lg"
								in:scale={{ duration: 300, delay: i * 100, easing: elasticOut }}
								out:scale={{ duration: 300, easing: cubicInOut }}
								title={speaker.name}>
								<span class="text-xs font-bold text-white">{speaker.speaker}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Enhanced video clip as a chat message -->
	{#if showVideoClip}
		<div
			in:fly={{ y: 20, duration: 600, easing: quintOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}
			class="flex items-start gap-4">
			<div class=" flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full shadow-lg">
				<IconCheck class="w-4 h-4 text-white" />
			</div>
			<div class="flex-1 max-w-2xl">
				<div
					class="text-foreground flex items-center gap-2 mb-3 text-xs font-medium"
					in:fly={{ x: -20, duration: 400, delay: 100, easing: quintOut }}
					out:fly={{ x: 20, duration: 400, easing: cubicInOut }}>
					<div class="size-2 bg-green-500 rounded-full"></div>
					Analysis complete • Video clips generated
				</div>
				<div
					class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-slate-700/50 overflow-hidden border shadow-xl"
					in:fly={{ y: 20, duration: 500, delay: 200, easing: elasticOut }}
					out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
					<div class="aspect-[16/10] bg-gradient-to-br from-slate-700/50 to-slate-800/50 relative">
						<img
							src="/images/wild/coca-cola-4k.png"
							alt="Video"
							class="opacity-60 absolute inset-0 object-cover w-full h-full" />
						<!-- Enhanced video player -->
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
									<div class="text-sm font-medium text-white">Customer Feedback Analysis</div>
									<div class="text-white/70 text-xs">Pricing concerns identified • 1:45 duration</div>
								</div>
							</div>
						</div>
						<!-- Enhanced video controls -->
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
