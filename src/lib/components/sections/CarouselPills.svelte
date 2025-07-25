<script lang="ts">
	import * as Carousel from "$lib/components/ui/carousel/index.js"
	import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
	import TwoSplit from "$components/layouts/TwoSplit.svelte"
	import DemoWorkflowAssetUpload from "$components/animations/DemoWorkflowAssetUpload.svelte"

	// Define the pill labels
	const pillLabels = [
		"In-House Strategy Teams",
		"Concept & Stimulus Testing",
		"Survey Analysis",
		"Research Agencies",
	]

	let api: CarouselAPI | undefined = $state()
	let current = $state(0)

	$effect(() => {
		if (!api) return

		current = api.selectedScrollSnap()
		api.on("select", () => {
			current = api!.selectedScrollSnap()
		})
	})

	// Handle keyboard events for accessibility
	const handleKeyDown = (event: KeyboardEvent, index: number) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			api?.scrollTo(index)
		}
	}
</script>

<div class="md:py-24 w-full py-16">
	<div class="text-muted-foreground w-full mb-8 text-sm text-center">
		<div class="flex flex-row items-center justify-center w-full max-w-3xl gap-4 py-2 mx-auto">
			{#each pillLabels as label, i (i)}
				<div
					onclick={() => api?.scrollTo(i)}
					onkeydown={(event) => handleKeyDown(event, i)}
					role="button"
					tabindex={i === current ? 0 : -1}
					aria-current={i === current}
					class={`
						truncate line-clamp-2 transition-all duration-300 cursor-pointer w-2/3 ease-in-out rounded-full p-2 px-4  border border-card hover:bg-card hover:text-card-foreground
						${i === current ? "w-full bg-card text-card-foreground " : " text-card"}
					`}>
					<span class=" relative z-10 text-sm">{label}</span>
				</div>
			{/each}
		</div>
	</div>
	<Carousel.Root
		opts={{
			loop: true,
			align: "center",
		}}
		setApi={(emblaApi) => (api = emblaApi)}
		class="max-w-7xl w-full mx-auto transition-all duration-500 ease-in-out">
		<Carousel.Content class="flex">
			<!-- Card 1: In-House Strategy Teams -->
			<Carousel.Item
				class="flex w-full max-w-7xl mx-auto {0 === current
					? 'opacity-100'
					: 'opacity-20'} transition-opacity  duration-300 ease-in-out"
				onclick={() => api?.scrollTo(0)}>
				<TwoSplit
					label="In-House Strategy Teams"
					heading="Solutions for in-house strategy teams"
					description="Move from insight to influence, unblock teams and become a critical asset to your company."
					buttonText="Solutions for in-house strategy teams"
					buttonHref="/blog/in-house-strategy-teams"
					showButton={true}
					reverse={false}>
					<div class="p-lg flex items-center justify-center">
						<!-- Add your custom component here instead of just an image -->
						<img
							src="/images/features/concept.gif"
							alt="In-House Strategy Teams"
							class="h-auto max-w-full" />
					</div>
				</TwoSplit>
			</Carousel.Item>

			<!-- Card 2: Concept & Stimulus Testing -->
			<Carousel.Item
				class="flex w-full max-w-7xl mx-auto {1 === current
					? 'opacity-100'
					: 'opacity-20'} transition-opacity  duration-300 ease-in-out"
				onclick={() => api?.scrollTo(1)}>
				<TwoSplit
					label="Concept & Stimulus Testing"
					heading="Solutions for product, message & concept testing"
					description="Test messages, concepts and products with machine precision and human empathy."
					buttonText="Solutions for product, message & concept testing"
					buttonHref="/blog/concept-stimulus-testing"
					showButton={true}
					reverse={false}>
					<div class="p-lg flex items-center justify-center">
						<!-- Add your custom component here instead of just an image -->
						<img
							src="/images/features/image.png"
							alt="Concept & Stimulus Testing"
							class="h-auto max-w-full" />
					</div>
				</TwoSplit>
			</Carousel.Item>

			<!-- Card 3: Survey Analysis -->
			<Carousel.Item
				class="flex w-full max-w-7xl mx-auto {2 === current
					? 'opacity-100'
					: 'opacity-20'} transition-opacity  duration-300 ease-in-out"
				onclick={() => api?.scrollTo(2)}>
				<TwoSplit
					label="Survey Analysis"
					heading="Solutions for analysing surveys"
					description="Generate nuanced, actionable analysis from survey open ends with human level accuracy in minutes not days."
					buttonText="Solutions for analysing surveys"
					buttonHref="/blog/survey-analysis"
					showButton={true}
					reverse={false}>
					<div class="p-lg flex items-center justify-center">
						<!-- Add your custom component here instead of just an image -->
						<img src="/images/features/steal.png" alt="Survey Analysis" class="h-auto max-w-full" />
					</div>
				</TwoSplit>
			</Carousel.Item>

			<!-- Card 4: Research Agencies -->
			<Carousel.Item
				class="flex w-full max-w-7xl mx-auto {3 === current
					? 'opacity-100'
					: 'opacity-20'} transition-opacity  duration-300 ease-in-out"
				onclick={() => api?.scrollTo(3)}>
				<TwoSplit
					label="Research Agencies"
					heading="Solutions for research agencies & consultancies"
					description="Cut manual effort, messy tool stacks and deliver unique strategic change to clients."
					buttonText="Solutions for research agencies & consultancies"
					buttonHref="/blog/research-agencies"
					showButton={true}
					reverse={false}>
					<div class="bg-accent-4 w-full h-full flex items-center justify-center relative">
						<img
							src="/images/water/tops.png"
							alt="Survey Analysis"
							class="inset-0 absolute w-full h-full object-cover opacity-50" />
						<div class="w-full pl-16 pt-16 h-full">
							<DemoWorkflowAssetUpload />
						</div>
					</div>
				</TwoSplit>
			</Carousel.Item>
		</Carousel.Content>
	</Carousel.Root>
</div>
