<script lang="ts">
	import { fly } from "svelte/transition"

	import { cn } from "$lib/utils.js"

	// Define the features data structure
	const features = [
		{
			id: "concept-testing",
			title: "Concept and message testing",
			description:
				"Quickly understand target audiences perception, and uncover what resonates. Never miss or mix up another concept with CoLoop's automatic keyword labelling.",
			image: "/images/features/concept.gif",
			bgColor: "bg-accent-1",
		},
		{
			id: "customer-experience",
			title: "Customer experience",
			description:
				"Analyze open-ended feedback to reveal customer sentiment. CoLoop enables scalable CX analysis to improve customer journeys and retention.",
			image: "/images/features/steal.png",
			bgColor: "bg-accent-2",
		},
		{
			id: "competitor-analysis",
			title: "Competitor analysis",
			description:
				"Unlock the competitive edge with deeper insights into unmet needs, differentiators and white space opportunities.",
			image: "/images/features/image.png",
			bgColor: "bg-accent-3",
		},
		{
			id: "market-research",
			title: "Market research",
			description:
				"Uncover market trends, customer needs, and market opportunities with comprehensive market research.",
			image: "/images/features/market.png",
			bgColor: "bg-accent-4",
		},
	]

	let activeFeature = $state(features[0])
</script>

<div class="lg:grid-cols-2 grid items-start grid-cols-1 gap-4">
	<!-- Left side - Feature options -->
	<div class="space-y-4">
		{#each features as feature}
			<div
				class={cn(
					"flex min-h-[150px] cursor-pointer flex-col justify-between rounded  p-6 transition-all duration-300",
					activeFeature.id === feature.id ? "bg-secondary text-secondary-foreground" : "bg-card",
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
	<div class="lg:sticky lg:top-8 w-full h-full">
		<div class="relative flex h-full w-full rounded transition-all duration-300 {activeFeature.bgColor}">
			<!-- Regular layout with image -->
			<div class="flex items-center justify-center w-full h-full transition-all duration-300">
				<img
					in:fly={{ y: 40, duration: 350, opacity: 0.2 }}
					out:fly={{ y: -40, duration: 250, opacity: 0.2 }}
					src={activeFeature.image}
					alt={activeFeature.title}
					class="object-contain w-2/3" />
			</div>
		</div>
	</div>
</div>
