<script lang="ts">
	import { page } from "$app/state"
	import TestimonialCard from "$components/blocks/TestimonialCard.svelte"
	import * as Card from "$lib/components/ui/card/index.js"
	import * as Carousel from "$lib/components/ui/carousel/index.js"
	import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
	import type { Testimonial as TestimonialType } from "$lib/server/connectors/notion-testimonials"

	let api = $state<CarouselAPI>()

	const count = $derived(api ? api.scrollSnapList().length : 0)
	let current = $state(0)

	$effect(() => {
		if (api) {
			current = api.selectedScrollSnap() + 1
			api.on("select", () => {
				current = api!.selectedScrollSnap() + 1
			})
		}
	})

	const { testimonials }: { testimonials: TestimonialType[] } = $props()
	console.log("testimonials :", testimonials)
</script>

<div class="md:py-24 bg-muted w-full py-16">
	<div class="md:py-24 bg-muted w-full py-16">
		<Carousel.Root
			opts={{
				loop: true,
				align: "center",
			}}
			setApi={(emblaApi) => (api = emblaApi)}
			class="max-w-6xl w-full mx-auto mask-l-from-90% mask-r-from-90%">
			<Carousel.Content class="flex">
				{#each testimonials as testimonial, i (i)}
					<Carousel.Item
						class="flex-[0_0_80%] md:flex-[0_0_70%] lg:flex-[0_0_60%] pl-4 shadow-2xl {i + 1 === current
							? 'opacity-100 '
							: 'opacity-20 '} transition-all duration-300 ease-in-out"
						onclick={() => api?.scrollTo(i)}>
						<div
							class=" relative z-20 aspect-[16/10] w-full overflow-hidden shadow-2xl grid h-full grid-cols-2 mx-8 rounded-xl">
							<img src={testimonial.avatar} alt="Testimonial 1" class=" object-cover w-full h-full" />
							<img src={testimonial.avatar} alt="Testimonial 1" class=" object-cover w-full h-full" />
							<!-- <TestimonialCard {testimonial} class="w-fusll h-full text-lg" size="sm" /> -->
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous class="" variant="secondary" />
			<Carousel.Next class="" variant="secondary" />
		</Carousel.Root>
		<div class="text-muted-foreground py-2 mt-8 text-sm text-center">
			<div class="flex items-center justify-center gap-2 py-2">
				{#each Array(count) as _, i (i)}
					<span
						onclick={() => api?.scrollTo(i)}
						role="button"
						tabindex={i + 1 === current ? 0 : -1}
						aria-current={i + 1 === current}
						class={`
						transition-all duration-300 ease-in-out rounded-full
						${i + 1 === current ? "bg-background w-8 h-2 scale-110 shadow-lg" : "bg-secondary w-2 h-2 scale-90 opacity-60"}
					`}
						style="transition-property: width, background, box-shadow, opacity, transform;"></span>
				{/each}
			</div>
		</div>
	</div>
</div>
