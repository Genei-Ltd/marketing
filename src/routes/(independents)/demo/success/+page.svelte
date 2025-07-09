<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import {
    IconArrowLeft,
    IconCheck,
    IconGift,
    IconMail,
    IconReceipt,
    IconStar,
    IconX,
  } from "@tabler/icons-svelte"
  import type { PageData } from "./$types"

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Format currency display
  function formatCurrency(
    amount: number | null | undefined,
    currency: string,
  ): string {
    if (!amount) return "$0.00"

    const value = amount / 100
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace(/\.00$/, "")
  }

  // Get plan display name
  function getPlanDisplayName(planId: string | null | undefined): string {
    if (!planId) return "Selected Plan"

    const planNames: Record<string, string> = {
      starter: "Starter Plan",
      professional: "Professional Plan",
      enterprise: "Enterprise Plan",
    }

    return (
      planNames[planId] ||
      planId.charAt(0).toUpperCase() + planId.slice(1) + " Plan"
    )
  }
</script>

<svelte:head>
  <title>Payment Successful - CoLoop Demo</title>
  <meta
    name="description"
    content="Your payment has been processed successfully"
  />
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-green-50 to-white">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    {#if data.success}
      <!-- Success Content -->
      <div class="text-center mb-12">
        <!-- Success Icon -->
        <div
          class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <IconCheck class="w-10 h-10 text-green-600" />
        </div>

        <!-- Success Message -->
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Thank you for choosing CoLoop. Your purchase has been processed
          successfully.
        </p>
      </div>

      <!-- Purchase Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Order Summary -->
        <Card class="p-8">
          <div class="flex items-center mb-6">
            <IconReceipt class="w-6 h-6 text-gray-600 mr-3" />
            <h2 class="text-2xl font-semibold text-gray-900">Order Summary</h2>
          </div>

          <div class="space-y-4">
            <div
              class="flex justify-between items-center py-3 border-b border-gray-100"
            >
              <span class="text-gray-600">Plan</span>
              <span class="font-semibold text-gray-900">
                {getPlanDisplayName(data.planId)}
              </span>
            </div>

            <div
              class="flex justify-between items-center py-3 border-b border-gray-100"
            >
              <span class="text-gray-600">Amount</span>
              <span class="font-semibold text-gray-900">
                {formatCurrency(data.amountTotal, data.currency || "USD")}
              </span>
            </div>

            {#if data.customerEmail}
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600">Email</span>
                <span class="font-medium text-gray-900"
                  >{data.customerEmail}</span
                >
              </div>
            {/if}

            <div
              class="flex justify-between items-center py-3 border-b border-gray-100"
            >
              <span class="text-gray-600">Payment Status</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <IconCheck class="w-3 h-3 mr-1" />
                {data.paymentStatus === "succeeded" ? "Paid" : "Processing"}
              </span>
            </div>

            {#if data.sessionId}
              <div class="flex justify-between items-center py-3">
                <span class="text-gray-600">Transaction ID</span>
                <span class="font-mono text-sm text-gray-900">
                  {data.sessionId.slice(-12)}
                </span>
              </div>
            {/if}
          </div>
        </Card>

        <!-- Next Steps -->
        <Card class="p-8">
          <div class="flex items-center mb-6">
            <IconGift class="w-6 h-6 text-blue-600 mr-3" />
            <h2 class="text-2xl font-semibold text-gray-900">What's Next?</h2>
          </div>

          <div class="space-y-6">
            <div class="flex items-start">
              <div
                class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 shrink-0"
              >
                <IconMail class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  Check Your Email
                </h3>
                <p class="text-gray-600 text-sm">
                  We've sent a confirmation email with your purchase details and
                  next steps.
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div
                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 shrink-0"
              >
                <IconStar class="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Account Setup</h3>
                <p class="text-gray-600 text-sm">
                  Our team will reach out within 24 hours to help you get
                  started with your new plan.
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div
                class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 shrink-0"
              >
                <IconReceipt class="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">
                  Access Your Dashboard
                </h3>
                <p class="text-gray-600 text-sm">
                  You'll receive login credentials and a link to your
                  personalized dashboard soon.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/demo" variant="outline" class="inline-flex items-center">
          <IconArrowLeft class="w-4 h-4 mr-2" />
          Back to Demo
        </Button>

        <Button href="/" class="inline-flex items-center">
          Go to Homepage
        </Button>
      </div>
    {:else}
      <!-- Error Content -->
      <div class="text-center">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
        >
          <IconX class="w-10 h-10 text-red-600" />
        </div>

        <h1 class="text-4xl font-bold text-gray-900 mb-4">Payment Error</h1>
        <p class="text-xl text-gray-600 mb-8">
          {data.error || "Something went wrong processing your payment."}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            href="/demo"
            variant="outline"
            class="inline-flex items-center"
          >
            <IconArrowLeft class="w-4 h-4 mr-2" />
            Back to Demo
          </Button>

          <Button href="/" class="inline-flex items-center">
            Go to Homepage
          </Button>
        </div>
      </div>
    {/if}

    <!-- Support Info -->
    <div class="mt-16 text-center">
      <p class="text-gray-600">
        Questions? Contact our support team at
        <a
          href="mailto:support@coloop.ai"
          class="text-primary hover:underline font-medium"
        >
          support@coloop.ai
        </a>
      </p>
    </div>
  </div>
</div>
