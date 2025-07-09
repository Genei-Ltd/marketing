<script lang="ts">
  import { run } from "svelte/legacy"

  import { enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import * as Icons from "@tabler/icons-svelte"
  import type { ComponentType } from "svelte"
  import { backOut, quintOut } from "svelte/easing"
  import { fly } from "svelte/transition"
  import type { ActionData, PageData } from "./$types"
  import type { UsageAdjustments } from "./+page.server"

  interface Props {
    data: PageData
    form: ActionData
  }

  let { data, form }: Props = $props()

  // Currency selection logic
  const validCurrencies = ["USD", "EUR", "GBP", "TEST"] as const
  type ValidCurrency = (typeof validCurrencies)[number]

  function isValidCurrency(currency: string | null): currency is ValidCurrency {
    return (
      currency !== null && validCurrencies.includes(currency as ValidCurrency)
    )
  }

  let selectedCurrency: ValidCurrency = $state(
    (() => {
      const urlCurrency = $page.url.searchParams.get("currency")
      return isValidCurrency(urlCurrency) ? urlCurrency : "USD"
    })(),
  )

  // Keep selectedCurrency in sync with URL changes
  run(() => {
    const urlCurrency = $page.url.searchParams.get("currency")
    selectedCurrency = isValidCurrency(urlCurrency) ? urlCurrency : "USD"
  })

  function updateCurrency(newCurrency: ValidCurrency) {
    const url = new URL($page.url)
    url.searchParams.set("currency", newCurrency)
    goto(url.toString())
  }

  // Initialize quantities for each item
  let quantities: { [itemId: string]: number } = $state({})
  run(() => {
    if (data.items) {
      data.items.forEach((item) => {
        if (!(item.id in quantities)) {
          quantities[item.id] = 0
        }
      })
    }
  })

  function increment(itemId: string) {
    quantities[itemId] = (quantities[itemId] || 0) + 1
  }

  function decrement(itemId: string) {
    quantities[itemId] = Math.max(0, (quantities[itemId] || 0) - 1)
  }

  // Helper to get icon component safely
  function getIconComponent(iconName: string): ComponentType {
    return (Icons as any)[iconName] || Icons.IconPackage
  }

  // Reactive statement for total price
  let totalPrice = $derived(
    data.items?.reduce((acc, item) => {
      const quantity = quantities[item.id] || 0
      const unitAmount =
        typeof item.unit_amount === "number" ? item.unit_amount : 0
      return acc + quantity * unitAmount
    }, 0) || 0,
  )

  // Reactive statement for total usage adjustments
  let totalUsageAdjustments = $derived(
    (() => {
      const adjustments: UsageAdjustments = {}

      data.items?.forEach((item) => {
        const quantity = quantities[item.id] || 0
        if (quantity > 0 && item.allowance_units) {
          Object.entries(item.allowance_units).forEach(
            ([usageType, adjustment]) => {
              if (adjustment) {
                const totalDelta = quantity * adjustment.delta
                const key = usageType as keyof UsageAdjustments

                // If this usage type already exists, add to the existing delta
                if (adjustments[key]) {
                  adjustments[key] = {
                    delta: adjustments[key]!.delta + totalDelta,
                    direction: adjustment.direction,
                  }
                } else {
                  // Otherwise, create a new entry
                  adjustments[key] = {
                    delta: totalDelta,
                    direction: adjustment.direction,
                  }
                }
              }
            },
          )
        }
      })

      return adjustments
    })(),
  )

  // Helper to format usage type names for display
  function formatUsageTypeName(usageType: string): string {
    const typeMap: { [key: string]: string } = {
      projectUsage: "Projects",
      chatMessageUsage: "Chat Messages",
      gridQuestionUsage: "Analysis Grid Questions",
      transcriptionUsage: "Transcription Hours",
      translationUsage: "Translation Hours",
      openEndLabelUsage: "Open-End Credits",
    }
    return typeMap[usageType] || usageType
  }

  // Helper to get usage type icons
  function getUsageTypeIcon(usageType: string): ComponentType {
    const iconMap: { [key: string]: ComponentType } = {
      projectUsage: Icons.IconClipboard,
      chatMessageUsage: Icons.IconMessageCircle,
      gridQuestionUsage: Icons.IconGrid4x4,
      transcriptionUsage: Icons.IconMicrophone,
      translationUsage: Icons.IconLanguage,
      openEndLabelUsage: Icons.IconMessages,
    }
    return iconMap[usageType] || Icons.IconPackage
  }

  // Helper to format currency
  function formatCurrency(amount: number, currencyCode: string) {
    const value = amount / 100
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)

    // Remove .00 if it's a whole number
    return formatted.replace(/\.00$/, "")
  }

  // Helper to format currency with code label
  function formatCurrencyWithCode(amount: number, currencyCode: string) {
    const value = amount / 100
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)

    // Remove .00 if it's a whole number
    const cleanFormatted = formatted.replace(/\.00$/, "")
    return `${cleanFormatted} ${currencyCode.toUpperCase()}`
  }

  // Reactive declarations
  let actionFormError = $derived(form?.formError || null)
  let loadError = $derived(data.error || null)
  let displayError = $derived(actionFormError || loadError)
  let workspaceName = $derived(data.workspaceName || "your workspace")
  let workspaceAvatarUrl = $derived(data.workspaceAvatarUrl || null)
  let totalAmountForDisplay = $derived((totalPrice / 100).toFixed(2))
  let selectedItemsCount = $derived(
    Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
  )

  // State for collapsible receipt
  let showDetailedReceipt = $state(false)
</script>

<svelte:head>
  <title>Self-Serve Credits - CoLoop</title>
  <meta
    name="description"
    content="Purchase credits for your CoLoop workspace. Secure payments with instant delivery."
  />
  <!-- Preload critical images -->
  <link rel="preload" href="/logo.png" as="image" />
  <link rel="preload" href="/logos/black.png" as="image" />
  <style>
    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.02);
      }
    }

    .animate-pulse-subtle {
      animation: pulse 2s ease-in-out infinite;
    }

    /* Prevent layout shift for images */
    img {
      display: block;
    }
  </style>
</svelte:head>

<div class="min-h-screen bg-background">
  <div
    class="container mx-auto p-4 md:p-8 max-w-4xl transition-all duration-300 ease-out"
  >
    <!-- Header Section -->
    <div class="text-center mb-12">
      <div
        class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
      >
        {#if data.workspaces && data.workspaces.length > 0}
          <Icons.IconBuilding class="w-8 h-8 text-primary" />
        {:else}
          <Icons.IconCreditCard class="w-8 h-8 text-primary" />
        {/if}
      </div>
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {#if data.workspaces && data.workspaces.length > 0}
          Choose Your CoLoop Workspace
        {:else}
          Add Credits to Your CoLoop Workspace
        {/if}
      </h1>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        {#if data.workspaces && data.workspaces.length > 0}
          Select the workspace you'd like to purchase credits for. All purchases
          are secure and credits are added instantly.
        {:else}
          Top up credits in your workspace. All purchases are secure and credits
          are added instantly.
        {/if}
      </p>
    </div>

    <!-- Currency Toggle - Only show when we have items (after workspace selection) -->
    {#if data.items && data.items.length > 0}
      <div class="flex justify-center mb-8 w-full">
        <div
          class="inline-flex items-center bg-card border border-border rounded-lg p-1 shadow-sm w-full"
        >
          <div class="flex w-full gap-1 font-bold">
            <button
              type="button"
              class="px-4 py-2 text-lg font-bold rounded-md transition-all duration-200 w-full {selectedCurrency ===
              'USD'
                ? 'bg-primary/80 text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
              class:active={selectedCurrency === "USD"}
              onclick={() => updateCurrency("USD")}
            >
              🇺🇸 USD
            </button>
            <button
              type="button"
              class="px-4 py-2 text-lg font-bold rounded-md transition-all duration-200 w-full {selectedCurrency ===
              'EUR'
                ? 'bg-primary/80 text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
              class:active={selectedCurrency === "EUR"}
              onclick={() => updateCurrency("EUR")}
            >
              🇪🇺 EUR
            </button>
            <button
              type="button"
              class="px-4 py-2 text-lg font-bold rounded-md transition-all duration-200 w-full {selectedCurrency ===
              'GBP'
                ? 'bg-primary/80 text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
              class:active={selectedCurrency === "GBP"}
              onclick={() => updateCurrency("GBP")}
            >
              🇬🇧 GBP
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Workspace Info - Only show when we have selected a workspace (have ID and items) -->
    {#if data.items && data.items.length > 0}
      {#if workspaceName && workspaceName !== "Unknown Workspace" && workspaceName !== "your workspace"}
        <div
          class="relative flex items-center justify-center my-16 p-6 bg-card border border-border rounded-lg shadow-sm"
        >
          <div
            class="absolute top-2 left-2 flex items-center justify-center gap-2"
          >
            <img
              src="/logo.png"
              alt="CoLoop Logo"
              class="w-5 h-5 rounded-lg bg-primary"
              loading="eager"
            />
            <span
              class="text-xs text-muted-foreground/80 font-semibold uppercase"
            >
              CoLoop Workspace
            </span>
          </div>
          <div class="text-center">
            <p
              class="text-sm text-muted-foreground mb-1 uppercase tracking-wide"
            >
              Adding credits to
            </p>
            <div class="flex items-center justify-center">
              {#if workspaceAvatarUrl}
                <img
                  src={workspaceAvatarUrl}
                  alt="{workspaceName} WorkspaceAvatar"
                  class="w-8 h-8 rounded-lg mr-2 shadow"
                  loading="eager"
                />
              {/if}
              <p class="text-xl font-semibold text-card-foreground">
                {workspaceName}
              </p>
            </div>
          </div>
        </div>
      {:else if data.id}
        <div
          class="flex items-center justify-center mb-8 p-6 bg-card border border-border rounded-lg shadow-sm"
        >
          <div class="text-center">
            <p class="text-sm text-muted-foreground mb-1">Workspace ID</p>
            <p class="text-lg font-mono text-card-foreground">
              {data.id}
            </p>
            <p class="text-xs text-muted-foreground mt-1">(Name not found)</p>
          </div>
        </div>
      {/if}
    {/if}

    <!-- Error Display -->
    {#if displayError && !data.workspaces?.length}
      <div
        class="bg-destructive/20 border border-destructive text-foreground px-6 py-4 rounded-lg mb-8"
        role="alert"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <Icons.IconAlertTriangle class="h-6 w-6 text-destructive" />
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold">Something went wrong</h3>
            <p class="mt-1">{displayError}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Workspace Selection -->
    {#if data.workspaces && data.workspaces.length > 0}
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-foreground mb-3">
            Select a Workspace
          </h2>
          <p class="text-muted-foreground">
            Choose which workspace you'd like to add credits to
          </p>
        </div>

        <div class="space-y-3">
          {#each data.workspaces as workspace}
            <button
              type="button"
              onclick={() => {
                const url = new URL($page.url)
                url.searchParams.set("id", workspace.id)
                if (selectedCurrency !== "USD") {
                  url.searchParams.set("currency", selectedCurrency)
                }
                goto(url.toString())
              }}
              class="w-full p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group"
            >
              <div class="flex items-center space-x-4">
                {#if workspace.imageUrl}
                  <img
                    src={workspace.imageUrl}
                    alt="{workspace.name} avatar"
                    class="w-12 h-12 rounded-lg object-cover border border-border/50 group-hover:border-primary/30 transition-colors duration-200"
                    loading="lazy"
                  />
                {:else}
                  <div
                    class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200"
                  >
                    <Icons.IconBuilding class="w-6 h-6 text-primary" />
                  </div>
                {/if}

                <div class="flex-1 text-left">
                  <h3
                    class="font-semibold text-foreground group-hover:text-primary transition-colors duration-200"
                  >
                    {workspace.name}
                  </h3>
                  <p class="text-sm text-muted-foreground mt-1">
                    Workspace ID: {workspace.id}
                  </p>
                </div>

                <div class="flex-shrink-0">
                  <Icons.IconChevronRight
                    class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                  />
                </div>
              </div>
            </button>
          {/each}
        </div>

        <!-- No workspaces found -->
        {#if data.workspaces.length === 0}
          <div
            class="text-center py-12 bg-card rounded-lg border border-border"
          >
            <div
              class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Icons.IconBuilding class="w-8 h-8 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-2">
              No workspaces found
            </h3>
            <p class="text-muted-foreground mb-4">
              You don't appear to be a member of any CoLoop workspaces.
            </p>
            <p class="text-sm text-muted-foreground">
              Contact <span class="text-primary font-semibold"
                >support@coloop.ai</span
              > for assistance.
            </p>
          </div>
        {/if}
      </div>
    {:else if data.items && data.items.length > 0}
      <form method="POST" action="?/checkout" id="checkout-form" use:enhance>
        <input type="hidden" name="currency" value={selectedCurrency} />
        <input type="hidden" name="id" value={data.id} />
        <input
          type="hidden"
          name="usage_adjustments"
          value={JSON.stringify(totalUsageAdjustments)}
        />

        <!-- Credit Packs - Single Column -->
        <div class="space-y-6 mb-12">
          {#each data.items as item (item.id)}
            <div class="relative transition-all duration-300 ease-out">
              <!-- Badge -->
              {#if item.badge}
                <div class="absolute -top-3 left-5 z-30">
                  <span
                    class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-primary/20 {item.badge ===
                    'RECOMMENDED'
                      ? ''
                      : ''}"
                  >
                    {item.badge}
                  </span>
                </div>
              {/if}

              <div
                class="bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-visible relative z-20 {item.error
                  ? 'border-destructive bg-destructive/5'
                  : item.badge
                    ? 'border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5'
                    : quantities[item.id] > 0
                      ? 'ring-2 ring-primary/40 border-primary/20'
                      : 'border border-border hover:border-border/60'}"
              >
                {#if !item.error}
                  {@const SvelteComponent = getIconComponent(item.icon)}
                  <div class="p-5">
                    <div class="flex items-start justify-between gap-6">
                      <!-- Left side: Icon, Title, Description -->
                      <div class="flex items-start space-x-3 flex-1 min-w-0">
                        <div class="flex-shrink-0 mt-0.5">
                          <div
                            class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center ring-1 ring-primary/20"
                          >
                            <SvelteComponent class="w-5 h-5 text-primary" />
                          </div>
                        </div>

                        <div class="flex-1 min-w-0">
                          <h3
                            class="text-lg font-bold text-card-foreground mb-1 leading-tight"
                          >
                            {item.name}
                          </h3>
                          <p
                            class="text-muted-foreground text-sm mb-3 leading-relaxed"
                          >
                            {item.description || "No description available."}
                          </p>

                          <!-- Benefits -->
                          {#if item.benefits && item.benefits.length > 0}
                            <div class="space-y-1.5">
                              {#each item.benefits as benefit}
                                <div
                                  class="flex items-start text-sm text-muted-foreground"
                                >
                                  <Icons.IconCheck
                                    class="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0 mt-0.5"
                                  />
                                  <span class="leading-relaxed">{benefit}</span>
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      </div>

                      <!-- Right side: Price and Quantity -->
                      <div class="flex-shrink-0 text-right">
                        <!-- Price -->
                        <div class="mb-4">
                          <div
                            class="text-2xl font-bold text-foreground leading-none"
                          >
                            {formatCurrency(
                              item.unit_amount || 0,
                              item.currency || "usd",
                            )}
                          </div>
                          <div
                            class="text-xs text-muted-foreground uppercase tracking-wide mt-0.5"
                          >
                            {item.currency || "usd"}
                          </div>
                        </div>

                        <!-- Quantity Selector -->
                        <div class="flex items-center justify-end space-x-2">
                          <span
                            class="text-xs font-medium text-muted-foreground mr-1"
                            >Qty</span
                          >
                          <div
                            class="flex items-center space-x-1 bg-background rounded-lg p-1"
                          >
                            <button
                              type="button"
                              onclick={() => decrement(item.id)}
                              disabled={quantities[item.id] === 0}
                              class="w-7 h-7 rounded-md bg-muted hover:border hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-border flex items-center justify-center transition-all text-muted-foreground shadow-sm"
                            >
                              <Icons.IconMinus class="w-4 h-4" />
                            </button>

                            <input
                              type="number"
                              id="{item.id}-quantity"
                              name={item.id}
                              bind:value={quantities[item.id]}
                              min="0"
                              max="100"
                              class="w-12 h-7 text-center border-0 bg-transparent font-semibold text-foreground text-sm focus:ring-0 focus:outline-none"
                              aria-label="{item.name} quantity"
                            />

                            <button
                              type="button"
                              onclick={() => increment(item.id)}
                              class="w-7 h-7 rounded-md bg-primary/80 hover:border hover:scale-105 active:scale-95 border-primary flex items-center justify-center transition-all text-primary-foreground shadow-sm"
                            >
                              <Icons.IconPlus class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {#if item.footer}
                      <div
                        class="text-xs justify-end ml-auto text-muted-foreground text-right mt-2"
                      >
                        {item.footer}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <!-- Error State -->
                  <div class="p-6 text-center">
                    <div
                      class="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-4"
                    >
                      <Icons.IconAlertTriangle
                        class="w-6 h-6 text-destructive"
                      />
                    </div>
                    <h3 class="text-lg font-semibold text-destructive mb-2">
                      {item.name}
                    </h3>
                    <p class="text-sm text-destructive-foreground">
                      {item.error}
                    </p>
                  </div>
                {/if}
              </div>

              <!-- Compact Subtotal -->
              {#if quantities[item.id] > 0}
                <div
                  class="relative -mt-2 mx-2 mb-4 z-10"
                  in:fly={{
                    y: -20,
                    duration: 200,
                    easing: quintOut,
                    opacity: 1,
                  }}
                  out:fly={{
                    y: -20,
                    duration: 150,
                    easing: quintOut,
                    opacity: 1,
                  }}
                >
                  <div
                    class="bg-gradient-to-r from-muted/40 to-muted/60 backdrop-blur-sm rounded-b-xl border border-t-0 border-border/40 px-4 pt-3 pb-2 shadow-sm"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2 text-xs">
                        <span class="font-medium text-muted-foreground"
                          >Subtotal</span
                        >
                        <span class="text-muted-foreground/80">
                          {quantities[item.id]} × {formatCurrency(
                            item.unit_amount || 0,
                            item.currency || "usd",
                          )}
                        </span>
                      </div>
                      <div class="flex items-center space-x-3">
                        {#if item.allowance_units && Object.keys(item.allowance_units).length > 0}
                          <div
                            class="flex items-center space-x-3 text-xs text-muted-foreground"
                          >
                            {#each Object.entries(item.allowance_units) as [usageType, adjustment]}
                              {#if adjustment}
                                <span class="font-medium">
                                  +{(
                                    quantities[item.id] * adjustment.delta
                                  ).toLocaleString()}
                                  {#if usageType === "transcriptionUsage" || usageType === "translationUsage"}
                                    hours
                                  {:else if usageType === "gridQuestionUsage"}
                                    questions
                                  {:else if usageType === "chatMessageUsage"}
                                    messages
                                  {:else if usageType === "projectUsage"}
                                    projects
                                  {:else if usageType === "openEndLabelUsage"}
                                    credits
                                  {:else}
                                    units
                                  {/if}
                                </span>
                              {/if}
                            {/each}
                          </div>
                        {/if}
                        <span class="font-bold text-foreground text-sm">
                          {formatCurrency(
                            (item.unit_amount || 0) * quantities[item.id],
                            item.currency || "usd",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Checkout Summary -->
        {#if selectedItemsCount > 0}
          <div
            class="sticky bottom-6 bg-card/50 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden hover:shadow-3xl transition-all duration-300 ease-out scale-105"
            in:fly={{
              y: 100,
              duration: 500,
              easing: backOut,
              opacity: 1,
            }}
            out:fly={{ y: 200, duration: 300, easing: quintOut, opacity: 0 }}
          >
            <!-- Main Summary Row -->
            <div class="p-5">
              <div class="flex items-center justify-between">
                <!-- Left: Cart Info -->
                <div class="flex items-center space-x-3">
                  <Icons.IconShoppingCart class="w-5 h-5 text-primary" />
                  <div>
                    <h3 class="font-bold text-foreground leading-tight">
                      {selectedItemsCount} item{selectedItemsCount !== 1
                        ? "s"
                        : ""}
                    </h3>
                    {#if Object.keys(totalUsageAdjustments).length > 0}
                      <p class="text-xs text-muted-foreground">
                        {Object.keys(totalUsageAdjustments).length} credit type{Object.keys(
                          totalUsageAdjustments,
                        ).length !== 1
                          ? "s"
                          : ""}
                      </p>
                    {/if}
                  </div>
                </div>

                <!-- Right: Total & Checkout -->
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <p class="text-2xl font-bold text-foreground">
                      {formatCurrencyWithCode(
                        totalPrice,
                        data.items[0]?.currency || "usd",
                      )}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={totalPrice === 0 || !data.id || !!loadError}
                    class="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span class="flex items-center space-x-2">
                      <span>Checkout</span>
                      <Icons.IconArrowRight
                        class="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Credits Dropdown -->
            {#if Object.keys(totalUsageAdjustments).length > 0}
              <div class="border-t border-border/30">
                <button
                  type="button"
                  onclick={() => (showDetailedReceipt = !showDetailedReceipt)}
                  class="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/30 bg-muted/50 transition-colors group"
                >
                  <div class="flex items-center space-x-2">
                    <Icons.IconListDetails
                      class="w-4 h-4 font-bold text-foreground"
                    />
                    <span
                      class="text-sm font-bold text-foreground transition-colors"
                    >
                      Credits breakdown
                    </span>
                  </div>

                  <div class="flex items-center space-x-3">
                    <!-- Credits Preview -->
                    {#if !showDetailedReceipt}
                      <div class="flex items-center space-x-3 text-sm">
                        {#each Object.entries(totalUsageAdjustments).slice(0, 2) as [usageType, amount]}
                          {@const SvelteComponent_1 =
                            getUsageTypeIcon(usageType)}
                          <div
                            class="flex items-center space-x-1.5 text-foreground transition-colors"
                          >
                            <SvelteComponent_1 class="w-4 h-4" />
                            <span class="font-medium">
                              +{amount.delta.toLocaleString()}
                            </span>
                          </div>
                        {/each}
                        {#if Object.keys(totalUsageAdjustments).length > 2}
                          <span
                            class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            +{Object.keys(totalUsageAdjustments).length - 2} more
                          </span>
                        {/if}
                      </div>
                    {/if}
                    <Icons.IconChevronDown
                      class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all duration-200 {showDetailedReceipt
                        ? 'rotate-180'
                        : ''}"
                    />
                  </div>
                </button>

                {#if showDetailedReceipt}
                  <div
                    class="px-5 pb-4 space-y-1 bg-muted/50"
                    transition:fly={{ y: -10, duration: 200 }}
                  >
                    {#each Object.entries(totalUsageAdjustments) as [usageType, amount]}
                      {@const SvelteComponent_2 = getUsageTypeIcon(usageType)}
                      <div
                        class="flex items-center justify-between py-1.5 text-muted-foreground/80 hover:bg-muted/30 rounded-lg px-2 mx-2 transition-colors"
                      >
                        <div class="flex items-center space-x-2.5">
                          <SvelteComponent_2 class="w-4 h-4 " />
                          <span class="text-xs">
                            {formatUsageTypeName(usageType)}
                          </span>
                        </div>
                        <span class="text-xs">
                          +{amount.delta.toLocaleString()}
                          {#if usageType === "transcriptionUsage" || usageType === "translationUsage"}
                            hours
                          {:else if usageType === "gridQuestionUsage"}
                            questions
                          {:else if usageType === "chatMessageUsage"}
                            messages
                          {:else if usageType === "projectUsage"}
                            projects
                          {:else if usageType === "openEndLabelUsage"}
                            credits
                          {:else}
                            units
                          {/if}
                        </span>
                      </div>
                    {/each}

                    <!-- Trust indicators -->
                    <div class="pt-3 mt-3 border-t border-border/20">
                      <div
                        class="flex items-center justify-center space-x-6 text-xs text-muted-foreground"
                      >
                        <div class="flex items-center space-x-1.5">
                          <Icons.IconClock class="w-3.5 h-3.5" />
                          <span class="font-medium">Instant activation</span>
                        </div>
                        <div class="flex items-center space-x-1.5">
                          <Icons.IconShieldCheck class="w-3.5 h-3.5" />
                          <span class="font-medium">Secure payment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {:else}
          <div
            class="text-center py-12"
            in:fly={{
              y: 100,
              duration: 500,
              easing: backOut,
              opacity: 1,
            }}
            out:fly={{ y: 200, duration: 300, easing: quintOut, opacity: 0 }}
          >
            <div
              class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Icons.IconShoppingBag class="w-8 h-8 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-2">
              Select your credit packs
            </h3>
            <p class="text-muted-foreground">
              Choose the quantities you need and proceed to checkout
            </p>
          </div>
        {/if}
      </form>
    {:else if !loadError}
      <!-- Loading State -->
      <div class="text-center py-20">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
        >
          <Icons.IconLoader class="animate-spin h-8 w-8 text-primary" />
        </div>
        <h3 class="text-xl font-semibold text-foreground mb-2">
          Loading credit packs...
        </h3>
        <p class="text-muted-foreground">
          Please wait while we fetch the available options
        </p>
      </div>
    {:else if !actionFormError && !data.items?.length}
      <!-- Empty State -->
      <div
        class="text-center py-20 bg-card rounded-lg shadow-sm border border-border"
      >
        <div
          class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Icons.IconPackage class="w-8 h-8 text-primary" />
        </div>
        <h3 class="text-2xl font-bold text-card-foreground mb-4">
          No credit packs available
        </h3>
        <p class="text-muted-foreground mb-8 max-w-md mx-auto">
          There are currently no credit packs available for purchase. Please
          check back later or contact our support team.
        </p>
        <span class="  font-semibold"> Contact </span>
        <span class=" text-primary font-semibold"> support@coloop.ai </span>
      </div>
    {/if}

    <!-- Trust Indicators -->
    <div class="mt-16 text-center">
      <div
        class="flex items-center justify-center space-x-8 text-muted-foreground"
      >
        <div class="flex items-center space-x-2">
          <Icons.IconShield class="w-5 h-5" />
          <span class="text-sm">Secure Payment</span>
        </div>
        <div class="flex items-center space-x-2">
          <Icons.IconBolt class="w-5 h-5" />
          <span class="text-sm">Instant Activation</span>
        </div>
        <div class="flex items-center space-x-2">
          <Icons.IconShieldCheck class="w-5 h-5" />
          <span class="text-sm">Secured with Stripe</span>
        </div>
      </div>
    </div>

    <!-- talk to support somethign doesnt look right -->
    <div class="text-center pt-12">
      <div class="  text-foreground mb-2">
        Something doesn't look right?
        <span class="  font-semibold"> Contact </span>
        <span class=" text-primary font-semibold"> support@coloop.ai </span>
      </div>
    </div>
  </div>
</div>
