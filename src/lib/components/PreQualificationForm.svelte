<script lang="ts">
  import { run } from 'svelte/legacy';

  import { enhance } from "$app/forms"
  import Button from "$lib/components/ui/button/button.svelte"
  import { Card } from "$lib/components/ui/card"
  import {
    getPreQualificationConfig,
    validateEmail,
    type PreQualificationConfig,
    type PreQualificationData,
  } from "$lib/configs/pre-qualification"
  import * as Icons from "@tabler/icons-svelte"
  import type { ComponentType } from "svelte"
  import { createEventDispatcher, onMount } from "svelte"
  import { cubicOut } from "svelte/easing"
  import { fade, fly, scale } from "svelte/transition"

  
  interface Props {
    // Props
    initialEmail?: string;
    form?: any;
    config?: PreQualificationConfig;
  }

  let { initialEmail = "", form = null, config = getPreQualificationConfig() }: Props = $props();

  // Component state
  let email = $state(initialEmail)
  let discoverySource = $state("")
  let productInterest: "qualification" | "open-ends" | "" = $state("")
  let isSubmitting = $state(false)

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    complete: PreQualificationData
  }>()

  // Reactive validation
  let isEmailValid = $derived(validateEmail(email))
  let canSubmit = $derived(isEmailValid && productInterest !== "")
  let formErrors = $derived(form?.errors || {})

  // Handle successful form submission
  run(() => {
    if (form?.success && form?.data) {
      dispatch("complete", form.data)
    }
  });

  // Get icon component
  function getIconComponent(iconName: string): ComponentType {
    return (Icons as any)[iconName] || Icons.IconHelp
  }

  // Initialize email from URL parameter
  onMount(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get("email")
      if (emailParam && validateEmail(emailParam) && !email) {
        email = emailParam
      }
    }
  })
</script>

<div class="bg-background py-8 h-full">
  <div
    class="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full"
  >
    <!-- Header -->
    <div
      class="text-center mb-12"
      in:fly={{ y: -20, duration: 600, easing: cubicOut, delay: 100 }}
    >
      <h2 class="text-4xl font-bold text-foreground mb-4">Let's Get Started</h2>
      <p class="text-lg text-muted-foreground mb-8">
        Tell us a bit about yourself so we can recommend the perfect solution
      </p>
    </div>

    <!-- Pre-qualification Form -->
    <div in:scale={{ duration: 400, easing: cubicOut, delay: 200 }}>
      <Card class="w-full p-8 shadow-lg">
        <form
          method="POST"
          action="?/prequalification"
          class="space-y-8"
          use:enhance={() => {
            isSubmitting = true
            return async ({ update }) => {
              await update()
              isSubmitting = false
            }
          }}
        >
          <!-- Email Input -->
          <div class="space-y-2">
            <label
              for="email"
              class="block text-sm font-medium text-foreground"
            >
              {config.questions.email.label}
              <span class="text-destructive">*</span>
            </label>
            <div class="relative">
              <input
                id="email"
                name="email"
                type="email"
                bind:value={email}
                placeholder={config.questions.email.placeholder}
                class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors {formErrors.email
                  ? 'border-destructive'
                  : ''}"
                required
              />
            </div>
            {#if formErrors.email}
              <p class="text-sm text-destructive" in:fade={{ duration: 200 }}>
                {formErrors.email}
              </p>
            {/if}
          </div>

          <!-- Discovery Source Input -->
          <div class="space-y-2">
            <label
              for="discovery"
              class="block text-sm font-medium text-foreground"
            >
              {config.questions.discoverySource.label}
            </label>
            <input
              id="discovery"
              name="discoverySource"
              type="text"
              bind:value={discoverySource}
              placeholder={config.questions.discoverySource.placeholder}
              maxlength={config.questions.discoverySource.maxLength}
              class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors {formErrors.discoverySource
                ? 'border-destructive'
                : ''}"
            />
            {#if formErrors.discoverySource}
              <p class="text-sm text-destructive" in:fade={{ duration: 200 }}>
                {formErrors.discoverySource}
              </p>
            {/if}
            {#if discoverySource.length > 0}
              <p class="text-xs text-muted-foreground text-right">
                {discoverySource.length}/{config.questions.discoverySource
                  .maxLength}
              </p>
            {/if}
          </div>

          <!-- Product Interest Selection -->
          <div class="space-y-4">
            <label class="block text-sm font-medium text-foreground">
              {config.questions.productInterest.label}
              <span class="text-destructive">*</span>
            </label>
            <div class="space-y-3">
              {#each config.questions.productInterest.options as option, index}
                {@const SvelteComponent = getIconComponent(option.icon)}
                <div
                  in:fly={{
                    x: -20,
                    duration: 300,
                    easing: cubicOut,
                    delay: 400 + index * 100,
                  }}
                >
                  <label
                    class="flex items-start space-x-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors {productInterest ===
                    option.value
                      ? 'border-primary bg-primary/5'
                      : ''}"
                  >
                    <input
                      type="radio"
                      name="productInterest"
                      bind:group={productInterest}
                      value={option.value}
                      class="mt-1 w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <SvelteComponent
                          class="w-5 h-5 text-primary"
                        />
                        <span class="font-medium text-foreground">
                          {option.label}
                        </span>
                      </div>
                      <p class="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </label>
                </div>
              {/each}
            </div>
            {#if formErrors.productInterest}
              <p class="text-sm text-destructive" in:fade={{ duration: 200 }}>
                {formErrors.productInterest}
              </p>
            {/if}
          </div>

          <!-- Submit Button -->
          <div class="pt-6">
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              class="w-full h-12 text-lg font-semibold {isSubmitting
                ? 'opacity-75'
                : ''}"
            >
              {#if isSubmitting}
                <Icons.IconLoader class="w-5 h-5 mr-2 animate-spin" />
                Processing...
              {:else}
                Continue
                <Icons.IconArrowRight class="w-5 h-5 ml-2" />
              {/if}
            </Button>
            {#if form?.error}
              <p
                class="text-sm text-destructive text-center mt-2"
                in:fade={{ duration: 200 }}
              >
                {form.error}
              </p>
            {/if}
          </div>
        </form>
      </Card>
    </div>

    <!-- Progress Indicator -->
    <div
      class="mt-8 flex items-center space-x-2 text-sm text-muted-foreground"
      in:fade={{ duration: 400, delay: 600 }}
    >
      <div class="w-2 h-2 bg-primary rounded-full"></div>
      <span>Step 1 of 2</span>
    </div>
  </div>
</div>
