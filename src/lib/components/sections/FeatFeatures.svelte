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
      id: "multiple-languages",
      title: "Multiple languages",
      subtitle:
        "50+ languages supported for broad coverage of multi-market studies.",
      description:
        "50+ languages supported for broad coverage of multi-market studies.",
      image: "/images/languages-bg-gray-wide.png",
    },
    {
      id: "multi-format-projects",
      title: "Multi-format projects",
      subtitle: "Analyze audio, video, text, and more in a single workflow.",
      description: "Analyze audio, video, text, and more in a single workflow.",
      image: "/images/formats-bg-gray-wide.png",
    },
    {
      id: "auto-magic-features",
      title: "Auto-magic features",
      subtitle:
        "Summaries, transcription, translation, clipping, thematic analysis, segments, quote finding — just hover to reveal.",
      description:
        "Summaries, transcription, translation, clipping, thematic analysis, segments, quote finding — just hover to reveal.",
      image: "/images/automagic-bg-gray-wide.png",
    },
    {
      id: "ai-chat",
      title: "AI chat ✨",
      subtitle:
        "Perfect memory of all your research, with links to cited sources.",
      description:
        "Perfect memory of all your research, with links to cited sources.",
      image: "/images/aichat-bg-gray-wide.png",
    },
    {
      id: "central-repository",
      title: "Central repository",
      subtitle: "Never lose track of a project again.",
      description: "Never lose track of a project again.",
      image: "/images/repository-bg-gray-wide.png",
    },
    {
      id: "online-community-data",
      title: "Online community data",
      subtitle: "From all the platforms you use.",
      description: "From all the platforms you use.",
      image: "/images/repository-bg-gray-wide.png",
    },
  ]

  let activeFeature = $state(features[0])
</script>

<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
  <!-- Left side - Feature options -->
  <div class="grid h-full grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-3">
    {#each features as feature}
      <div
        class={cn(
          "relative flex min-h-[350px] cursor-pointer flex-col justify-between  p-6 transition-all duration-300",
          activeFeature.id === feature.id
            ? "bg-primary text-primary-foreground"
            : "bg-card hover:bg-primary/10",
        )}
        onmouseenter={() => (activeFeature = feature)}
        role="button"
        tabindex="0"
      >
        <div
          class="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <img
            src="/images/features/test.png"
            alt="Feature"
            class="h-full w-full object-cover object-center p-12"
          />
        </div>

        <h3 class="z-20 mb-3 font-serif text-3xl font-semibold capitalize">
          {feature.title}
        </h3>
        <p
          class="z-20 text-sm leading-relaxed {activeFeature.id === feature.id
            ? 'text-primary-foreground'
            : 'text-primary/80'}"
        >
          {feature.description}
        </p>
      </div>
    {/each}
  </div>
</div>
