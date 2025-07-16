<script lang="ts">
  // Success metrics data
  const successMetrics = [
    {
      title:
        "Reduce project turnaround time by 10x compared to manual analysis",
      subtitle: "From data to insights in hours, not days",
      metric: "10x Faster",
    },
    {
      title: "Pinpoint accuracy, even in challenging settings",
      subtitle:
        "Over 96% accuracy on multi-language and complex domains benchmark",
      metric: "96% Accuracy",
    },
    {
      title: "Expand your analysis capabilities",
      subtitle: "Effortlessly conduct a wider range of studies",
      metric: "Unlimited Scope",
    },
    {
      title: "50% less manual effort",
      subtitle: "Save the team from painful and arduous work with automation",
      metric: "50% less effort",
    },
  ]
</script>

<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
  {#each successMetrics as metric, index}
    <div
      class="group bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground relative flex min-h-[400px] flex-col items-start justify-between transition-all duration-300 ease-in-out"
    >
      <img
        src={`/images/amethyst-${index + 1}.png`}
        alt="Success"
        class="absolute inset-0 z-0 h-full w-full object-cover opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-80"
      />
      <div
        class="group-hover:text-secondary-foreground group-hover:from-secondary/80 group-hover:to-secondary/20 z-10 flex h-full flex-col justify-between p-4 text-left group-hover:bg-linear-to-t"
      >
        <h3 class="mb-3 font-serif text-2xl leading-tight font-semibold">
          {metric.metric}
        </h3>
        <div class="mb-2">
          <span class="leading mb-2 text-sm leading-tight">
            {metric.subtitle}
          </span>
          <div class=" text-lg font-semibold tracking-wide uppercase">
            {metric.title}
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
