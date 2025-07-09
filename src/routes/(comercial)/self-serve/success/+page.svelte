<script lang="ts">
  import {
    APP_BASE_URL,
    DOCS_URL,
    SUPPORT_EMAIL,
    WEBSITE_NAME,
  } from "$lib/../config"
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import {
    IconArrowRight,
    IconBuilding,
    IconCalendar,
    IconCheck,
    IconClipboard,
    IconCreditCard,
    IconExternalLink,
    IconFileText,
    IconGrid4x4,
    IconLanguage,
    IconMail,
    IconMessageCircle,
    IconMessages,
    IconMicrophone,
    IconPackage,
    IconShield,
    IconShoppingCart,
    IconSparkles,
    IconUser,
  } from "@tabler/icons-svelte"

  let { data } = $props();

  let copied = false
  let copiedTransactionId = $state(false)

  // Format currency with null checks
  function formatCurrency(amount: number | null, currency: string | null) {
    if (!amount || !currency) return "$0.00"
    const value = amount / 100
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
    return formatted.replace(/\.00$/, "")
  }

  // Format date
  function formatDate(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get product name from line item
  function getProductName(lineItem: any) {
    return lineItem.price?.product?.name || "Unknown Product"
  }

  // Get product description from line item
  function getProductDescription(lineItem: any) {
    return lineItem.price?.product?.description || ""
  }

  // Copy transaction ID to clipboard
  async function copyTransactionId() {
    try {
      await navigator.clipboard.writeText(data.session.id)
      copiedTransactionId = true
      setTimeout(() => {
        copiedTransactionId = false
      }, 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // Calculate total items
  let totalItems =
    $derived(data.lineItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0)

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
  function getUsageTypeIcon(usageType: string) {
    const iconMap: { [key: string]: any } = {
      projectUsage: IconClipboard,
      chatMessageUsage: IconMessageCircle,
      gridQuestionUsage: IconGrid4x4,
      transcriptionUsage: IconMicrophone,
      translationUsage: IconLanguage,
      openEndLabelUsage: IconMessages,
    }
    return iconMap[usageType] || IconPackage
  }

  // Helper to get usage type units
  function getUsageTypeUnit(usageType: string): string {
    const unitMap: { [key: string]: string } = {
      projectUsage: "projects",
      chatMessageUsage: "messages",
      gridQuestionUsage: "questions",
      transcriptionUsage: "hours",
      translationUsage: "hours",
      openEndLabelUsage: "credits",
    }
    return unitMap[usageType] || "units"
  }

  // Helper to get usage type colors
  function getUsageTypeColor(usageType: string): string {
    const colorMap: { [key: string]: string } = {
      projectUsage: "bg-blue-50 border-blue-200 text-blue-700",
      chatMessageUsage: "bg-green-50 border-green-200 text-green-700",
      gridQuestionUsage: "bg-purple-50 border-purple-200 text-purple-700",
      transcriptionUsage: "bg-orange-50 border-orange-200 text-orange-700",
      translationUsage: "bg-pink-50 border-pink-200 text-pink-700",
      openEndLabelUsage: "bg-indigo-50 border-indigo-200 text-indigo-700",
    }
    return colorMap[usageType] || "bg-gray-50 border-gray-200 text-gray-700"
  }

  // Helper to get usage type icon colors
  function getUsageTypeIconColor(usageType: string): string {
    const colorMap: { [key: string]: string } = {
      projectUsage: "text-blue-600",
      chatMessageUsage: "text-green-600",
      gridQuestionUsage: "text-purple-600",
      transcriptionUsage: "text-orange-600",
      translationUsage: "text-pink-600",
      openEndLabelUsage: "text-indigo-600",
    }
    return colorMap[usageType] || "text-gray-600"
  }

  // Helper to safely get delta from adjustment
  function getAdjustmentDelta(adjustment: any): number {
    return adjustment?.delta || 0
  }

  // Calculate total credits added
  let totalCreditsAdded = $derived(data.metadata?.usageAdjustments
    ? Object.values(data.metadata.usageAdjustments).reduce(
        (sum: number, adjustment: any) => sum + (adjustment?.delta || 0),
        0,
      )
    : 0)

  // Download receipt function
  function downloadReceipt() {
    if (data.session.receiptUrl) {
      window.open(data.session.receiptUrl, "_blank")
    } else if (data.session.invoicePdfUrl) {
      window.open(data.session.invoicePdfUrl, "_blank")
    } else {
      console.error("No receipt URL found")
    }
  }
</script>

<svelte:head>
  <title>Payment Successful - {WEBSITE_NAME}</title>
  <meta
    name="description"
    content="Your payment has been processed successfully."
  />
</svelte:head>

<div
  class="min-h-screen bg-linear-to-br from-background via-background to-muted/20"
>
  <div class="container mx-auto p-4 md:p-8 max-w-4xl">
    <!-- Success Header -->
    <div class="text-center mb-16 pt-12">
      <div
        class="relative inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-green-100 to-emerald-100 rounded-full mb-8 ring-8 ring-green-200/50 shadow"
      >
        <IconCheck class="w-12 h-12 text-green-600" stroke-width="2.5" />
        <div
          class="absolute -top-2 -right-2 w-8 h-8 overflow-hidden rounded-full flex items-center justify-center shadow"
        >
          <img src="/logo.png" alt="CoLoop" class="h-full" />
        </div>
      </div>
      <h1
        class="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight"
      >
        Payment Successful!
      </h1>
      <p
        class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
      >
        Your credits have been added to your workspace and are ready to use
        immediately.
      </p>

      <!-- Total Credits Added - Full Width -->
      <div class=" mx-auto">
        <Card
          class="p-4 bg-linear-to-br from-green-200 to-emerald-200 border border-green-500 shadow"
        >
          <div class="text-center">
            <div class="text-xl font-bold text-green-700 mb-2">
              {totalCreditsAdded.toLocaleString()}
              <span class="font-semibold pl-2"> Total Credits Added </span>
            </div>
            <div
              class="text-sm flex items-center justify-center gap-2 text-green-700 font-semibold"
            >
              <IconCheck class="w-4 h-4 text-green-700" />
              Ready to use immediately.
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto space-y-6 mb-16">
      <!-- Purchased Items - Receipt Style -->
      {#if data.lineItems && data.lineItems.length > 0}
        <Card class="p-0 shadow border border-border bg-white overflow-hidden">
          <!-- Receipt Header -->
          <div
            class="bg-linear-to-r from-gray-50 to-gray-100 p-6 border-b border-dashed border-gray-300"
          >
            <div class="text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <IconShoppingCart class="w-5 h-5 text-gray-600" />
                <h2
                  class="text-lg font-bold text-gray-800 uppercase tracking-wide"
                >
                  Purchase Receipt
                </h2>
              </div>
              <div class="text-sm text-gray-500 font-mono uppercase">
                {formatDate(data.session.created)}
              </div>

              <div class="text-sm text-gray-500 font-mono uppercase">
                Status: {data.session.payment_status.toUpperCase()}
              </div>
            </div>
          </div>

          <!-- Receipt Body -->
          <div class="p-6 bg-white font-mono text-sm">
            <!-- Items -->
            <div class="space-y-3 mb-6">
              {#each data.lineItems as item}
                <div class="border-b border-dotted border-gray-300 pb-3">
                  <div class="flex justify-between items-start mb-1">
                    <div class="flex-1 pr-4">
                      <div
                        class="font-semibold text-gray-800 uppercase text-sm tracking-wide"
                      >
                        {getProductName(item)}
                      </div>
                      {#if getProductDescription(item)}
                        <div class="text-xs text-gray-600 mt-1">
                          {getProductDescription(item)}
                        </div>
                      {/if}
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-gray-800">
                        {formatCurrency(
                          item.amount_total,
                          data.session.currency,
                        )}
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between text-sm text-gray-500">
                    <span>QTY: {item.quantity}</span>
                    <span>
                      {formatCurrency(
                        (item.amount_total || 0) / (item.quantity || 1),
                        data.session.currency,
                      )} each
                    </span>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Total Section -->
            <div class="border-t-2 border-gray-800 pt-3">
              <div class="flex justify-between items-center">
                <span
                  class="font-bold text-gray-800 uppercase tracking-wide text-xl"
                  >TOTAL</span
                >
                <span class="font-bold text-xl text-gray-800">
                  {formatCurrency(
                    data.session.amount_total,
                    data.session.currency,
                  )}
                </span>
              </div>
              <div class="flex justify-between text-sm text-gray-500 mt-1">
                <span>PAYMENT METHOD</span>
                <span>
                  {#if data.session.payment_intent && typeof data.session.payment_intent === "object" && data.session.payment_intent.payment_method && typeof data.session.payment_intent.payment_method === "object"}
                    {data.session.payment_intent.payment_method.type?.toUpperCase() ||
                      "CARD"}
                  {:else}
                    CARD
                  {/if}
                </span>
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>STATUS</span>
                <span class="text-green-600 font-semibold"
                  >{data.session.payment_status.toUpperCase()}</span
                >
              </div>
              <div
                class="flex justify-between text-sm text-gray-500 pt-2 mt-4 border-t border-dotted border-gray-300"
              >
                <span>TRANSACTION ID</span>
                <span class="font-mono break-all text-right max-w-[200px]"
                  >{data.session.id}</span
                >
              </div>
            </div>

            <!-- Receipt Footer -->
            <div
              class="mt-8 pt-6 border-t-2 border-dashed border-gray-400 font-mono"
            >
              <div class="text-center space-y-3">
                <div
                  class="text-sm text-gray-600 font-semibold uppercase tracking-wider"
                >
                  Thank you for your purchase!
                </div>
                <div class="text-sm text-gray-500">
                  Credits have been added to your workspace and are ready to use
                </div>

                <!-- Support info -->
                <div class="text-sm text-gray-400 mt-4 space-y-1">
                  <div>Questions? Contact us at {SUPPORT_EMAIL}</div>
                  <div class="font-mono">{APP_BASE_URL}</div>
                </div>

                <!-- Logo and branding -->
                <div
                  class="flex flex-col items-center justify-center mt-6 pt-4 space-y-2"
                >
                  <img
                    src="/logos/black.png"
                    alt="CoLoop"
                    class="h-5 opacity-70"
                  />
                  <div
                    class="text-sm text-gray-400 font-semibold tracking-wider font-mono"
                  >
                    AI INSIGHTS FROM COLOOP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      {/if}

      <!-- Payment Details Card -->
      <Card class="p-8 shadow border border-border bg-card backdrop-blur-sm">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20"
            >
              <IconCreditCard class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-card-foreground">
                Payment Details
              </h2>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex items-center gap-1">
                  <IconCheck class="w-4 h-4 text-green-600" />
                  <span class="text-sm font-medium text-green-700"
                    >Transaction completed successfully</span
                  >
                </div>
                <span class="text-muted-foreground">•</span>
                <span class="text-sm text-muted-foreground">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} purchased
                </span>
              </div>
            </div>
          </div>
          {#if data.session.receiptUrl || data.session.invoicePdfUrl}
            <Button
              variant="outline"
              size="sm"
              on:click={downloadReceipt}
              class="shadow-sm"
            >
              <IconExternalLink class="w-4 h-4 mr-2" />
              View Receipt
            </Button>
          {/if}
        </div>

        <!-- Payment Information Section -->
        <div class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <div
                class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <IconCreditCard class="w-4 h-4" />
                Total Amount
              </div>
              <div class="text-4xl font-bold text-foreground">
                {formatCurrency(
                  data.session.amount_total,
                  data.session.currency,
                )}
              </div>
              <div
                class="text-xs text-muted-foreground uppercase tracking-wider font-medium"
              >
                {data.session.currency || "USD"}
              </div>
            </div>

            <div class="space-y-2">
              <div
                class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <IconCalendar class="w-4 h-4" />
                Purchase Date
              </div>
              <div class="text-xl font-semibold text-foreground">
                {formatDate(data.session.created)}
              </div>
            </div>
          </div>

          <!-- Customer Information Section -->
          {#if data.session.customer_email || data.session.customer_name}
            <div class="border-t border-border/30 pt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                {#if data.session.customer_email}
                  <div class="space-y-2">
                    <div
                      class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                    >
                      <IconMail class="w-4 h-4" />
                      Email
                    </div>
                    <div class="text-lg font-semibold text-foreground">
                      {data.session.customer_email}
                    </div>
                  </div>
                {/if}

                {#if data.session.customer_name}
                  <div class="space-y-2">
                    <div
                      class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                    >
                      <IconUser class="w-4 h-4" />
                      Customer
                    </div>
                    <div class="text-lg font-semibold text-foreground">
                      {data.session.customer_name}
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Workspace Information Section -->
          {#if data.workspace?.id}
            <div class="border-t border-border/30 pt-6">
              <div class="space-y-3">
                <div
                  class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <IconBuilding class="w-4 h-4" />
                  Workspace
                </div>
                <div class="flex items-center gap-3">
                  {#if data.workspace.avatarUrl}
                    <img
                      src={data.workspace.avatarUrl}
                      alt="{data.workspace.name || 'Workspace'} Avatar"
                      class="w-8 h-8 rounded-lg shadow-sm border border-border/20"
                    />
                  {:else}
                    <div
                      class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-border/20"
                    >
                      <IconClipboard class="w-4 h-4 text-primary" />
                    </div>
                  {/if}
                  <div>
                    <div class="text-lg font-semibold text-foreground">
                      {data.workspace.name || data.workspace.id}
                    </div>
                    {#if data.workspace.name}
                      <div class="text-xs text-muted-foreground font-mono">
                        {data.workspace.id}
                      </div>
                    {/if}
                  </div>
                </div>
                <div class="text-xs text-muted-foreground">
                  Credits added to this workspace
                </div>
              </div>
            </div>
          {/if}

          <!-- Transaction Details Section -->
          <div class="border-t border-border/30 pt-6">
            <div class="space-y-4">
              <div
                class="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <IconShield class="w-4 h-4" />
                Transaction Details
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <div
                    class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Payment Status
                  </div>
                  <div class="flex items-center gap-2">
                    <IconCheck class="w-4 h-4 text-green-600" />
                    <span
                      class="text-sm font-semibold text-green-700 uppercase tracking-wide"
                    >
                      {data.session.payment_status}
                    </span>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Transaction ID
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-mono text-foreground truncate">
                      {data.session.id}
                    </span>
                    <button
                      onclick={copyTransactionId}
                      class="p-1 hover:bg-muted rounded transition-colors"
                      title="Copy transaction ID"
                    >
                      {#if copiedTransactionId}
                        <IconCheck class="w-4 h-4 text-green-600" />
                      {:else}
                        <IconClipboard class="w-4 h-4 text-muted-foreground" />
                      {/if}
                    </button>
                  </div>
                  {#if copiedTransactionId}
                    <div class="text-xs text-green-600 font-medium">
                      Copied to clipboard
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Credits Applied Card -->
      {#if data.metadata?.usageAdjustments && Object.keys(data.metadata.usageAdjustments).length > 0}
        <Card class="p-8 shadow border border-border bg-card backdrop-blur-sm">
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20"
            >
              <IconSparkles class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-card-foreground">
                Credits Applied
              </h2>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex items-center gap-1">
                  <IconCheck class="w-4 h-4 text-green-600" />
                  <span class="text-sm font-medium text-green-700"
                    >Credits added successfully</span
                  >
                </div>
                <span class="text-muted-foreground">•</span>
                <span class="text-sm text-muted-foreground">
                  {Object.keys(data.metadata.usageAdjustments).length} credit type{Object.keys(
                    data.metadata.usageAdjustments,
                  ).length !== 1
                    ? "s"
                    : ""} applied
                </span>
              </div>
            </div>
          </div>

          <!-- Credits breakdown with consistent spacing -->
          <div class="space-y-1">
            {#each Object.entries(data.metadata.usageAdjustments) as [usageType, adjustment]}
              {@const SvelteComponent = getUsageTypeIcon(usageType)}
              <div
                class="flex items-center justify-between border-b border-border/20 pb-1 text-base"
              >
                <div class="flex items-center gap-3">
                  <SvelteComponent
                    class="w-5 h-5 text-muted-foreground"
                  />
                  <span class="text-base font-medium text-foreground">
                    {formatUsageTypeName(usageType)}
                  </span>
                </div>

                <div class="text-right">
                  <div class="text-base font-semibold text-foreground">
                    +{getAdjustmentDelta(adjustment).toLocaleString()}
                  </div>
                  <div
                    class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                  >
                    {getUsageTypeUnit(usageType)}
                  </div>
                </div>
              </div>
            {/each}
          </div>

          <!-- Total section with consistent styling -->
          <div class="mt-6 pt-6 border-t-2 border-border/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconSparkles class="w-4 h-4 text-primary" />
                <span class="text-base font-bold text-muted-foreground"
                  >Total Credits Added</span
                >
              </div>
              <div class="text-right">
                <div class="text-xl font-bold text-primary">
                  {totalCreditsAdded.toLocaleString()}
                </div>
                <div
                  class="text-xs text-muted-foreground font-medium uppercase tracking-wider"
                >
                  credits
                </div>
              </div>
            </div>
          </div>
        </Card>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <Button
        variant="default"
        href={APP_BASE_URL}
        class=" px-8 py-3 text-base font-semibold transition-colors"
      >
        Continue to CoLoop
        <IconArrowRight class="w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="outline"
        href={`/self-serve?id=${data.metadata.clerkWorkspaceId || ""}`}
        class="px-8 py-3 text-base font-semibold transition-colors"
      >
        <IconShoppingCart class="w-4 h-4 mr-2" />
        Buy More Credits
      </Button>
    </div>

    <!-- Support & Trust Indicators -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <Card class="p-8 bg-card border border-border  ">
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
          >
            <IconMail class="w-6 h-6 text-primary" />
          </div>
          <h3 class="font-bold text-card-foreground text-xl">Need Help?</h3>
        </div>
        <p class="text-muted-foreground mb-6 leading-relaxed">
          Our support team is here to help with any questions about your
          purchase or account.
        </p>
        <div class="space-y-2">
          <div class="text-sm font-medium text-foreground">
            Contact Support:
          </div>
          <a
            href="mailto:{SUPPORT_EMAIL}"
            class="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold hover:underline underline-offset-2 transition-colors"
          >
            <IconMail class="w-4 h-4 " />
            {SUPPORT_EMAIL}
          </a>
        </div>
      </Card>

      <Card class="p-8 bg-card border border-border  ">
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
          >
            <IconFileText class="w-6 h-6 text-primary" />
          </div>
          <h3 class="font-bold text-card-foreground text-xl">Documentation</h3>
        </div>
        <p class="text-muted-foreground mb-6 leading-relaxed">
          Learn how to make the most of your credits and workspace features.
        </p>
        <Button
          variant="outline"
          href={DOCS_URL}
          class="w-full shadow-sm hover:shadow-md transition-shadow"
        >
          <IconExternalLink class="w-4 h-4 mr-2" />
          View Documentation
        </Button>
      </Card>
    </div>
  </div>
</div>
