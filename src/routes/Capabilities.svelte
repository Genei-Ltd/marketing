<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { fly } from "svelte/transition"

  // Data features for research capabilities (from Capabilities.svelte)
  interface Feature {
    id: string
    title: string
    subtitle: string
    description: string
    image: string
  }

  const features: Feature[] = [
    {
      id: "collaborative-work",
      title: "Work simultaneously across projects",
      subtitle: "Never get out of sync again",
      description:
        "Work simultaneously across projects, never get out of sync again.",
      image: "/images/collaborate-bg-gray-wide.png",
    },
    {
      id: "guest-access",
      title: "Guest access",
      subtitle: "Invite your clients and stakeholders to see progress",
      description: "Invite your clients and stakeholders to see progress.",
      image: "/images/guest-bg-gray-wide.png",
    },
    {
      id: "share-work",
      title: "Share your work",
      subtitle:
        "Select the clips, transcripts, AI chats and analysis grids that shine",
      description:
        "Select the clips, transcripts, AI chats and analysis grids that shine.",
      image: "/images/share-bg-gray-wide.png",
    },
  ]

  let activeFeature = $state(features[0])
</script>

<div class="grid grid-cols-1 items-start gap-4">
  <!-- Left side - Feature options -->
  <div class="grid h-full grid-cols-3 gap-4">
    {#each features as feature}
      <div
        class={cn(
          "flex min-h-[350px] cursor-pointer flex-col justify-between  p-6 transition-all duration-300",
          activeFeature.id === feature.id
            ? "bg-secondary text-secondary-foreground"
            : "bg-card hover:text-secondary",
        )}
        onmouseenter={() => (activeFeature = feature)}
        role="button"
        tabindex="0"
      >
        <h3 class="mb-3 font-serif text-3xl font-semibold capitalize">
          {feature.title}
        </h3>
        <p
          class="text-sm leading-relaxed {activeFeature.id === feature.id
            ? 'text-secondary-foreground'
            : 'text-secondary/80'}"
        >
          {feature.description}
        </p>
      </div>
    {/each}
  </div>

  <!-- Right side - Content display -->
  <div class="hidden h-full w-full lg:sticky lg:top-8">
    <div class="bg-card relative flex h-full w-full rounded">
      <!-- Regular layout with image -->
      <div
        class="flex aspect-video h-full w-full items-center justify-center transition-all duration-300"
      >
        <img
          in:fly={{ y: 40, duration: 350, opacity: 0.2 }}
          out:fly={{ y: -40, duration: 250, opacity: 0.2 }}
          src={activeFeature.image}
          alt={activeFeature.title}
          class="h-full w-full object-cover object-left"
        />
      </div>
    </div>
  </div>
</div>
