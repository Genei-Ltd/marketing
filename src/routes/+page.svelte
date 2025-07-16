<script lang="ts">
  import EmailSubmit from "../lib/components/blocks/EmailSubmit.svelte"
  import Features from "../lib/components/sections/Features.svelte"
  import Success from "../lib/components/sections/Success.svelte"
  import Testimonials from "../lib/components/sections/Testimonials.svelte"
  import type { Testimonial } from "$lib/server/connectors/notion-testimonials"
  import Integrations from "../lib/components/sections/Integrations.svelte"
  import Security from "../lib/components/sections/Security.svelte"
  import CommitmentLetter from "../lib/components/sections/CommitmentLetter.svelte"
  import Community from "../lib/components/sections/Community.svelte"
  import CTAdemo from "../lib/components/sections/CTAdemo.svelte"
  import Methodologies from "../lib/components/sections/Methodologies.svelte"
  import DataFeatures from "../lib/components/sections/DataFeatures.svelte"
  import FeatColaboration from "../lib/components/sections/FeatColaboration.svelte"
  import PharmaInsightDemo from "$components/animations/PharmaInsightDemo.svelte"
  let {
    form,
    data,
  }: { form: FormData; data: { testimonials: Testimonial[] } } = $props()
</script>

{#snippet section(title: string)}
  <h2 class="text-center font-serif text-4xl">{title}</h2>
{/snippet}

<div
  class="relative mx-auto flex max-w-7xl flex-col items-center justify-center"
>
  <!-- <div class="flex flex-row items-center justify-center w-full gap-4 mt-32">
  <div class="w-full h-16 bg-brand text-brand-foreground">Brand</div>
  <div class="w-full h-16 bg-primary text-primary-foreground">Primary</div>
  <div class="w-full h-16 bg-accent-1 text-accent-1-foreground">Accent 1</div>
  <div class="w-full h-16 bg-accent-2 text-accent-2-foreground">Accent 2</div>
  <div class="w-full h-16 bg-accent-3 text-accent-3-foreground">Accent 3</div>
  <div class="w-full h-16 bg-accent-4 text-accent-4-foreground">Accent 4</div>
  </div> -->
  <!-- Hero text -->
  <h1
    class="text-huge mx-16 mt-64 text-center font-serif leading-tight text-balance"
  >
    AI-powered analysis <br /> for human-powered insights
  </h1>
  <h2 class="text-foreground mt-16 text-center font-sans leading-tight">
    Opinions in, insights out. Fast.
  </h2>
</div>

<!-- Hero image -->
<div class="relative mt-32 w-full">
  <img
    src="/images/hero-3.png"
    alt="Hero"
    class="border-primary relative z-50 mx-auto aspect-video w-full max-w-7xl rounded border-4 object-cover shadow-2xl grayscale"
  />
  <img
    src="/images/wild/reveal.png"
    alt="Hero"
    class="absolute inset-0 h-full w-full object-cover py-16 opacity-50"
  />
</div>

<div
  class="relative mx-auto flex max-w-7xl flex-col items-center justify-center"
>
  <!-- Customer logos -->
  <div class="mt-32 mb-16 w-full">
    <h2 class="text-center font-serif text-2xl">
      Trusted by the brands you trust
    </h2>
    <div class="mt-8 flex flex-row items-center justify-center gap-16">
      {#each Array.from({ length: 10 }, (_, i) => i) as index}
        <div class="flex flex-col items-center justify-center">
          <img
            src={`/customer-logos/${index + 1}.png`}
            alt="Logo"
            class="w-24 object-contain opacity-80 brightness-200 contrast-0 grayscale dark:brightness-0 dark:contrast-0 dark:invert-0"
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- Email subscribe form -->
  <div class="mt-16 mb-18 w-full">
    <EmailSubmit
      {form}
      placeholder="Enter your email address"
      buttonText="Subscribe"
    />
  </div>

  <!-- CTA -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    <CTAdemo />
  </div>

  <!-- Features -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section("Run every kind of study, on any kind of data")}
    <Features />
  </div>

  <!-- Success -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section("Unlock the power of AI for your team")}
    <Success />
  </div>
</div>

<!-- Testimonials -->
<div class="bg-primary text-primary-foreground w-full">
  <div class="mx-auto mt-32 mb-32 flex w-full max-w-7xl flex-col gap-16 py-16">
    {@render section("What our customers say")}
    <Testimonials testimonials={data.testimonials} />
  </div>
</div>

<div
  class="relative mx-auto flex max-w-7xl flex-col items-center justify-center"
>
  {@render section("What our customers say")}
  <div class="mb-32 grid h-full w-full grid-cols-3 gap-16 rounded py-16">
    <div class="bg-accent-2 col-span-2 max-h-96 rounded p-16">
      <img
        src="/images/features/concept.gif"
        alt=""
        class="h-full w-full object-contain"
      />
    </div>
    <div
      class="text-sans col-span-1 mt-16 flex flex-col items-start justify-start gap-8 text-xl"
    >
      <h2 class="text-5xl tracking-tighter">Insights, Fresh out the oven.</h2>
      <p class="text-xl font-light">
        "I love this product! It's so easy to use and has helped me so much."
      </p>
    </div>
  </div>
</div>

<div
  class="relative mx-auto flex max-w-7xl flex-col items-center justify-center"
>
  <!-- Methodologies -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section("Extensive capabilities for every methodology")}
    <Methodologies />
  </div>

  <!-- Data features -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section("Run every kind of study, on any kind of data")}
    <DataFeatures />
  </div>

  <!-- Capabilities -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section("Collaborate with your team & stakeholders")}
    <FeatColaboration />
  </div>

  <!-- PharmaInsight Demo -->
  <div
    class="mt-32 mb-32 flex w-full flex-col items-center justify-center gap-16"
  >
    {@render section("From data to decisions, instantly")}
    <div class="w-full">
      <PharmaInsightDemo />
    </div>
  </div>

  <!-- Success -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section(
      "Seamlessly integrated with all the tools you already use",
    )}
    <Integrations />
  </div>

  <!-- Security -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    {@render section("Enterprise-grade security")}
    <Security />
  </div>
</div>

<!-- Commitment Letter -->
<div class="relative mt-32 mb-32 flex w-full flex-col gap-16">
  <div class="relative mx-auto mt-16 h-300 w-full">
    <img
      src="/images/amethyst-6-wide-4k.png"
      alt="Commitment Letter"
      class="z-0 h-full w-full object-cover opacity-100"
    />
    <div
      class="absolute inset-0 z-10 flex h-full w-full items-center justify-center gap-32"
    >
      {@render section("Our commitment to human-driven insights")}
      <CommitmentLetter />
    </div>
  </div>
</div>

<div
  class="relative mx-auto flex max-w-7xl flex-col items-center justify-center"
>
  <!-- Community -->
  <div class="mt-32 mb-32 flex w-full flex-col gap-16">
    <Community />
  </div>
</div>
