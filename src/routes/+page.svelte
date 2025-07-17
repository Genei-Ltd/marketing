<script lang="ts">
	import { Button } from "$components/ui/button"
	import { IconMessage } from "@tabler/icons-svelte"

	import PharmaInsightDemo from "$components/animations/PharmaInsightDemo.svelte"
	import TwoSide from "$components/layouts/TwoSplit.svelte"
	import PillTabs from "$components/sections/PillTabs.svelte"
	import type { Testimonial } from "$lib/server/connectors/notion-testimonials"

	import EmailSubmit from "../lib/components/blocks/EmailSubmit.svelte"
	import SideGrid from "../lib/components/layouts/BentoGrid.svelte"
	import CommitmentLetter from "../lib/components/sections/CommitmentLetter.svelte"
	import Community from "../lib/components/sections/Community.svelte"
	import CTAdemo from "../lib/components/sections/CTAdemo.svelte"
	import DataFeatures from "../lib/components/sections/DataFeatures.svelte"
	import FeatColaboration from "../lib/components/sections/FeatColaboration.svelte"
	import Features from "../lib/components/sections/Features.svelte"
	import Integrations from "../lib/components/sections/Integrations.svelte"
	import Methodologies from "../lib/components/sections/Methodologies.svelte"
	import Security from "../lib/components/sections/Security.svelte"
	import Testimonials from "../lib/components/sections/Testimonials.svelte"
	let { form, data }: { form: FormData; data: { testimonials: Testimonial[] } } = $props()
</script>

{#snippet section(title: string)}
	<h2 class="font-serif text-4xl text-center">{title}</h2>
{/snippet}

<div class="pb-96 max-h-300 relative top-0 z-10 w-full h-screen">
	<img
		src="/images/wild/petri-2.png"
		alt="Hero"
		class="absolute top-0 z-10 object-cover w-full h-full align-bottom opacity-100" />
	<div class="pb-96 bg-gradient-to-t from-primary to-transparent absolute bottom-0 z-10 w-full h-screen"></div>
	<div class="max-w-7xl absolute bottom-0 left-0 right-0 z-50 py-16 mx-auto">
		<h1 class="text-huge text-background text-balance drop-shadow-lg font-serif leading-tight text-left">
			AI-powered analysis <br /> for human-powered insights
		</h1>
		<h2 class="text-background opacity-60 mt-4 font-sans leading-tight text-left">
			Opinions in, insights out. Fast.
		</h2>
	</div>
</div>

<div class="max-w-7xl relative z-50 flex flex-col items-center justify-center mx-auto">
	<!-- <div class="flex flex-row items-center justify-center w-full gap-4 mt-32">
  <div class="bg-brand text-brand-foreground w-full h-16">Brand</div>
  <div class="bg-primary text-primary-foreground w-full h-16">Primary</div>
  <div class="bg-accent-1 text-accent-1-foreground w-full h-16">Accent 1</div>
  <div class="bg-accent-2 text-accent-2-foreground w-full h-16">Accent 2</div>
  <div class="bg-accent-3 text-accent-3-foreground w-full h-16">Accent 3</div>
  <div class="bg-accent-4 text-accent-4-foreground w-full h-16">Accent 4</div>
  </div> -->
	<!-- Hero text -->
	<!-- <h1 class="text-huge text-foreground text-balance drop-shadow-lg mx-16 mt-64 font-serif leading-tight text-left">
		AI-powered analysis <br /> for human-powered insights
	</h1>
	<h2 class="text-foreground mt-16 font-sans leading-tight text-left">Opinions in, insights out. Fast.</h2> -->
</div>

<!-- Hero image -->
<!-- <div class="relative z-50 w-full mt-16">
	<img
		src="/images/hero-3.png"
		alt="Hero"
		class="border-primary aspect-video max-w-7xl grayscale border-6 relative z-50 object-cover w-full mx-auto rounded shadow-2xl" />
	</div> -->
<!-- <img src="/images/wild/hero.png" alt="Hero" class="absolute inset-0 object-cover w-full h-full py-16 opacity-50" /> -->

<!-- <Button>Button</Button> -->
<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<!-- Customer logos -->
	<div class="w-full mt-32 mb-16">
		<h2 class="font-serif text-2xl text-center">Trusted by the brands you trust</h2>
		<div class="flex flex-row items-center justify-center gap-16 mt-8">
			{#each Array.from({ length: 10 }, (_, i) => i) as index}
				<div class="flex flex-col items-center justify-center">
					<img
						src={`/customer-logos/${index + 1}.png`}
						alt="Logo"
						class="opacity-80 brightness-200 contrast-0 grayscale dark:brightness-0 dark:contrast-0 dark:invert-0 object-contain w-24" />
				</div>
			{/each}
		</div>
	</div>

	<!-- Email subscribe form -->
	<div class="mb-18 w-full mt-16">
		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Subscribe" />
	</div>

	<!-- CTA -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		<CTAdemo />
	</div>

	<!-- CTA -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		<TwoSide
			label="Coloop"
			heading="Analysis on Steroids"
			description="Multi-model agents. Fast. Easy. Human-driven."
			buttonText="Try it out"
			buttonHref="/test">
			<div class="flex flex-col gap-4">
				<div class="bg-card hover:shadow-md p-4 transition-shadow rounded-lg shadow-sm">
					<div class="flex flex-row items-center gap-2 text-center">
						<div class="flex items-center justify-center w-6 h-6">
							<IconMessage class="text-foreground w-8 h-8" />
						</div>
						<div>
							<span class="text-foreground text-base font-semibold">Support</span>
						</div>
					</div>
				</div>
			</div>
		</TwoSide>
	</div>

	<!-- Features -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Run every kind of study, on any kind of data")}
		<Features />
	</div>

	<!-- Success -->
	<div class="flex flex-col w-full mt-32 mb-32">
		{@render section("Unlock the power of AI for your team")}
		<div class="flex flex-row mb-16"></div>
		<SideGrid />
	</div>

	<!-- Success -->
	<div class="flex flex-col w-full mt-32 mb-32">
		{@render section("Unlock the power of AI for your team")}
		<div class="flex flex-row mb-16"></div>
		<PillTabs defaultValue="in-house-counsel" autoProgressInterval={4000} />
	</div>
</div>

<!-- insert calendar from cal.com -->
<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<div class="w-full">
		<iframe
			src="https://coloop.cal.com/coloop-ai/agencies"
			style="border: 0px #ffffff none"
			width="100%"
			height="800"
			frameborder="0"
			marginheight="0"
			marginwidth="0"
			title="Booking Calendar"></iframe>
	</div>
</div>

<!-- Testimonials -->
<div class="bg-primary text-primary-foreground w-full">
	<div class="max-w-7xl flex flex-col w-full gap-16 py-16 mx-auto mt-32 mb-32">
		{@render section("What our customers say")}
		<Testimonials testimonials={data.testimonials} />
	</div>
</div>

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	{@render section("What our customers say")}
	<div class="grid w-full h-full grid-cols-3 gap-16 py-16 mb-32 rounded">
		<div class="bg-accent-2 max-h-96 col-span-2 p-16 rounded">
			<img src="/images/features/concept.gif" alt="" class="object-contain w-full h-full" />
		</div>
		<div class="text-sans flex flex-col items-start justify-start col-span-1 gap-8 mt-16 text-xl">
			<h2 class="text-5xl tracking-tighter">Insights, Fresh out the oven.</h2>
			<p class="text-xl font-light">"I love this product! It's so easy to use and has helped me so much."</p>
		</div>
	</div>
</div>

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<!-- Methodologies -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Extensive capabilities for every methodology")}
		<Methodologies />
	</div>

	<!-- Data features -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Run every kind of study, on any kind of data")}
		<DataFeatures />
	</div>

	<!-- Capabilities -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Collaborate with your team & stakeholders")}
		<FeatColaboration />
	</div>

	<!-- PharmaInsight Demo -->
	<div class="flex flex-col items-center justify-center w-full gap-16 mt-32 mb-32">
		{@render section("From data to decisions, instantly")}
		<div class="w-full">
			<PharmaInsightDemo />
		</div>
	</div>

	<!-- Success -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Seamlessly integrated with all the tools you already use")}
		<Integrations />
	</div>

	<!-- Security -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Enterprise-grade security")}
		<Security />
	</div>
</div>

<!-- Commitment Letter -->
<div class="relative flex flex-col w-full gap-16 mt-32 mb-32">
	<div class="h-300 relative w-full mx-auto mt-16">
		<img
			src="/images/amethyst-6-wide-4k.png"
			alt="Commitment Letter"
			class="z-0 object-cover w-full h-full opacity-100" />
		<div class="absolute inset-0 z-10 flex items-center justify-center w-full h-full gap-32">
			{@render section("Our commitment to human-driven insights")}
			<CommitmentLetter />
		</div>
	</div>
</div>

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<!-- Community -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		<Community />
	</div>
</div>
