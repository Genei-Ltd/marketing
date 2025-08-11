<!--
ANIMATED CORE VALUE USER FLOW
Shows the core user loop: Ask questions and get cited answers
Clean, minimal design matching the document interface style
-->

<script lang="ts">
	import { onMount } from "svelte"
	import { IconFilePlus, IconFileText, IconVideo } from "@tabler/icons-svelte"
	import Box from "./Box.svelte"

	let currentStep = $state(0)
	let typedText = $state("")
	let summaryWords = $state<string[]>([])
	let visibleWords = $state(0)

	const questionText =
		"Identify which of these third-party contracts do not contain our standard assignment language?"
	const summaryText =
		"As requested, I am providing a detailed summary of the main interim operating covenants that will be in place during the period between signing and closing of the merger agreement with Solid Biosciences Inc. These covenants are designed to ensure that AavantiBio maintains its business operations in a manner consistent with past practices and does not undertake any actions that could adversely affect the merger."

	// Split summary into words for animation
	$effect(() => {
		summaryWords = summaryText.split(" ")
	})

	// Typing animation for question
	function typeQuestion() {
		typedText = ""
		let i = 0
		const typeInterval = setInterval(() => {
			if (i < questionText.length) {
				typedText += questionText[i]
				i++
			} else {
				clearInterval(typeInterval)
			}
		}, 50) // Type each character every 50ms
	}

	// Word-by-word animation for summary
	function animateSummary() {
		visibleWords = 0
		const wordInterval = setInterval(() => {
			if (visibleWords < summaryWords.length) {
				visibleWords++
			} else {
				clearInterval(wordInterval)
			}
		}, 100) // Show each word every 100ms
	}

	onMount(() => {
		function animate() {
			// Step 0: Upload (3s) - slide in from right
			currentStep = 0
			setTimeout(() => {
				// Step 1: Files (3s) - slide up from bottom
				currentStep = 1
				setTimeout(() => {
					// Step 2: Question (3s) - slide in from left + start typing
					currentStep = 2
					setTimeout(() => {
						typeQuestion()
					}, 300) // Start typing after slide transition
					setTimeout(() => {
						// Step 3: Answer (4s) - slide down from top + animate summary
						currentStep = 3
						setTimeout(() => {
							animateSummary()
						}, 300) // Start word animation after slide transition
						setTimeout(() => {
							animate() // Restart
						}, 4000)
					}, 3500)
				}, 3000)
			}, 3000)
		}
		animate()
	})
</script>

<!-- Main Container -->
<div class="h-full w-full flex flex-col items-center justify-center max-w-full mx-auto space-y-12">
	<!-- Stage 1: File Upload -->
	<Box
		innerClass=""
		class="p-lg transition-all duration-700 ease-out {currentStep === 0
			? 'opacity-100 scale-100 translate-x-0'
			: currentStep < 0
				? 'opacity-0 scale-95 translate-x-8'
				: 'opacity-30 scale-95 translate-x-0'}">
		<div class="text-left">
			<h2 class="text-xl text-black leading-tight max-w-full mx-auto">
				Upload your Interviews & Discussion Guide
			</h2>
		</div>
		<div class="flex flex-row items-center justify-center w-full">
			<div class="space-y-3 max-w-full mx-auto w-full">
				<div
					class="flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-muted rounded-lg transition-colors cursor-pointer w-full min-h-32">
					<span class="inline-flex items-center justify-center rounded-full p-3 border border-muted">
						<IconFilePlus stroke="1" class="size-8 text-muted" />
					</span>
					<span class="text-muted-foreground font-medium text-base">Drag & Drop your files here</span>
					<span class="text-xs text-muted-foreground">or click to browse</span>
				</div>
			</div>
		</div>
	</Box>

	<!-- Stage 2: File List -->
	<Box
		class="transition-all duration-700 ease-out {currentStep === 1
			? 'opacity-100 scale-100 translate-y-0'
			: currentStep < 1
				? 'opacity-0 scale-95 translate-y-8'
				: 'opacity-30 scale-95 translate-y-0'}">
		<!-- File Count -->
		<div class="text-left">
			<p class="text-xl font-medium text-black">87 Speakers Detected</p>
			<p class="text-lg text-muted-foreground mt-2">2 Researchers Selected</p>
		</div>
		<div class="flex flex-row items-center justify-center w-full">
			<!-- File List -->
			<div class="space-y-3 max-w-full mx-auto w-full">
				<div
					class="flex items-center gap-3 p-4 border border-muted rounded-lg hover:bg-gray-50 transition-colors">
					<IconFileText class="size-5 text-muted flex-shrink-0" />
					<span class="text-muted font-medium">Discussion Guide.pdf</span>
				</div>
				<div
					class="flex items-center gap-3 p-4 border border-muted rounded-lg hover:bg-gray-50 transition-colors">
					<IconVideo class="size-5 text-muted flex-shrink-0" />
					<span class="text-muted font-medium">Expert Interview (French).mov</span>
				</div>
				<div
					class="flex items-center gap-3 p-4 border border-muted rounded-lg hover:bg-gray-50 transition-colors">
					<IconVideo class="size-5 text-muted flex-shrink-0" />
					<span class="text-muted font-medium">Expert Interview.mp4</span>
				</div>
			</div>
		</div>
	</Box>

	<!-- Stage 3: Question Input -->
	<Box
		class="p-lg transition-all duration-700 ease-out {currentStep === 2
			? 'opacity-100 scale-100 -translate-x-0'
			: currentStep < 2
				? 'opacity-0 scale-95 -translate-x-8'
				: 'opacity-30 scale-95 translate-x-0'}">
		<!-- Question Title -->
		<div class="text-left">
			<h2 class="text-xl text-black leading-tight max-w-full mx-auto min-h-[3rem]">
				{typedText}<span
					class="animate-pulse {currentStep === 2 && typedText.length < questionText.length
						? 'opacity-100'
						: 'opacity-0'}">|</span>
			</h2>
		</div>

		<!-- Ask CoLoop Button -->
		<div class="flex justify-left w-full">
			<div
				class="bg-black text-white px-8 py-3 rounded font-medium hover:bg-black/70 transition-colors w-full min-w-full text-center">
				Ask CoLoop
			</div>
		</div>
	</Box>

	<!-- Stage 4: Document Analysis Result -->
	<Box
		class="transition-all duration-700 ease-out {currentStep === 3
			? 'opacity-100 scale-100 translate-y-0'
			: currentStep < 3
				? 'opacity-0 scale-95 -translate-y-8'
				: 'opacity-30 scale-95 translate-y-0'}">
		<!-- Analysis Text with Citation -->
		<div class="relative max-w-full mx-auto">
			<h2 class="text-xl text-black font-semibold mb-6 leading-tight max-w-full mx-auto">CoLoop Summary</h2>
			<div class="text-gray-500 leading-relaxed text-sm space-y-4 min-h-[12rem]">
				{#each summaryWords as word, index}
					<span class="transition-opacity duration-200 {index < visibleWords ? 'opacity-100' : 'opacity-0'}">
						{word}
						{#if index === 15}
							<span class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded"
								>1</span>
						{/if}
						{#if index === 32}
							<span class="relative inline">
								<span class="bg-yellow-200/60 px-1">Conduct of Business in the Ordinary Course</span>
								<!-- Citation Number -->
								<sup class="relative">
									<span
										class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded"
										>2</span>
									<!-- Citation Tooltip -->
									<div class="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
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
						{/if}
						{#if index === 45}
							<span class="bg-black font-semibold text-white text-center text-xs px-1.5 py-0.5 rounded"
								>3</span>
						{/if}
					</span>
				{/each}
				<span
					class="animate-pulse {currentStep === 3 && visibleWords < summaryWords.length
						? 'opacity-100'
						: 'opacity-0'}">|</span>
			</div>
		</div>

		<!-- Referenced Quote -->
		<div
			class="text-left border-l-4 border-black pl-2 {currentStep === 3 && visibleWords >= summaryWords.length
				? 'opacity-100'
				: 'opacity-0'} transition-opacity duration-500 delay-500">
			<p class="text-sm text-gray-500">
				<span class="font-medium text-gray-700">
					<span class="bg-black text-white text-xs px-1.5 py-0.5 mr-1 rounded">2</span>
					<span class="font-bold text-black">Speaker AB:</span>
				</span>
				<span class="font-medium text-muted"> Assignment language is missing from the contract. </span>
			</p>
		</div>
	</Box>
</div>
