<script lang="ts">
  import { enhance } from "$app/forms"
  import { invalidateAll } from "$app/navigation"
  import { page } from "$app/stores"
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import { Card, CardContent } from "$lib/components/ui/card"
  import * as Icon from "@tabler/icons-svelte"

  let { data } = $props()

  //   console.log("♦️ data.workspaces", data.workspaces)

  let cancellingTrialIds: Set<string> = $state(new Set())
  let testingConnection = false
  let cancelErrors: Map<string, { error: string; details?: string }> = $state(
    new Map(),
  )

  function formatDate(dateString: string | number) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "admin":
        return "secondary"
      case "basic_member":
        return "outline"
      default:
        return "outline"
    }
  }

  function formatRole(role: string) {
    return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  function formatUsageValue(value: number) {
    if (value === -1) return "Unlimited"
    return value.toLocaleString()
  }

  function getUsagePercentage(used: number, total: number) {
    if (total === -1) return 0 // Unlimited
    if (total === 0) return 100
    return Math.min((used / total) * 100, 100)
  }

  function getUsageColor(percentage: number) {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  function formatUsageLabel(key: string) {
    const labels: Record<string, string> = {
      chatMessageUsage: "Chat Messages",
      gridQuestionUsage: "Grid Questions",
      projectUsage: "Projects",
      transcriptionUsage: "Transcription",
      translationUsage: "Translation",
      openEndLabelUsage: "Open-End Labels",
    }
    return labels[key] || key
  }

  // Type guards for usage objects
  function isRegularUsage(usage: any): usage is {
    used: number
    total: number
    remaining: number
    period: string
  } {
    return (
      usage &&
      typeof usage === "object" &&
      "used" in usage &&
      "total" in usage &&
      "remaining" in usage
    )
  }

  function isNonCyclingUsage(
    usage: any,
  ): usage is { credited: number; debited: number; remaining: number } {
    return (
      usage &&
      typeof usage === "object" &&
      "credited" in usage &&
      "debited" in usage &&
      "remaining" in usage
    )
  }

  // Product helper functions
  function isTrialProduct(product: any): boolean {
    const isTrialArray = product?.values?.is_trial
    if (
      !isTrialArray ||
      !Array.isArray(isTrialArray) ||
      isTrialArray.length === 0
    ) {
      return false
    }

    // Check if the first item has an option with title "Trial"
    const firstItem = isTrialArray[0]
    return firstItem?.option?.title === "Trial"
  }

  function calculateTimeRemaining(endDate: any): {
    days: number
    expired: boolean
  } {
    if (!endDate || !Array.isArray(endDate) || endDate.length === 0) {
      return { days: 0, expired: true }
    }

    const dateValue = endDate[0]?.value
    if (!dateValue) {
      return { days: 0, expired: true }
    }

    // Parse the date string (format: "2025-08-03")
    const endDateObj = new Date(dateValue)

    // Check if the date is valid
    if (isNaN(endDateObj.getTime())) {
      return { days: 0, expired: true }
    }

    // Get current date without time component
    const now = new Date()
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
    const targetDate = new Date(
      endDateObj.getFullYear(),
      endDateObj.getMonth(),
      endDateObj.getDate(),
    )

    const timeDiff = targetDate.getTime() - currentDate.getTime()
    const days = Math.round(timeDiff / (1000 * 60 * 60 * 24))

    return {
      days: Math.max(0, days),
      expired: days < 0,
    }
  }

  function formatProductType(isTrialArray: any[]): string {
    if (
      !isTrialArray ||
      !Array.isArray(isTrialArray) ||
      isTrialArray.length === 0
    ) {
      return "Unknown"
    }

    const firstItem = isTrialArray[0]
    return firstItem?.option?.title === "Trial" ? "Trial" : "Full Product"
  }

  // Helper function to extract value from Attio field structure
  function getAttioFieldValue(field: any): any {
    if (!field || !Array.isArray(field) || field.length === 0) {
      return null
    }

    const firstItem = field[0]
    if (firstItem?.option) {
      return firstItem.option.title
    }

    return firstItem?.value || null
  }

  // Helper function to get product name
  function getProductName(product: any): string {
    const name = getAttioFieldValue(product?.values?.product_title)
    return name || "Unnamed Product"
  }

  // Helper function to get product start date
  function getProductStartDate(product: any): string | null {
    return getAttioFieldValue(product?.values?.start_date)
  }

  // Helper function to get product end date
  function getProductEndDate(product: any): any[] | null {
    const endDate = product?.values?.end_date
    return Array.isArray(endDate) ? endDate : null
  }

  // Helper function to get product duration
  function getProductDuration(product: any): number {
    const duration = getAttioFieldValue(product?.values?.duration_months)
    return typeof duration === "number" ? duration : 0
  }

  // Helper function to get product origin
  function getProductOrigin(product: any): string | null {
    return getAttioFieldValue(product?.values?.origin_of_purchase)
  }

  function getProductStatusColor(
    isExpired: boolean,
    daysRemaining: number,
  ): string {
    if (isExpired) return "text-red-600"
    if (daysRemaining <= 7) return "text-yellow-600"
    return "text-green-600"
  }

  function clearCancelError(productId: string) {
    console.log("🔄 Clearing cancel error for product:", productId)
    cancelErrors.delete(productId)
    cancelErrors = cancelErrors
  }

  function logDebugInfo(productId: string, workspace: any, product: any) {
    console.log("🐛 Debug Info:", {
      productId,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      stripeSubscriptionId: product.values.stripe_subscription_id[0].value,
      isCancelling: cancellingTrialIds.has(productId),
      hasError: cancelErrors.has(productId),
      error: cancelErrors.get(productId),
      product: product.values,
      timestamp: new Date().toISOString(),
    })
  }

  // Check if we're in development mode
  let isDevelopment = $derived(
    $page.url.hostname === "localhost" || $page.url.hostname === "127.0.0.1",
  )
</script>

<svelte:head>
  <title>Billing & Workspaces - CoLoop</title>
  <meta
    name="description"
    content="Manage your CoLoop workspaces and billing information"
  />
</svelte:head>

<main class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Clean Page Header -->
    <div class="mb-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-4xl font-semibold text-foreground mb-2">
            Billing & Workspaces
          </h1>
          <p class="text-muted-foreground">
            Manage your workspaces and billing information
          </p>
        </div>
        <div
          class="flex items-center gap-6 justify-end border-r border-border pr-4"
        >
          <div class="text-right"></div>
        </div>
      </div>
    </div>

    <!-- User Account Card -->
    <div class="flex flex-row justify-between mb-6">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <Icon.IconUser class="w-5 h-5" />
          <h2 class="text-2xl font-bold text-foreground">
            Account Information
          </h2>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <Card class="border border-border rounded-md">
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="col-span-2">
              <div class="flex items-center gap-4">
                <img
                  src={data.user.imageUrl}
                  alt="User avatar"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 class="font-medium text-foreground">
                    {data.user.firstName || ""}
                    {data.user.lastName || ""}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {data.user.emailAddresses[0]?.emailAddress ||
                      "Not available"}
                  </p>
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-center">
              <p class="text-sm text-muted-foreground mb-1">User ID</p>
              <code class="text-sm bg-muted px-2 py-1 rounded font-mono">
                {data.user.id.slice(0, 12)}...
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Workspaces Section -->
    {#if data.workspaces.length === 0}
      <!-- Clean Empty State -->
      <Card class="border-dashed border-2">
        <CardContent class="flex flex-col items-center justify-center py-12">
          <Icon.IconBuildingCommunity
            class="w-16 h-16 text-muted-foreground mb-4"
          />
          <h3 class="text-lg font-medium mb-2">No workspaces found</h3>
          <p class="text-muted-foreground text-center max-w-md mb-6">
            You're not a member of any workspaces yet. Got to the
            <a href="https://app.coloop.ai" target="_blank">app.coloop.ai</a>
            to create a new workspace or ask an admin to invite you to an existing
            one.
          </p>
          <!-- <Button>
            <Icon.IconPlus class="w-4 h-4 mr-2" />
            Create Your First Workspace
          </Button> -->
        </CardContent>
      </Card>
    {:else}
      <!--  Workspaces  -->
      <div class="flex flex-row justify-between mb-6">
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <Icon.IconBuildingCommunity class="w-5 h-5" />
            <h2 class="text-2xl font-bold text-foreground">Workspaces</h2>
          </div>
          <p class="text-muted-foreground">
            Manage your workspaces and billing information
          </p>
        </div>
        <div class="flex flex-col text-right items-end">
          <p class="text-sm text-muted-foreground">Total Workspaces</p>
          <p class="text-2xl font-medium text-foreground">
            {data.workspaces.length}
          </p>
        </div>
      </div>

      <div class="space-y-8">
        {#each data.workspaces as workspace}
          <div class="border border-border rounded bg-card shadow-sm">
            <!-- Clean Workspace Header -->
            <div
              class="flex items-start justify-between p-6 border-b border-border bg-muted/30"
            >
              <div class="flex items-start gap-4">
                <div class="relative">
                  {#if workspace.imageUrl}
                    <img
                      src={workspace.imageUrl}
                      alt="{workspace.name} logo"
                      class="w-16 h-16 rounded object-cover"
                    />
                  {:else}
                    <div
                      class="w-16 h-16 bg-muted rounded flex items-center justify-center"
                    >
                      <Icon.IconBuildingCommunity
                        class="w-8 h-8 text-muted-foreground"
                      />
                    </div>
                  {/if}
                </div>
                <div class="flex flex-col">
                  <h2 class="text-xl font-medium text-foreground mb-1">
                    {workspace.name}
                  </h2>
                  <div class="flex flex-row gap-2">
                    <div
                      class="flex items-center gap-4 text-sm text-muted-foreground"
                    >
                      <Badge
                        variant={getRoleColor(workspace.userRole)}
                        class="text-xs rounded-sm"
                      >
                        {formatRole(workspace.userRole)}
                      </Badge>
                      <span class="flex items-center gap-1">
                        <Icon.IconUsers class="w-4 h-4" />
                        {workspace.memberCount} members
                      </span>
                      {#if workspace.createdAt}
                        <span class="flex items-center gap-1">
                          <Icon.IconCalendar class="w-4 h-4" />
                          {formatDate(workspace.createdAt)}
                        </span>
                      {/if}
                    </div>
                    {#if workspace.slug}
                      <p class="text-sm text-muted-foreground">
                        <a
                          href={`https://app.coloop.ai/${workspace.id}`}
                          target="_blank"
                          class="hover:underline hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Icon.IconLink class="w-3 h-3" />
                          app.coloop.ai/{workspace.slug}
                        </a>
                      </p>
                    {/if}
                  </div>
                </div>
              </div>
              <div class="flex items-start justify-start gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  href={`/self-serve?id=${workspace.id}`}
                >
                  <Icon.IconShoppingCart class="w-4 h-4 mr-2" />
                  Buy More Credits
                </Button>
                <Button
                  size="sm"
                  href={`https://app.coloop.ai/${workspace.id}`}
                  target="_blank"
                >
                  <Icon.IconExternalLink class="w-4 h-4 mr-2" />
                  Open Workspace
                </Button>
              </div>
            </div>

            <!-- Clean Content Grid -->
            <div
              class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-card rounded"
            >
              <!-- Simplified Usage & Credits -->
              <div class="lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium flex items-center gap-2">
                    <Icon.IconChartBar class="w-5 h-5" />
                    Usage & Credits
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/self-serve?id=${workspace.id}`}
                  >
                    <Icon.IconCreditCard class="w-4 h-4 mr-2" />
                    Manage Credits
                  </Button>
                </div>

                {#if workspace.usage}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each Object.entries(workspace.usage) as [key, usage]}
                      {#if isRegularUsage(usage)}
                        <div
                          class="border border-border rounded p-4 bg-background shadow-sm"
                        >
                          <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-base">
                              {formatUsageLabel(key)}
                            </h4>
                            <span
                              class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                            >
                              Reset every {usage.period}
                            </span>
                          </div>

                          <div class="space-y-2 text-sm">
                            <div class="flex justify-between items-center">
                              <span class="text-muted-foreground text-sm"
                                >Limit</span
                              >
                              <span class="font-medium">
                                {formatUsageValue(usage.total)} /{usage.period}
                              </span>
                            </div>
                            <div class="flex justify-between items-center">
                              <span class="text-muted-foreground text-sm"
                                >Remaining</span
                              >
                              <span
                                class="font-medium {getUsageColor(
                                  getUsagePercentage(usage.used, usage.total),
                                )}"
                              >
                                {formatUsageValue(usage.remaining)}
                              </span>
                            </div>
                          </div>
                        </div>
                      {:else if isNonCyclingUsage(usage)}
                        <div
                          class="border border-border rounded p-4 bg-background shadow-sm"
                        >
                          <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-base mb-3">
                              {formatUsageLabel(key)}
                            </h4>
                            <span
                              class="text-xs text-muted-foreground font-medium"
                            >
                              Credits
                            </span>
                          </div>
                          <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div class="text-lg font-medium text-foreground">
                                {usage.credited.toLocaleString()}
                              </div>
                              <div class="text-xs text-muted-foreground">
                                Credited
                              </div>
                            </div>
                            <div>
                              <div class="text-lg font-medium text-foreground">
                                {usage.debited.toLocaleString()}
                              </div>
                              <div class="text-xs text-muted-foreground">
                                Used
                              </div>
                            </div>
                            <div>
                              <div class="text-lg font-medium text-foreground">
                                {usage.remaining.toLocaleString()}
                              </div>
                              <div class="text-xs text-muted-foreground">
                                Remaining
                              </div>
                            </div>
                          </div>
                        </div>
                      {/if}
                    {/each}
                  </div>
                {:else if !workspace.error}
                  <div class="text-center py-8">
                    <Icon.IconLoader
                      class="w-6 h-6 mx-auto mb-2 animate-spin text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground"
                      >Loading usage data...</span
                    >
                  </div>
                {/if}
              </div>

              <!-- Clean Subscriptions -->
              <div class="border-l pl-4 border-border/20">
                <h3 class="text-lg font-medium flex items-center gap-2 mb-4">
                  <Icon.IconPackage class="w-5 h-5" />
                  Trials
                </h3>

                {#if workspace.products && workspace.products.length > 0}
                  <div class="space-y-3">
                    {#each workspace.products as product}
                      {@const isTrial = isTrialProduct(product)}
                      {@const endDate = getProductEndDate(product)}
                      {@const timeRemaining = endDate
                        ? calculateTimeRemaining(endDate)
                        : { days: 0, expired: false }}
                      {@const productId = product.id?.record_id || ""}
                      {@const isCancelling = cancellingTrialIds.has(productId)}
                      {@const error = cancelErrors.get(productId)}

                      <!-- Active Product Card -->
                      {#if product.stripeSubscription?.status === "active"}
                        <div
                          class="border border-border rounded p-4 bg-background shadow-sm"
                        >
                          <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-base">
                              {getProductName(product)}
                            </h4>
                            <div class="flex items-center gap-2">
                              <Badge
                                variant={isTrial ? "secondary" : "default"}
                                class="text-xs rounded"
                              >
                                {formatProductType(product.values?.is_trial)}
                              </Badge>
                            </div>
                          </div>

                          {#if isTrial && endDate}
                            <div class="space-y-2 text-sm mt-4">
                              <div
                                class="flex items-center gap-2 text-sm justify-between"
                              >
                                <span>Status: </span>
                                <span
                                  class="text-sm text-green-600 font-medium flex items-center gap-2 flex-row"
                                >
                                  <Icon.IconCheck
                                    class="w-4 h-4 text-green-600 font-bold uppercase"
                                  />
                                  {product.stripeSubscription?.status}
                                </span>
                              </div>
                              <div class="flex justify-between items-center">
                                <span class="text-muted-foreground text-sm"
                                  >Trial:</span
                                >
                                <span
                                  class="font-medium flex flex-row items-center gap-2 {getProductStatusColor(
                                    timeRemaining.expired,
                                    timeRemaining.days,
                                  )}"
                                >
                                  <Icon.IconClock
                                    class="w-4 h-4 text-green-600"
                                  />
                                  {#if timeRemaining.expired}
                                    Expired
                                  {:else if timeRemaining.days === 0}
                                    Expires today
                                  {:else if timeRemaining.days === 1}
                                    1 day remaining
                                  {:else}
                                    {timeRemaining.days} days remaining
                                  {/if}
                                </span>
                              </div>
                            </div>

                            <!-- Cancel Trial Section -->
                            {#if !timeRemaining.expired}
                              <!-- Error Display -->
                              {#if error}
                                <div
                                  class="bg-red-50 border border-red-200 rounded p-3 mt-3"
                                >
                                  <div
                                    class="flex items-center justify-between gap-2"
                                  >
                                    <div class="flex items-center gap-2">
                                      <Icon.IconAlertCircle
                                        class="w-4 h-4 text-red-600"
                                      />
                                      <span class="text-red-900 text-sm"
                                        >{error.error}</span
                                      >
                                    </div>
                                    <Button
                                      variant="ghost"
                                      class="text-red-600 hover:text-red-800"
                                      on:click={() =>
                                        clearCancelError(productId)}
                                    >
                                      <Icon.IconX class="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              {/if}

                              <!-- Cancel Form -->
                              <form
                                method="POST"
                                action="?/cancelTrial"
                                use:enhance={() => {
                                  cancelErrors.delete(productId)
                                  cancelErrors = cancelErrors
                                  cancellingTrialIds.add(productId)
                                  cancellingTrialIds = cancellingTrialIds

                                  return async ({ result }) => {
                                    cancellingTrialIds.delete(productId)
                                    cancellingTrialIds = cancellingTrialIds

                                    if (result.type === "success") {
                                      invalidateAll()
                                    } else {
                                      const error =
                                        (result.type === "failure" &&
                                        typeof result.data?.error === "string"
                                          ? result.data.error
                                          : null) || "Failed to cancel trial"
                                      const details =
                                        (result.type === "failure" &&
                                        typeof result.data?.details === "string"
                                          ? result.data.details
                                          : null) || "Please try again"
                                      cancelErrors.set(productId, {
                                        error,
                                        details,
                                      })
                                      cancelErrors = cancelErrors
                                    }
                                  }
                                }}
                              >
                                <input
                                  type="hidden"
                                  name="productId"
                                  value={productId}
                                />
                                <input
                                  type="hidden"
                                  name="workspaceId"
                                  value={workspace.id}
                                />
                                <input
                                  type="hidden"
                                  name="stripeSubscriptionId"
                                  value={product.values
                                    .stripe_subscription_id[0].value}
                                />
                                <Button
                                  type="submit"
                                  variant="outline"
                                  size="sm"
                                  class="w-full mt-3 hover:bg-red-600 hover:text-white"
                                  disabled={isCancelling}
                                >
                                  {#if isCancelling}
                                    <Icon.IconLoader
                                      class="w-4 h-4 mr-2 animate-spin"
                                    />
                                    Cancelling...
                                  {:else}
                                    <Icon.IconX class="w-4 h-4 mr-2" />
                                    Cancel Trial
                                  {/if}
                                </Button>
                              </form>
                            {/if}
                          {/if}
                        </div>

                        <!-- Inactive Product Card -->
                      {:else}
                        <div
                          class="border border-red-200 rounded p-4 bg-red-50 shadow-sm"
                        >
                          <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-base">
                              {getProductName(product)}
                            </h4>
                            <div class="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                class="text-xs rounded"
                              >
                                {formatProductType(product.values?.is_trial)}
                              </Badge>
                            </div>
                          </div>
                          <div class="flex flex-col gap-2 mt-4">
                            <div
                              class="flex items-center gap-2 text-sm justify-between"
                            >
                              <span>Status: </span>
                              <span
                                class="text-xs text-red-600 font-medium flex items-center gap-2 flex-row"
                              >
                                <Icon.IconAlertCircle
                                  class="w-4 h-4 text-red-600"
                                />
                                {product.stripeSubscription?.status}
                              </span>
                            </div>
                            <div
                              class="text-sm text-muted-foreground flex flex-row items-center gap-2 justify-between"
                            >
                              Cancelled Date:
                              <span class="font-medium">
                                {product.stripeSubscription?.canceled_at
                                  ? formatDate(
                                      product.stripeSubscription.canceled_at *
                                        1000,
                                    )
                                  : "Unknown date"}
                              </span>
                            </div>
                          </div>
                        </div>
                      {/if}
                    {/each}
                  </div>
                {:else if !workspace.error}
                  <div class="text-center py-6">
                    <Icon.IconPackage
                      class="w-6 h-6 mx-auto mb-2 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground"
                      >No trials found</span
                    >
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</main>
