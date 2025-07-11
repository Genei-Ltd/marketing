<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { IconCalendarEvent } from "@tabler/icons-svelte"
  import { Button } from "$lib/components/ui/button"
  // Button click handler
  // function handleBookDemo() {
  //   window.open("https://cal.com/coloop/demo", "_blank", "noopener,noreferrer")
  // }
</script>

<div
  class="bg-primary text-primary-foreground flex flex-col items-center justify-center border border-dashed p-16"
>
  <div class="flex flex-col items-center justify-center gap-6">
    <h2 class=" text-center font-serif text-3xl font-semibold">
      See CoLoop in action
    </h2>
    <p class="max-w-xl text-center text-lg opacity-80">
      Book a personalized demo to discover how CoLoop can accelerate your
      research and insights workflow.
    </p>
    <Button size="lg" variant="secondary" aria-label="Book a demo" href="/demo">
      <IconCalendarEvent class="size-4" />
      Book a demo
    </Button>
  </div>
</div>
