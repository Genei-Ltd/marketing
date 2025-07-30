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
		status: "typing" | "selecting" | "sharing" | "complete"
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
			icon: IconCrown,
			color: "text-foreground",
		},
		{
			id: "editor",
			name: "Editor",
			icon: IconEdit,
			color: "text-foreground",
		},
		{
			id: "analyst",
			name: "Analyst",
			icon: IconEye,
			color: "text-foreground",
		},
		{
			id: "viewer",
			name: "Viewer",
			icon: IconLock,
			color: "text-foreground",
		},
		{
			id: "guest",
			name: "Guest",
			icon: IconLock,
			color: "text-foreground",
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
			// Show access levels first
			for (let i = 0; i < accessLevels.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.accessLevels = accessLevels.slice(0, i + 1)
				await controller.delay(300)
			}

			// Type email
			await controller.delay(500)
			const email = "alex@client-corp.com"
			for (let i = 0; i <= email.length; i++) {
				if (controller.signal.aborted) throw new Error("Animation cancelled")
				animationState.shareAction.email = email.slice(0, i)
				await controller.delay(80)
			}

			// Select guest access
			await controller.delay(600)
			animationState.shareAction.status = "selecting"
			animationState.selectedLevel = accessLevels.find((l) => l.id === "guest") || null

			// Complete sharing
			await controller.delay(800)
			animationState.shareAction.status = "complete"

			await controller.delay(1000)
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

<!-- Animated text bubble (simplified) -->
{#snippet animatedTextBubble(config: { header: string; text: string; showDot?: boolean })}
	<div
		class="bg-card/85 backdrop-blur-sm border-border/10 max-w-2xl p-4 mb-3 border rounded-lg shadow-sm"
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
		<div class="text-card-foreground mb-2 text-xs font-medium tracking-wide uppercase">
			{config.header}
		</div>
		<div class="text-card-foreground border-border/20 p-1 px-2 font-sans text-sm leading-relaxed border rounded">
			{config.text}
			{#if config.showDot}
				<span class="bg-card-foreground/70 size-3 animate-pulse inline-block mt-1 ml-1 rounded-full"></span>
			{/if}
		</div>
	</div>
{/snippet}
<!-- Animated text bubble (simplified) -->
{#snippet textBubble(config: { header: string; text: string; showDot?: boolean })}
	<div
		class="bg-card/85 backdrop-blur-sm border-border/10 max-w-2xl p-4 mb-3 border rounded-lg shadow-sm"
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
		<div class="text-card-foreground mb-2 text-xs font-medium tracking-wide uppercase">
			{config.header}
		</div>
		<div class="text-card-foreground font-sans text-sm leading-relaxed">
			{config.text}
			{#if config.showDot}
				<span class="bg-card-foreground/70 size-3 animate-pulse inline-block mt-1 ml-1 rounded-full"></span>
			{/if}
		</div>
	</div>
{/snippet}

<!-- Access levels display (simplified) -->
{#snippet accessLevelsDisplay(levels: AccessLevel[], selectedLevel: AccessLevel | null)}
	<div
		class="bg-card/85 backdrop-blur-sm border-border/10 max-w-2xl p-4 mb-3 border rounded-lg shadow-sm"
		in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
		out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
		<div class="text-foreground mb-3 text-xs font-medium tracking-wide uppercase">Access Permissions</div>
		<div class="grid grid-cols-2 gap-2">
			{#each levels as level (level.id)}
				{@const IconComponent = level.icon}
				{@const isSelected = selectedLevel?.id === level.id}
				<div
					class="flex items-center gap-2 p-2 rounded-md border uppercase transition-all duration-200 hover:bg-primary/5 {isSelected
						? 'border-primary/30 bg-primary/5'
						: 'border-border/20'}"
					in:fly={{ x: -10, duration: 300, delay: levels.indexOf(level) * 100, easing: quintOut }}>
					<div class="{level.color} p-1">
						<IconComponent class="size-6" />
					</div>
					<span class="text-card-foreground text-sm font-medium">{level.name}</span>
					{#if isSelected}
						<div class="text-primary ml-auto" in:scale={{ duration: 200, easing: elasticOut }}>
							<IconCheck class="size-4" />
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/snippet}

<!-- Invitation notification (simplified) -->
{#snippet invitationNotification(visible: boolean, projectName: string, inviterName: string)}
	{#if visible}
		<div
			class="bg-card/85 backdrop-blur-sm border-border/10 max-w-2xl p-4 border rounded-lg shadow-sm"
			in:fly={{ y: 20, duration: 500, easing: elasticOut }}
			out:fly={{ y: -20, duration: 300, easing: cubicInOut }}>
			<div class="text-card-foreground mb-3 text-xs font-medium tracking-wide uppercase">
				Invitation Notification
			</div>
			<div class="flex items-start gap-3">
				<div class="bg-primary/30 text-primary-foreground p-2 rounded-md">
					<IconMail class="size-4" />
				</div>
				<div class="flex-1">
					<div class="text-card-foreground text-md font-sans">
						<span class="font-medium">You've been invited to view</span>
						<span class="text-foreground font-semibold">"{projectName}"</span>
					</div>
					<div class="text-card-foreground/70 text-xs">
						by {inviterName} • Guest access
					</div>
				</div>
				<div class="text-primary">
					<IconCheck class="size-4" />
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<!-- Team members grid (simplified and monotone) -->
{#snippet teamMembersGrid(members: TeamMember[], highlightedId: string | null)}
	{#if members.length > 0}
		<div
			class="bg-card/85 backdrop-blur-sm border-border/10 max-w-2xl p-4 border rounded-lg shadow-sm"
			in:fly={{ y: 20, duration: 400, easing: cubicInOut }}
			out:fly={{ y: -20, duration: 500, easing: cubicInOut }}>
			<div class="text-card-foreground/70 mb-3 text-xs font-medium tracking-wide uppercase">
				Team Access • {members.length} Members
			</div>
			<div class="space-y-2">
				{#each members as member (member.id)}
					{@const accessLevel = accessLevels.find((l) => l.id === member.accessLevel)}
					{@const IconComponent = accessLevel?.icon ?? IconLoader}
					{@const isHighlighted = highlightedId === member.id}
					<div
						class="flex items-center gap-3 p-2 rounded-md transition-all duration-300 {isHighlighted
							? 'bg-primary/10 border-primary/20 border'
							: 'hover:bg-muted/10'}"
						in:fly={{ y: -20, duration: 400, delay: members.indexOf(member) * 100, easing: elasticOut }}>
						<!-- Avatar (simplified) -->
						<div
							class="relative w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center shadow-sm {member.isExternal
								? 'bg-secondary/70 text-secondary-foreground'
								: 'bg-primary/70 text-primary-foreground'}">
							{member.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
							{#if member.isExternal}
								<div class="-bottom-1 -right-1 absolute">
									<div
										class="bg-primary/70 text-primary-foreground flex items-center justify-center w-4 h-4 rounded-full shadow-sm"
										in:scale={{ duration: 300, easing: elasticOut, delay: 500 }}>
										<IconLock class="size-2.5" />
									</div>
								</div>
							{/if}
						</div>

						<!-- Member info (simplified) -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-card-foreground text-sm font-medium truncate">{member.name}</span>
								{#if member.isExternal}
									<span
										class="bg-primary/10 text-primary px-1.5 py-0.5 text-xs font-medium rounded"
										in:scale={{ duration: 200, easing: elasticOut, delay: 600 }}>
										External
									</span>
								{/if}
							</div>
							<div class="text-card-foreground/70 text-xs truncate">{member.email}</div>
						</div>

						<!-- Access level (simplified) -->
						<div class="flex items-center gap-2">
							{#if accessLevel}
								<span class="text-card-foreground/70 text-sm font-medium uppercase"
									>{accessLevel.name}</span>
								<div class={accessLevel.color}>
									<IconComponent class="size-5" />
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<!-- ============================================================================ -->
<!-- MAIN UI - SIMPLIFIED STATIC/ANIMATED MODE
<!-- ============================================================================ -->

<!-- 
SIMPLE TOGGLE: Change 'staticDesignMode' to 'true' on line ~375 to see all steps without animations
Perfect for design work - shows access levels, share setup, notification, and team grid
-->

{#if staticDesignMode}
	<!-- STATIC DESIGN MODE - All steps visible with full data -->
	<div class="relative flex flex-col w-full pl-12 space-y-12">
		<!-- STEP 1: Share Setup -->
		<div class="space-y-4">
			<div class="absolute top-0 left-0 z-10">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconShare class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Share Project</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Share configuration completed
					</span>
				</div>
			</div>

			{@render accessLevelsDisplay(accessLevels, accessLevels.find((l) => l.id === "guest") || null)}
			{@render animatedTextBubble({
				header: "Guest Email • Project Sharing",
				text: "alex@client-corp.com",
			})}
			{@render textBubble({
				header: "Share Link • Generated",
				text: "Guest access link created and sent to alex@client-corp.com",
			})}
		</div>

		<!-- STEP 2: Invite Notification -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 32rem;">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconBell class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Send Invitation</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Invitation sent successfully
					</span>
				</div>
			</div>

			{@render invitationNotification(true, "Optimal Research Group - Project 1", "Sarah Chen")}
		</div>

		<!-- STEP 3: Team Access -->
		<div class="space-y-4">
			<div class="absolute left-0 z-10" style="top: 46rem;">
				<div
					class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg">
					<IconUsers class="size-4" />
				</div>
			</div>

			<div class="mb-4 space-y-3">
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Team Access</h3>
				<div class="text-foreground text-sm leading-relaxed">
					<span class="text-primary flex items-center gap-2 mb-2 font-medium">
						<div class="size-2 flex-shrink-0 bg-green-500 rounded-full shadow-lg"></div>
						Access permissions updated
					</span>
				</div>
			</div>

			{@render teamMembersGrid(teamMembers, "alex")}
		</div>
	</div>
{:else}
	<!-- ANIMATED MODE - Standard step-by-step animation -->
	<div class="relative flex flex-col w-full pl-12 space-y-4">
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

				{#if isLoading || animationState.isComplete}
					{#if currentStep.id === "share-setup"}
						{#if animationState.accessLevels.length > 0}
							{@render accessLevelsDisplay(animationState.accessLevels, animationState.selectedLevel)}
						{/if}

						{#if animationState.shareAction.email}
							{@render animatedTextBubble({
								header: "Guest Email • Project Sharing",
								text: animationState.shareAction.email,
								showDot: animationState.shareAction.status === "typing",
							})}
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
