<script lang="ts">
	import { fly } from "svelte/transition"

	import { cn } from "$lib/utils.js"
	import { conceptTestingDemo, demoInterviewAnalysis, demoTranslation } from "$lib/components/animations"
	import WildAnimationBox from "../../../routes/WildAnimationBox.svelte"
	// Define the features data structure
	const features = [
		{
			id: "concept-testing",
			title: "Open Ends",
			description:
				"Quickly understand target audiences perception, and uncover what resonates. Never miss or mix up another concept with CoLoop's automatic keyword labelling.",
			demo: conceptTestingDemo,
			image: "/water/blue-1.png",
			bgColor: "bg-accent-1",
		},
		{
			id: "customer-experience",
			title: "Qualitative",
			description:
				"Analyze open-ended feedback to reveal customer sentiment. CoLoop enables scalable CX analysis to improve customer journeys and retention.",
			demo: demoInterviewAnalysis,
			image: "/water/green-1.png",
			bgColor: "bg-accent-2",
		},
		{
			id: "competitor-analysis",
			title: "Concept & Message Testing",
			description:
				"Unlock the competitive edge with deeper insights into unmet needs, differentiators and white space opportunities.",
			demo: demoInterviewAnalysis,
			image: "/water/blue-3.png",
			bgColor: "bg-accent-3",
		},
		{
			id: "market-research",
			title: "Agentic Chat",
			description:
				"Uncover market trends, customer needs, and market opportunities with comprehensive market research.",
			demo: demoTranslation,
			image: "/water/tan-1.png",
			bgColor: "bg-accent-4",
		},
	]

	let activeFeature = $state(features[0])
</script>

<div class="lg:grid-cols-2 lg:h-156 grid items-start h-full grid-cols-1 gap-4">
	<!-- Left side - Feature options -->
	<div class="h-156 flex flex-col justify-between gap-4">
		{#each features as feature}
			<div
				class={cn(
					"flex h-full cursor-pointer flex-col justify-between rounded  p-4 transition-all duration-300",
					activeFeature.id === feature.id
						? "text-card-foreground shadow bg-secondary border-primary"
						: "bg-card",
				)}
				onmouseenter={() => (activeFeature = feature)}
				role="button"
				tabindex="0">
				<h3 class="mb-3 font-medium capitalize transition-all">
					{feature.title}
				</h3>
				<p
					class="pr-16 text-sm leading-relaxed transition-all {activeFeature.id === feature.id
						? 'text-secondary-foreground'
						: 'text-primary/80'}">
					{feature.description}
				</p>
			</div>
		{/each}
	</div>

	<!-- Right side - Content display -->
	<div class="lg:sticky lg:top-8 h-156 w-full overflow-hidden rounded">
		<div class="relative flex h-full w-full rounded transition-all duration-300 {activeFeature.bgColor}">
			<!-- Regular layout with image -->
			<div class="w-full h-full overflow-hidden">
				<WildAnimationBox backgroundImage={activeFeature.image}>
					{@render activeFeature.demo?.()}
				</WildAnimationBox>
			</div>
		</div>
	</div>
</div>
