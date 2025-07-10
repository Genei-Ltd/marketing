<script lang="ts">
  // Success metrics data
  const successMetrics = [
    {
      title:
        "Reduce project turnaround time by 10x compared to manual analysis",
      subtitle: "From data to insights in hours, not days",
      metric: "10x faster",
    },
    {
      title: "Pinpoint accuracy, even in challenging settings",
      subtitle:
        "Over 92% accuracy on multi-language and complex domains benchmark",
      metric: "92% accuracy",
    },
    {
      title: "Expand your analysis capabilities",
      subtitle: "Effortlessly conduct a wider range of studies",
      metric: "Unlimited scope",
    },
    {
      title: "50% less manual effort",
      subtitle: "Save the team from painful and arduous work with automation",
      metric: "50% less effort",
    },
  ]
</script>

<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
  {#each successMetrics as metric}
    <div
      class=" bg-primary text-primary-foreground hover:bg-card/80 hover:text-card-foreground flex min-h-[400px] flex-col items-start justify-between p-4 transition-all duration-300"
    >
      <div class="flex h-full flex-col justify-between gap-2 text-left">
        <h3 class="mb-3 font-serif text-2xl leading-tight font-semibold">
          {metric.title}
        </h3>
        <p class="text-sm leading-relaxed opacity-80">
          {metric.subtitle}
        </p>
      </div>
      <!-- <div class="mb-4">
        <div class="text-primary text-sm font-semibold tracking-wide uppercase">
          {metric.metric}
        </div>
      </div> -->
    </div>
  {/each}
</div>
