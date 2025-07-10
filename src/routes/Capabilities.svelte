<script lang="ts">
  import { cn } from "$lib/utils.js"

  // Capabilities data organized by category
  const capabilities = [
    {
      title: "Methodology",
      subtitle: "Comprehensive research approaches for every need",
      features: [
        "In-depth interviews",
        "Focus groups",
        "Concept testing",
        "Online qualitative data",
      ],
    },
    {
      title: "Features",
      subtitle: "Advanced tools for modern research workflows",
      features: [
        "Multiple languages",
        "Multi-format projects",
        "Summaries & transcription",
        "Translation & clipping",
        "Thematic analysis",
        "Segment analysis (demographics, age groups, etc.)",
        "AI-powered quote finding",
        "Intelligent chat interface",
        "Central repository for in-house teams",
      ],
    },
    {
      title: "Collaboration",
      subtitle: "Seamless teamwork across projects and stakeholders",
      features: [
        "Work simultaneously across projects",
        "Guest access for external stakeholders",
        "Share clips and insights instantly",
      ],
    },
  ]
</script>

<div class="flex flex-wrap justify-center gap-8">
  {#each capabilities as capability}
    <div
      class={cn(
        "border-border group relative flex min-h-[400px] w-full max-w-sm flex-col items-start justify-start border border-dashed p-6 transition-all duration-200 hover:z-10 hover:shadow-lg",
        "hover:bg-primary hover:text-primary-foreground hover:border-primary",
      )}
    >
      <div class="flex h-full flex-col gap-4 text-left">
        <div
          class="border-b border-current pb-4 opacity-50 group-hover:opacity-100"
        >
          <h3 class="font-serif text-2xl font-semibold leading-tight">
            {capability.title}
          </h3>
          <p class="mt-2 text-sm leading-relaxed opacity-75">
            {capability.subtitle}
          </p>
        </div>

        <div class="flex-1 space-y-3">
          {#each capability.features as feature}
            <div class="flex items-start gap-2">
              <div
                class="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-50"
              ></div>
              <span class="text-sm leading-relaxed">
                {feature}
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>
