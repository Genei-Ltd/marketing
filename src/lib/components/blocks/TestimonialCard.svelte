<script lang="ts">
  import type { Testimonial as TestimonialType } from "$lib/server/connectors/notion-testimonials"

  type Props = {
    testimonial: TestimonialType
  }

  let { testimonial }: Props = $props()
</script>

<div
  class="bg-card text-card-foreground flex h-full overflow-hidden rounded p-12 transition-all duration-300 hover:shadow-lg"
>
  <div class="flex flex-1 flex-col justify-between">
    <!-- Quote Content -->
    <blockquote class="ellipsis mb-16 flex-1 pr-16 text-left font-serif">
      <h3 class="">"{testimonial.content}"</h3>
    </blockquote>

    <!-- Author Info -->
    <div class="flex h-16 w-full flex-0 flex-row items-end justify-between">
      {#if testimonial.avatar}
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          class="h-32 w-32 rounded-full object-cover grayscale"
        />
      {/if}
      <div class="flex flex-col">
        <div class="text-right font-bold opacity-80">
          {testimonial.name}
        </div>
        <div class="text-right text-sm font-semibold opacity-80">
          {testimonial.role}
          {#if testimonial.company}
            <span class="font-normal opacity-80">at</span>
            <span class="font-semibold opacity-80 hover:underline"
              ><a href={`https://${testimonial.companyDomain}`} target="_blank"
                >{testimonial.company}</a
              ></span
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
