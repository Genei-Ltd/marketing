<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { fly } from "svelte/transition"

  // Define the features data structure
  const features = [
    {
      id: "concept-testing",
      title: "Concept and message testing",
      description:
        "Quickly understand target audiences perception, and uncover what resonates. Never miss or mix up another concept with CoLoop's automatic keyword labelling.",
      image: "/images/features/concept.gif",
      bgColor: "bg-secondary",
    },
    {
      id: "customer-experience",
      title: "Customer experience",
      description:
        "Analyze open-ended feedback to reveal customer sentiment. CoLoop enables scalable CX analysis to improve customer journeys and retention.",
      image: "/images/features/steal.png",
      bgColor: "bg-accent-2",
    },
    {
      id: "competitor-analysis",
      title: "Competitor analysis",
      description:
        "Unlock the competitive edge with deeper insights into unmet needs, differentiators and white space opportunities.",
      image: "/images/features/image.png",
      bgColor: "bg-accent-3",
    },
    {
      id: "market-research",
      title: "Market research",
      description:
        "Uncover market trends, customer needs, and market opportunities with comprehensive market research.",
      image: "/images/features/market.png",
      bgColor: "bg-accent-4",
    },
  ]

  let activeFeature = $state(features[0])
</script>

<div class="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
  <!-- Left side - Feature options -->
  <div class="space-y-8">
    {#each features as feature}
      <div
        class={cn(
          "flex min-h-[150px] cursor-pointer flex-col justify-between  p-6 transition-all duration-300",
          activeFeature.id === feature.id
            ? "bg-primary text-primary-foreground"
            : "bg-card hover:bg-primary/10",
        )}
        onmouseenter={() => (activeFeature = feature)}
        role="button"
        tabindex="0"
      >
        <h3
          class="mb-3 font-serif text-xl font-semibold capitalize transition-all"
        >
          {feature.title}
        </h3>
        <p
          class="text-sm leading-relaxed transition-all {activeFeature.id ===
          feature.id
            ? 'text-primary-foreground'
            : 'text-primary/80'}"
        >
          {feature.description}
        </p>
      </div>
    {/each}
  </div>

  <!-- Right side - Content display -->
  <div class="h-full w-full lg:sticky lg:top-8">
    <div
      class="relative flex h-full w-full rounded transition-all duration-300 {activeFeature.bgColor}"
    >
      {#if activeFeature.id === "many-more"}
        <!-- Special layout for "many more" with text bubbles -->
        <div class="flex min-h-[400px] flex-col justify-center p-8">
          <div class="mx-auto grid max-w-md grid-cols-2 gap-3">
            {#each activeFeature.bubbles ?? [] as bubble}
              <div
                class="bg-primary/10 text-primary rounded-full px-4 py-2 text-center text-sm font-medium"
              >
                {bubble}
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <!-- Regular layout with image -->
        <div
          class="flex h-full w-full items-center justify-center transition-all duration-300"
        >
          <img
            in:fly={{ y: 40, duration: 350, opacity: 0.2 }}
            out:fly={{ y: -40, duration: 250, opacity: 0.2 }}
            src={activeFeature.image}
            alt={activeFeature.title}
            class="w-2/3 object-contain"
          />
        </div>
      {/if}
    </div>
  </div>
</div>
