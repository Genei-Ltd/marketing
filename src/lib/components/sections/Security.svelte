<script lang="ts">
	import {
		IconShield,
		IconLock,
		IconUserCheck,
		IconDatabase,
		IconExternalLink,
		IconShieldCheck,
		IconShieldLock,
		IconClockShield,
		IconLockAccess,
		IconPlus,
	} from "@tabler/icons-svelte"

	import { cn } from "$lib/utils.js"

	// Security certifications with logos
	const certifications = [
		{
			name: "SOC2 Type I",
			image: "/security/soc-2.png",
			link: "https://trust.coloop.ai/doc?s=9u0fwagr3r3hvjfcypwus2",
		},
		{
			name: "SOC II Type II",
			image: "/security/soc-2-blue.png",
			link: "https://trust.coloop.ai/doc?s=l6qlmwfk06wjebs23sp8qx",
		},
		{
			name: "ISO 27001",
			image: "/security/soc-2-vanta.png",
			link: "https://trust.coloop.ai/",
		},
		{
			name: "GDPR",
			image: "/security/gdpr.svg",
			link: "https://trust.coloop.ai/",
		},
	]

	// Security features with icons
	const features = [
		{
			icon: IconShield,
			title: "No training on your data",
		},
		{
			icon: IconLock,
			title: "Modern & secure data practices",
		},
		{
			icon: IconDatabase,
			title: "End to end encryption",
		},
		{
			icon: IconUserCheck,
			title: "Audited & tested",
		},
	]
</script>

<div class="relative w-full mx-auto">
	<!-- Main Content Grid -->
	<div class="lg:grid-cols-2 lg:grid flex flex-col-reverse items-start grid-cols-1 gap-16">
		<!-- Left Column - Content -->
		<div class=" flex flex-col items-start justify-between h-full space-y-8">
			<!-- <div class="flex flex-row items-center justify-start w-full gap-4 mb-12">
				<div class="bg-primary p-2">
					<IconLock class="text-primary-foreground w-6 h-6" />
				</div>
				<h2 class=" font-serif text-lg">Security</h2>
			</div> -->
			<div class="flex flex-col gap-6">
				<div class="flex flex-col gap-2 mb-8">
					<span class=" text-balance font-serif text-4xl font-medium leading-tight"
						>Enterprise Grade Security</span>
					<span class=" opacity-90 text-lg">Trusted by the largest global brands and agencies</span>
				</div>

				<!-- Features List -->
				{#each features as feature}
					<div class="opacity-70 flex items-center h-3 space-x-2">
						<div class="flex items-center justify-center w-4 h-4">
							<svelte:component this={feature.icon} class=" w-4 h-4" />
						</div>
						<span class=" text-sm">{feature.title}</span>
					</div>
				{/each}
			</div>

			<!-- Call to Action -->
			<div class="pt-4">
				<a
					href="https://trust.coloop.ai/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-card-foreground hover:text-primary bg-card hover:underline inline-flex items-center p-2 px-4 text-sm transition-colors duration-200">
					Trust Center
					<IconExternalLink class="w-4 h-4 ml-2" />
				</a>
			</div>
		</div>

		<!-- Right Column - Certifications Grid -->
		<div class="lg:justify-end lg:w-full flex items-center justify-center">
			<div class="grid grid-cols-2 gap-4">
				{#each certifications as cert}
					<a href={cert.link} target="_blank" rel="noopener noreferrer" class="">
						<div
							class=" bg-card group hover:shadow-lg relative flex items-center justify-center w-64 h-64 p-4 transition-all duration-200 rounded">
							<img
								src={cert.image}
								alt={cert.name}
								class="w-fit grayscale group-hover:grayscale-0 dark:invert object-contain h-32 transition-opacity duration-200" />
							<span
								class=" text-card-foreground opacity-70 absolute bottom-0 left-0 p-2 px-3 font-mono text-sm font-semibold">
								{cert.name}
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
