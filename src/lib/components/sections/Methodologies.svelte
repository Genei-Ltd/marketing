<script lang="ts">
  import { cn } from "$lib/utils.js"
  import ConceptTestingDemo from "$components/animations/ConceptTestingDemo.svelte"

  // Define the features data structure
  // Methodologies data (from Capabilities.svelte)
  const features = [
    {
      id: "in-depth-interviews",
      title: "In-depth Interviews",
      description: "Synthesis, themes, quotes - in one click.",
      image: "/images/chat-bg-gray-wide.png",
    },
    {
      id: "focus-groups",
      title: "Focus groups",
      description: "High-accuracy speaker diarization.",
      image: "/images/interview-bg-gray-wide.png",
    },
    {
      id: "concept-testing",
      title: "Concept testing",
      description: "Automatically generate quotes.",
      image: "/images/members-bg-gray-wide.png",
    },
    {
      id: "online-community-data",
      title: "Online community data",
      description: "From all the platforms you use.",
      image: "/images/interview-bg-gray-wide.png",
    },
  ]

  let activeFeature = $state(features[0])
</script>

<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
  <!-- Left side - Feature options -->
  <div class="grid h-full grid-cols-2 gap-4">
    {#each features as feature}
      <div
        class={cn(
          "flex min-h-[350px] cursor-pointer flex-col justify-between  p-6 transition-all duration-300",
          activeFeature.id === feature.id
            ? "bg-primary text-primary-foreground"
            : "bg-card hover:bg-primary/10",
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
    <div class="bg-card relative flex h-full w-full rounded">
      <!-- Regular layout with image -->
      <div
        class="bg-accent-1 flex h-full w-full items-center justify-center p-4 transition-all duration-300"
      >
        <ConceptTestingDemo />
        <!-- <img
          in:fly={{ y: 40, duration: 350, opacity: 0.2 }}
          out:fly={{ y: -40, duration: 250, opacity: 0.2 }}
          src={activeFeature.image}
          alt={activeFeature.title}
          class="object-cover object-left w-full h-full"
        /> -->
      </div>
    </div>
  </div>
</div>
