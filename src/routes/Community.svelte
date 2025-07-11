<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { IconUsers } from "@tabler/icons-svelte"

  // Button click handler
  function handleJoinCommunity() {
    window.open("https://community.coloop.ai", "_blank", "noopener,noreferrer")
  }
</script>

<div
  class="bg-card flex flex-col items-center justify-center border border-dashed p-16"
>
  <div class="flex flex-col items-center justify-center gap-6">
    <h2 class="text-foreground text-center font-serif text-3xl font-semibold">
      Join 1.5k+ others getting value from our community
    </h2>
    <p class="text-muted-foreground max-w-2xl text-center text-lg">
      Connect with the best minds in the industry, gain exclusive access to our
      events, and stay updated with the latest news
    </p>
    <button
      type="button"
      class={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-4 inline-flex items-center gap-2 rounded-[calc(var(--radius))] px-8 py-3 font-semibold shadow transition-colors duration-200 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
      )}
      on:click={handleJoinCommunity}
      aria-label="Join our community"
    >
      <IconUsers class="size-4" />
      Join Community
    </button>
  </div>
</div>
