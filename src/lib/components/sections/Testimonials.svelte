<script lang="ts">
  import type { Testimonial } from "$lib/server/connectors/notion-testimonials"
  import TestimonialCard from "../blocks/TestimonialCard.svelte"

  interface Props {
    testimonials: Testimonial[]
    title?: string
    subtitle?: string
  }

  let { testimonials }: Props = $props()

  // Split testimonials into featured (first 2) and regular (next 3)
  let featuredTestimonials = $derived(testimonials.slice(0, 2))
  let regularTestimonials = $derived(testimonials.slice(2, 5))

  console.log("testimonials", testimonials)
  console.log("featuredTestimonials", featuredTestimonials)
  console.log("regularTestimonials", regularTestimonials)
</script>

<!-- Testimonials Grid -->
<div class="flex flex-col gap-8">
  <!-- Top Row: 2 Larger Testimonials -->
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
    {#each featuredTestimonials as testimonial (testimonial.id)}
      <div class="h-full">
        <TestimonialCard {testimonial} size="xl" />
      </div>
    {/each}
  </div>

  <!-- Bottom Row: 3 Smaller Testimonials -->
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
    {#each regularTestimonials as testimonial (testimonial.id)}
      <div class="h-full">
        <TestimonialCard {testimonial} size="sm" />
      </div>
    {/each}
  </div>
</div>
