<script lang="ts">
	import { IconCloudUpload, IconLanguage, IconCheck, IconLoader } from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale, fade } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"

	// ============================================================================
	// ANIMATION CONTROLLER (Following established pattern)
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
	// DATA MODELS
	// ============================================================================

	type Integration = {
		id: string
		name: string
		logo: string
		status: "disconnected" | "connecting" | "connected"
	}

	// ============================================================================
	// CENTRALIZED STATE
	// ============================================================================

	let animationState = $state({
		// Current step integrations (bigger icons, cleaner display)
		currentIntegrations: <Integration[]>[],
		connectingIndex: -1,

		// Global state
		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState() {
		// Simple reset - just clear current integrations and connecting state
		animationState.currentIntegrations = []
		animationState.connectingIndex = -1
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION - CATEGORIZED BY WORKFLOW
	// ============================================================================

	// Step 1: Video & Meeting Platforms - Where conversations happen
	const videoPlatforms: Integration[] = [
		{ id: "zoom", name: "Zoom", logo: "/integrations/zoom.png", status: "disconnected" },
		{ id: "teams", name: "Microsoft Teams", logo: "/integrations/teams.png", status: "disconnected" },
		{ id: "google-meet", name: "Google Meet", logo: "/integrations/google-meet.png", status: "disconnected" },
		{ id: "discuss", name: "Discuss.io", logo: "/integrations/discuss.png", status: "disconnected" },
	]

	// Step 2: Transcription & Translation Services - Language processing
	const transcriptionServices: Integration[] = [
		{ id: "otter", name: "Otter.ai", logo: "/integrations/otter.png", status: "disconnected" },
		{ id: "rev", name: "Rev.com", logo: "/integrations/rev.png", status: "disconnected" },
		{ id: "yazi", name: "Yazi", logo: "/integrations/yazi.png", status: "disconnected" },
	]

	// Step 3: Research & Storage Tools - Analysis and storage
	const researchStorage: Integration[] = [
		{ id: "user-testing", name: "UserTesting", logo: "/integrations/user-testing.png", status: "disconnected" },
		{ id: "qualzy", name: "Qualzy", logo: "/integrations/qualzy.png", status: "disconnected" },
		{ id: "recollective", name: "Recollective", logo: "/integrations/recollective.png", status: "disconnected" },
		{ id: "onedrive", name: "OneDrive", logo: "/integrations/onedrive.png", status: "disconnected" },
		{ id: "sharepoint", name: "SharePoint", logo: "/integrations/sharepoint.png", status: "disconnected" },
		{ id: "field-notes", name: "Field Notes", logo: "/integrations/field-notes.png", status: "disconnected" },
	]

	// ============================================================================
	// ANIMATION FUNCTIONS - SIMPLE CONNECTION FOCUS
	// ============================================================================

	async function animateVideoPlatforms(controller: AnimationController): Promise<void> {
		try {
			// Initialize video platforms as disconnected
			animationState.currentIntegrations = videoPlatforms.map((integration) => ({
				...integration,
				status: "disconnected" as const,
			}))

			await controller.delay(600)

			// Connect all platforms with staggered timing
			for (let i = 0; i < animationState.currentIntegrations.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.connectingIndex = i
				animationState.currentIntegrations[i].status = "connecting"

				await controller.delay(500)

				if (!controller.signal.aborted) {
					animationState.currentIntegrations[i].status = "connected"
				}
			}

			animationState.connectingIndex = -1
			await controller.delay(800)
		} catch (err) {
			// Graceful fallback
			animationState.currentIntegrations = videoPlatforms.map((integration) => ({
				...integration,
				status: "connected" as const,
			}))
			animationState.connectingIndex = -1
			throw err
		}
	}

	async function animateTranscriptionServices(controller: AnimationController): Promise<void> {
		try {
			// Initialize transcription services as disconnected
			animationState.currentIntegrations = transcriptionServices.map((integration) => ({
				...integration,
				status: "disconnected" as const,
			}))

			await controller.delay(600)

			// Connect all services with staggered timing
			for (let i = 0; i < animationState.currentIntegrations.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.connectingIndex = i
				animationState.currentIntegrations[i].status = "connecting"

				await controller.delay(600)

				if (!controller.signal.aborted) {
					animationState.currentIntegrations[i].status = "connected"
				}
			}

			animationState.connectingIndex = -1
			await controller.delay(800)
		} catch (err) {
			// Graceful fallback
			animationState.currentIntegrations = transcriptionServices.map((integration) => ({
				...integration,
				status: "connected" as const,
			}))
			animationState.connectingIndex = -1
			throw err
		}
	}

	async function animateResearchStorage(controller: AnimationController): Promise<void> {
		try {
			// Initialize research & storage tools as disconnected
			animationState.currentIntegrations = researchStorage.map((integration) => ({
				...integration,
				status: "disconnected" as const,
			}))

			await controller.delay(600)

			// Connect all tools with staggered timing (faster for larger group)
			for (let i = 0; i < animationState.currentIntegrations.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")

				animationState.connectingIndex = i
				animationState.currentIntegrations[i].status = "connecting"

				await controller.delay(400)

				if (!controller.signal.aborted) {
					animationState.currentIntegrations[i].status = "connected"
				}
			}

			animationState.connectingIndex = -1
			await controller.delay(1000)
		} catch (err) {
			// Graceful fallback
			animationState.currentIntegrations = researchStorage.map((integration) => ({
				...integration,
				status: "connected" as const,
			}))
			animationState.connectingIndex = -1
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
			id: "video-platforms",
			icon: IconCloudUpload,
			title: "Video & Meeting Platforms",
			subtitle: "Connecting to video conferencing and meeting platforms...",
			loadingText: "Connecting to meeting platforms",
			completeText: "Meeting platforms connected",
			execute: animateVideoPlatforms,
		},
		{
			id: "transcription-services",
			icon: IconLanguage,
			title: "Transcription & Translation",
			subtitle: "Connecting to transcription and translation services...",
			loadingText: "Connecting to language services",
			completeText: "Language services connected",
			execute: animateTranscriptionServices,
		},
		{
			id: "research-storage",
			icon: IconCheck,
			title: "Research & Storage Tools",
			subtitle: "Connecting to research platforms and storage solutions...",
			loadingText: "Connecting to research tools",
			completeText: "All integrations ready • Streamlined analysis enabled",
			execute: animateResearchStorage,
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
		setTimeout(() => {
			startAnimation()
		}, 500)
	})
</script>

<!-- ============================================================================ -->
<!-- VISUAL SNIPPETS - BIGGER ICONS, NO SCROLLING
<!-- ============================================================================ -->

<!-- Simple integration grid with bigger icons -->
{#snippet integrationGrid(integrations: Integration[])}
	{#if integrations.length > 0}
		<!-- Fixed 3-column grid -->
		<div class="grid grid-cols-3 gap-3">
			{#each integrations as integration, i (integration.id)}
				<div
					class="relative"
					in:fly={{ y: 15, duration: 400, delay: i * 100, easing: quintOut }}
					out:fade={{ duration: 200 }}>
					<div
						class="group h-18 relative flex flex-col items-center justify-center w-full p-2 transition-all duration-300 border rounded-lg backdrop-blur-sm
						{integration.status === 'connected'
							? 'bg-secondary/20 border-secondary/40 shadow-md'
							: integration.status === 'connecting'
								? 'bg-primary/10 border-primary/30 shadow-sm animate-pulse'
								: 'bg-card/50 border-border/20 hover:border-border/40'}">
						<!-- Logo -->
						<img
							src={integration.logo}
							alt={integration.name}
							class="object-contain mb-1 transition-all duration-300
							{integration.status === 'connected' ? 'w-12 h-12' : 'w-10 h-10'}" />

						<!-- Name -->
						<div
							class="text-center leading-tight transition-all duration-300
							{integration.status === 'connected'
								? 'text-secondary-foreground text-[10px] font-semibold'
								: 'text-card-foreground/80 text-[9px] font-medium'}">
							{integration.name}
						</div>

						<!-- Connection status indicator -->
						<div class="-top-1 -right-1 absolute">
							{#if integration.status === "connected"}
								<div class="size-3 ring-2 ring-background bg-secondary rounded-full shadow-lg">
									<IconCheck class="size-2 text-secondary-foreground mt-[1px] ml-[1px]" />
								</div>
							{:else if integration.status === "connecting"}
								<div
									class="bg-primary size-3 animate-pulse ring-2 ring-background rounded-full shadow-lg">
								</div>
							{:else}
								<div class="bg-muted size-3 ring-2 ring-background rounded-full shadow-lg"></div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI - CLEAN 3-STEP APPROACH
<!-- ============================================================================ -->

<div class="relative flex flex-col w-full pl-12 space-y-4">
	<!-- Fixed step icon -->
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

			<!-- Dynamic content - just the integration grid -->
			{#if isLoading || animationState.isComplete}
				{@render integrationGrid(animationState.currentIntegrations)}
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
