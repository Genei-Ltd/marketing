<script lang="ts">
	import { IconCalendarEvent } from "@tabler/icons-svelte"

	import { Button } from "$lib/components/ui/button"

	import TestimonialCard from "../blocks/TestimonialCard.svelte"

	// Button click handler
	// function handleBookDemo() {
	//   window.open("https://cal.com/coloop/demo", "_blank", "noopener,noreferrer")
	// }
	import { page } from "$app/state"
</script>

<div class="group relative grid justify-center grid-cols-2 gap-8">
	<div class="flex flex-col items-start justify-start gap-6 pr-16 mt-16 text-left">
		<h2 class="font-serif font-semibold">See CoLoop in action</h2>
		<p class=" opacity-60">
			Book a personalized demo to discover how CoLoop can accelerate your research and insights workflow.
		</p>
		<Button size="lg" variant="default" aria-label="Book a demo" href="/demo">
			<IconCalendarEvent class="size-4" />
			Book demo
		</Button>
	</div>

	<div class="min-h-96 h-full">
		<TestimonialCard testimonial={page.data.ctaTestimonial[0]} size="scale" />
	</div>
</div>
