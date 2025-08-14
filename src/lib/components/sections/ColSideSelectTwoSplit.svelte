<script lang="ts">
	import DemoConceptTesting from "$lib/components/animations/DemoConceptTesting.svelte"
	import DemoInterviewAnalysis from "$lib/components/animations/DemoInterviewAnalysis.svelte"
	import DemoTranslation from "$lib/components/animations/DemoTranslation.svelte"
	import { fly } from "svelte/transition"

	import { cn } from "$lib/utils.js"
	import WildAnimationBox from "../../../routes/WildAnimationBox.svelte"
	import DemoWorkflow from "$components/animations/DemoWorkflow.svelte"

	// Define the features data structure
	const features = [
		{
			id: "concept-testing",
			title: "Open Ends",
			description:
				"Quickly understand target audiences perception, and uncover what resonates. Never miss or mix up another concept with CoLoop's automatic keyword labelling.",
			demo: ConceptTesting,
			image: "/water/blue-1.png",
			bgColor: "bg-accent-1",
		},
		{
			id: "customer-experience",
			title: "Qualitative",
			description:
				"Analyze open-ended feedback to reveal customer sentiment. CoLoop enables scalable CX analysis to improve customer journeys and retention.",
			demo: InterviewAnalysis,
			image: "/water/green-1.png",
			bgColor: "bg-accent-2",
		},
		{
			id: "competitor-analysis",
			title: "Concept & Message Testing",
			description:
				"Unlock the competitive edge with deeper insights into unmet needs, differentiators and white space opportunities.",
			demo: Workflow,
			image: "/water/blue-3.png",
			bgColor: "bg-accent-3",
		},
		{
			id: "market-research",
			title: "Agentic Chat",
			description:
				"Uncover market trends, customer needs, and market opportunities with comprehensive market research.",
			demo: Translation,
			image: "/water/tan-1.png",
			bgColor: "bg-accent-4",
		},
	]

	let activeFeature = $state(features[0])
</script>

{#snippet ConceptTesting()}
	<DemoConceptTesting />
{/snippet}

{#snippet InterviewAnalysis()}
	<DemoInterviewAnalysis />
{/snippet}

{#snippet Translation()}
	<DemoTranslation />
{/snippet}

{#snippet Workflow()}
	<DemoWorkflow />
{/snippet}

<div class="lg:grid-cols-2 grid items-start w-full h-full grid-cols-1 gap-4">
	<!-- Left side - Feature options -->
	<div class="lg:grid-cols-1 aspect-square grid justify-between w-full h-full max-h-full grid-cols-2 gap-4">
		{#each features as feature}
			<div
				class={cn(
					"flex flex-1 h-full cursor-pointer flex-col w-full lg:h-full justify-between rounded p-4 transition-all duration-300 overflow-hidden text-ellipsis line-clamp-2",
					activeFeature.id === feature.id
						? "text-card-foreground shadow bg-secondary border-primary"
						: "bg-card",
				)}
				onmouseenter={() => (activeFeature = feature)}
				role="button"
				tabindex="0">
				<h3 class=" mb-1 overflow-hidden text-lg font-medium capitalize transition-all">
					{feature.title}
				</h3>
				<p
					class=" text-balance text-sm h-full line-clamp-2 transition-all overflow-hidden {activeFeature.id ===
					feature.id
						? 'text-secondary-foreground'
						: 'text-primary/80'}">
					{feature.description}
				</p>
			</div>
		{/each}
	</div>

	<!-- Right side - Content display -->
	<div class="lg:sticky lg:top-8 aspect-square w-full h-full overflow-hidden rounded">
		<div
			class="relative flex h-full w-full rounded transition-all duration-300 {activeFeature.bgColor}  aspect-square overflow-hidden">
			<!-- Regular layout with image -->
			<div class="aspect-square w-full h-full overflow-hidden">
				<WildAnimationBox backgroundColor={activeFeature.bgColor}>
					{@render activeFeature.demo?.()}
				</WildAnimationBox>
			</div>
		</div>
	</div>
</div>
