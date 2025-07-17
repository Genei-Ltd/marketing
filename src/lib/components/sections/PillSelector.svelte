<script lang="ts" module>
  import type { Snippet } from "svelte"

  export interface PillOption {
    id: string
    label: string
  }

  export interface PillSelectorProps {
    options: PillOption[]
    activeOption: string
    onOptionSelect?: (option: string) => void
    content?: Snippet<[]>
  }
</script>

<script lang="ts">
  let {
    options = [],
    activeOption = "",
    onOptionSelect,
    content = $bindable(),
  }: PillSelectorProps = $props()

  function handlePillClick(option: string) {
    onOptionSelect?.(option)
  }
</script>

<div class="space-y-6">
  <!-- Pills -->
  <div class="flex flex-wrap gap-3">
    {#each options as option}
      <button
        class="rounded-full border px-4 py-2 text-sm font-medium transition-colors
          {activeOption === option.label
          ? 'bg-card text-card-foreground border-border'
          : 'text-foreground border-border hover:bg-muted bg-transparent'}"
        onclick={() => handlePillClick(option.label)}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <!-- Content -->
  {@render content?.()}
</div>
