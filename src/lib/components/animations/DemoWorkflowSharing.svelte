<script lang="ts">
	import {
		IconShare,
		IconUsers,
		IconCheck,
		IconMail,
		IconLoader,
		IconLock,
		IconEye,
		IconEdit,
		IconCrown,
		IconBell,
		IconEditOff,
		IconAddressBook,
		IconSettings,
	} from "@tabler/icons-svelte"
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut, cubicInOut, elasticOut } from "svelte/easing"
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
	// STEP ANIMATIONS
	// ============================================================================

	async function animateShareSetup(controller: AnimationController): Promise<void> {
		try {
			// Type email
			await controller.delay(500)
			const email = "alex@client-corp.com"
			for (let i = 0; i <= email.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.shareAction.email = email.slice(0, i)
				await controller.delay(80)
			}

			// Show access levels first
			if (controller.signal.aborted) throw new Error("Animation cancelled")
			animationState.accessLevels = accessLevels
			await controller.delay(300)

			// Select guest access
			await controller.delay(600)
			animationState.shareAction.status = "selecting"
			animationState.selectedLevel = accessLevels.find((l) => l.id === "guest") || null

			// Show send button
			await controller.delay(800)
			animationState.shareAction.showSendButton = true

			// Simulate send button click
			await controller.delay(1200)
			animationState.shareAction.status = "sending"

			// Complete sharing
			await controller.delay(600)
			animationState.shareAction.status = "complete"
			animationState.shareAction.showSendButton = false

			await controller.delay(1000)
		} catch (err) {
			// Fallback
			animationState.accessLevels = accessLevels
			animationState.shareAction.email = "alex@client-corp.com"
			animationState.selectedLevel = accessLevels.find((l) => l.id === "guest") || null
			animationState.shareAction.status = "complete"
			animationState.shareAction.showSendButton = false
			throw err
		}
	}

	async function animateInviteNotification(controller: AnimationController): Promise<void> {
		try {
			await controller.delay(500)
			animationState.notification.visible = true
			await controller.delay(2000)
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
				await controller.delay(400)
			}

			// Highlight external member
			await controller.delay(600)
			animationState.highlightedMember = "alex"

			await controller.delay(1500)
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
			subtitle: "Setting up guest access permissions...",
			loadingText: "Configuring project sharing",
			completeText: "Share configuration completed",
			execute: animateShareSetup,
		},
		{
			id: "invite-notification",
			icon: IconBell,
			title: "Send Invitation",
			subtitle: "Notifying external collaborator...",
			loadingText: "Sending invitation notification",
			completeText: "Invitation sent successfully",
			execute: animateInviteNotification,
		},
		{
			id: "access-grid",
			icon: IconUsers,
			title: "Team Access",
			subtitle: "Managing project permissions...",
			loadingText: "Loading team access controls",
			completeText: "Access permissions updated",
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
<!-- CLEAN VISUAL COMPONENTS (simplified and monotone)
<!-- ============================================================================ -->

<!-- Animated text bubble (professional layout) -->
{#snippet animatedTextBubble(config: { header: string; text: string; showDot?: boolean })}
	<div
		class="card p-6"
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
		<!-- Title -->
		<div class="text-base font-semibold mb-1">Guest Access Setup</div>
		<!-- Metadata -->
		<div class="text-sm text-muted-foreground mb-4">
			{config.header}
		</div>
		<!-- Content -->
		<div class="text-sm leading-relaxed">
			{config.text}
			{#if config.showDot}
				<span class="bg-muted size-2 animate-pulse inline-block ml-1 rounded-full"></span>
			{/if}
		</div>
	</div>
{/snippet}
<!-- Static text bubble (professional layout) -->
{#snippet textBubble(config: { header: string; text: string; showDot?: boolean })}
	<div
		class="card p-6"
		in:fly={{ y: 20, duration: 30, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 30, easing: cubicInOut }}>
		<!-- Title -->
		<div class="text-base font-semibold mb-1">Share Link Generated</div>
		<!-- Metadata -->
		<div class="text-sm text-muted-foreground mb-4">
			{config.header}
		</div>
		<!-- Content -->
		<div class="text-sm leading-relaxed">
			{config.text}
			{#if config.showDot}
				<span class="bg-muted size-2 animate-pulse inline-block ml-1 rounded-full"></span>
			{/if}
		</div>
	</div>
{/snippet}

<!-- Access levels display (professional layout) -->
{#snippet accessLevelsDisplay(levels: AccessLevel[], selectedLevel: AccessLevel | null)}
	<div
		class="card p-6 mt-4"
		in:fly={{ y: 20, duration: 30, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 30, easing: cubicInOut }}>
		<div class="grid grid-cols-2 gap-3 mb-4">
			{#each levels as level (level.id)}
				{@const IconComponent = level.icon}
				{@const isSelected = selectedLevel?.id === level.id}
				<div
					class="flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 {isSelected
						? 'bg-muted border-foreground'
						: 'border-border hover:border-muted-foreground'}"
					in:fly={{ x: -10, duration: 30, delay: levels.indexOf(level) * 100, easing: quintOut }}>
					<div class={level.color}>
						<IconComponent class="size-5" />
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-medium">{level.name}</div>
					</div>
					{#if isSelected}
						<div in:scale={{ duration: 200, easing: elasticOut }}>
							<IconCheck class="size-4" />
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<!-- Summary -->
		<div class="text-xs text-muted-foreground">
			{levels.length} permission levels • Guest selected
		</div>
	</div>
{/snippet}

<!-- Invitation notification (professional layout) -->
{#snippet invitationNotification(visible: boolean, projectName: string, inviterName: string)}
	{#if visible}
		<div
			class="card p-6 mx-auto"
			in:fly={{ y: 20, duration: 500, easing: elasticOut }}
			out:fly={{ y: -20, duration: 300, easing: cubicInOut }}>
			<!-- Title -->
			<div class="text-base font-semibold mb-1">Invitation Sent</div>
			<!-- Metadata -->
			<div class="text-sm text-muted-foreground mb-4">Guest notification delivered</div>
			<!-- Content -->
			<div class="flex items-start gap-3 mb-4">
				<div class="bg-muted p-2 rounded-lg">
					<IconMail class="size-4" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm font-medium mb-1">
						You've been invited to view "{projectName}"
					</div>
					<div class="text-xs text-muted-foreground">
						by {inviterName}
					</div>
				</div>
				<div>
					<IconCheck class="size-4" />
				</div>
			</div>
			<!-- Footer -->
			<div class="text-xs text-muted-foreground">Guest access • Read-only permissions</div>
		</div>
	{/if}
{/snippet}

<!-- Full-width send button (professional layout) -->
{#snippet sendButton(isPressed: boolean)}
	<div
		class="card p-6"
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 300, easing: cubicInOut }}>
		<!-- Title -->
		<div class="text-base font-semibold mb-1">Send Invitation</div>
		<!-- Metadata -->
		<div class="text-sm text-muted-foreground mb-6">Guest access will be sent to alex@client-corp.com</div>
		<!-- Button -->
		<button
			type="button"
			class="w-full bg-white text-background font-medium py-4 px-6 rounded-lg transition-all duration-200 ease-out
			{isPressed ? 'scale-[0.98]' : 'active:scale-[0.98]'}"
			disabled>
			{#if isPressed}
				<div class="flex items-center justify-center gap-2">
					<IconLoader class="size-4 animate-spin" />
					<span>Sending invitation...</span>
				</div>
			{:else}
				<div class="flex items-center justify-center gap-2">
					<IconMail class="size-4" />
					<span>Send Guest Access</span>
				</div>
			{/if}
		</button>
		<!-- Footer info -->
		<div class="text-xs text-muted-foreground mt-4 text-center">Guest permissions • Read-only access</div>
	</div>
{/snippet}

<!-- Team members grid (professional layout) -->
{#snippet teamMembersGrid(members: TeamMember[], highlightedId: string | null)}
	{#if members.length > 0}
		<div
			class="card p-6"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<!-- Title -->
			<div class="text-base font-semibold mb-1">Team Access</div>
			<!-- Metadata -->
			<div class="text-sm text-muted-foreground mb-6">Manage project permissions and member access</div>
			<!-- Members List -->
			<div class="space-y-3 mb-4">
				{#each members as member (member.id)}
					{@const accessLevel = accessLevels.find((l) => l.id === member.accessLevel)}
					{@const IconComponent = accessLevel?.icon ?? IconLoader}
					{@const isHighlighted = highlightedId === member.id}
					<div
						class="flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 {isHighlighted
							? 'bg-muted border-foreground'
							: 'border-border hover:border-muted-foreground'}"
						in:fly={{ y: -20, duration: 30, delay: members.indexOf(member) * 100, easing: elasticOut }}>
						<!-- Avatar -->
						<div
							class="relative w-10 h-10 rounded-full font-medium text-sm flex items-center justify-center {member.isExternal
								? 'bg-muted text-foreground'
								: 'bg-white text-background'}">
							{member.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
							{#if member.isExternal}
								<div class="-bottom-0.5 -right-0.5 absolute">
									<div
										class="bg-white text-background flex items-center justify-center w-4 h-4 rounded-full"
										in:scale={{ duration: 300, easing: elasticOut, delay: 500 }}>
										<IconLock class="size-2.5" />
									</div>
								</div>
							{/if}
						</div>

						<!-- Member Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-0.5">
								<span class="text-sm font-medium truncate">{member.name}</span>
								{#if member.isExternal}
									<span
										class="bg-white text-background px-2 py-0.5 text-xs font-medium rounded-full"
										in:scale={{ duration: 200, easing: elasticOut, delay: 600 }}>
										External
									</span>
								{/if}
							</div>
							<div class="text-xs text-muted-foreground truncate">{member.email}</div>
						</div>

						<!-- Access Level -->
						<div class="flex items-center gap-2 text-right">
							<div class="text-xs text-muted-foreground">
								{#if accessLevel}
									{accessLevel.name}
								{/if}
							</div>
							{#if accessLevel}
								<div class={accessLevel.color}>
									<IconComponent class="size-4" />
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<!-- Footer Summary -->
			<div class="text-xs text-muted-foreground">
				{members.length} team members • {members.filter((m) => m.isExternal).length} external users
			</div>
		</div>
	{/if}
{/snippet}
<div class="relative flex flex-col w-full">
	{#if showCard}
		<div
			class="transition-all duration-500"
			in:fly={{ y: 30, duration: 600, easing: quintOut }}
			out:fly={{ y: -30, duration: 500, easing: cubicInOut }}>
			{#if isLoading || animationState.isComplete}
				{#if currentStep.id === "share-setup"}
					{#if animationState.shareAction.email}
						{@render animatedTextBubble({
							header: "Guest Email • Project Sharing",
							text: animationState.shareAction.email,
							showDot: animationState.shareAction.status === "typing",
						})}
						{#if animationState.accessLevels.length > 0}
							{@render accessLevelsDisplay(animationState.accessLevels, animationState.selectedLevel)}
						{/if}
					{/if}

					{#if animationState.shareAction.showSendButton}
						{@render sendButton(animationState.shareAction.status === "sending")}
					{/if}

					{#if animationState.shareAction.status === "complete"}
						{@render textBubble({
							header: "Share Link • Generated",
							text: "Guest access sent to alex@client-corp.com",
						})}
					{/if}
				{/if}

				{#if currentStep.id === "invite-notification"}
					{@render invitationNotification(
						animationState.notification.visible,
						animationState.notification.projectName,
						animationState.notification.inviterName,
					)}
				{/if}

				{#if currentStep.id === "access-grid"}
					{@render teamMembersGrid(animationState.teamMembers, animationState.highlightedMember)}
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.animate-shimmer-once {
		background: var(--muted);
		color: var(--foreground);
		animation: shine 1.5s infinite;
	}

	@keyframes shine {
		to {
			background-position: left;
		}
	}
</style>
