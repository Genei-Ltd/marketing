<script lang="ts">
  import { goto } from "$app/navigation"
  import PricingTable from "$lib/components/PricingTable.svelte"
  import { Card } from "$lib/components/ui/card"
  import type {
    QualificationConfig,
    QualificationOption,
  } from "$lib/configs/qualification"
  import * as Icons from "@tabler/icons-svelte"
  import type { ComponentType } from "svelte"
  import { cubicOut } from "svelte/easing"
  import { fade, fly, scale } from "svelte/transition"
  import Button from "./ui/button/button.svelte"

  interface Props {
    config: QualificationConfig;
    pricingPlans?: any[];
    selectedCurrency?: "USD" | "EUR" | "GBP";
    onCurrencyChange?: (
    currency: "USD" | "EUR" | "GBP",
  ) => void;
    onSelectionChange?: (option: QualificationOption) => void;
  }

  let {
    config,
    pricingPlans = [],
    selectedCurrency = "USD",
    onCurrencyChange = () => {},
    onSelectionChange = () => {}
  }: Props = $props();

  let selectedOption: QualificationOption | null = $state(null)
  let showResults = $state(false)
  let isTransitioning = $state(false)

  async function handleOptionSelect(option: QualificationOption) {
    if (isTransitioning) return

    isTransitioning = true
    selectedOption = option

    // Check if option has an internal link and route immediately
    if (option.externalLink && !option.externalLink.external) {
      // Route immediately for internal links
      goto(option.externalLink.url)
      return
    }

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150))
    showResults = true
    isTransitioning = false

    onSelectionChange(option)
  }

  async function resetSelection() {
    if (isTransitioning) return

    isTransitioning = true
    showResults = false

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150))
    selectedOption = null
    isTransitioning = false
  }

  function getIconComponent(iconName: string): ComponentType {
    return (Icons as any)[iconName] || Icons.IconUser
  }
</script>

<div class="bg-background py-4 h-full">
  <div
    class="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between h-full"
  >
    <!-- Header -->
    <div
      class="text-center mb-12 max-w-2xl mx-auto"
      in:fly={{ y: -20, duration: 600, easing: cubicOut, delay: 100 }}
    >
      <h2 class="text-4xl font-bold text-foreground mb-4">
        {config.question}
      </h2>
      <p class="text-lg text-muted-foreground mb-8">
        {config.subtitle}
      </p>
    </div>

    {#if !showResults}
      <div class="max-w-4xl mx-auto flex flex-col justify-center items-center">
        <!-- Qualification Options -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mx-auto h-full"
          in:fly={{ y: 20, duration: 600, easing: cubicOut, delay: 200 }}
          out:fly={{ y: -20, duration: 300, easing: cubicOut }}
        >
          {#each config.options as option, index}
            <div
              in:scale={{
                duration: 400,
                easing: cubicOut,
                delay: 300 + index * 100,
                start: 0.9,
              }}
            >
              <Card
                class="group cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden hover:shadow-xl h-full w-full"
              >
                {@const SvelteComponent = getIconComponent(option.icon)}
                <button
                  type="button"
                  onclick={() => handleOptionSelect(option)}
                  class="w-full text-left"
                  disabled={isTransitioning}
                >
                  <div class="flex items-start h-32">
                    <div
                      class="w-32 h-full bg-primary flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                    >
                      <SvelteComponent
                        class="w-18 h-18 text-primary-foreground transition-transform duration-300"
                      />
                    </div>
                    <div class="flex-1 p-4 w-full">
                      <div class="flex-1 flex items-center justify-between">
                        <h4 class="text-xl font-semibold text-foreground">
                          {option.title}
                        </h4>
                        <Icons.IconArrowRight
                          class="w-5 h-5 text-foreground  group-hover:translate-x-1 transition-all duration-300"
                        />
                      </div>
                      <p class="text-muted-foreground text-sm mt-1 w-2/3">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              </Card>
            </div>
          {/each}
        </div>

        <!-- Human Contact Option -->
        <div
          class="text-center max-w-2xl mx-auto mt-12"
          in:fade={{ duration: 600, delay: 600 }}
          out:fade={{ duration: 200 }}
        >
          <p class="text-muted-foreground mb-2 text-sm">
            {config.humanContactText || "Prefer to speak with someone?"}
          </p>
          <Button
            variant="link"
            href={config.calComLink}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-muted-foreground font-medium transition-all duration-300 hover:underline"
          >
            <Icons.IconCalendar class="w-4 h-4 mr-2" />
            {config.calComButtonText || "Schedule a call"}
            <Icons.IconExternalLink class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    {:else}
      <!-- Results Section -->
      {@const SvelteComponent_1 = getIconComponent(selectedOption?.icon || "IconUser")}
      <div
        in:fly={{ y: 30, duration: 600, easing: cubicOut, delay: 200 }}
        out:fly={{ y: -30, duration: 300, easing: cubicOut }}
      >
        <!-- Selected Option Badge -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full mb-6 border border-primary/20"
            in:scale={{ duration: 400, easing: cubicOut, delay: 400 }}
          >
            <SvelteComponent_1
              class="w-5 h-5 text-primary"
            />
            <span class="font-medium text-primary">
              {selectedOption?.title}
            </span>
          </div>

          <h4
            class="text-2xl font-bold text-gray-900 mb-4"
            in:fly={{ y: 20, duration: 500, easing: cubicOut, delay: 500 }}
          >
            {selectedOption?.resultTitle ||
              "Perfect! Here's what we recommend:"}
          </h4>

          {#if selectedOption?.resultDescription}
            <p
              class="text-gray-600 mb-8 max-w-2xl mx-auto"
              in:fade={{ duration: 500, delay: 600 }}
            >
              {selectedOption.resultDescription}
            </p>
          {/if}
        </div>

        <!-- Dynamic Content Based on Selection -->
        <div
          class="mb-8"
          in:fly={{ y: 40, duration: 600, easing: cubicOut, delay: 700 }}
        >
          {#if selectedOption?.showPricing && pricingPlans.length > 0}
            <div class="transform">
              <PricingTable
                plans={pricingPlans}
                {selectedCurrency}
                {onCurrencyChange}
              />
            </div>
          {:else if selectedOption?.calComEmbed}
            <div
              class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg"
              in:scale={{ duration: 500, easing: cubicOut }}
            >
              <iframe
                src={selectedOption.calComEmbed}
                width="100%"
                height="600"
                frameborder="0"
                title="Schedule a meeting"
                class=""
              ></iframe>
            </div>
          {:else if selectedOption?.externalLink}
            <div
              class="text-center"
              in:scale={{ duration: 400, easing: cubicOut }}
            >
              <a
                href={selectedOption.externalLink.url}
                target={selectedOption.externalLink.external
                  ? "_blank"
                  : "_self"}
                rel={selectedOption.externalLink.external
                  ? "noopener noreferrer"
                  : ""}
                class="inline-flex items-center justify-center text-lg px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {selectedOption.externalLink.text}
                {#if selectedOption.externalLink.external}
                  <Icons.IconExternalLink class="w-5 h-5 ml-2" />
                {/if}
              </a>
            </div>
          {/if}
        </div>

        <!-- Back Button -->
        <div class="text-left" in:fade={{ duration: 400, delay: 800 }}>
          <button
            type="button"
            onclick={resetSelection}
            disabled={isTransitioning}
            class="inline-flex items-center text-muted-foreground hover:text-foreground font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            <Icons.IconArrowLeft class="w-4 h-4 mr-1" />
            Change selection
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
