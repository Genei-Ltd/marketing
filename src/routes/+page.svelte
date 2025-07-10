<script lang="ts">
  import EmailSubmit from "./EmailSubmit.svelte"

  interface Props {
    form?: any
  }

  let { form }: Props = $props()
</script>

<div class=" mx-auto flex max-w-7xl flex-col items-center justify-center">
  <h1 class="mx-16 mt-64 text-center font-serif text-6xl font-bold">
    AI-powered analysis for human-powered insights
  </h1>
  <h2
    class="text-muted-foreground mt-16 text-center font-sans text-2xl leading-tight font-semibold"
  >
    Get expert-level analysis on research projects, in minutes
  </h2>

  <div class="mt-16 mb-32 w-full">
    <EmailSubmit
      {form}
      placeholder="Enter your email address"
      buttonText="Subscribe"
    />
  </div>

  <div class="mt-16 mb-32 w-full">
    <img src="/images/hero.png" alt="Hero" class="w-full object-contain" />
  </div>
  <div class="mt-16 mb-32 w-full">
    <h2 class="text-center font-serif text-4xl font-bold">
      Trusted by leading agencies and brands
    </h2>
    <div class="mt-16 flex flex-row items-center justify-center gap-16">
      {#each new Array(10) as _, index}
        <div class="flex flex-col items-center justify-center">
          <img
            src={`/customer-logos/${index + 1}.png`}
            alt="Logo"
            class="w-24 object-contain brightness-200 contrast-0"
          />
        </div>
      {/each}
    </div>
  </div>
</div>
