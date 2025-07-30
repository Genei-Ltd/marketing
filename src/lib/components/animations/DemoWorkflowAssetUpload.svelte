<script lang="ts">
	import { IconUpload, IconFileText, IconCheck, IconLoader, IconMovie, IconMicrophone } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut, linear } from "svelte/easing"
	import type { ComponentType } from "svelte"

	// ============================================================================
	// ANIMATION CONTROLLER (unchanged)
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
	// FILE PROCESSING DATA MODELS
	// ============================================================================

	type FileType = "video" | "audio"

	type UploadFile = {
		id: string
		name: string
		type: FileType
		size: string
		duration?: string
		icon: string
		uploadProgress: number
		status: "uploading" | "uploaded" | "processing" | "complete"
	}

	type ProcessingColumn = "transcription" | "translation" | "speakers"

	type FileProcessingRow = {
		file: UploadFile
		transcription: {
			status: "processing" | "complete"
			progress: number
			text?: string
			detectedLanguages?: string[]
		}
		translation: {
			status: "processing" | "complete"
			progress: number
			targetLanguage?: string
			translatedText?: string
			originalLanguage?: string
		}
		speakers: {
			status: "processing" | "complete"
			progress: number
			speakers?: Array<{ id: string; name: string; color: string }>
		}
	}

	// Animation state
	let animationState = $state({
		// Upload step
		uploadedFiles: <UploadFile[]>[],
		currentUploadIndex: 0,

		// Processing step
		processingRows: <FileProcessingRow[]>[],
		currentColumn: <ProcessingColumn | null>null,
		columnCompletion: {
			transcription: false,
			translation: false,
			speakers: false,
		},

		// Text animation tracking
		animatedTextProgress: <{ [key: string]: number }>{},

		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState(preserveUploads: boolean = false) {
		if (!preserveUploads) {
			animationState.uploadedFiles = []
		}
		animationState.currentUploadIndex = 0
		animationState.processingRows = []
		animationState.currentColumn = null
		animationState.columnCompletion = {
			transcription: false,
			translation: false,
			speakers: false,
		}
		animationState.animatedTextProgress = {}
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const filesToUpload: UploadFile[] = [
		{
			id: "video1",
			name: "customer-interview-01.mp4",
			type: "video",
			size: "24.5 MB",
			duration: "12:34",
			icon: "/icons/mp4.png",
			uploadProgress: 0,
			status: "uploading",
		},
		{
			id: "audio1",
			name: "focus-group-session.wav",
			type: "audio",
			size: "8.2 MB",
			duration: "18:45",
			icon: "/icons/wav.png",
			uploadProgress: 0,
			status: "uploading",
		},
		{
			id: "video2",
			name: "product-demo-feedback.mov",
			type: "video",
			size: "31.7 MB",
			duration: "9:23",
			icon: "/icons/mov.png",
			uploadProgress: 0,
			status: "uploading",
		},
		{
			id: "audio2",
			name: "phone-interview-sarah.m4a",
			type: "audio",
			size: "5.8 MB",
			duration: "15:12",
			icon: "/icons/mp3.png",
			uploadProgress: 0,
			status: "uploading",
		},
		{
			id: "video3",
			name: "user-testing-session.mp4",
			type: "video",
			size: "18.9 MB",
			duration: "7:56",
			icon: "/icons/mp4.png",
			uploadProgress: 0,
			status: "uploading",
		},
	]

	const sampleContent = [
		{
			originalLanguage: "Spanish",
			originalText: "Realmente creo que el modelo de precios necesita trabajo. Es bastante confuso...",
			englishText: "I really think the pricing model needs some work. It's quite confusing...",
		},
		{
			originalLanguage: "French",
			originalText: "L'interface est fantastique, très intuitive et facile à naviguer...",
			englishText: "The interface is fantastic, very intuitive and easy to navigate through...",
		},
		{
			originalLanguage: "Italian",
			originalText:
				"La mia principale preoccupazione riguarda la sicurezza dei dati e come vengono trattate le nostre informazioni...",
			englishText: "My main concern is about data security and how our information is handled...",
		},
		{
			originalLanguage: "German",
			originalText: "Die mobile App könnte einige Verbesserungen gebrauchen, besonders die Suchfunktion...",
			englishText: "The mobile app could use some improvements, especially the search function...",
		},
		{
			originalLanguage: "Italian",
			originalText: "L'esperienza complessiva è stata positiva, la raccomanderei ai colleghi...",
			englishText: "Overall experience has been positive, would recommend to colleagues...",
		},
	]

	const sampleSpeakers = [
		[
			{ id: "s1", name: "Sarah Chen", color: "text-primary" },
			{ id: "s2", name: "Interviewer", color: "text-secondary" },
		],
		[
			{ id: "s3", name: "Mike Rodriguez", color: "text-primary" },
			{ id: "s4", name: "Emma Wilson", color: "text-primary" },
			{ id: "s5", name: "David Kim", color: "text-primary" },
			{ id: "s6", name: "Interviewer", color: "text-secondary" },
		],
		[
			{ id: "s7", name: "Ana Silva", color: "text-primary" },
			{ id: "s8", name: "Interviewer", color: "text-secondary" },
		],
		[
			{ id: "s9", name: "Alex Thompson", color: "text-primary" },
			{ id: "s10", name: "Interviewer", color: "text-secondary" },
		],
		[
			{ id: "s11", name: "Lisa Park", color: "text-primary" },
			{ id: "s12", name: "John Davis", color: "text-primary" },
			{ id: "s13", name: "Interviewer", color: "text-secondary" },
		],
	]

	// ============================================================================
	// STEP ANIMATIONS
	// ============================================================================

	async function animateFileUpload(controller: AnimationController): Promise<void> {
		try {
			for (let i = 0; i < filesToUpload.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				const file = { ...filesToUpload[i] }
				animationState.uploadedFiles = [
					...animationState.uploadedFiles,
					file,
				]
				animationState.currentUploadIndex = i

				// Animate upload progress
				for (let progress = 0; progress <= 100; progress += 10) {
					if (controller.signal.aborted) throw new Error("Animation cancelled")
					animationState.uploadedFiles[i].uploadProgress = progress
					await controller.delay(70)
				}

				animationState.uploadedFiles[i].status = "uploaded"
				await controller.delay(50)
			}

			await controller.delay(800)
		} catch (err) {
			// Fallback
			animationState.uploadedFiles = filesToUpload.map((f) => ({
				...f,
				uploadProgress: 100,
				status: "uploaded" as const,
			}))
			throw err
		}
	}

	async function animateSequentialProcessing(controller: AnimationController): Promise<void> {
		try {
			// Show initial delay to let user see the table appear
			await controller.delay(500)

			// Process each column sequentially
			await animateColumnProcessing(controller, "transcription")
			await controller.delay(500)

			await animateColumnProcessing(controller, "translation")
			await controller.delay(500)

			await animateColumnProcessing(controller, "speakers")

			await controller.delay(1000)
		} catch (err) {
			// Fallback - mark all processing as complete
			if (animationState.processingRows.length > 0) {
				animationState.processingRows = animationState.processingRows.map((row) => ({
					...row,
					transcription: { ...row.transcription, status: "complete", progress: 100 },
					translation: { ...row.translation, status: "complete", progress: 100 },
					speakers: { ...row.speakers, status: "complete", progress: 100 },
				}))
			}
			throw err
		}
	}

	async function animateColumnProcessing(controller: AnimationController, column: ProcessingColumn): Promise<void> {
		// Start all rows in this column simultaneously
		for (let i = 0; i < animationState.processingRows.length; i++) {
			animationState.processingRows[i][column].status = "processing"
		}

		// Animate all rows in parallel for this column
		const rowPromises = animationState.processingRows.map(async (_, i) => {
			// Animate progress smoothly
			for (let progress = 0; progress <= 100; progress += 10) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.processingRows[i][column].progress = progress
				await controller.delay(150)
			}

			// Complete the row
			animationState.processingRows[i][column].status = "complete"

			// For transcription, animate text typing after completion
			if (column === "transcription") {
				const text = animationState.processingRows[i].transcription.text || ""
				const textKey = `${i}-transcription`
				animationState.animatedTextProgress[textKey] = 0

				// Animate text typing
				for (let charIndex = 0; charIndex <= text.length; charIndex += 3) {
					if (controller.signal.aborted) throw new Error("Animation cancelled")
					animationState.animatedTextProgress[textKey] = Math.min(charIndex, text.length)
					await controller.delay(50)
				}
			}
		})

		await Promise.all(rowPromises)

		// Mark column as complete
		animationState.columnCompletion[column] = true
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
			id: "file-upload",
			icon: IconUpload,
			title: "File Upload",
			subtitle: "Uploading interview files and media assets...",
			loadingText: "Processing file uploads",
			completeText: "All files uploaded successfully",
			execute: animateFileUpload,
		},
		{
			id: "parallel-processing",
			icon: IconFileText,
			title: "Running transcription, translation, and speaker identification...",
			subtitle: "Running transcription, translation, and speaker identification...",
			loadingText: "Processing files in parallel",
			completeText: "All files analysed",
			execute: animateSequentialProcessing,
		},
	]

	// ============================================================================
	// EXECUTION ENGINE (same as DemoWorkflow)
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

		// Preserve uploads when transitioning to parallel processing
		const preserveUploads = step.id === "parallel-processing"
		resetAnimationState(preserveUploads)
		animationState.currentStepId = step.id

		// Initialize processing rows for parallel processing step
		if (step.id === "parallel-processing") {
			const initialRows: FileProcessingRow[] = animationState.uploadedFiles.map((file, index) => ({
				file,
				transcription: {
					status: "processing",
					progress: 0,
					text: sampleContent[index].originalText,
					detectedLanguages: [sampleContent[index].originalLanguage],
				},
				translation: {
					status: "processing",
					progress: 0,
					targetLanguage: "English",
					translatedText: sampleContent[index].englishText,
					originalLanguage: sampleContent[index].originalLanguage,
				},
				speakers: {
					status: "processing",
					progress: 0,
					speakers: sampleSpeakers[index],
				},
			}))
			animationState.processingRows = initialRows
		}

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
			resetAnimationState(false) // Full reset when restarting

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
		setTimeout(() => {
			startAnimation()
		}, 500)
	})
</script>

<!-- ============================================================================ -->
<!-- VISUAL COMPONENTS
<!-- ============================================================================ -->

<!-- File upload list -->
{#snippet fileUploadList(files: UploadFile[])}
	<div
		class="bg-card/85 backdrop-blur-sm border-border/10 p-4 mr-16 border rounded-lg shadow-sm"
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
		<div class="text-card-foreground mb-3 text-xs font-medium tracking-wide uppercase">
			Uploading Files • {files.length} Assets
		</div>
		<div class="space-y-3">
			{#each files as file, i (file.id)}
				<div
					class="flex items-center gap-3 p-3 rounded-md transition-all duration-200 {file.status ===
					'uploaded'
						? 'bg-primary/5 border-primary/20 border'
						: 'hover:bg-muted/10'}"
					in:fly={{ y: -20, duration: 400, delay: i * 100, easing: elasticOut }}>
					<!-- File icon -->
					<div class="p-2">
						<img src={file.icon} alt={file.type} class="size-5" />
					</div>

					<!-- File info -->
					<div class="flex-1 min-w-0">
						<div class="text-card-foreground text-sm font-medium truncate">{file.name}</div>
						<div class="text-card-foreground/70 text-xs">
							{file.size} • {file.duration || "Unknown duration"}
						</div>
					</div>

					<!-- Upload progress or status -->
					<div class="flex items-center gap-2">
						{#if file.status === "uploading"}
							<div class="w-20">
								<div class="bg-secondary h-1.5 overflow-hidden rounded-full">
									<div
										class="bg-primary h-full transition-all duration-200 rounded-full"
										style="width: {file.uploadProgress}%">
									</div>
								</div>
							</div>
							<span class="text-card-foreground/70 font-mono text-xs">{file.uploadProgress}%</span>
						{:else if file.status === "uploaded"}
							<div
								class="text-primary flex items-center gap-2"
								in:scale={{ duration: 200, easing: elasticOut }}>
								<span class="text-card-foreground/70 text-xs font-medium"
									>{file.type.toUpperCase()}</span>
								<IconCheck class="size-4" />
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/snippet}

<!-- Processing table -->
{#snippet processingTable(rows: FileProcessingRow[])}
	{#if rows.length > 0}
		<div
			class="bg-card/70 backdrop-blur-sm border-border/10 max-w-4xl overflow-hidden border rounded-lg"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<!-- Column headers -->
			<div class="bg-card/85 backdrop-blur-sm border-border/10 grid grid-cols-4 gap-4 px-4 py-3 border-b">
				<div class="text-foreground/80 text-xs font-bold tracking-wider uppercase">Asset</div>
				<div class="text-foreground/80 text-xs font-bold tracking-wider uppercase">Transcription</div>
				<div class="text-foreground/80 text-xs font-bold tracking-wider uppercase">Translation</div>
				<div class="text-foreground/80 text-xs font-bold tracking-wider uppercase">Speakers</div>
			</div>

			<!-- Rows -->
			<div class="divide-border/20 divide-y">
				{#each rows as row, i (row.file.id)}
					<div
						class="hover:bg-card backdrop-blur-sm grid grid-cols-4 gap-4 px-4 py-4 transition-colors"
						in:fly={{ y: -20, duration: 400, delay: i * 100, easing: linear }}>
						<!-- Asset column -->
						<div class="space-y-2">
							<div class="flex items-center gap-3">
								{#if row.file.type === "video"}
									<IconMovie class="size-5 text-foreground/60" />
								{:else if row.file.type === "audio"}
									<IconMicrophone class="size-5 text-foreground/60" />
								{/if}
								<div class="text-foreground/70 font-mono text-sm font-medium truncate">
									{row.file.name.replace(/\.(mp4|wav|m4a|mov)$/, "")}
								</div>
							</div>
							<div class="text-foreground/50 ml-8 text-xs">
								{row.file.size} • {row.file.duration || "Unknown"}
							</div>
							{#if row.translation.originalLanguage && row.translation.targetLanguage}
								<div class="ml-8" in:fly={{ duration: 200, easing: linear, delay: 100, x: -20 }}>
									<span class="bg-primary/10 text-primary px-2 py-1 text-xs font-medium rounded">
										{row.translation.originalLanguage} → {row.translation.targetLanguage}
									</span>
								</div>
							{/if}
						</div>

						<!-- Transcription column -->
						<div class="space-y-2">
							{@render compactProcessingCell(row.transcription)}
							{#if row.transcription.status === "complete"}
								<!-- {#if row.transcription.detectedLanguages}
									<div
										class="flex flex-wrap gap-1"
										in:fly={{ duration: 200, easing: linear, delay: 100, x: -20 }}>
										{#each row.transcription.detectedLanguages as lang}
											<span
												class="bg-secondary text-secondary-foreground px-2 py-1 text-xs font-medium rounded">
												{lang}
											</span>
										{/each}
									</div>
								{/if} -->
								{#if row.transcription.text}
									{@const textKey = `${i}-transcription`}
									{@const animatedLength = animationState.animatedTextProgress[textKey] || 0}
									{@const isAnimating = animatedLength < row.transcription.text.length}
									<div class="text-foreground/70 text-xs leading-relaxed">
										{row.transcription.text.slice(
											0,
											Math.min(animatedLength, 80),
										)}{#if row.transcription.text.length > 80}...{/if}{#if isAnimating}<span
												class="animate-pulse text-primary">|</span
											>{/if}
									</div>
								{/if}
							{/if}
						</div>

						<!-- Translation column -->
						<div class="space-y-2">
							{@render compactProcessingCell(row.translation)}
							{#if row.translation.status === "complete"}
								{#if row.translation.translatedText}
									<div
										class="text-foreground/70 text-xs leading-relaxed"
										in:fly={{ duration: 200, easing: linear, delay: 100, x: -20 }}>
										{row.translation.translatedText.slice(
											0,
											80,
										)}{#if row.translation.translatedText.length > 80}...{/if}
									</div>
								{/if}
							{/if}
						</div>

						<!-- Speakers column -->
						<div class="space-y-2">
							{@render compactProcessingCell(row.speakers)}
							{#if row.speakers.status === "complete" && row.speakers.speakers}
								<div
									class="flex items-center -space-x-1"
									in:fly={{ duration: 200, easing: elasticOut, delay: 100, x: -20 }}>
									{#each row.speakers.speakers as speaker, speakerIndex}
										<div
											class="flex items-center justify-center size-6 text-[10px] font-bold rounded-full border-2 border-background relative z-[{10 -
												speakerIndex}]
											{speaker.color === 'text-primary' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background'}"
											title={speaker.name}>
											{speaker.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</div>
									{/each}
								</div>
								<div class="text-foreground/50 text-xs font-medium">
									{row.speakers.speakers.length} identified
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- Compact processing cell -->
{#snippet compactProcessingCell(cell: { status: string; progress: number })}
	<div class="flex items-center gap-2">
		{#if cell.status === "processing"}
			<div class="text-primary animate-spin">
				<IconLoader class="size-4" />
			</div>
			<div class="flex-1">
				<div class="bg-primary/20 h-1.5 overflow-hidden rounded-full">
					<div
						class="bg-primary h-full transition-all duration-200 rounded-full"
						style="width: {cell.progress}%">
					</div>
				</div>
			</div>
			<span class="text-foreground/60 font-mono text-xs">{cell.progress}%</span>
		{/if}
	</div>
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI
<!-- ============================================================================ -->

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

			<!-- Dynamic content -->
			{#if isLoading || animationState.isComplete}
				<!-- FILE UPLOAD STEP -->
				{#if currentStep.id === "file-upload"}
					{#if animationState.uploadedFiles.length > 0}
						{@render fileUploadList(animationState.uploadedFiles)}
					{/if}
				{/if}

				<!-- PARALLEL PROCESSING STEP -->
				{#if currentStep.id === "parallel-processing"}
					{@render processingTable(animationState.processingRows)}
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
