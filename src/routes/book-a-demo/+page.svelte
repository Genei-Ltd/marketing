<script lang="ts">
	import Marquee from "$lib/components/ui/Marquee.svelte"
	import { enhance } from "$app/forms"
	import { page } from "$app/stores"
	import Button from "$lib/components/ui/button/button.svelte"
	import { Card } from "$lib/components/ui/card"
	import { cubicOut } from "svelte/easing"
	import { fade, fly, scale, slide } from "svelte/transition"
	import { onMount } from "svelte"
	import {
		IconLoader,
		IconArrowRight,
		IconUser,
		IconSchool,
		IconUsersGroup,
		IconBuilding,
		IconBriefcase2,
		IconCalendar,
	} from "@tabler/icons-svelte"
	import type { ActionData, PageData } from "./$types"

	interface Props {
		data: PageData
		form?: ActionData
	}

	let { data, form }: Props = $props()

	// Form state
	let email = $state(data.email || "")
	let teamType = $state("")
	let discoverySource = $state("")
	let productInterest = $state("")
	let isSubmitting = $state(false)
	let showCalEmbed = $state(false)
	let calEmbedLink = $state("")
	let iframeHeight = $state(650)
	let calIframe: HTMLIFrameElement | null = $state(null)
	let embedContainer: HTMLDivElement | null = $state(null)

	// Configuration
	const TEAM_OPTIONS = [
		{
			id: "freelancer",
			title: "Freelancer / Independent Researcher",
			icon: IconUser,
			description: "Individual consultant",
		},
		{
			id: "academic",
			title: "Academic Institution",
			icon: IconSchool,
			description: "University or research institute",
		},
		{
			id: "icg-member",
			title: "ICG Member",
			icon: IconUsersGroup,
			description: "Insights Community Group",
		},
		{
			id: "agency",
			title: "Research Agency",
			icon: IconBriefcase2,
			description: "Market research consultancy",
		},
		{
			id: "in-house",
			title: "In-House Research Team",
			icon: IconBuilding,
			description: "Corporate insights team",
		},
	] as const

	const PRODUCT_OPTIONS = [
		{
			id: "qualitative",
			title: "Qualitative Research",
			icon: IconUser,
			description: "Interview analysis & insights",
		},
		{
			id: "open-ends",
			title: "Open-End Analysis",
			icon: IconUser,
			description: "Survey response insights",
		},
		{
			id: "both",
			title: "Complete Platform",
			icon: IconUser,
			description: "Full research suite",
		},
	] as const

	// Validation
	let formErrors = $derived(form?.errors || {})
	let canSubmit = $derived(email && teamType && discoverySource && productInterest)

	// Handle successful submission
	$effect(() => {
		if (form?.success) {
			showCalEmbed = true
			calEmbedLink = form.data.calEmbedLink
		}
	})

	// Initialize email from URL parameter
	onMount(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search)
			const emailParam = urlParams.get("email")
			if (emailParam && !email) {
				email = emailParam
			}
		}

		// Handle Cal.com height changes
		const handleMessage = (event: MessageEvent) => {
			// Ensure the message is from Cal.com
			if (event.origin.includes("cal.com") || event.origin.includes("calendly.com")) {
				const data = event.data

				// Handle different Cal.com message formats
				if (data?.type === "cal:height" && data.height) {
					iframeHeight = Math.max(data.height, 400) // Minimum height of 400px
				} else if (data?.height && typeof data.height === "number") {
					iframeHeight = Math.max(data.height, 400)
				} else if (typeof data === "object" && data?.cal?.height) {
					iframeHeight = Math.max(data.cal.height, 400)
				}
			}
		}

		window.addEventListener("message", handleMessage)

		return () => {
			window.removeEventListener("message", handleMessage)
		}
	})
</script>

<svelte:head>
	<title>Book a Demo - CoLoop</title>
	<meta
		name="description"
		content="Book a personalized demo of CoLoop's research platform. Quick form to get started." />
</svelte:head>

<div class="min-h-screen mt-14 h-full flex xl:flex-row flex-col">
	{#if !showCalEmbed}
		<!-- Header -->
		<div class="text-left bg-black py-16 mb-16 lg:justify-between max-h-screen relative">
			<img src="/images/base.png" alt="CoLoop" class="absolute inset-0 object-cover w-full h-full opacity-60" />
			<div class="bg-gradient-to-t from-black/50 to-black/0 absolute z-10 w-full h-full"></div>
			<div class="lg:px-10 relative flex flex-col items-start justify-between max-w-4xl px-6 mx-auto h-full">
				<div>
					<h1 class="font-bold text-white mb-4 w-full">300+ Teams Trust CoLoop</h1>
					<p class="text-lg text-white mx-auto w-full">
						Get a personalized demonstration of CoLoop's research platform.
					</p>
				</div>
				<!-- <div class="w-full overflow-hidden h-128">
					<Marquee fade direction="up" duration="20s" gap="3rem" numberOfCopies={3} class="h-full">
						{#each new Array(16) as _, i}
							<img
								src="/customer-logos/{i + 1}.png"
								alt="Company Logo"
								class="h-16 max-h-16 w-fit saturate-0" />
						{/each}
					</Marquee>
				</div> -->

				<!-- TESTIMONIAL QUOTE -->
				<div class=" text-white py-16">
					<!-- <div class=" flex items-center justify-center">
							<img
								src="/images/old-man.png"
								alt="customer testimonial"
								class="aspect-square object-cover w-full h-full rounded" />
						</div> -->
					<div class=" flex flex-col items-start justify-center max-w-2xl">
						<blockquote class="text-white text-balance mb-8 font-serif text-xl">
							"CoLoop transformed how we approach qualitative research. What used to take our team weeks
							now happens in days, and the insights are more actionable than ever."
						</blockquote>
						<div class="text-white font-sans text-sm">
							<span class="text-white block font-semibold">Sarah Chen</span>
							<span class="block">Head of User Research, TechCorp</span>
						</div>
					</div>
				</div>

				<div class=" flex-col items-start justify-start mb-16 lg:mb-0 hidden xl:flex">
					<p class="text-md text-white mx-auto w-full max-w-2xl">
						Join 300+ teams who've transformed their research workflow. See how CoLoop's AI-powered platform
						can accelerate your insights discovery by 10x in just 30 minutes.
					</p>
				</div>
			</div>
		</div>

		<div
			class="w-full mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-screen flex flex-col items-center justify-center max-w-6xl pb-16">
			<!-- Main Form -->
			<div
				class="h-full w-full mx-auto flex flex-col items-center justify-center flex-1"
				in:slide={{ axis: "y", duration: 1000 }}>
				<div class="w-full h-full max-w-3xl mx-auto">
					<div class="flex flex-col items-center justify-center mb-16 text-center">
						<h1 class="font-bold text-foreground mb-4 w-full">Book Your Demo</h1>
						<p class="text-lg text-muted-foreground mx-auto w-full">
							Get a personalized demonstration of CoLoop's research platform
						</p>
					</div>
					<form
						method="POST"
						action="?/submit"
						class="space-y-8"
						use:enhance={() => {
							isSubmitting = true
							return async ({ update }) => {
								await update()
								isSubmitting = false
							}
						}}>
						<!-- Email Input -->
						<div class="space-y-2">
							<label for="email" class="block text-base font-medium text-foreground">
								Email Address <span class="text-destructive">*</span>
							</label>
							<input
								id="email"
								name="email"
								type="email"
								bind:value={email}
								placeholder="your.email@company.com"
								class="w-full px-4 py-2 text-base border border-border rounded focus:ring-2 focus:ring-ring focus:border-ring transition-colors {formErrors.email
									? 'border-destructive'
									: ''}"
								required />
							{#if formErrors.email}
								<p class="text-sm text-destructive">
									{formErrors.email}
								</p>
							{/if}
						</div>

						<!-- Team Type Selection -->
						<fieldset class="space-y-2">
							<legend class="block text-base font-medium text-foreground">
								Team Type <span class="text-destructive">*</span>
							</legend>
							<div class="grid gap-3 grid-cols-1 lg:grid-cols-2">
								{#each TEAM_OPTIONS as option}
									{@const IconComponent = option.icon}
									<label
										class="flex items-center border border-border min-h-16 lg:min-h-24 rounded overflow-hidden cursor-pointer hover:bg-muted/50 transition-all duration-300 {teamType ===
										option.id
											? 'border-primary scale-95 '
											: ' hover:scale-102  transition-all duration-300'}">
										<input
											type="radio"
											name="teamType"
											bind:group={teamType}
											value={option.id}
											class="sr-only" />
										<div class="flex items-center w-full h-full">
											<div
												class="h-full w-1/4 lg:w-1/3 bg-primary flex items-center justify-center relative {teamType ===
												option.id
													? 'bg-primary '
													: ''}">
												<IconComponent stroke={1} class="size-6 text-primary-foreground" />
											</div>
											<div
												class="flex-1 p-4 transition-all duration-300 {teamType === option.id
													? 'bg-primary/10 '
													: ''}">
												<div class="font-medium text-foreground text-sm">
													{option.title}
												</div>
												<div class="text-muted-foreground text-xs">
													{option.description}
												</div>
											</div>
											<!-- <div
												class="absolute top-2 right-2 w-4 h-4 border-2 rounded-full flex items-center justify-center {productInterest ===
												option.id
													? 'border-primary'
													: 'border-primary'}">
												{#if productInterest === option.id}
													<div class="w-2 h-2 bg-primary rounded-full"></div>
												{/if}
											</div> -->
										</div>
									</label>
								{/each}
							</div>
							{#if formErrors.teamType}
								<p class="text-sm text-destructive">
									{formErrors.teamType}
								</p>
							{/if}
						</fieldset>

						<!-- Product Interest -->
						<fieldset class="space-y-2">
							<legend class="block text-base font-medium text-foreground">
								Product Interest <span class="text-destructive">*</span>
							</legend>
							<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
								{#each PRODUCT_OPTIONS as option}
									{@const IconComponent = option.icon}

									<label
										class="flex items-center border border-border min-h-16 lg:min-h-24 rounded overflow-hidden cursor-pointer hover:bg-muted/50 transition-all duration-300 {productInterest ===
										option.id
											? 'border-primary scale-95 '
											: ' hover:scale-102  transition-all duration-300'}">
										<input
											type="radio"
											name="productInterest"
											bind:group={productInterest}
											value={option.id}
											class="sr-only" />
										<div class="flex items-center w-full h-full">
											<div
												class="h-full w-1/4 lg:w-1/3 bg-primary flex items-center justify-center relative {productInterest ===
												option.id
													? 'bg-primary '
													: ''}">
												<IconComponent stroke={1} class="size-6 text-primary-foreground" />
											</div>
											<div
												class="flex-1 p-4 transition-all duration-300 {productInterest ===
												option.id
													? 'bg-primary/10 '
													: ''}">
												<div class="font-medium text-foreground text-sm">
													{option.title}
												</div>
												<div class="text-muted-foreground text-xs">
													{option.description}
												</div>
											</div>
											<!-- <div
												class="absolute top-2 right-2 w-4 h-4 border-2 rounded-full flex items-center justify-center {productInterest ===
												option.id
													? 'border-primary'
													: 'border-primary'}">
												{#if productInterest === option.id}
													<div class="w-2 h-2 bg-primary rounded-full"></div>
												{/if}
											</div> -->
										</div>
									</label>
								{/each}
							</div>
							{#if formErrors.productInterest}
								<p class="text-sm text-destructive">
									{formErrors.productInterest}
								</p>
							{/if}
						</fieldset>

						<!-- Discovery Source -->
						<div class="space-y-2">
							<label for="discovery" class="block text-base font-medium text-foreground">
								How did you hear about us? <span class="text-destructive">*</span>
							</label>
							<input
								id="discovery"
								name="discoverySource"
								type="text"
								bind:value={discoverySource}
								placeholder="LinkedIn, referral, conference..."
								maxlength={100}
								class="w-full px-4 py-2 text-base border border-border rounded focus:ring-2 focus:ring-ring focus:border-ring transition-colors {formErrors.discoverySource
									? 'border-destructive'
									: ''}"
								required />
							{#if formErrors.discoverySource}
								<p class="text-sm text-destructive">
									{formErrors.discoverySource}
								</p>
							{/if}
						</div>
						<!-- Submit Button -->
						<div class="pt-6">
							<Button
								type="submit"
								disabled={!canSubmit || isSubmitting}
								class="w-full h-12 text-base font-semibold"
								size="lg">
								{#if isSubmitting}
									<IconLoader class="w-4 h-4 mr-2 animate-spin" />
									Processing...
								{:else}
									Book Demo
									<IconArrowRight class="w-4 h-4 ml-2" />
								{/if}
							</Button>
							{#if form?.error}
								<p class="text-sm text-destructive text-center mt-2">
									{form.error}
								</p>
							{/if}
						</div>
					</form>
				</div>
			</div>
		</div>
	{:else}
		<!-- Cal.com Embed -->
		<div class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
			<div class="text-center mb-6">
				<h2 class="text-3xl font-bold text-foreground mb-3">Schedule Your Demo</h2>
				<p class="text-base text-muted-foreground">
					Choose a convenient time for your personalized demonstration
				</p>
			</div>

			<div
				class="shadow-lg rounded-lg overflow-hidden h-full"
				style="min-height: {iframeHeight}px;"
				bind:this={embedContainer}>
				<iframe
					src={calEmbedLink}
					width="100%"
					frameborder="0"
					title="Schedule a CoLoop Demo"
					class="w-full"
					bind:this={calIframe}
					style="height: {iframeHeight}px;"></iframe>
			</div>

			<div class="text-center mt-4">
				<button
					type="button"
					onclick={() => (showCalEmbed = false)}
					class="text-sm text-muted-foreground hover:text-foreground">
					← Back to form
				</button>
			</div>
		</div>
	{/if}
</div>
