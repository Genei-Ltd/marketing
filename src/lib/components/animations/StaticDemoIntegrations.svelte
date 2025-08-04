<script lang="ts">
	import { IconCheck } from "@tabler/icons-svelte"
	import { onMount } from "svelte"

	// ============================================================================
	// DATA CONFIGURATION - SLIDING WINDOW INTEGRATIONS
	// ============================================================================

	type Integration = {
		id: string
		name: string
		logo: string
	}

	// All available integrations in one array
	const allIntegrations: Integration[] = [
		// Video & Meeting Platforms
		{ id: "zoom", name: "Zoom", logo: "/integrations/zoom.png" },
		{ id: "teams", name: "Microsoft Teams", logo: "/integrations/teams.png" },
		{ id: "google-meet", name: "Google Meet", logo: "/integrations/google-meet.png" },
		{ id: "discuss", name: "Discuss.io", logo: "/integrations/discuss.png" },

		// Transcription & Translation Services
		{ id: "otter", name: "Otter.ai", logo: "/integrations/otter.png" },
		{ id: "rev", name: "Rev.com", logo: "/integrations/rev.png" },
		{ id: "yazi", name: "Yazi", logo: "/integrations/yazi.png" },

		// Research & Storage Tools
		{ id: "user-testing", name: "UserTesting", logo: "/integrations/user-testing.png" },
		{ id: "qualzy", name: "Qualzy", logo: "/integrations/qualzy.png" },
		{ id: "recollective", name: "Recollective", logo: "/integrations/recollective.png" },
		{ id: "onedrive", name: "OneDrive", logo: "/integrations/onedrive.png" },
		{ id: "sharepoint", name: "SharePoint", logo: "/integrations/sharepoint.png" },
		{ id: "field-notes", name: "Field Notes", logo: "/integrations/field-notes.png" },
		{ id: "capvision", name: "Capvision", logo: "/integrations/capvision.png" },
		{ id: "incling", name: "Incling", logo: "/integrations/incling.png" },
	]

	// Configuration
	const WINDOW_SIZE = 12 // Number of cards to display
	const TRANSITION_INTERVAL = 3000 // Time between window shifts in ms
	const FLIP_DURATION = 1000 // Duration of flip animation in ms

	// Reactive state
	let currentWindow = $state(allIntegrations.slice(0, WINDOW_SIZE))
	let flippingCards = $state<Set<number>>(new Set())
	let nextWindowIntegrations = $state<Map<number, Integration>>(new Map())

	// Sliding window logic
	onMount(() => {
		const startWindowTransition = () => {
			setTimeout(() => {
				shiftWindow()
				startWindowTransition() // Schedule next transition
			}, TRANSITION_INTERVAL)
		}

		// Start the sliding window after initial load
		setTimeout(startWindowTransition, 2000)
	})

	function shiftWindow() {
		// Pick a random position to change (0 to WINDOW_SIZE-1)
		const randomPosition = Math.floor(Math.random() * WINDOW_SIZE)

		// Find the next integration that's not currently visible
		const currentIds = new Set(currentWindow.map((integration) => integration.id))
		const availableIntegrations = allIntegrations.filter((integration) => !currentIds.has(integration.id))

		if (availableIntegrations.length === 0) return // No more integrations to show

		// Pick a random available integration
		const nextIntegration = availableIntegrations[Math.floor(Math.random() * availableIntegrations.length)]

		// Set the back face content for the random position
		nextWindowIntegrations.set(randomPosition, nextIntegration)

		// Start flip animation only for this position
		flippingCards.add(randomPosition)

		// Change content at the midpoint of the animation (when card is edge-on)
		setTimeout(() => {
			// Update the current window
			const newWindow = [...currentWindow]
			newWindow[randomPosition] = nextIntegration
			currentWindow = newWindow
		}, FLIP_DURATION / 2)

		// Clean up after the full animation completes
		setTimeout(() => {
			nextWindowIntegrations.clear()
			flippingCards.clear()
		}, FLIP_DURATION)
	}
</script>

<div class="p- h-full w-full flex mx-auto self-center flex-col items-center justify-center">
	<div class="grid w-full h-full max-w-4xl grid-cols-3 gap-4">
		{#each currentWindow as integration, index (integration.id)}
			{@const backIntegration = nextWindowIntegrations.get(index) || integration}
			<div class="group h-full w-full [perspective:1000px] hover:scale-105 transition-transform duration-300">
				<div
					class="relative h-full w-full min-h-max [transform-style:preserve-3d] {flippingCards.has(index)
						? 'card-flip'
						: ''}">
					<!-- Front of card -->
					<div class="absolute h-full w-full [backface-visibility:hidden]">
						<div
							class="group card max-h-24 relative flex flex-col items-center justify-between w-full h-full p-2 transition-all duration-300">
							<!-- Connected status indicator -->
							<div class="-top-2 -right-2 absolute">
								<div
									class="size-4 ring-2 ring-background bg-secondary flex items-center justify-center rounded-full shadow-lg">
									<IconCheck class="size-3.5 text-secondary-foreground" />
								</div>
							</div>

							<!-- Logo -->
							<img
								src={integration.logo}
								alt={integration.name}
								class="max-h-12 object-contain w-24 h-12" />

							<!-- Name -->
							<div class="text-secondary-foreground text-sm font-medium leading-tight text-center">
								{integration.name}
							</div>
						</div>
					</div>

					<!-- Back of card (shows new integration during flip) -->
					<div class="absolute h-full w-full [backface-visibility:hidden] [transform:rotateX(180deg)]">
						<div
							class="group card max-h-24 relative flex flex-col items-center justify-between w-full h-full p-2 transition-all duration-300">
							<!-- Connected status indicator -->
							<div class="-top-2 -right-2 absolute">
								<div
									class="size-4 ring-2 ring-background bg-secondary flex items-center justify-center rounded-full shadow-lg">
									<IconCheck class="size-3.5 text-secondary-foreground" />
								</div>
							</div>

							<!-- Logo -->
							<img
								src={backIntegration.logo}
								alt={backIntegration.name}
								class="max-h-12 object-contain w-24 h-12" />

							<!-- Name -->
							<div class="text-secondary-foreground text-sm font-medium leading-tight text-center">
								{backIntegration.name}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="flex flex-row items-center justify-center w-full mt-4">
		<div class="text-secondary text-sm font-semibold leading-tight text-center">+ More</div>
	</div>
</div>

<style>
	.card-flip {
		animation: flip-x 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes flip-x {
		0% {
			transform: rotateX(0deg);
		}
		20% {
			transform: rotateX(90deg);
		}
		100% {
			transform: rotateX(180deg);
		}
	}
</style>
