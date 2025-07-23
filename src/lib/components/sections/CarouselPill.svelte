<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js"
	import * as Carousel from "$lib/components/ui/carousel/index.js"
	import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
	import TwoSplit from "$components/layouts/TwoSplit.svelte"
	import type { Snippet } from "svelte"

	type SplitCard = {
		label?: string
		heading?: string
		description?: string
		buttonText?: string
		buttonHref?: string
		buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
		showButton?: boolean
		children?: Snippet
		clearBackground?: [boolean, boolean]
		reverse?: boolean
		backgroundImage?: string
	}

	const cards: SplitCard[] = [
		// 		Pill Title	Title	Description	CTA
		// In-House Strategy Teams	In-House Strategy Teams	Move from insight to influence, unblock teams and become a critical asset to your company.	Solutions for in-house strategy teams
		// Concept & Stimulus Testing	Concept & Stimulus Testing	Test messages, concepts and products with machine precision and human empathy.	Solutions for product, message & concept testing
		// Survey Analysis	Survey Analysis	Generate nuanced, actionable analysis from survey open ends with human level accuracy in minutes not days.	Solutions for analysing surveys
		// Research Agencies	Research Agencies	Cut manual effort, messy tool stacks and deliver unique strategic change to clients.	Solutions for research agencies & consultancies
		{
			label: "In-House Strategy Teams",
			heading: "Solutions for in-house strategy teams",
			description: "Move from insight to influence, unblock teams and become a critical asset to your company.",
			buttonText: "Solutions for in-house strategy teams",
			buttonHref: "/blog/in-house-strategy-teams",
			showButton: true,
			reverse: false,
			backgroundImage: "/images/features/concept.gif",
		},
		{
			label: "Concept & Stimulus Testing",
			heading: "Solutions for product, message & concept testing",
			description: "Test messages, concepts and products with machine precision and human empathy.",
			buttonText: "Solutions for product, message & concept testing",
			buttonHref: "/blog/concept-stimulus-testing",
			showButton: true,
			reverse: false,
			backgroundImage: "/images/features/image.png",
		},
		{
			label: "Survey Analysis",
			heading: "Solutions for analysing surveys",
			description:
				"Generate nuanced, actionable analysis from survey open ends with human level accuracy in minutes not days.",
			buttonText: "Solutions for analysing surveys",
			buttonHref: "/blog/survey-analysis",
			showButton: true,
			reverse: false,
			backgroundImage: "/images/features/steal.png",
		},
		{
			label: "Research Agencies",
			heading: "Solutions for research agencies & consultancies",
			description: "Cut manual effort, messy tool stacks and deliver unique strategic change to clients.",
			buttonText: "Solutions for research agencies & consultancies",
			buttonHref: "/blog/research-agencies",
			showButton: true,
			reverse: false,
			backgroundImage: "/images/features/test.png",
		},
	]

	let api: CarouselAPI | undefined = $state()
	const count = $derived(api ? api.scrollSnapList().length : 0)
	let current = $state(0)

	$effect(() => {
		if (!api) return

		current = api.selectedScrollSnap()
		api.on("select", () => {
			current = api!.selectedScrollSnap()
		})
	})
</script>

<div class="md:py-24 bg-muted w-full py-16">
	<div class="text-muted-foreground w-full py-2 mb-8 text-sm text-center">
		<div class="flex flex-row items-center justify-center w-full max-w-5xl gap-8 py-2 mx-auto">
			{#each Array(count) as _, i (i)}
				<span
					onclick={() => api?.scrollTo(i)}
					role="button"
					tabindex={i === current ? 0 : -1}
					aria-current={i === current}
					class={`
						transition-all duration-300 cursor-pointer w-full ease-in-out rounded-full p-2 px-4 border border-card
						${i === current ? " bg-card text-card-foreground " : "text-card"}
					`}
					style="transition-property: width, background, box-shadow, opacity, transform;">
					<span class=" relative z-10 text-sm">{cards[i].label}</span>
				</span>
			{/each}
		</div>
	</div>
	<Carousel.Root
		opts={{
			loop: true,
			align: "center",
		}}
		setApi={(emblaApi) => (api = emblaApi)}
		class="max-w-7xl w-full mx-auto mask-l-from-95% mask-r-from-95%">
		<Carousel.Content class="flex">
			{#each cards as card, index}
				<Carousel.Item
					class="flex w-full max-w-6xl mx-auto pl-4 {index === current
						? 'opacity-100'
						: 'opacity-20'} transition-opacity duration-300 ease-in-out"
					onclick={() => api?.scrollTo(index)}>
					<TwoSplit
						label={card.label}
						heading={card.heading}
						description={card.description}
						buttonText={card.buttonText}
						buttonHref={card.buttonHref}
						showButton={card.showButton}
						clearBackground={card.clearBackground}
						reverse={card.reverse}>
						<div class="p-lg flex items-center justify-center">
							<img src={card.backgroundImage} alt={card.label} class="h-auto max-w-full" />
						</div>
					</TwoSplit>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
