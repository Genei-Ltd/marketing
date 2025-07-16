<script lang="ts">
  import { enhance } from "$app/forms"
  import { Button } from "$components/ui/button"
  import { IconCircleCheck, IconSend } from "@tabler/icons-svelte"
  import { fade, slide } from "svelte/transition"

  interface Props {
    form?: any
    placeholder?: string
    buttonText?: string
    className?: string
  }

  let {
    form = null,
    placeholder = "Enter your email address",
    buttonText = "Subscribe",
  }: Props = $props()

  let isSubmitting = $state(false)
  let email = $state("")
  let mounted = $state(false)

  $effect(() => {
    mounted = true
  })

  // Reset form after successful submission
  $effect(() => {
    if (form?.success) {
      email = ""
    }
  })

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  let canSubmit = $derived(
    email.length > 0 && isValidEmail(email) && !isSubmitting,
  )
</script>

<div class="mx-auto w-full max-w-2xl">
  {#if form?.success}
    <div
      class="mx-auto flex w-full flex-row items-center gap-4 py-2 text-center"
      in:slide={{ duration: 300 }}
    >
      <span
        class="text-primary/80 flex w-full items-center justify-center gap-4 text-lg font-medium"
      >
        <IconCircleCheck class=" h-6 w-6" />
        {form.message || "Thank you, we will keep you in the loop."}
      </span>
    </div>
  {:else}
    <form
      method="POST"
      class="flex w-full"
      action="?/emailSubmit"
      use:enhance={() => {
        isSubmitting = true
        return async ({ update }) => {
          await update()
          isSubmitting = false
        }
      }}
    >
      <!-- Input and Button Container -->
      <div class="flex w-full items-center justify-center gap-3">
        <input
          type="email"
          name="email"
          bind:value={email}
          {placeholder}
          class="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full
                         rounded-lg border px-4
                         py-3 transition-all duration-200 focus:ring-2 focus:outline-none
                         {form?.errors?.email
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : ''}
                         {canSubmit
            ? 'border-green-300 focus:border-green-400'
            : ''}"
          required
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          disabled={!canSubmit}
          class=" {canSubmit
            ? 'cursor-pointer'
            : ''}  bg-primary text-primary-foreground flex h-12 min-h-max items-center justify-around rounded px-6 font-semibold"
        >
          {#if isSubmitting}
            <div class="flex items-center justify-center gap-2">
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
              Submitting...
            </div>
          {:else}
            <div class="flex items-center justify-center gap-2">
              <IconSend class="h-4 w-4" />
              {buttonText}
            </div>
          {/if}
        </Button>
      </div>

      <!-- Error Messages -->
      {#if form?.errors?.email}
        <p class="text-sm font-medium text-red-600" in:fade={{ duration: 200 }}>
          {form.errors.email}
        </p>
      {/if}

      {#if form?.errors?.general}
        <p class="text-sm font-medium text-red-600" in:fade={{ duration: 200 }}>
          {form.errors.general}
        </p>
      {/if}
    </form>
  {/if}
</div>
