<script lang="ts">
  import { goto } from "$app/navigation"
  import PricingTable from "$lib/components/PricingTable.svelte"
  import Testimonial from "$lib/components/Testimonial.svelte"
  import { Marquee } from "@selemondev/svelte-marquee"
  import { IconArrowLeft } from "@tabler/icons-svelte"
  import type { PageData } from "./$types"
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Handle currency change
  function handleCurrencyChange(currency: "USD" | "EUR" | "GBP") {
    goto(`/demo/independents/purchase?currency=${currency}`, {
      replaceState: true,
    })
  }

  // Function to shuffle an array
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Function to split array into n roughly equal parts
  function splitArrayIntoChunks<T>(array: T[], chunks: number): T[][] {
    const result: T[][] = []
    const chunkSize = Math.ceil(array.length / chunks)

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = start + chunkSize
      result.push(array.slice(start, end))
    }

    return result
  }

  // Split and randomize testimonials for each scroller
  let testimonialsChunks = $derived(splitArrayIntoChunks(data.testimonials, 3).map(
    (chunk) => shuffleArray(chunk),
  ))
  let testimonials1 = $derived(testimonialsChunks[0] || [])
  let testimonials2 = $derived(testimonialsChunks[1] || [])
  let testimonials3 = $derived(testimonialsChunks[2] || [])
</script>

<svelte:head>
  <title>Purchase - CoLoop for Independents</title>
  <meta
    name="description"
    content="Choose the perfect plan for your independent consulting needs"
  />
</svelte:head>

<div
  class="max-h-screen h-full w-full bg-background flex flex-row overflow-hidden"
>
  <div class=" flex-row h-full max-h-screen w-full flex min-w-full">
    <div
      class=" flex-col bg-primary min-h-screen max-h-screen h-full hidden lg:flex w-3/4 relative justify-evenly 3xl:gap-8 gap-6 py-4 3xl:py-12"
    >
      <div class="flex flex-col h-full justify-between flex-1 p-4">
        <!-- HEADER -->
        <div
          class="flex flex-col w-full max-w-3xl mx-auto text-primary-foreground items-start py-4 justify-start text-sm gap-2 min-h-18 h-1/4 flex-0"
        >
          <img
            src="/logos/black.png"
            alt="CoLoop Logo"
            class="h-8 w-auto object-contain invert dark:invert-0"
          />
          <div class="flex flex-col mt-8 items-start justify-center gap-2">
            <span class="text-xl font-bold">Insights from Coloop </span>
            <span class="text-lg font-semibold"
              >Perfect for Independent Consultants</span
            >
          </div>
        </div>

        <!-- FOOTER -->
        <div
          class="flex flex-row w-full max-w-3xl justify-between items-end mx-auto text-primary-foreground text-sm min-h-18 h-1/4 flex-0"
        >
          <div class="flex flex-row items-center justify-center gap-2">
            <span class="">Powered by</span>
            <span class="text-xs font-bold">Stripe</span>
          </div>
          <h2 class="flex flex-row items-center justify-center gap-2">
            Insights to influence
          </h2>
        </div>
      </div>

      <!-- TESTIMONIALS -->
      <div
        class="max-h-1/2 flex flex-0 flex-col gap-8 justify-between h-1/2 absolute max-w-full"
      >
        <div
          class="w-18 inset-0 h-18 rounded-full bg-radial from-pink-400 from-40% to-fuchsia-700"
        ></div>

        <!-- First Testimonials Scroller -->
        <div class="flex flex-row h-full relative 3xl:gap-16 gap-12">
          <Marquee pauseOnHover={true} direction="left" fade={false}>
            {#each testimonials1 as testimonial, index (`1-${testimonial.id}-${index}`)}
              <Testimonial {testimonial} />
            {/each}
          </Marquee>
        </div>

        <!-- Third Testimonials Scroller -->
        <div class="flex flex-row h-full relative 3xl:gap-16 gap-12">
          <Marquee
            direction="left"
            pauseOnHover={true}
            fade={false}
            reverse={true}
          >
            {#each testimonials3 as testimonial, index (`3-${testimonial.id}-${index}`)}
              <Testimonial {testimonial} />
            {/each}
          </Marquee>
        </div>

        <!-- Second Testimonials Scroller (Reverse) -->
        <div class=" flex-row h-full relative 3xl:gap-16 gap-12 flex">
          <Marquee direction="left" pauseOnHover={true} fade={false}>
            {#each testimonials2 as testimonial, index (`2-${testimonial.id}-${index}`)}
              <Testimonial {testimonial} />
            {/each}
          </Marquee>
        </div>
      </div>
    </div>
    <!-- Pricing Section -->
    <div
      class="bg-background flex flex-col h-full w-full py-4 3xl:py-8 justify-around transition-all"
    >
      <div class="px-12 mt-8 max-w-6xl mx-auto flex flex-col h-full w-full">
        <div class="text-center mb-6 2xl:mb-12">
          <!-- back -->
          <div class="flex flex-row items-center justify-between">
            <button
              class="text-foreground hover:text-foreground/80 transition-all duration-200 hover:-translate-x-1 flex flex-row items-center gap-2"
              onclick={() => goto("/demo/independents")}
            >
              <IconArrowLeft class="w-6 h-6" />
              <span class="text-sm font-medium">Back</span>
            </button>
            <!-- <img
              src="/logos/black.png"
              alt="CoLoop Logo"
              class="h-6 dark:invert"
            /> -->
            <span class="font-bold text-md xl:text-lg 2xl:text-xl">
              Select your plan
            </span>
          </div>
        </div>
        <h2
          class="text-xl 2xl:text-2xl 3xl:text-4xl font-bold text-foreground 3xl:py-4"
        >
          30-Day Trial for Independent Consultants
        </h2>
        <p class="text-lg text-muted-foreground">
          Choose the plan that fits your consulting needs. 30 day trial then 12
          month yearly subscription, with the ease of pay monthly.
        </p>

        <div class="flex flex-col gap-4 mt-8 px-8 w-full mx-auto">
          <PricingTable
            plans={data.pricingPlans}
            selectedCurrency={data.selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
        </div>
      </div>
    </div>
  </div>
</div>
