<script lang="ts">
  import EmailSubmit from "./EmailSubmit.svelte"
  import Features from "./Features.svelte"
  import Success from "./Success.svelte"
  import Testimonials from "./Testimonials.svelte"
  import type { Testimonial } from "$lib/server/connectors/notion-testimonials"
  import Integrations from "./Integrations.svelte"
  import Security from "./Security.svelte"
  import Capabilities from "./Capabilities.svelte"
  import CommitmentLetter from "./CommitmentLetter.svelte"
  import Community from "./Community.svelte"
  let {
    form,
    data,
  }: { form: FormData; data: { testimonials: Testimonial[] } } = $props()
</script>

<div class="mx-auto flex max-w-7xl flex-col items-center justify-center">
  <!-- Hero text -->
  <h1 class="mt-54 mx-16 text-center font-serif text-7xl leading-tight">
    AI-powered analysis <br /> for human-powered insights
  </h1>
  <h2
    class="text-foreground mt-16 text-center font-sans text-2xl leading-tight"
  >
    Get expert-level analysis on research projects, in minutes
  </h2>

  <!-- Email subscribe form -->
  <div class="mb-18 mt-16 w-full">
    <EmailSubmit
      {form}
      placeholder="Enter your email address"
      buttonText="Subscribe"
    />
  </div>
  <!-- Customer logos -->
  <div class="mb-16 mt-16 w-full">
    <h2 class="text-center font-serif text-2xl">
      Trusted by the brands you trust
    </h2>
    <div class="mt-8 flex flex-row items-center justify-center gap-16">
      {#each Array.from({ length: 10 }, (_, i) => i) as index}
        <div class="flex flex-col items-center justify-center">
          <img
            src={`/customer-logos/${index + 1}.png`}
            alt="Logo"
            class="w-24 object-contain opacity-50 brightness-0 contrast-200 grayscale invert"
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- Hero image -->
  <div class="mb-32 mt-16 w-full">
    <img
      src="/images/hero.png"
      alt="Hero"
      class="w-full object-contain grayscale"
    />
  </div>

  <!-- Features -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">
      Run every kind of study, on any kind of data
    </h2>
    <div class="mt-8">
      <Features />
    </div>
  </div>

  <!-- Success -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">
      Unlock the power of AI for your insights
    </h2>
    <div class="mt-16">
      <Success />
    </div>
  </div>

  <!-- Testimonials -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">What our customers say</h2>
    <div class="mt-16">
      <Testimonials testimonials={data.testimonials} />
    </div>
  </div>

  <!-- Capabilities -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">
      Extensive capabilities for every use case
    </h2>
    <div class="mt-16">
      <Capabilities />
    </div>
  </div>

  <!-- Success -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">
      Seamlessly integrated with all the tools you already use
    </h2>
    <div class="mt-16">
      <Integrations />
    </div>
  </div>

  <!-- Security -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">Enterprise-grade security</h2>
    <div class="mt-16">
      <Security />
    </div>
  </div>

  <!-- Commitment Letter -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">
      Our commitment to human-driven insights
    </h2>
    <div class="mt-16">
      <CommitmentLetter />
    </div>
  </div>

  <!-- Community -->
  <div class="mb-32 mt-16 w-full">
    <h2 class="text-center font-serif text-3xl">
      Join 1.5k+ others getting value from our community
    </h2>
    <h3 class="mt-2 w-full text-center font-serif text-lg opacity-50">
      Connect with the best minds in the industry, gain exclusive access to our
      events, and stay updated with the latest news
    </h3>
    <div class="mt-16">
      <Community />
    </div>
  </div>
</div>
