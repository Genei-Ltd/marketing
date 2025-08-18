<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js"
	import * as Carousel from "$lib/components/ui/carousel/index.js"
	import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
	import type { Testimonial } from "$lib/server/connectors/notion-testimonials"
	import { IconChevronLeft, IconChevronRight, IconQuote } from "@tabler/icons-svelte"
	import Autoplay from "embla-carousel-autoplay"
	import { fly } from "svelte/transition"

	let { testimonials }: { testimonials: Testimonial[] } = $props()

	let api: CarouselAPI | undefined = $state()
	const count = $derived(api ? api.scrollSnapList().length : 0)
	const dots = $derived(Array.from({ length: count }, (_, i) => i))
	let current = $state(0)

	// Autoplay progress state for current snap (CSS-driven for smoothness)
	let startMs = $state(0)
	let progressWidth = $state("0%")
	let progressTransition = $state("none")
	// Create a dedicated plugin instance so we can access its methods
	const autoplayPlugin = Autoplay({
		delay: 6000,
		jump: true,
		stopOnMouseEnter: false,
		stopOnInteraction: true,
	})

	$inspect(testimonials)

	$effect(() => {
		if (!api) return
		current = api.selectedScrollSnap()
		api.on("select", () => {
			current = api!.selectedScrollSnap()
		})
	})

	$effect(() => {
		const embla = api
		if (!embla) return

		function setToRemaining() {
			const remaining = autoplayPlugin.timeUntilNext() ?? 0
			if (startMs > 0) {
				const ratio = remaining != null ? 1 - remaining / startMs : 0
				const pct = Math.max(0, Math.min(100, ratio * 100))
				progressWidth = `${pct}%`
			}
		}

		function onTimeSet() {
			startMs = autoplayPlugin.timeUntilNext() ?? 0
			// reset to 0 immediately without transition
			progressTransition = "none"
			// progressWidth = "0%"
			if (startMs > 0) {
				// next frame: set transition and animate to 100%
				requestAnimationFrame(() => {
					progressTransition = `width ${startMs}ms linear`
					requestAnimationFrame(() => {
						progressWidth = "100%"
					})
				})
			}
		}

		function onTimerStopped() {
			// freeze at current position
			setToRemaining()
			progressTransition = "none"
		}

		function onStop() {
			setToRemaining()
			progressTransition = "none"
		}

		function onPlay() {
			onTimeSet()
		}

		function onSelect() {
			// Reset progress on new snap
			progressTransition = "none"
			progressWidth = "0%"
		}

		embla.on("autoplay:timerset", onTimeSet)
		embla.on("autoplay:timerstopped", onTimerStopped)
		embla.on("autoplay:stop", onStop)
		embla.on("autoplay:play", onPlay)
		embla.on("autoplay:select", onSelect)

		return () => {
			embla.off("autoplay:timerset", onTimeSet)
			embla.off("autoplay:timerstopped", onTimerStopped)
			embla.off("autoplay:stop", onStop)
			embla.off("autoplay:play", onPlay)
			embla.off("autoplay:select", onSelect)
		}
	})
</script>

<div class="lg:py-24 w-full h-full self-center">
	<!-- Controls -->

	<div class="text-muted-foreground mt-8 text-sm flex flex-row justify-between w-full items-center">
		<!-- Dots -->
		<div class="text-muted-foreground py-2 text-sm text-center w-full">
			<div class="flex items-center justify-start gap-2 py-2 pl-1 w-full">
				{#each dots as i (i)}
					<span
						onclick={() => api?.scrollTo(i)}
						onkeydown={(e) => e.key === "Enter" && api?.scrollTo(i)}
						role="button"
						tabindex={i === current ? 0 : -1}
						aria-current={i === current}
						class={`relative overflow-hidden transition-all duration-300 ease-in-out rounded-full cursor-pointer ${i === current ? "bg-muted border border-muted w-8 h-2 scale-110 shadow-lg" : "bg-muted w-2 h-2 scale-90"}`}
						style="transition-property: width, background, box-shadow, opacity, transform;">
						{#if i === current}
							<span class="absolute left-0 top-0 h-full bg-primary/60 w-full"></span>
							<span
								class="absolute left-0 top-0 h-full bg-secondary"
								style={`width: ${progressWidth}; transition: ${progressTransition};`}></span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
		<div class="flex items-center justify-end gap-2 py-2">
			<Button
				variant="outline"
				size="icon"
				aria-label="Previous testimonial"
				class="rounded-full mr-2"
				onclick={() => api?.scrollPrev()}
				disabled={count <= 1}>
				<IconChevronLeft class="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				aria-label="Next testimonial"
				class="rounded-full"
				onclick={() => api?.scrollNext()}
				disabled={count <= 1}>
				<IconChevronRight class="size-4" />
			</Button>
		</div>
	</div>

	<Carousel.Root
		opts={{
			loop: true,
			align: "center",
			containScroll: false,
		}}
		plugins={[autoplayPlugin]}
		setApi={(emblaApi) => (api = emblaApi)}
		class="w-full mx-auto h-full">
		<Carousel.Content class="flex">
			{#each testimonials as testimonial, index}
				<Carousel.Item class="" onclick={() => api?.scrollTo(index)}>
					<div class="grid grid-cols-3 w-full gap-4">
						<div
							class="relative col-span-2 h-full w-full overflow-hidden rounded lg:shadow-xl shadow-md select-none aspect-[16/11] transition-all duration-500 ease-in-out {index ===
							current
								? 'opacity-100 scale-100'
								: 'opacity-40 scale-[0.98]'}">
							<!-- Background gradient (original style) -->
							<div
								class="absolute inset-0 z-0 bg-gradient-to-t from-primary/90 via-primary/80 to-primary/70">
							</div>

							<div class="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-end">
								<div class="flex flex-col justify-end">
									<div class="flex flex-col justify-end">
										<IconQuote
											class="size-10 md:size-12 text-primary-foreground/30 -mb-2"
											stroke={1} />
										<blockquote
											class="text-primary-foreground line-clamp-6 md:line-clamp-5 font-serif text-lg md:text-xl">
											{testimonial.content}
										</blockquote>
										<div class="mt-6 text-primary-foreground/90 font-sans text-sm">
											<span class="block font-semibold">{testimonial.name}</span>
											<span class="opacity-80">{testimonial.role}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col-span-1 h-full relative">
							<div
								class="w-full h-full absolute object-cover border border-border/30 bg-primary/10 rounded overflow-hidden">
								<img
									src={"/images/base.png"}
									alt={"Background"}
									class="w-full h-full absolute object-cover" />
							</div>

							<!-- Gradient overlay over the image -->
							<div
								class="absolute h-full w-full inset-0 z-20 rounded bg-gradient-to-tr from-background via-background/20 to-transparent pointer-events-none">
							</div>

							<!-- Company logo or name centered -->
							<div
								class="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none h-full w-full">
								{#if testimonial.companyLogo}
									<img
										src={testimonial.companyLogo}
										alt={testimonial.company || "Company"}
										transition:fly={{ x: 100, duration: 1000 }}
										class="w-1/2 h-auto invert brightness-0 contrast-200 saturate-0 object-contain" />
								{:else if testimonial.company}
									<div class="text-white text-xl uppercase font-semibold tracking-tight">
										{testimonial.company}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
