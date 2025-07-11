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
  import CTAdemo from "./CTAdemo.svelte"
  import EndReveal from "./EndReveal.svelte"
  import Methodologies from "./Methodologies.svelte"
  import DataFeatures from "./DataFeatures.svelte"
  let {
    form,
    data,
  }: { form: FormData; data: { testimonials: Testimonial[] } } = $props()
</script>

<div
  class="relative mx-auto flex max-w-7xl flex-col items-center justify-center"
>
  <!-- Hero text -->
  <h1 class="mx-16 mt-54 text-center font-serif text-7xl leading-tight">
    AI-powered analysis <br /> for human-powered insights
  </h1>
  <h2
    class="text-foreground mt-16 text-center font-sans text-2xl leading-tight"
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
            class="w-24 object-contain opacity-50 brightness-0 contrast-200 grayscale invert"
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- Hero image -->
  <div class="mt-16 mb-32 w-full">
    <img
      src="/images/hero-bg-gray.png"
      alt="Hero"
      class="w-full object-contain"
    />
  </div>

  <!-- CTA -->
  <div class="mt-16 mb-32 w-full">
    <div class="mt-8">
      <CTAdemo />
    </div>
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

  <!-- Testimonials -->
  <div class="mt-16 mb-32 w-full">
    <h1 class="text-left font-serif text-5xl">What our customers say</h1>
    <div class="mt-16">
      <Testimonials testimonials={data.testimonials} />
    </div>
  </div>

  <!-- Capabilities -->
  <div class="mt-16 mb-32 w-full">
    <!-- Methodologies -->
    <h2 class="mt-32 mb-8 text-left font-serif text-5xl">
      Extensive capabilities for every methodology
    </h2>
    <div class="mt-16">
      <Methodologies />
    </div>
    <!-- Data features -->
    <h2 class="mt-32 mb-8 text-center font-serif text-3xl">
      Run every kind of study, on any kind of data
    </h2>
    <div class="mt-16">
      <DataFeatures />
    </div>
    <!-- Capabilities -->
    <h2 class="mt-32 mb-8 text-center font-serif text-3xl">
      Collaborate with your team & stakeholders
    </h2>
    <div class="mt-16">
      <Capabilities />
    </div>
  </div>

  <!-- Success -->
  <div class="mt-16 mb-32 w-full">
    <h2 class="text-center font-serif text-3xl">
      Seamlessly integrated with all the tools you already use
    </h2>
    <div class="mt-16">
      <Integrations />
    </div>
  </div>

  <!-- Security -->
  <div class="mt-16 mb-32 w-full">
    <h2 class="text-center font-serif text-3xl">Enterprise-grade security</h2>
    <div class="mt-16">
      <Security />
    </div>
  </div>

  <!-- Commitment Letter -->
  <div class="relative mt-16 mb-32 w-full">
    <h2 class="text-center font-serif text-3xl">
      Our commitment to human-driven insights
    </h2>
    <div class="relative mt-16 h-250 w-full">
      <img
        src="/images/amethyst-2.png"
        alt="Commitment Letter"
        class="z-0 my-8 h-full w-full object-cover"
      />
      <div class="absolute inset-0 z-10 h-full w-full py-12">
        <CommitmentLetter />
      </div>
    </div>
  </div>

  <!-- Community -->
  <div class="mt-16 mb-32 w-full">
    <div class="mt-16">
      <Community />
    </div>
  </div>
</div>
