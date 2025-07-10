<script lang="ts">
  import Card from "$components/ui/card/card.svelte"
  import type { Testimonial as TestimonialType } from "$lib/server/connectors/notion-testimonials"
  import { IconQuote, IconStar } from "@tabler/icons-svelte"

  type Props = {
    testimonial: TestimonialType
    size: "sm" | "default" | "lg" | "xl"
  }

  let { testimonial, size = "default" }: Props = $props()

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

<div
  class="hover:bg-primary hover:text-primary-foreground bg-card text-card-foreground flex h-full flex-row overflow-hidden transition-all duration-200 {size ===
  'sm'
    ? 'max-h-64'
    : size === 'lg'
      ? 'max-h-96'
      : size === 'xl'
        ? 'max-h-128'
        : 'max-h-64'}"
>
  <!-- Avatar -->
  <div class=" flex h-full w-1/3 items-center justify-center rounded-full">
    {#if testimonial.avatar}
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        class="h-full w-full object-cover grayscale"
      />
    {:else}
      <div class="bg-card flex h-full w-full items-center justify-center">
        <span class="text-card-foreground text-2xl font-medium">
          {getInitials(testimonial.name)}
        </span>
      </div>
    {/if}
  </div>
  <div
    class="  flex flex-1 flex-col justify-between border shadow-sm transition-shadow duration-200 hover:shadow-md {size ===
    'sm'
      ? 'p-2'
      : size === 'lg'
        ? 'p-4'
        : size === 'xl'
          ? 'p-8'
          : 'p-4'}"
  >
    <!-- Quote Icon -->
    <div class="flex-0 mb-4 flex items-start justify-between">
      <IconQuote
        class=" {size === 'sm'
          ? 'h-6 w-6'
          : size === 'lg'
            ? 'h-8 w-8'
            : size === 'xl'
              ? 'h-10 w-10'
              : 'h-10 w-10'}"
      />

      <!-- Rating Stars -->
      <!-- {#if testimonial.rating}
      <div class="flex items-center space-x-1 p-2">
        {#each renderStars(testimonial.rating) as filled}
          <IconStar
            class="3xl:w-16 3xl:h-16 h-10 w-10 {filled
              ? 'text-primary-foreground fill-current'
              : 'opacity-50'}"
          />
        {/each}
      </div>
    {/if} -->
    </div>

    <div class="flex h-full flex-1 flex-col items-center justify-center pl-4">
      <!-- Quote Content -->
      <blockquote
        class="ellipsis mb-6 flex-1 text-left font-serif leading-relaxed
         {size === 'sm'
          ? 'text-sm'
          : size === 'lg'
            ? 'text-lg'
            : size === 'xl'
              ? 'text-2xl'
              : 'text-xl'} "
      >
        "{testimonial.content}"
      </blockquote>

      <!-- Author Info -->
      <div
        class="flex-0 flex h-16 w-full flex-col items-end {size === 'sm'
          ? 'text-sm'
          : size === 'lg'
            ? 'text-lg'
            : size === 'xl'
              ? 'text-2xl'
              : 'text-xl'}"
      >
        <div class="text-left font-bold opacity-80">
          {testimonial.name}
        </div>
        <div
          class=" text-right font-semibold opacity-80 {size === 'sm'
            ? 'text-xs'
            : size === 'lg'
              ? 'text-sm'
              : size === 'xl'
                ? 'text-base'
                : 'text-lg'}"
        >
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
