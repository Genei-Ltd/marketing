<script lang="ts">
  import EmailSubmit from "./EmailSubmit.svelte"
  import Features from "./Features.svelte"
  import Success from "./Success.svelte"

  let { form }: { form: FormData } = $props()
</script>

<div class=" mx-auto flex max-w-7xl flex-col items-center justify-center">
  <!-- Hero text -->
  <h1 class="mx-16 mt-54 text-center font-serif text-7xl leading-tight">
    AI-powered analysis <br /> for human-powered insights
  </h1>
  <h2
    class="text-muted-foreground mt-16 text-center font-sans text-2xl leading-tight"
  >
    Get expert-level analysis on research projects, in minutes
  </h2>

  <!-- Email subscribe form -->
  <div class="mt-16 mb-18 w-full">
    <EmailSubmit
      {form}
      placeholder="Enter your email address"
      buttonText="Subscribe"
    />
  </div>
  <!-- Customer logos -->
  <div class="mt-16 mb-16 w-full">
    <h2 class="text-center font-serif text-2xl">
      Trusted by the brands you trust
    </h2>
    <div class="mt-8 flex flex-row items-center justify-center gap-16">
      {#each Array.from({ length: 10 }, (_, i) => i) as index}
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

  <!-- Hero image -->
  <div class="mt-16 mb-32 w-full">
    <img src="/images/hero.png" alt="Hero" class="w-full object-contain" />
  </div>

  <!-- Features -->
  <div class="mt-16 mb-32 w-full">
    <h2 class="text-center font-serif text-3xl">
      Run every kind of study, on any kind of data
    </h2>
    <div class="mt-8">
      <Features />
    </div>
  </div>

  <!-- Success -->
  <div class="mt-16 mb-32 w-full">
    <h2 class="text-center font-serif text-3xl">
      Unlock the power of AI for your insights
    </h2>
    <div class="mt-16">
      <Success />
    </div>
  </div>
</div>
