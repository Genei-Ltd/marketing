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

	// Security certifications with logos
	const certifications = [
		{
			name: "SOC2 Type I",
			image: "/security/soc-1.png",
			link: "https://trust.coloop.ai/doc?s=9u0fwagr3r3hvjfcypwus2",
		},
		{
			name: "SOC II Type II",
			image: "/security/soc-2-blue.png",
			link: "https://trust.coloop.ai/doc?s=l6qlmwfk06wjebs23sp8qx",
		},
		{
			name: "Trust Center",
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
	<div class="lg:grid-cols-2 lg:grid flex flex-col-reverse items-start justify-between h-full grid-cols-1 gap-16">
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

		<div class="flex flex-col items-end justify-end w-full h-full">
			<!-- Right Column - Certifications Grid -->
			<div class="lg:self-end w-fit flex items-end self-start justify-end h-full">
				<div class="lg:grid-cols-2 lg:gap-4 grid items-end justify-end w-full h-full grid-cols-4">
					{#each certifications as cert}
						<a href={cert.link} target="_blank" rel="noopener noreferrer" class="">
							<div
								class=" lg:bg-card group hover:shadow lg:w-full min-h-32 max-h-32 lg:max-h-68 lg:p-4 lg:h-96 relative flex items-center justify-center w-full h-32 transition-all duration-200 rounded">
								<img
									src={cert.image}
									alt={cert.name}
									loading="lazy"
									decoding="async"
									fetchpriority="low"
									class:invert={cert.name === "GDPR"}
									class="w-fit grayscale group-hover:grayscale-0 contrast-200 max-h-32 object-contain h-32 transition-opacity duration-200" />
								<span
									class="lg:absolute text-card-foreground opacity-70 lg:block bottom-0 left-0 hidden p-2 px-3 font-mono text-sm font-semibold">
									{cert.name}
								</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
