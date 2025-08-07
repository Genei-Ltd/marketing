<script lang="ts">
	import {
		IconShieldLock,
		IconDeviceDesktopCode,
		IconScale,
		IconWorldWww,
		IconShieldChevron,
		IconHeartHandshake,
		IconChartBar,
		IconClock,
	} from "@tabler/icons-svelte"
	import type { ComponentType } from "svelte"

	type Props = {
		set?: "security" | "features" | "enterprise-ready"
	}
	type Feature = {
		icon: ComponentType
		title: string
		description: string
	}

	const security: Feature[] = [
		{
			icon: IconShieldLock,
			title: "Placeholder",
			description: "Placeholder",
		},
	]

	const features: Feature[] = [
		{
			icon: IconShieldLock,
			title: "Enterprise-Grade Security",
			description: "Robust, industry-standard protection with zero training on your data.",
		},
		{
			icon: IconClock,
			title: "70% time saving",
			description: "Robust, industry-standard protection with zero training on your data.",
		},
		{
			icon: IconDeviceDesktopCode,
			title: "Live Support & Training",
			description:
				"White glove support to support adoption, maximise value and transform your team to AI first experts.",
		},
		{
			icon: IconHeartHandshake,
			title: "Over half of researchers report more enjoyable work",
			description: "AI-first research teams are more engaged and productive.",
		},
		{
			icon: IconChartBar,
			title: "46% of researchers report higher quality reports",
			description: "AI-first research teams are more productive and efficient.",
		},
		{
			icon: IconScale,
			title: "2x more likely to recommend that ChatGPT",
			description: "Robust, industry-standard protection with zero training on your data.",
		},
	]
	const enterpriseReady: Feature[] = [
		{
			icon: IconShieldLock,
			title: "SOC II Compliant",
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

	let { set }: Props = $props()

	let chosenSet: Feature[] = $state(features)

	switch (set) {
		case "security":
			chosenSet = security
			break
		case "features":
			chosenSet = features
			break
		case "enterprise-ready":
			chosenSet = enterpriseReady
			break
		default:
			chosenSet = features
			break
	}
</script>

{#snippet card(feature: Feature)}
	<div
		class=" bg-card border-primary h-full text-balance flex lg:flex-col flex-row items-start py-4 pl-4 text-left border-l-4 rounded">
		<div class=" flex items-start justify-start h-full mb-0 lg:mb-8 mr-4 lg:mr-0">
			<feature.icon class="size-10 lg:size-12 text-primary" stroke={0.8} />
		</div>
		<div class="flex flex-col items-start w-full">
			<span class="mb-2 text-lg font-semibold">{feature.title}</span>
			<span class="opacity-70 lg:pr-md pr-sm text-sm">{feature.description}</span>
		</div>
	</div>
{/snippet}

<section class="text-foreground w-full">
	<div class="md:grid-cols-2 lg:grid-cols-3 lg:gap-y-8 grid gap-4">
		{#each chosenSet as feature}
			{@render card(feature)}
		{/each}
	</div>
</section>
