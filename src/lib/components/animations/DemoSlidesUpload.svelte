<!-- 
SLIDES VISUAL ABSTRACTION ANIMATION
A visual abstraction representing document/slide management workflow with file folder metaphor.

Design principles learned from user requirements:
- Visual abstraction that represents UI elements conceptually rather than literally
- GIF-like smooth looping animation with seamless transitions
- File folder metaphor showing document organization and management
- Clean, modern interface with proper visual hierarchy
- Scalable design that works in any square container
- Professional appearance suitable for business presentations
- Accessible color scheme with proper contrast as defined in app.css
- Uses established AnimationController pattern for smooth, cancellable animations

Animation Flow:
1. Display file folder with document count indicator
2. Animate folder opening to reveal organized slides/documents
3. Show document preview with metadata (updated date, file count, query count)
4. Smooth transitions between states with proper timing
5. Loop seamlessly back to initial state

Technical Implementation:
- Uses Svelte 5 runes for reactive state management
- Tailwind CSS for styling with semantic design tokens
- Tabler icons for consistent iconography
- Follows established animation patterns from other demo components
- Implements proper cleanup and cancellation handling
-->

<script lang="ts">
	import { onMount } from "svelte"
	import { fly, scale } from "svelte/transition"
	import { quintOut } from "svelte/easing"
	import { IconFolder, IconFile, IconSearch, IconCalendar } from "@tabler/icons-svelte"

	// ============================================================================
	// ANIMATION CONTROLLER
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
	// DATA & STATE
	// ============================================================================

	const controller = new AnimationController()

	// Animation states
	let showFolder = $state(true)
	let showContent = $state(false)
	let showDetails = $state(false)
	let folderOpen = $state(false)
	let fileCount = $state(0)
	let queryCount = $state(0)

	// Document data
	const documents = [
		{ name: "Concept Analysis", type: "pdf", size: "2.4MB" },
		{ name: "Survey Results", type: "xlsx", size: "1.8MB" },
		{ name: "User Feedback", type: "doc", size: "856KB" },
		{ name: "Market Research", type: "pptx", size: "3.2MB" },
	]

	// ============================================================================
	// ANIMATION SEQUENCE
	// ============================================================================

	async function runAnimation() {
		try {
			await controller.execute(async (ctrl) => {
				// Reset state
				showFolder = true
				showContent = false
				showDetails = false
				folderOpen = false
				fileCount = 0
				queryCount = 0

				await ctrl.delay(500)

				// Phase 1: Open folder
				folderOpen = true
				await ctrl.delay(800)

				// Phase 2: Show content
				showContent = true
				await ctrl.delay(600)

				// Phase 3: Animate counters
				for (let i = 0; i <= 102; i += 8) {
					if (ctrl.signal.aborted) break
					fileCount = Math.min(i, 102)
					await ctrl.delay(30)
				}

				await ctrl.delay(200)

				for (let i = 0; i <= 25; i += 2) {
					if (ctrl.signal.aborted) break
					queryCount = Math.min(i, 25)
					await ctrl.delay(50)
				}

				// Phase 4: Show details
				await ctrl.delay(400)
				showDetails = true

				// Phase 5: Hold final state
				await ctrl.delay(2000)

				// Phase 6: Reset for loop
				showDetails = false
				await ctrl.delay(300)
				showContent = false
				await ctrl.delay(300)
				folderOpen = false
				await ctrl.delay(500)
			})

			// Restart animation
			if (controller.state === "completed") {
				setTimeout(runAnimation, 1000)
			}
		} catch (err) {
			if (!controller.signal.aborted) {
				console.error("Animation error:", err)
			}
		}
	}

	// ============================================================================
	// LIFECYCLE
	// ============================================================================

	onMount(() => {
		runAnimation()

		return () => {
			controller.cancel()
		}
	})
</script>

<!-- Main container with proper aspect ratio -->
<div class="relative w-full aspect-square bg-background border border-border rounded-lg overflow-hidden">
	<!-- Folder icon and initial state -->
	{#if showFolder}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="relative">
				<!-- Folder icon with animation -->
				<div
					class="transition-transform duration-700 ease-out"
					class:rotate-12={folderOpen}
					class:scale-110={folderOpen}>
					<IconFolder size={120} class="text-accent-1 drop-shadow-sm {!folderOpen ? 'animate-pulse' : ''}" />
				</div>

				<!-- Folder label -->
				<div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
					<div class="bg-card px-3 py-1 rounded-md border border-border shadow-sm">
						<span class="text-sm font-medium text-card-foreground">Commercial Contracts</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Content preview when folder opens -->
	{#if showContent}
		<div
			class="absolute inset-4 bg-card rounded-lg border border-border shadow-lg"
			in:scale={{ duration: 600, easing: quintOut }}>
			<!-- Header -->
			<div class="p-4 border-b border-border">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-card-foreground">Commercial Contracts</h3>
					<div class="flex items-center gap-2 text-muted-foreground text-sm">
						<IconCalendar size={16} />
						<span>Updated Jul 20</span>
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="p-4 space-y-3">
				<div class="flex items-center gap-3">
					<IconFile size={20} class="text-accent-2" />
					<span class="text-sm text-card-foreground">
						<span class="font-semibold">{fileCount}</span> Files
					</span>
				</div>

				<div class="flex items-center gap-3">
					<IconSearch size={20} class="text-accent-3" />
					<span class="text-sm text-card-foreground">
						<span class="font-semibold">{queryCount}</span> Queries
					</span>
				</div>
			</div>

			<!-- Document preview -->
			{#if showDetails}
				<div class="px-4 pb-4" in:fly={{ y: 20, duration: 400, easing: quintOut }}>
					<div class="bg-muted rounded-lg p-3 space-y-2">
						{#each documents as doc, i}
							<div
								class="flex items-center justify-between py-2 px-3 bg-background rounded-md"
								in:fly={{ x: -20, duration: 300, delay: i * 100, easing: quintOut }}>
								<div class="flex items-center gap-2">
									<IconFile size={16} class="text-muted-foreground" />
									<span class="text-sm font-medium text-foreground">{doc.name}</span>
								</div>
								<span class="text-xs text-muted-foreground">{doc.size}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
