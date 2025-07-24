<script lang="ts">
	import { IconShieldLock, IconDeviceDesktopCode, IconScale, IconWorldWww } from "@tabler/icons-svelte"
	import type { ComponentType } from "svelte"

	type Props = {
		set?: "security" | "features"
	}
	type Feature = {
		icon: ComponentType
		title: string
		description: string
	}

	const security: Feature[] = [
		{
			icon: IconShieldLock,
			title: "Enterprise-Grade Security",
			description: "Robust, industry-standard protection with zero training on your data.",
		},
		{
			icon: IconDeviceDesktopCode,
			title: "Agentic Workflows",
			description: "Produce expert-quality work product for complex workflows, with no prompting required.",
		},
		{
			icon: IconScale,
			title: "Domain-Specific Models",
			description: "High-performing custom models built for complex professional work.",
		},
		{
			icon: IconWorldWww,
			title: "24/7 Customer Support",
			description: "White glove support to resolve issues and maximize your CoLoop experience.",
		},
	]

	const features: Feature[] = [
		{
			icon: IconShieldLock,
			title: "SOCII",
			description: "Robust, industry-standard protection with zero training on your data.",
		},
		{
			icon: IconDeviceDesktopCode,
			title: "Live Support & Training",
			description:
				"White glove support to support adoption, maximise value and transform your team to AI first experts.",
		},
		{
			icon: IconScale,
			title: "Best In Class Models",
			description:
				"High-performing model ensembles assembled from across platforms and providers for a best in class experience.",
		},
		{
			icon: IconWorldWww,
			title: "Flexible API & Agentic Workflows",
			description:
				"Retrofit your teams, tools and processes in weeks with integrated APIs and expert quality tooling with no prompting experience required.",
		},
	]

	let { set = "features" }: Props = $props()
	const chosenSet = set === "security" ? security : features
</script>

{#snippet card(feature: Feature)}
	<div class=" flex flex-col items-start text-left">
		<div class=" flex items-center justify-start w-12 h-12 mb-4">
			<feature.icon class="size-8 text-primary" />
		</div>
		<span class="mb-2 text-lg font-semibold">{feature.title}</span>
		<span class="opacity-70 pr-8 text-sm">{feature.description}</span>
	</div>
{/snippet}

<section class="text-foreground w-full py-16">
	<div class="md:grid-cols-2 lg:grid-cols-4 grid gap-4 px-4">
		{#each chosenSet as feature}
			{@render card(feature)}
		{/each}
	</div>
</section>
