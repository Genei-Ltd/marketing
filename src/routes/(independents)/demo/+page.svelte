<script lang="ts">
  import { goto } from "$app/navigation"
  import PreQualificationForm from "$lib/components/PreQualificationForm.svelte"
  import QualificationForm from "$lib/components/QualificationForm.svelte"
  import type { PreQualificationData } from "$lib/configs/pre-qualification"
  import type { QualificationOption } from "$lib/configs/qualification"
  import { getQualificationConfig } from "$lib/configs/qualification"
  import * as Icons from "@tabler/icons-svelte"
  import { onMount } from "svelte"
  import { cubicOut } from "svelte/easing"
  import { fly } from "svelte/transition"
  import type { ActionData, PageData } from "./$types"
  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form = null }: Props = $props();

  // Multi-step form state
  let currentStep = $state(1)
  let preQualificationData: PreQualificationData | null = $state(null)
  let selectedQualification: QualificationOption | null = null
  let showPricingForQualification = false
  let initialEmail = $state("")

  // Handle currency change
  function handleCurrencyChange(currency: "USD" | "EUR" | "GBP") {
    goto(`/demo?currency=${currency}`, { replaceState: true })
  }

  // Handle pre-qualification completion
  function handlePreQualificationComplete(
    event: CustomEvent<PreQualificationData>,
  ) {
    preQualificationData = event.detail
    currentStep = 2
  }

  // Handle qualification selection
  function handleQualificationChange(option: QualificationOption) {
    selectedQualification = option
    showPricingForQualification = option.showPricing || false
  }

  // Handle back navigation
  function goBackToPreQualification() {
    currentStep = 1
  }

  // Get qualification config
  let qualificationConfig = $derived(getQualificationConfig())

  // Initialize email from URL parameter
  onMount(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get("email")
      if (emailParam) {
        initialEmail = emailParam
      }
    }
  })
</script>

<svelte:head>
  <title>Demo - CoLoop</title>
  <meta
    name="description"
    content="Help us recommend the right solution for your needs"
  />
</svelte:head>

<div class="h-full flex flex-col justify-center items-center my-8 flex-1">
  {#if currentStep === 1}
    <!-- Pre-qualification Step -->
    <div
      class="w-full h-full"
      in:fly={{ x: -50, duration: 400, easing: cubicOut }}
      out:fly={{ x: -50, duration: 300, easing: cubicOut }}
    >
      <PreQualificationForm
        {initialEmail}
        {form}
        on:complete={handlePreQualificationComplete}
      />
    </div>
  {:else if currentStep === 2}
    <!-- Main Qualification Step -->
    <div
      in:fly={{ x: 50, duration: 400, easing: cubicOut }}
      out:fly={{ x: 50, duration: 300, easing: cubicOut }}
      class="w-full h-full"
    >
      <div
        class="w-full h-full relative max-w-6xl mx-auto px-4 flex justify-center items-center flex-col gap-4"
      >
        <!-- Back Button -->
        <div class="w-full">
          <button
            onclick={goBackToPreQualification}
            class="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icons.IconArrowLeft class="w-4 h-4 mr-2" />
            Back to previous step
          </button>
        </div>

        <div
          class="w-full flex flex-row gap-4 my-8 justify-center items-center"
        >
          <!-- Progress Indicator -->
          <div class=" w-fit">
            <div
              class="flex items-center space-x-2 text-sm text-muted-foreground"
            >
              <div class="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span>Step 2 of 2</span>
            </div>
          </div>

          <!-- User Info Display -->
          {#if preQualificationData}
            <div class="w-fit">
              <div
                class="bg-primary/5 border border-primary/20 rounded-lg p-4 inline-flex items-center space-x-4"
              >
                <div class="flex items-center space-x-2">
                  <Icons.IconMail class="w-4 h-4 text-primary" />
                  <span class="font-medium text-foreground">
                    {preQualificationData.email}
                  </span>
                </div>
                {#if preQualificationData.productInterest}
                  <div
                    class="flex items-center space-x-2 border-l border-primary/20 pl-4"
                  >
                    <Icons.IconMessages class="w-4 h-4 text-primary" />
                    <span class="text-sm text-foreground/80">
                      Interested in {preQualificationData.productInterest ===
                      "qualification"
                        ? "Qualification Questions"
                        : "Open-Ended Analysis"}
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Qualification Form -->
      <QualificationForm
        config={qualificationConfig}
        pricingPlans={data.pricingPlans || []}
        selectedCurrency={data.selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
        onSelectionChange={handleQualificationChange}
      />
    </div>
  {/if}
</div>
