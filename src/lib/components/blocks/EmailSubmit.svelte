<script lang="ts">
	import { IconCircleCheck, IconSend } from "@tabler/icons-svelte"
	import { fade, slide } from "svelte/transition"

	import { Button } from "$components/ui/button"

	import { enhance } from "$app/forms"
	import { cn } from "$lib/utils"

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
		className = "",
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

	let canSubmit = $derived(email.length > 0 && isValidEmail(email) && !isSubmitting)
</script>

<div class={cn("mx-auto w-full max-w-2xl", className)}>
	{#if form?.success}
		<div class="flex flex-row items-center w-full gap-4 py-2 mx-auto text-center" in:slide={{ duration: 300 }}>
			<span class="text-primary/80 flex items-center justify-center w-full gap-4 text-lg font-medium">
				<IconCircleCheck class=" w-6 h-6" />
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
			}}>
			<!-- Input and Button Container -->
			<div class="lg:flex-row flex flex-col items-center justify-center w-full gap-3">
				<input
					type="email"
					name="email"
					bind:value={email}
					{placeholder}
					class="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full
                         rounded-lg border px-4
                         py-3 transition-all duration-200 focus:ring-2 focus:outline-none
                         {form?.errors?.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                         {canSubmit ? 'border-green-300 focus:border-green-400' : ''}"
					required
					disabled={isSubmitting} />

				<Button
					type="submit"
					disabled={!canSubmit}
					class=" {canSubmit
						? 'cursor-pointer'
						: ''}  bg-primary text-primary-foreground flex h-12 min-h-max items-center justify-around rounded px-6 font-semibold w-full lg:w-auto">
					{#if isSubmitting}
						<div class="flex items-center justify-center gap-2">
							<div class="animate-spin border-t-transparent w-4 h-4 border-2 border-white rounded-full">
							</div>
							Submitting...
						</div>
					{:else}
						<div class="flex items-center justify-center gap-2">
							<IconSend class="w-4 h-4" />
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
