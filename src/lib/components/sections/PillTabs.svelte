<script lang="ts" module>
	import { onMount, onDestroy } from "svelte"

	import TwoSide from "$components/layouts/TwoSplit.svelte"
	import * as Tabs from "$lib/components/ui/tabs"
	import { cn } from "$lib/utils"

	export interface PillTabsProps {
		defaultValue?: string
		autoProgressInterval?: number
		className?: string
	}
</script>

<!-- Pill Title	Title	Description	CTA
In-House Strategy Teams	In-House Strategy Teams	Move from insight to influence, unblock teams and become a critical asset to your company.	Solutions for in-house strategy teams
Concept & Stimulus Testing	Concept & Stimulus Testing	Test messages, concepts and products with machine precision and human empathy.	Solutions for product, message & concept testing
Survey Analysis	Survey Analysis	Generate nuanced, actionable analysis from survey open ends with human level accuracy in minutes not days.	Solutions for analysing surveys
Research Agencies	Research Agencies	Cut manual effort, messy tool stacks and deliver unique strategic change to clients.	Solutions for research agencies & consultancies -->
<script lang="ts">
	let { defaultValue = "in-house-counsel", autoProgressInterval = 3000, className }: PillTabsProps = $props()

	const options = [
		{
			id: "in-house-strategy-teams",
			label: "In-House Strategy Teams",
		},
		{
			id: "concept-stimulus-testing",
			label: "Concept & Stimulus Testing",
		},
		{
			id: "survey-analysis",
			label: "Survey Analysis",
		},
		{
			id: "research-agencies",
			label: "Research Agencies",
		},
	]

	let activeValue = $state(defaultValue)
	let isAutoProgressing = $state(true)
	let intervalId: number | null = null
	let resetTimeoutId: number | null = null

	function startAutoProgression() {
		if (!isAutoProgressing || options.length <= 1) return

		intervalId = setInterval(() => {
			if (isAutoProgressing) {
				const currentIndex = options.findIndex((opt) => opt.id === activeValue)
				const nextIndex = (currentIndex + 1) % options.length
				activeValue = options[nextIndex].id
			}
		}, autoProgressInterval)
	}

	function stopAutoProgression() {
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
		isAutoProgressing = false
	}

	function restartAutoProgression() {
		isAutoProgressing = true
		startAutoProgression()
	}

	function handleTabChange(value: string) {
		stopAutoProgression()
		activeValue = value
	}

	function handleTabHover(value: string) {
		stopAutoProgression()
		activeValue = value

		// Clear any existing reset timeout
		if (resetTimeoutId) {
			clearTimeout(resetTimeoutId)
		}

		// Set a new timeout to restart auto-progression after 10 seconds
		resetTimeoutId = setTimeout(() => {
			restartAutoProgression()
		}, 10000)
	}

	function handleContentHover() {
		stopAutoProgression()

		// Clear any existing reset timeout
		if (resetTimeoutId) {
			clearTimeout(resetTimeoutId)
		}

		// Set a new timeout to restart auto-progression after 10 seconds
		resetTimeoutId = setTimeout(() => {
			restartAutoProgression()
		}, 10000)
	}

	function handleContentLeave() {
		// Clear any existing reset timeout
		if (resetTimeoutId) {
			clearTimeout(resetTimeoutId)
		}

		// Restart auto-progression immediately
		restartAutoProgression()
	}

	onMount(() => {
		startAutoProgression()
	})

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId)
		}
		if (resetTimeoutId) {
			clearTimeout(resetTimeoutId)
		}
	})
</script>

{#snippet inHouseCounselContent()}
	<TwoSide
		label="In-House Strategy Teams"
		heading="Solutions for in-house strategy teams"
		description="Move from insight to influence, unblock teams and become a critical asset to your company."
		buttonText="Solutions for in-house strategy teams"
		buttonHref="/demo">
		<div class="flex items-center justify-center">
			<img src="/images/features/concept.gif" alt="In-House Strategy Teams" class="h-auto max-w-full" />
		</div>
	</TwoSide>
{/snippet}

{#snippet innovationTeamsContent()}
	<TwoSide
		label="Concept & Stimulus Testing"
		heading="Solutions for product, message & concept testing"
		description="Test messages, concepts and products with machine precision and human empathy."
		buttonText="Solutions for product, message & concept testing"
		buttonHref="/demo">
		<div class="flex items-center justify-center">
			<img src="/images/features/image.png" alt="Concept & Stimulus Testing" class="h-auto max-w-full" />
		</div>
	</TwoSide>
{/snippet}

{#snippet transactionalWorkContent()}
	<TwoSide
		label="Survey Analysis"
		heading="Solutions for analysing surveys"
		description="Generate nuanced, actionable analysis from survey open ends with human level accuracy in minutes not days."
		buttonText="Solutions for analysing surveys"
		buttonHref="/demo">
		<div class="flex items-center justify-center">
			<img src="/images/features/steal.png" alt="Survey Analysis" class="h-auto max-w-full" />
		</div>
	</TwoSide>
{/snippet}

{#snippet litigationWorkContent()}
	<TwoSide
		label="Research Agencies"
		heading="Solutions for research agencies & consultancies"
		description="Cut manual effort, messy tool stacks and deliver unique strategic change to clients."
		buttonText="Solutions for research agencies & consultancies"
		buttonHref="/demo">
		<div class="flex items-center justify-center">
			<img src="/images/features/test.png" alt="Research Agencies" class="h-auto max-w-full" />
		</div>
	</TwoSide>
{/snippet}

<div class={cn("space-y-6", className)}>
	<Tabs.Root value={activeValue} onValueChange={handleTabChange}>
		<!-- Custom Pills List -->
		<div class="flex flex-row items-center justify-center w-2/3 gap-8 mx-auto">
			{#each options as option}
				<div role="button" onmouseenter={() => handleTabHover(option.id)} tabindex="-1">
					<Tabs.Trigger
						value={option.id}
						class="data-[state=active]:bg-card  data-[state=active]:text-card-foreground data-[state=active]:border-border data-[state=inactive]:text-foreground data-[state=inactive]:border-border hover:bg-muted focus-visible:ring-ring/50 relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:opacity-50 data-[state=inactive]:bg-transparent">
						{#if option.id === activeValue && autoProgressInterval}
							<div class="progress-bar opacity-40 inset-0 pointer-events-none" aria-hidden="true"></div>
						{/if}
						<span class="relative z-10">{option.label}</span>
					</Tabs.Trigger>
				</div>
			{/each}
		</div>

		<!-- Tab Content -->
		<Tabs.Content value="in-house-strategy-teams" class="mt-6">
			<div
				role="tabpanel"
				tabindex="-1"
				onmouseenter={() => handleContentHover()}
				onmouseleave={handleContentLeave}>
				{@render inHouseCounselContent()}
			</div>
		</Tabs.Content>

		<Tabs.Content value="concept-stimulus-testing" class="mt-6">
			<div
				role="tabpanel"
				tabindex="-1"
				onmouseenter={() => handleContentHover()}
				onmouseleave={handleContentLeave}>
				{@render innovationTeamsContent()}
			</div>
		</Tabs.Content>

		<Tabs.Content value="survey-analysis" class="mt-6">
			<div
				role="tabpanel"
				tabindex="-1"
				onmouseenter={() => handleContentHover()}
				onmouseleave={handleContentLeave}>
				{@render transactionalWorkContent()}
			</div>
		</Tabs.Content>

		<Tabs.Content value="research-agencies" class="mt-6">
			<div
				role="tabpanel"
				tabindex="-1"
				onmouseenter={() => handleContentHover()}
				onmouseleave={handleContentLeave}>
				{@render litigationWorkContent()}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.progress-bar {
		animation: progress 4s linear 0s alternate;
		background: linear-gradient(to right, #000000, #000000);
		position: absolute;
		z-index: 0;
		height: 100%;
	}

	@keyframes progress {
		0% {
			width: 0%;
		}
		100% {
			width: 100%;
		}
	}
</style>
