<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import type { PricingPlan } from "$lib/configs/pricing"
  import * as Icons from "@tabler/icons-svelte"
  import type { ComponentType } from "svelte"

  // Extended interface for enriched plans with Stripe data
  interface EnrichedPricingPlan extends PricingPlan {
    unit_amount?: number
    currency?: string
  }

  interface Props {
    plans?: EnrichedPricingPlan[]
    selectedCurrency?: "USD" | "EUR" | "GBP"
    onCurrencyChange?: (currency: "USD" | "EUR" | "GBP") => void
  }

  let {
    plans = [],
    selectedCurrency = "USD",
    onCurrencyChange = () => {},
  }: Props = $props()

  // Helper to get icon component safely
  function getIconComponent(iconName: string): ComponentType {
    return (Icons as any)[iconName] || Icons.IconPackage
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
    return formatted.replace(/\.00$/, "")
  }

  // Helper to convert camelCase to sentence case
  function toSentenceCase(str: string): string {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (match) => match.toUpperCase())
      .trim()
  }

  const currencies = [
    {
      code: "USD",
      symbol: "$",
      name: "US Dollar",
      region: "America",
      flag: "🇺🇸",
    },
    { code: "EUR", symbol: "€", name: "Euro", region: "Europe", flag: "🇪🇺" },
    {
      code: "GBP",
      symbol: "£",
      name: "British Pound",
      region: "UK",
      flag: "🇬🇧",
    },
  ] as const
</script>

<div
  class="w-full py-6 3xl:py-16 flex flex-1 flex-col justify-between gap-8 items-center h-full"
>
  <!-- Currency Selector -->
  <div class="text-center mt-12 flex flex-col justify-center">
    <div
      class="flex flex-row items-center bg-card p-1 border rounded-md border-border shadow-sm gap-2 justify-center w-fit mx-auto"
    >
      {#each currencies as currency, index}
        <Button
          size="sm"
          variant="ghost"
          on:click={() => onCurrencyChange(currency.code)}
          class="p-1 3xl:px-4 3xl:py-2 w-32 rounded-md font-bold text-sm 3xl:text-md uppercase hover:text-secondary-foreground hover:bg-secondary transition-all duration-200 {selectedCurrency ===
          currency.code
            ? 'bg-primary text-primary-foreground shadow-sm border border-border'
            : ' '}"
        >
          <!-- {currency.symbol} -->
          {currency.flag}
          {currency.region}
        </Button>
      {/each}
    </div>
    <span class="text-sm py-1 text-muted-foreground text-center">
      Select your region, you can change currency at checkout.
    </span>
  </div>
  <!-- Pricing Plans Grid -->
  <div class="grid grid-cols-1 2xl:grid-cols-2 my-4 max-w-5xl w-full mx-auto">
    {#each plans as plan (plan.id)}
      <Card
        class="relative p-8 3xl:p-6 bg-card shadow-lg w-full mx-auto 2xl:max-w-96 {plan.isPopular
          ? ' transform scale-105 border-primary'
          : ''}   transition-all duration-200 shadow-lg"
      >
        {@const SvelteComponent = getIconComponent(plan.icon)}
        <div class="flex flex-col justify-between h-full">
          <div class="flex flex-col">
            <!-- Plan Header -->
            <div class="text-left my-2 3xl:my-6 z-50">
              <div
                class="w-12 hidden h-12 mr-auto mb-4 bg-primary rounded-xl 3xl:flex items-center justify-center"
              >
                <SvelteComponent class="w-8 h-8 text-primary-foreground" />
              </div>

              <!-- Popular Badge -->
              {#if plan.badge}
                <div class="absolute top-0 left-0 w-full flex justify-center">
                  <div
                    class="flex items-center justify-center rounded-lg left-0 translate-y-[-50%] transform bg-primary text-primary-foreground w-fit px-2"
                  >
                    <span
                      class=" text-sm font-bold px-3 py-1 uppercase text-center"
                    >
                      {plan.badge}
                    </span>
                  </div>
                </div>
              {/if}
              <div class="flex flex-row justify-between items-center">
                <h3 class="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
              </div>

              <p class="text-foreground/80 text-sm">
                {plan.description}
              </p>
            </div>

            <!-- Price -->
            <div class="text-left mb-6">
              <h2 class="text-4xl font-bold text-foreground 3xl:mb-2">
                {formatCurrency(
                  plan.unit_amount || 0,
                  plan.currency || selectedCurrency.toLowerCase(),
                )}
              </h2>
              <div class="text-sm text-muted-foreground">/ per month</div>
            </div>

            <!-- Credits -->
            <div class="space-y-3 my-8 text-left">
              {#each Object.entries(plan.allowance_units) as [key, value]}
                <div class="flex items-start">
                  <Icons.IconPlus
                    class="w-4 h-4 text-secondary rounded-sm mr-3 flex-shrink-0 mt-0.5  border-secondary"
                  />
                  <span class="text-sm text-foreground mr-2">{value.delta}</span
                  >
                  <span class="text-sm text-foreground">{value.label}</span>
                </div>
              {/each}
            </div>
            <!-- Features -->
            <div class="space-y-3 mb-8 text-left">
              {#each plan.features as feature}
                <div class="flex items-start">
                  <Icons.IconCheck
                    class="w-4 h-4 rounded-sm text-secondary mr-3 flex-shrink-0 mt-0.5  border-secondary"
                  />
                  <span class="text-sm text-foreground">{feature}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- CTA Button -->
          <form method="POST" action="?/checkout" class="w-full">
            <input type="hidden" name="planId" value={plan.id} />
            <input
              type="hidden"
              name="stripePriceId"
              value={plan.stripeSubscriptionPriceId}
            />
            <input
              type="hidden"
              name="stripeOneTimePriceId"
              value={plan.stripeOneTimePriceId}
            />
            <input type="hidden" name="currency" value={selectedCurrency} />

            <Button
              type="submit"
              variant={plan.isPopular ? "default" : "secondary"}
              class="w-full py-3 text-base font-semibold transition-all duration-200 hover:scale-102 border-border "
            >
              {plan.buttonText || "Get Started"}
              <Icons.IconArrowRight class="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </Card>
    {/each}
  </div>

  <!-- Trust Indicators -->
  <div class="mt-4 2xl:mt-8 3xl:mt-12 text-center">
    <div
      class="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground"
    >
      <div class="flex items-center space-x-2">
        <Icons.IconShieldCheck class="w-5 h-5 text-primary" />
        <span>1 Month trial</span>
      </div>
      <div class="flex items-center space-x-2">
        <Icons.IconClock class="w-5 h-5 text-primary" />
        <span>Instant activation</span>
      </div>
      <div class="flex items-center space-x-2">
        <Icons.IconCreditCard class="w-5 h-5 text-primary" />
        <span>Secure payments with Stripe</span>
      </div>
    </div>
  </div>
</div>
