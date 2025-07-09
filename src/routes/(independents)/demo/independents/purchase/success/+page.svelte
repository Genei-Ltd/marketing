<script lang="ts">
  import { run } from 'svelte/legacy';

  import { Button } from "$components/ui/button"
  import NotionContent from "$lib/components/NotionContent.svelte"
  import {
    IconArrowLeft,
    IconBuilding,
    IconCalendarRepeat,
    IconCheck,
    IconCreditCard,
    IconDownload,
    IconRocket,
  } from "@tabler/icons-svelte"
  import { quintOut } from "svelte/easing"
  import { fade, fly, scale, slide } from "svelte/transition"
  import type { ActionData, PageData } from "./$types"
  import NewWorkspaceForm from "./NewWorkspaceForm.svelte"

  interface Props {
    data: PageData;
    form?: ActionData | null;
  }

  let { data, form = null }: Props = $props();
  let showNewWorkspaceForm = $state(false)
  let showOnboarding = $state(false)
  let workspaceId: string | null = $state(null)

  run(() => {
    if (form?.message && "success" in form.message && form.message.success) {
      showOnboarding = true
      workspaceId = form.message.workspaceId as string
    }
  });

  // Get pricing data from API
  let unitPrice = $derived(data.sessionData?.unit_price
    ? data.sessionData.unit_price / 100
    : 0)
  let quantity = $derived(data.sessionData?.quantity || 1)
  let subtotalAmount = $derived(data.sessionData?.subtotal_amount
    ? data.sessionData.subtotal_amount / 100
    : 0)
  let discountAmount = $derived(data.sessionData?.discount_amount
    ? data.sessionData.discount_amount / 100
    : 0)
  let totalAmount = $derived(data.sessionData?.amount_total
    ? data.sessionData.amount_total / 100
    : 0)
  let paymentDate = $derived(data.sessionData?.payment_date
    ? new Date(data.sessionData.payment_date)
    : new Date())

  // Format dates
  let formattedPaymentDate = $derived(paymentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }))

  // Format subscription period if available
  let subscriptionPeriod =
    $derived(data.sessionData?.subscription_start_date &&
    data.sessionData?.subscription_current_period_end
      ? `${new Date(data.sessionData.subscription_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${new Date(data.sessionData.subscription_current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : null)
</script>

<svelte:head>
  <title>Purchase Complete - CoLoop</title>
  <meta
    name="description"
    content="Your purchase has been completed successfully"
  />
</svelte:head>

<main class="min-h-screen bg-background">
  <!-- Header -->
  <div
    class="mx-auto px-4 py-6 flex w-full max-w-3xl flex-row items-center justify-between"
  >
    <img src="/logos/black.png" alt="CoLoop Logo" class="h-8 dark:invert" />
    {#if showNewWorkspaceForm}
      <h1
        class="text-2xl font-semibold text-gray-900"
        in:fly={{ x: 20, duration: 400, delay: 200, easing: quintOut }}
        out:fly={{ x: -20, duration: 300, easing: quintOut }}
      >
        Create Your Workspace
      </h1>
    {:else}
      <h1
        class="text-2xl font-semibold text-gray-900"
        in:fly={{ x: -20, duration: 400, easing: quintOut }}
        out:fly={{ x: 20, duration: 300, easing: quintOut }}
      >
        Purchase Successful
      </h1>
    {/if}
  </div>

  {#if data.sessionData.status === "complete"}
    {#if !showNewWorkspaceForm}
      <!-- Success Content -->
      <div
        class="py-12"
        in:fade={{ duration: 500, easing: quintOut }}
        out:slide={{ duration: 400, easing: quintOut }}
      >
        <div class="max-w-2xl mx-auto px-4">
          <!-- Success Message -->
          <div class="text-center mb-12">
            <div
              class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              in:scale={{ duration: 600, delay: 100, easing: quintOut }}
              out:scale={{ duration: 400, easing: quintOut }}
            >
              <IconCheck class="w-8 h-8 text-green-600" />
            </div>
            <h2
              class="text-4xl font-bold text-gray-900 mb-4"
              in:fly={{ y: 20, duration: 500, delay: 200, easing: quintOut }}
              out:fly={{ y: -20, duration: 400, easing: quintOut }}
            >
              Payment Successful!
            </h2>
            <p
              class="text-xl text-gray-600 mb-8"
              in:fly={{ y: 20, duration: 500, delay: 300, easing: quintOut }}
              out:fly={{ y: -20, duration: 400, easing: quintOut }}
            >
              Your payment has been processed successfully. You'll receive a
              confirmation email shortly.
            </p>
          </div>

          <!-- Workspace Button -->
          <div
            class="text-center mb-12 w-full bg-primary/10 rounded-lg py-12 p-4 border border-primary/20"
            in:fly={{ y: 20, duration: 500, delay: 400, easing: quintOut }}
            out:slide={{ duration: 400, easing: quintOut }}
          >
            <p class="text-foreground mb-4 text-3xl font-medium">
              Ready to get started?
            </p>
            <Button
              variant="default"
              size="lg"
              class="transform transition-all hover:scale-105 hover:shadow-lg text-xl font-semibold duration-300  px-8 py-3"
              on:click={() => {
                showNewWorkspaceForm = true
              }}
            >
              Create Your Workspace
            </Button>
          </div>

          <!-- Receipt Summary Card -->
          {#if data.sessionData}
            <div
              class="bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl mx-auto mb-8"
              in:fly={{ y: 20, duration: 500, delay: 500, easing: quintOut }}
              out:fly={{ y: -20, duration: 400, easing: quintOut }}
            >
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <IconBuilding class="w-4 h-4 text-gray-600 mr-2" />
                  <h3 class="text-sm font-medium text-gray-700">
                    Receipt from CoLoop
                  </h3>
                </div>

                <div class="mb-4">
                  <div class="text-3xl font-bold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </div>
                  <div class="text-sm text-gray-500">
                    Paid {formattedPaymentDate}
                  </div>
                </div>

                <!-- Receipt and Invoice Action Buttons -->
                <div class="flex flex-col gap-2 mb-4">
                  {#if data.sessionData.invoice_url}
                    <Button
                      variant="outline"
                      size="sm"
                      class="flex items-center gap-2 justify-start"
                      on:click={() =>
                        data.sessionData.invoice_url &&
                        window.open(data.sessionData.invoice_url, "_blank")}
                    >
                      <IconDownload class="w-4 h-4" />
                      Download invoice
                    </Button>
                  {/if}
                  {#if data.sessionData.receipt_url}
                    <Button
                      variant="outline"
                      size="sm"
                      class="flex items-center gap-2 justify-start"
                      on:click={() =>
                        data.sessionData.receipt_url &&
                        window.open(data.sessionData.receipt_url, "_blank")}
                    >
                      <IconDownload class="w-4 h-4" />
                      Download receipt
                    </Button>
                  {/if}
                </div>

                <!-- Quick Details -->
                <div class="space-y-2 text-sm">
                  {#if data.sessionData.receipt_number}
                    <div class="flex justify-between">
                      <span class="text-gray-600">Receipt number</span>
                      <span class="font-mono"
                        >{data.sessionData.receipt_number}</span
                      >
                    </div>
                  {/if}

                  {#if data.sessionData.invoice_id}
                    <div class="flex justify-between">
                      <span class="text-gray-600">Invoice number</span>
                      <span class="font-mono"
                        >{data.sessionData.invoice_id}</span
                      >
                    </div>
                  {/if}

                  <div class="flex justify-between">
                    <span class="text-gray-600">Payment method</span>
                    <div class="flex items-center">
                      <IconCreditCard class="w-4 h-4 mr-1" />
                      <span>•••• {data.sessionData.payment_method_details}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- Detailed Receipt -->
          {#if data.sessionData}
            <div
              class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-2xl max-w-2xl mx-auto relative overflow-hidden"
              in:fly={{ y: 30, duration: 600, delay: 600, easing: quintOut }}
              out:fly={{ y: -30, duration: 400, easing: quintOut }}
            >
              <!-- Receipt Header -->
              <div class="p-4 text-center border-b border-gray-100">
                <div class="flex items-center justify-center mb-2">
                  <IconBuilding class="w-4 h-4 text-gray-600 mr-1" />
                  <span
                    class="text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >Receipt from CoLoop</span
                  >
                </div>

                <div class="text-2xl font-bold text-gray-900 font-mono mb-1">
                  ${totalAmount.toFixed(2)}
                </div>
                <div class="text-xs text-gray-500 font-mono">
                  Paid {formattedPaymentDate}
                </div>
              </div>

              <!-- Receipt Info -->
              <div
                class="p-4 space-y-2 text-xs font-mono border-b border-gray-100"
              >
                {#if data.sessionData.receipt_number}
                  <div class="flex justify-between">
                    <span class="text-gray-600">Receipt number</span>
                    <span class="font-medium"
                      >{data.sessionData.receipt_number}</span
                    >
                  </div>
                {/if}

                {#if data.sessionData.invoice_id}
                  <div class="flex justify-between">
                    <span class="text-gray-600">Invoice number</span>
                    <span class="font-medium"
                      >{data.sessionData.invoice_id}</span
                    >
                  </div>
                {/if}

                <div class="flex justify-between">
                  <span class="text-gray-600">Payment method</span>
                  <div class="flex items-center">
                    <IconCreditCard class="w-3 h-3 mr-1" />
                    <span class="font-medium"
                      >•••• {data.sessionData.payment_method_details}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Detailed Receipt -->
              <div class="p-4">
                <!-- Receipt Header Info -->
                <div class="text-center mb-4">
                  <div
                    class="text-sm font-semibold text-gray-900 font-mono mb-1"
                  >
                    Receipt #{data.sessionData.receipt_number || "N/A"}
                  </div>
                  <div class="text-xs text-gray-600 font-mono">
                    {subscriptionPeriod || formattedPaymentDate}
                  </div>
                </div>

                <hr class=" border-t border-dashed border-gray-300 my-3" />

                <!-- Product Details -->
                {#if data.sessionData.product_name}
                  <div class="mb-3">
                    <div class="flex justify-between items-start mb-1">
                      <div class="flex-1">
                        <div
                          class="text-sm font-medium text-gray-900 font-mono leading-tight"
                        >
                          {data.sessionData.product_name}
                        </div>
                        {#if data.sessionData.product_description}
                          <div
                            class="text-xs text-gray-500 font-mono mt-0.5 leading-tight"
                          >
                            {data.sessionData.product_description}
                          </div>
                        {/if}
                      </div>
                    </div>

                    <div class="flex justify-between text-xs font-mono mt-2">
                      <span class="text-gray-600"
                        >Qty {quantity} × ${unitPrice.toFixed(2)}</span
                      >
                      <span class="font-medium"
                        >${(unitPrice * quantity).toFixed(2)}</span
                      >
                    </div>
                  </div>
                {/if}

                <hr class=" border-t border-dashed border-gray-300 my-3" />

                <!-- Totals -->
                <div class="space-y-1">
                  <div class="flex justify-between text-xs font-mono">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium">${subtotalAmount.toFixed(2)}</span
                    >
                  </div>

                  {#if discountAmount > 0}
                    <div class="flex justify-between text-xs font-mono">
                      <span class="text-gray-600">
                        {#if data.sessionData.discount_code}
                          {data.sessionData.discount_code.toUpperCase()}
                        {:else}
                          DISCOUNT
                        {/if}
                        {#if data.sessionData.discount_amount && data.sessionData.subtotal_amount}
                          ({Math.round(
                            (data.sessionData.discount_amount /
                              data.sessionData.subtotal_amount) *
                              100,
                          )}% off)
                        {/if}
                      </span>
                      <span class="font-medium text-green-600"
                        >-${discountAmount.toFixed(2)}</span
                      >
                    </div>
                  {/if}

                  <hr class=" border-t border-dashed border-gray-300 my-3" />

                  <div
                    class="flex justify-between text-sm font-semibold font-mono"
                  >
                    <span class="text-gray-900">Total</span>
                    <span class="text-gray-900">${totalAmount.toFixed(2)}</span>
                  </div>

                  <div
                    class="flex justify-between text-sm font-semibold font-mono"
                  >
                    <span class="text-gray-900">Amount paid</span>
                    <span class="text-gray-900">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {#if data.sessionData.mode === "subscription"}
                  <div
                    class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center"
                  >
                    <div class="flex items-center justify-center text-blue-800">
                      <IconCalendarRepeat class="w-3 h-3 mr-1" />
                      <span class="text-xs font-medium font-mono"
                        >Recurring subscription - renews automatically</span
                      >
                    </div>
                  </div>
                {/if}

                <hr class=" border-t border-dashed border-gray-300 my-3 mt-4" />

                <!-- Transaction Details -->
                <div class="space-y-2 text-xs font-mono">
                  <div>
                    <div class="text-gray-500 uppercase tracking-wider text-xs">
                      Session ID
                    </div>
                    <div
                      class="font-mono text-xs text-gray-900 break-all leading-tight"
                    >
                      {data.sessionData.id}
                    </div>
                  </div>

                  {#if data.sessionData.subscription_id}
                    <div>
                      <div
                        class="text-gray-500 uppercase tracking-wider text-xs"
                      >
                        Subscription ID
                      </div>
                      <div
                        class="font-mono text-xs text-gray-900 break-all leading-tight"
                      >
                        {data.sessionData.subscription_id}
                      </div>
                    </div>
                  {/if}

                  {#if data.sessionData.subscription_status}
                    <div class="flex justify-between">
                      <span class="text-gray-500 uppercase tracking-wider"
                        >Status</span
                      >
                      <span
                        class="font-medium {data.sessionData
                          .subscription_status === 'active'
                          ? 'text-green-600'
                          : 'text-yellow-600'}"
                      >
                        {data.sessionData.subscription_status.toUpperCase()}
                      </span>
                    </div>
                  {/if}

                  {#if data.sessionData.customer_email}
                    <div>
                      <div
                        class="text-gray-500 uppercase tracking-wider text-xs"
                      >
                        Email
                      </div>
                      <div class="text-gray-900 text-xs break-all">
                        {data.sessionData.customer_email}
                      </div>
                    </div>
                  {/if}

                  <div class="flex justify-between">
                    <span class="text-gray-500 uppercase tracking-wider"
                      >Currency</span
                    >
                    <span class="font-medium uppercase"
                      >{data.sessionData.currency}</span
                    >
                  </div>

                  <div class="flex justify-between">
                    <span class="text-gray-500 uppercase tracking-wider"
                      >Status</span
                    >
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      <IconCheck class="w-3 h-3 mr-1" />
                      {data.sessionData.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <hr class=" border-t border-dashed border-gray-300 my-3 mt-4" />

                <!-- Footer -->
                <div class="text-center">
                  <div
                    class="text-xs font-semibold text-gray-900 font-mono mb-1"
                  >
                    THANK YOU FOR YOUR PURCHASE!
                  </div>
                  <div class="text-xs text-gray-600 font-mono mb-2">
                    Credits have been added to your workspace and are ready to
                    use
                  </div>
                  <div class="text-xs text-gray-500 font-mono mb-3">
                    Questions? Contact us at <a
                      href="mailto:support@coloop.ai"
                      class="text-blue-600 hover:text-blue-800 underline"
                      >support@coloop.ai</a
                    >
                  </div>

                  <!-- Company Logo -->
                  <div class="flex items-center justify-center mb-1">
                    <img
                      src="/logos/black.png"
                      alt="CoLoop"
                      class="h-4 opacity-60"
                    />
                  </div>
                  <div class="text-xs text-gray-400 font-mono tracking-wider">
                    AI INSIGHTS FROM COLOOP
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
        <!-- Progress indicator -->
        <div
          class="mt-8 text-center max-w-2xl mx-auto flex flex-col items-center justify-center gap-2 w-full"
          in:fade={{ duration: 400, delay: 600 }}
        >
          <p class="text-sm text-muted-foreground font-semibold mb-1">
            Step 2 of 3
          </p>
          <div class="flex flex-row items-center justify-center gap-2 w-full">
            <div
              class="w-full h-2 bg-primary rounded-full border border-primary"
            ></div>
            <div
              class="w-full h-2 bg-primary/80 rounded-full animate-pulse border border-primary"
            ></div>
            <div
              class="w-full h-2 bg-transparent rounded-full border border-primary"
            ></div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Workspace Form or Onboarding -->
      {#if showOnboarding && workspaceId}
        <div
          class="container mx-auto px-4 py-8 w-full"
          in:fly={{ y: 20, duration: 500, delay: 300, easing: quintOut }}
        >
          <div class="max-w-3xl mx-auto text-center">
            <div
              class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <IconCheck class="w-8 h-8 text-green-600" />
            </div>
            <h2 class="text-4xl font-bold text-gray-900 mb-4">
              Workspace Created!
            </h2>
            <p class="text-xl text-gray-600 mb-8">
              Your workspace is ready. Here's a quick guide to get you started.
            </p>
            <Button
              href={`https://app.coloop.ai/`}
              target="_blank"
              size="lg"
              class="mb-12"
            >
              <IconRocket class="mr-2" />
              Go to Your Workspace
            </Button>
            <p class="text-muted-foreground">
              Check your email for a invite to your new workspace.
            </p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <NotionContent blocks={data.onboardingBlocks} />
          </div>
        </div>
      {:else}
        <!-- Workspace Form -->
        <div
          class="container mx-auto px-4 py-8 w-full h-full min-h-[60vh]"
          in:fly={{ x: 300, duration: 600, delay: 200, easing: quintOut }}
          out:fly={{ x: -300, duration: 400, easing: quintOut }}
        >
          <div class="max-w-2xl mx-auto">
            <div
              class="mb-2 text-center"
              in:fade={{ duration: 400, delay: 400 }}
              out:fade={{ duration: 300, easing: quintOut }}
            >
              <Button
                variant="link"
                class="mb-2  text-gray-600 group"
                on:click={() => {
                  showNewWorkspaceForm = false
                }}
              >
                <IconArrowLeft
                  class="w-4 h-4 mr-2 text-foreground hover:text-foreground/80 transition-all duration-200 group-hover:-translate-x-1"
                />
                Back to confirmation
              </Button>
            </div>
            <div
              in:scale={{ duration: 500, delay: 600, easing: quintOut }}
              out:scale={{ duration: 300, easing: quintOut }}
            >
              <NewWorkspaceForm data={data.form} />
            </div>
          </div>
        </div>
      {/if}
    {/if}

    <!-- Footer -->
    <div class="border-t border-gray-200 mt-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="text-center text-gray-600 text-sm">
          <p>© CoLoop {new Date().getFullYear()}</p>
          <p class="mt-1">AI analysis copilot for Insights & Strategy Teams</p>
        </div>
      </div>
    </div>
  {:else}
    <div class="py-16">
      <div class="max-w-2xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Something went wrong. Please try again.
        </h2>
        <p class="text-gray-600">Please contact support@coloop.ai</p>
      </div>
    </div>
  {/if}
</main>
