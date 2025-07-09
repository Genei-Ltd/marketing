<script lang="ts">
  import Card from "$components/ui/card/card.svelte"
  import type { Testimonial as TestimonialType } from "$lib/configs/testimonials"
  import { IconQuote, IconStar } from "@tabler/icons-svelte"

  interface Props {
    testimonial: TestimonialType
  }

  let { testimonial }: Props = $props()

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
  class="bg-transparent text-primary-foreground h-full rounded overflow-hidden  3xl:max-w-xl flex-1 max-w-2xl flex flex-col border border-border shadow-sm hover:shadow-md transition-shadow duration-200 p-4 justify-between"
>
  <!-- Quote Icon -->
  <div class="flex justify-between items-start p-2 px-3 pb-0 flex-0">
    <IconQuote class="3xl:w-16 3xl:h-16 h-10 w-10  " />

    <!-- Rating Stars -->
    {#if testimonial.rating}
      <div class="flex items-center space-x-1 p-2">
        {#each renderStars(testimonial.rating) as filled}
          <IconStar
            class="3xl:w-16 3xl:h-16 h-10 w-10 {filled
              ? 'text-yellow-400 fill-current'
              : 'text-primary-foreground'}"
          />
        {/each}
      </div>
    {/if}
  </div>

  <div
    class="flex flex-col px-4 py-8 h-full justify-center items-center gap-4 flex-1"
  >
    <!-- Quote Content -->
    <blockquote
      class=" 3xl:mb-8 ellipsis leading-relaxed text-left px-4 flex-1 line-clamp-4 text-xl font-semibold"
    >
      "{testimonial.content}"
    </blockquote>
  </div>
  <!-- Author Info -->
  <div class="flex items-center h-16 w-full flex-0 p-8 mb-8 gap-4">
    <!-- Avatar -->
    <div class="flex-0 h-20 w-20 flex items-center justify-center rounded-full">
      {#if testimonial.avatar}
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          class="3xl:w-24 3xl:h-24 w-20 h-20 object-cover rounded-full"
        />
      {:else}
        <div
          class="3xl:w-20 3xl:h-20 w-20 h-20 bg-card flex items-center justify-center rounded-full"
        >
          <span class="text-2xl font-medium text-card-foreground">
            {getInitials(testimonial.name)}
          </span>
        </div>
      {/if}
    </div>

    <!-- Author Details -->
    <div class="flex flex-col">
      <div
        class="text-2xl 3xl:text-3xl font-bold text-primary-foreground text-left"
      >
        {testimonial.name}
      </div>
      <div
        class="text-lg 3xl:text-xl text-primary-foreground text-left font-semibold"
      >
        {testimonial.role}
        {#if testimonial.company}
          <span class="text-primary-foreground font-normal">at</span>
          <span class="font-semibold text-primary-foreground hover:underline"
            ><a href="https://{testimonial.companyDomain}" target="_blank"
              >{testimonial.company}</a
            ></span
          >
        {/if}
      </div>
    </div>
  </div>
</Card>
