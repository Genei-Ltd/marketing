<script lang="ts">
  import type { Testimonial as TestimonialType } from "$lib/configs/testimonials"
  import { IconStar } from "@tabler/icons-svelte"
  import LoopingScroller from "./LoopingScroller.svelte"
  import Testimonial from "./Testimonial.svelte"

  interface Props {
    testimonials?: TestimonialType[];
    title?: string;
    subtitle?: string;
  }

  let { testimonials = [], title = "What our customers say", subtitle = "Don't just take our word for it" }: Props = $props();
</script>

<div class="gap-6 flex flex-col">
  <!-- Header -->
  <div class="text-center space-y-2">
    <h3 class="text-2xl font-bold text-gray-900">{title}</h3>
    <p class="text-gray-600">{subtitle}</p>
  </div>

  <LoopingScroller direction="horizontal">
    <!-- Testimonials Grid -->
    <div class="gap-4 flex-row flex">
      {#each testimonials as testimonial (testimonial.id)}
        <Testimonial {testimonial} />
      {/each}
    </div>
  </LoopingScroller>

  <!-- Trust Badge -->
  <div class="text-center pt-4">
    <div class="inline-flex items-center space-x-2 text-sm text-gray-500">
      <IconStar class="w-4 h-4 text-yellow-400 fill-current" />
      <span>Trusted by 1000+ teams worldwide</span>
    </div>
  </div>
</div>
