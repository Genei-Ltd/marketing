<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="flex flex-col min-h-screen bg-background text-foreground">
  <main class="flex-1 container mx-auto p-4">
    {@render children?.()}
  </main>
</div>
