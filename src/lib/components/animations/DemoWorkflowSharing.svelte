<script lang="ts">
	import {
		IconShare,
		IconUsers,
		IconCheck,
		IconMail,
		IconLoader,
		IconLock,
		IconEdit,
		IconBell,
		IconEditOff,
		IconAddressBook,
		IconSettings,
	} from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fade, fly, scale, slide } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
	import type { ComponentType } from "svelte"
	import Box from "./Box.svelte"

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
	// ABSTRACT SHARING DATA MODELS
	// ============================================================================

	type AccessLevel = {
		id: string
		name: string
		icon: ComponentType
		color: string
	}

	type ShareAction = {
		email: string
		accessLevel: string
		status: "typing" | "selecting" | "sending" | "complete"
		showSendButton: boolean
	}

	type TeamMember = {
		id: string
		name: string
		email: string
		domain: string
		accessLevel: string
		isExternal: boolean
		status: "adding" | "invited" | "active"
	}

	// Animation state
	let animationState = $state({
		// Share step
		shareAction: <ShareAction>{
			email: "",
			accessLevel: "guest",
			status: "typing",
			showSendButton: false,
		},
		accessLevels: <AccessLevel[]>[],
		selectedLevel: <AccessLevel | null>null,

		// Notification step
		notification: {
			visible: false,
			projectName: "Premium Product Research",
			inviterName: "Sarah Chen",
		},

		// Access grid step
		teamMembers: <TeamMember[]>[],
		highlightedMember: <string | null>null,

		currentStepId: "",
		isComplete: false,
	})

	function resetAnimationState() {
		animationState.shareAction = {
			email: "",
			accessLevel: "guest",
			status: "typing",
			showSendButton: false,
		}
		animationState.accessLevels = []
		animationState.selectedLevel = null
		animationState.notification.visible = false
		animationState.teamMembers = []
		animationState.highlightedMember = null
		animationState.isComplete = false
	}

	// ============================================================================
	// DATA CONFIGURATION
	// ============================================================================

	const accessLevels: AccessLevel[] = [
		{
			id: "admin",
			name: "Admin",
			icon: IconSettings,
			color: "",
		},
		{
			id: "editor",
			name: "Editor",
			icon: IconEdit,
			color: "",
		},
		{
			id: "viewer",
			name: "Viewer",
			icon: IconEditOff,
			color: "",
		},
		{
			id: "analyst",
			name: "Analyst",
			icon: IconEdit,
			color: "",
		},
		{
			id: "guest",
			name: "Guest",
			icon: IconAddressBook,
			color: "",
		},
	]

	const teamMembers: TeamMember[] = [
		{
			id: "sarah",
			name: "Sarah Chen",
			email: "sarah@company.com",
			domain: "company.com",
			accessLevel: "admin",
			isExternal: false,
			status: "active",
		},
		{
			id: "mike",
			name: "Mike Rodriguez",
			email: "mike@company.com",
			domain: "company.com",
			accessLevel: "editor",
			isExternal: false,
			status: "active",
		},
		{
			id: "alex",
			name: "Alex Thompson",
			email: "alex@client-corp.com",
			domain: "client-corp.com",
			accessLevel: "guest",
			isExternal: true,
			status: "adding",
		},
		{
			id: "emma",
			name: "Emma Wilson",
			email: "emma@company.com",
			domain: "company.com",
			accessLevel: "editor",
			isExternal: false,
			status: "active",
		},
	]

	// ============================================================================
	// STEP ANIMATIONS - Simplified and cleaner
	// ============================================================================

	async function animateShareSetup(controller: AnimationController): Promise<void> {
		try {
			// Type email character by character
			await controller.delay(500)
			const email = "alex@client-corp.com"
			for (let i = 0; i <= email.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.shareAction.email = email.slice(0, i)
				await controller.delay(60)
			}

			// Show access levels
			await controller.delay(800)
			animationState.accessLevels = accessLevels

			// Select guest access
			await controller.delay(1000)
			animationState.selectedLevel = accessLevels.find((l) => l.id === "guest") || null
			animationState.shareAction.status = "selecting"

			// Show send button
			await controller.delay(800)
			animationState.shareAction.showSendButton = true

			// Complete sharing
			await controller.delay(1200)
			animationState.shareAction.status = "complete"

			await controller.delay(1500)
		} catch (err) {
			// Fallback
			animationState.accessLevels = accessLevels
			animationState.shareAction.email = "alex@client-corp.com"
			animationState.selectedLevel = accessLevels.find((l) => l.id === "guest") || null
			animationState.shareAction.status = "complete"
			throw err
		}
	}

	async function animateInviteNotification(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(600)
			animationState.notification.visible = true
			await controller.delay(2500)
		} catch (err) {
			animationState.notification.visible = true
			throw err
		}
	}

	async function animateAccessGrid(controller: AnimationController): Promise<void> {
		try {
			// Add members progressively
			for (let i = 0; i < teamMembers.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.teamMembers = teamMembers.slice(0, i + 1)
				await controller.delay(500)
			}

			// Highlight the new external member
			await controller.delay(800)
			animationState.highlightedMember = "alex"

			await controller.delay(2000)
		} catch (err) {
			animationState.teamMembers = teamMembers
			animationState.highlightedMember = "alex"
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
			id: "share-setup",
			icon: IconShare,
			title: "Share Project",
			subtitle: "Configure guest access permissions",
			loadingText: "Setting up project sharing",
			completeText: "Guest access configured",
			execute: animateShareSetup,
		},
		{
			id: "invite-notification",
			icon: IconBell,
			title: "Send Invitation",
			subtitle: "Notify external collaborator",
			loadingText: "Sending invitation",
			completeText: "Invitation delivered",
			execute: animateInviteNotification,
		},
		{
			id: "access-grid",
			icon: IconUsers,
			title: "Team Overview",
			subtitle: "Review project member access",
			loadingText: "Loading team access",
			completeText: "Team access updated",
			execute: animateAccessGrid,
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

	// STATIC DESIGN MODE - Set to true to disable animations and show all steps
	// Perfect for design work: shows access levels, share setup, notification, and team grid
	// all at once without any animations or delays
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

				await controller.delay(1500)

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
		if (!staticDesignMode) {
			setTimeout(() => {
				startAnimation()
			}, 500)
		}
	})
</script>

<!-- ============================================================================ -->
<!-- CLEAN WORKFLOW UI - Matches DemoCoreValue Style -->
<!-- ============================================================================ -->

<div class="w-full h-full flex items-center justify-center">
	{#if showCard}
		<div
			class="transition-all duration-500"
			in:slide={{ axis: "y", duration: 300, easing: quintOut }}
			out:fade={{ duration: 200, delay: 100, easing: cubicInOut }}>
			<!-- SHARE SETUP STEP -->
			{#if currentStep?.id === "share-setup"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 300, easing: cubicInOut, start: 0.5 }}>
					<Box class="h-full flex min-w-96 max-w-96 items-center justify-center">
						<div class="space-y-6 w-full h-full relative">
							<div class="text-left">
								<h2 class="text-xl text-black leading-tight max-w-full mx-auto">
									Share with External Guest
								</h2>
							</div>

							<div class="space-y-4">
								<!-- Email Input Field -->
								<div class="space-y-2">
									<label for="guest-email" class="text-sm font-medium text-gray-800"
										>Email address</label>
									<div class="relative">
										<input
											id="guest-email"
											type="email"
											class="w-full px-4 py-3 border border-gray-800 rounded-lg bg-white text-gray-800 text-sm"
											value={animationState.shareAction.email}
											placeholder="Enter email address"
											readonly />
										{#if animationState.shareAction.email && animationState.shareAction.status === "typing"}
											<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
												<div class="w-1 h-5 bg-gray-800 animate-pulse"></div>
											</div>
										{/if}
									</div>
								</div>

								<!-- Access Levels -->
								{#if animationState.accessLevels.length > 0}
									<div class="space-y-3" in:fade={{ duration: 300, delay: 200 }}>
										<div class="text-sm font-medium text-gray-800">Access level</div>
										<div class="grid grid-cols-2 gap-2">
											{#each animationState.accessLevels.slice(0, 4) as level (level.id)}
												{@const IconComponent = level.icon}
												{@const isSelected = animationState.selectedLevel?.id === level.id}
												<div
													class="flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 {isSelected
														? 'border-black bg-gray-100'
														: 'border-gray-300 hover:border-gray-500'}"
													in:scale={{
														duration: 200,
														easing: quintOut,
														delay: level.id === "guest" ? 400 : 100,
													}}>
													<IconComponent class="size-4 text-gray-800" />
													<span class="text-sm text-gray-800">{level.name}</span>
													{#if isSelected}
														<div
															class="ml-auto"
															in:scale={{ duration: 200, easing: elasticOut }}>
															<IconCheck class="size-4 text-black" />
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Send Button -->
								{#if animationState.shareAction.showSendButton}
									<div class="pt-2" in:fade={{ duration: 300, delay: 200 }}>
										<div
											class={`w-full bg-black text-white px-6 py-3 rounded-lg font-medium transition-all text-center ${
												animationState.shareAction.status === "complete"
													? "bg-black/70 scale-95"
													: ""
											}`}>
											{#if animationState.shareAction.status === "complete"}
												<div class="flex items-center justify-center gap-2">
													<IconCheck class="size-4" />
													<span>Invitation Sent</span>
												</div>
											{:else}
												<div class="flex items-center justify-center gap-2">
													<IconMail class="size-4" />
													<span>Send Guest Access</span>
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</Box>
				</div>
			{/if}

			<!-- INVITE NOTIFICATION STEP -->
			{#if currentStep?.id === "invite-notification"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full flex items-center justify-center min-w-96 max-w-96">
						{#if animationState.notification.visible}
							<div class="space-y-4 w-full h-full relative" in:fade={{ duration: 400, delay: 200 }}>
								<div class="text-left">
									<h2 class="text-xl text-black leading-tight">Invitation Delivered</h2>
								</div>

								<!-- Notification Card -->
								<div class="border border-gray-800 rounded-lg p-4 bg-gray-50">
									<div class="flex items-start gap-3">
										<div class="p-2 bg-black rounded-lg">
											<IconMail class="size-5 text-white" />
										</div>
										<div class="flex-1">
											<h3 class="text-sm font-semibold text-black mb-1">Project Invitation</h3>
											<p class="text-sm text-gray-700 mb-2">
												You've been invited to view "{animationState.notification.projectName}"
											</p>
											<p class="text-xs text-gray-600">
												by {animationState.notification.inviterName}
											</p>
										</div>
										<IconCheck class="size-5 text-black" />
									</div>
								</div>

								<!-- Details -->
								<div class="text-sm text-gray-600 space-y-1">
									<div>• Guest access granted</div>
									<div>• Read-only permissions</div>
									<div>• Link expires in 30 days</div>
								</div>
							</div>
						{/if}
					</Box>
				</div>
			{/if}

			<!-- ACCESS GRID STEP -->
			{#if currentStep?.id === "access-grid"}
				<div
					class="transition-all duration-300 w-full h-full flex items-center justify-center"
					in:scale={{ duration: 500, easing: elasticOut, start: 0.5 }}>
					<Box class="h-full flex items-center justify-center min-w-96 max-w-96">
						<div class="space-y-4 w-full h-full relative">
							<div class="text-left">
								<h2 class="text-xl text-black leading-tight">Team Access Overview</h2>
								<p class="text-sm text-gray-600 mt-1">
									{animationState.teamMembers.length} members • {animationState.teamMembers.filter(
										(m) => m.isExternal,
									).length} external
								</p>
							</div>

							<!-- Team Members List -->
							<div class="space-y-2">
								{#each animationState.teamMembers as member, index (member.id)}
									{@const accessLevel = accessLevels.find((l) => l.id === member.accessLevel)}
									{@const IconComponent = accessLevel?.icon ?? IconLoader}
									{@const isHighlighted = animationState.highlightedMember === member.id}
									<div
										class="flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 {isHighlighted
											? 'border-black bg-gray-100'
											: 'border-gray-300'}"
										in:fly={{ y: 20, duration: 300, delay: index * 200, easing: quintOut }}>
										<!-- Avatar -->
										<div
											class="relative w-8 h-8 rounded-full font-medium text-xs flex items-center justify-center {member.isExternal
												? 'bg-gray-300 text-gray-800'
												: 'bg-black text-white'}">
											{member.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
											{#if member.isExternal}
												<div class="absolute -bottom-0.5 -right-0.5">
													<div
														class="bg-black text-white w-3 h-3 rounded-full flex items-center justify-center"
														in:scale={{ duration: 300, easing: elasticOut, delay: 400 }}>
														<IconLock class="size-1.5" />
													</div>
												</div>
											{/if}
										</div>

										<!-- Member Info -->
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2">
												<span class="text-sm font-medium text-black truncate"
													>{member.name}</span>
												{#if member.isExternal && isHighlighted}
													<span
														class="bg-black text-white px-2 py-0.5 text-xs rounded-full"
														in:scale={{ duration: 200, easing: elasticOut, delay: 600 }}>
														Guest
													</span>
												{/if}
											</div>
											<div class="text-xs text-gray-600 truncate">{member.email}</div>
										</div>

										<!-- Access Level -->
										<div class="flex items-center gap-1">
											<span class="text-xs text-gray-600">
												{accessLevel?.name ?? ""}
											</span>
											{#if IconComponent}
												<IconComponent class="size-3 text-gray-600" />
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</Box>
				</div>
			{/if}
		</div>
	{/if}
</div>
