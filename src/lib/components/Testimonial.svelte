<script lang="ts">
  import Card from "$components/ui/card/card.svelte"
  import type { Testimonial as TestimonialType } from "$lib/configs/testimonials"
  import { IconQuote, IconStar } from "@tabler/icons-svelte"

  interface Props {
    testimonial: TestimonialType;
    maxWidth?: string;
  }

  let { testimonial, maxWidth = "max-w-sm" }: Props = $props();

  // Generate initials for avatar fallback
  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Render stars for rating
  function renderStars(rating: number = 5): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating)
  }
</script>

<Card
  class="bg-card h-full rounded-sm overflow-hidden max-w-xs 3xl:max-w-xl flex-1 {maxWidth} flex flex-col border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
>
  <!-- Quote Icon -->
  <div class="flex justify-between items-start p-2 px-3 pb-0 flex-0">
    <IconQuote class="3xl:w-10 3xl:h-10 h-5 w-5 text-muted-foreground " />

    <!-- Rating Stars -->
    {#if testimonial.rating}
      <div class="flex items-center space-x-1 p-2">
        {#each renderStars(testimonial.rating) as filled}
          <IconStar
            class="3xl:w-6 3xl:h-6 h-3 w-3 {filled
              ? 'text-yellow-400 fill-current'
              : 'text-muted-foreground'}"
          />
        {/each}
      </div>
    {/if}
  </div>

  <!-- Quote Content -->
  <blockquote
    class="text-foreground 3xl:mb-8 leading-relaxed text-left px-4 flex-1 overflow-hidden line-clamp-4"
  >
    "{testimonial.content}"
  </blockquote>

  <!-- Author Info -->
  <div class="flex items-center gap-2 bg-secondary shrink-0 h-16 w-full flex-0">
    <!-- Avatar -->
    <div class="flex-0 h-16 w-16 flex items-center justify-center">
      {#if testimonial.avatar}
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          class="3xl:w-24 3xl:h-24 w-16 h-16 object-cover"
        />
      {:else}
        <div
          class="3xl:w-16 3xl:h-16 w-10 h-10 bg-secondary flex items-center justify-center"
        >
          <span class="text-2xl font-medium text-secondary-foreground">
            {getInitials(testimonial.name)}
          </span>
        </div>
      {/if}
    </div>

    <!-- Author Details -->
    <div class="flex-1 bg-secondary">
      <div
        class="text-lg 3xl:text-2xl font-bold text-secondary-foreground text-left"
      >
        {testimonial.name}
      </div>
      <div
        class="text-xs 3xl:text-ms text-secondary-foreground text-left font-semibold"
      >
        {testimonial.role}
        {#if testimonial.company}
          <span class="text-secondary-foreground font-normal">at</span>
          <span class="font-semibold text-secondary-foreground hover:underline"
            ><a href="https://{testimonial.companyDomain}" target="_blank"
              >{testimonial.company}</a
            ></span
          >
        {/if}
      </div>
    </div>
  </div>
</Card>
