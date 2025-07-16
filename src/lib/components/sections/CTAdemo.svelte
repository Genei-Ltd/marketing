<script lang="ts">
  import { IconCalendarEvent } from "@tabler/icons-svelte"
  import { Button } from "$lib/components/ui/button"
  import { page } from "$app/state"
  import TestimonialCard from "../blocks/TestimonialCard.svelte"
  // Button click handler
  // function handleBookDemo() {
  //   window.open("https://cal.com/coloop/demo", "_blank", "noopener,noreferrer")
  // }
</script>

<div
  class="bg-primary group text-primary-foreground relative grid grid-cols-2 justify-center gap-8 p-16"
>
  <!-- <img
    src="/images/amethyst-6.png"
    alt="CTA"
    class="absolute inset-0 z-10 object-cover w-full h-full transition-all duration-300 opacity-20 group-hover:opacity-100"
  /> -->

  <div class="z-20 flex flex-col items-center justify-center gap-6 text-center">
    <h2 class="font-serif text-4xl font-semibold">See CoLoop in action</h2>
    <p class="max-w-3xl text-lg opacity-80">
      Book a personalized demo to discover how CoLoop can accelerate your
      research and insights workflow.
    </p>
    <Button size="lg" variant="secondary" aria-label="Book a demo" href="/demo">
      <IconCalendarEvent class="size-4" />
      Book a demo
    </Button>
  </div>
  <div class="h-full min-h-96 shadow-lg">
    <TestimonialCard testimonial={page.data.ctaTestimonial[0]} size="scale" />
  </div>
</div>
