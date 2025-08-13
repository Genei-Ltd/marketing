<script lang="ts">
	import Timeline from "../lib/components/sections/Timeline.svelte"

	import WildAnimationBox from "./WildAnimationBox.svelte"

	import BlogEndArtCard from "./../lib/components/blocks/BlogEndArtCard.svelte"

	import TwoSplit from "$components/layouts/TwoSplit.svelte"
	import type { Testimonial } from "$lib/server/connectors/notion-testimonials"

	import EmailSubmit from "../lib/components/blocks/EmailSubmit.svelte"
	import ColSideSelectTwoSplit from "../lib/components/sections/ColSideSelectTwoSplit.svelte"

	import Card from "$components/blocks/Card.svelte"
	import NakedCardSet from "$components/sections/NakedCardSet.svelte"
	import CarouselBlogs from "$components/sections/CarouselBlogs.svelte"
	import CarouselPills from "$components/sections/CarouselPills.svelte"
	import type { Article } from "$lib/types/articles"
	import Security from "$components/sections/Security.svelte"
	import DemoWorkflowSharing from "$components/animations/DemoWorkflowSharing.svelte"
	import StaticDemoIntegrations from "$components/animations/StaticDemoIntegrations.svelte"
	import DemoTranscriptClips from "$components/animations/DemoTranscriptClips.svelte"
	import DemoFeatureReel from "$components/animations/DemoFeatureReel.svelte"
	import CarouselTestimonials from "$components/sections/CarouselTestimonials.svelte"

	// SEO imports
	import SEOHead from "$lib/components/SEOHead.svelte"
	import { generateHomepageMetadata } from "$lib/utils/seo"
	import { generateHomepageSchemas } from "$lib/utils/structured-data"

	let {
		form,
		data,
	}: {
		form: FormData
		data: {
			testimonials: Testimonial[]
			ctaTestimonial: Testimonial[]
			articles: Article[]
			partner: string | null
		}
	} = $props()

	// Generate SEO metadata and structured data
	const seoMetadata = generateHomepageMetadata()
	const structuredData = generateHomepageSchemas()

	const partnerUrl = $derived(data.partner)

	$effect(() => {
		console.log("partnerURL", partnerUrl)
	})
</script>

<!-- SEO Meta Tags and Structured Data -->
<SEOHead metadata={seoMetadata} {structuredData} />

{#snippet section(title: string, subtitle?: string)}
	<div class="flex flex-col items-center justify-center w-full">
		{#if subtitle}
			<div class="flex flex-col items-center justify-center w-full">
				<h2 class="text-balance lg:text-2xl w-full mx-auto mb-4 font-serif text-xl text-center">
					{title}
				</h2>
				<span class="text-balance opacity-80 text-md w-2/3 mx-auto mb-16 font-sans text-center"
					>{subtitle}</span>
			</div>
		{:else}
			<h2 class="text-balance lg:text-2xl w-full mx-auto mb-16 font-serif text-xl text-center">
				{title}
			</h2>
		{/if}
	</div>
{/snippet}

<!-- Hero image -->
<!-- <div class="relative z-50 w-full mt-16">
	<img
		src="/images/hero-3.png"
		alt="Hero"
		class="border-primary aspect-video grayscale border-6 relative z-50 object-cover w-full max-w-6xl mx-auto rounded shadow-2xl" />
	</div> -->
<!-- <img src="/images/wild/hero.png" alt="Hero" class="absolute inset-0 object-cover w-full h-full py-16 opacity-50" /> -->

<!-- HERO SECTION -->
<div class="pb-96 max-h-300 relative top-0 z-10 w-full h-screen">
	{#if partnerUrl}
		<!-- <div
			class="absolute inset-0 bg-linear-100 from-white/45 via-transparent to-black/40 pointer-events-none rounded-sm mix-blend-overlay transform z-50">
			<img src={partner} alt="Partner" class="w-full h-full object-cover" />
		</div>
		<img
			src={partner}
			alt="Hero"
			class="2xl:object-bottom-right object-center absolute top-0 z-10 object-cover xl:object-right w-full h-full opacity-100 transition-all duration-500 ease-in-out" />
		<div
			class="absolute 2xl:top-[150px] 2xl:right-[445px] 2xl:w-[1465px] 2xl:h-[590px] z-30"
			style="
		transform-origin: bottom right;
		transform-style: preserve-3d;
		transform: 
		perspective(2250px) 
		rotateX(0deg) 
		rotateY(-34deg) 
		rotateZ(-1.2deg)
		skewX(-1deg)
		scaleY(1)
		">
			<img
				src="/wild/super-car.png"
				alt="Billboard Advertisement"
				class="w-full h-full object-cover brightness-80 contrast-85 saturate-80 transition-all feather-100 duration-300 hover:brightness-120 transform-gpu" />
			<div
				class="absolute inset-0 bg-linear-100 from-white/45 via-transparent to-black/40 pointer-events-none rounded-sm mix-blend-overlay transform z-50">
			</div>
		</div>
		<div
			class="pb-96 bg-gradient-to-t from-black/90 via-black/0 to-transparent opacity-60 absolute bottom-0 z-10 w-full h-screen">
		</div> -->
		{#await partnerUrl}
			<span class="text-foreground">Loading partner...</span>
		{:then partnerUrl}
			<img
				src={partnerUrl}
				alt="Hero"
				class="2xl:object-bottom-right object-center absolute top-0 z-10 object-cover xl:object-right w-full h-full opacity-100 transition-all duration-500 ease-in-out" />
			<div
				class="pb-96 bg-gradient-to-t from-black/90 via-black/0 to-transparent opacity-60 absolute bottom-0 z-10 w-full h-screen">
			</div>
		{:catch}
			<span class="text-foreground">Error loading partner</span>
		{/await}
	{:else}
		<img
			src="/wild/coca-cola-4k-wide.jpg"
			alt="Hero"
			class="2xl:object-bottom-right object-center absolute top-0 z-10 object-cover xl:object-right w-full h-full opacity-100 transition-all duration-500 ease-in-out" />
		<div
			class="pb-96 bg-gradient-to-t from-black/90 via-black/0 to-transparent opacity-60 absolute bottom-0 z-10 w-full h-screen">
		</div>
	{/if}

	<!-- BILLBOARD OVERLAY - PRECISELY MATCHES the billboard in background -->
	<!-- 
		TO CHANGE BILLBOARD: Replace src with your image:
		Examples:
		- "/wild/pepsi.png" 
		- "/wild/crazy-cola.png"
		- "/wild/billboard.png"
		- "/custom/your-ad.jpg"
		
		The overlay automatically matches the billboard's exact position and 3D perspective
		across all screen sizes and responsive breakpoints.
	-->

	<!-- <div
		class="px-auto absolute bottom-0 left-0 right-0 z-50 flex flex-col items-start justify-between h-full py-16 mx-32">
		<div class="h-fit relative top-0 z-10 flex items-center justify-center object-cover w-1/4 mt-16 opacity-100">
			<DemoWorkflow />
		</div>
	</div> -->
	<div
		class="lg:px-10 absolute bottom-0 left-0 right-0 z-50 flex flex-col items-start justify-between h-full max-w-6xl px-6 py-16 mx-auto">
		<div class="flex flex-col items-start justify-end h-full">
			<h1
				class="xl:text-huge text-white text-balance drop-shadow-lg sm:text-3xl md:text-4xl font-serif text-2xl leading-tight tracking-wide text-left capitalize">
				AI-powered analysis for human-powered insights
			</h1>
			<h2
				class="text-white opacity-80 text-md md:text-lg mt-4 font-sans font-medium leading-tight tracking-wide text-left uppercase">
				Opinions in, insights out. Fast.
			</h2>
		</div>
	</div>
</div>

<div class="lg:px-10 relative flex flex-col items-center justify-center max-w-6xl px-6 mx-auto overflow-hidden">
	<!-- CUSTOMER LOGOS  -->
	<div class="lg:lg:mt-32 w-full mt-16 mb-16">
		<h2 class="font-serif text-2xl text-center">Trusted by the brands you trust</h2>
		<div class="flex flex-row items-center justify-center gap-16 mt-8">
			{#each Array.from({ length: 10 }, (_, i) => i) as index}
				<div class="flex flex-col items-center justify-center">
					<img
						src={`/customer-logos/${index + 1}.png`}
						alt="Logo"
						class="opacity-80 min-w-18 brightness-200 contrast-0 grayscale dark:brightness-0 dark:contrast-0 dark:invert-0 object-contain w-24" />
				</div>
			{/each}
		</div>
	</div>

	<!-- FIRST CTA -->
	<div class="w-full mt-16">
		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Subscribe" />
	</div>

	<!-- PRODUCT BENEFITS  -->
	<div class="lg:mt-32 lg:mb-32 flex flex-col w-full gap-32 mt-16 mb-16">
		<TwoSplit
			label="Analysis Agents"
			heading="Specialized for Insights"
			description="Delegate complex tasks in natural language to domain-specific agents that can count, search, summarise and cite."
			buttonText="Explore Agents"
			buttonHref="/book-a-demo">
			<WildAnimationBox backgroundColor="bg-accent-4">
				<DemoTranscriptClips />
			</WildAnimationBox>
		</TwoSplit>
		<TwoSplit
			label="Workflows"
			heading="Streamline Your Analysis"
			description="Precise purpose built workflows for transcription, translation, content analysis, clip reels and more."
			buttonText="Explore Workflows"
			reverse
			buttonHref="/book-a-demo">
			<div class="bg-accent-3 flex items-center justify-center h-full mx-auto overflow-hidden">
				<DemoFeatureReel />
			</div>
		</TwoSplit>
		<TwoSplit
			label="Integrations"
			heading="Streamlined Analysis in a single tool"
			description="Upload your data from a growing range of file formats, languages and 3rd party tools to create a single unified source of truth."
			buttonText="Explore Integrations"
			buttonHref="/book-a-demo">
			<WildAnimationBox backgroundColor="bg-accent-2">
				<StaticDemoIntegrations />
			</WildAnimationBox>
		</TwoSplit>
		<TwoSplit
			label="Projects"
			heading="Secure Access Controlled Workspaces"
			description="Combine your research material in secure projects with all of the context."
			buttonText="Explore Projects"
			reverse
			buttonHref="/book-a-demo"
			clearBackground={[false, true]}>
			<WildAnimationBox backgroundColor="bg-accent-1">
				<DemoWorkflowSharing />
			</WildAnimationBox>
		</TwoSplit>
	</div>
</div>
<div class="bg-primary text-primary-foreground lg:px-10 flex flex-col items-center justify-center w-full py-32">
	<!-- TESTIMONIAL HIGHLIGHT  -->
	<div class="lg:grid-cols-2 lg:gap-0 grid items-center justify-center max-w-6xl grid-cols-1 gap-16 px-6 mx-auto">
		<div class=" flex items-center justify-center">
			<img src="/images/old-man.png" alt="old man" class="aspect-square object-cover w-full h-full rounded" />
		</div>
		<div class=" xl:p-lg lg:p-md p-sm flex flex-col items-start justify-center flex-1">
			<blockquote class="text-primary-foreground text-balance mb-8 font-serif text-xl">
				"When it comes to AI and technology, it’s all about learning by doing. You won’t figure everything out
				right away, but the more you engage with it, the more opportunities you’ll see."
			</blockquote>
			<div class="text-primary-foreground font-sans text-sm">
				<span class="text-primary-foreground block font-semibold">Tommi Laitio</span>
				<span class="block">Former Executive Director, Culture and Leisure, City of Helsinki</span>
			</div>
		</div>
	</div>
</div>

<div class="lg:px-10 relative flex flex-col items-center justify-center max-w-6xl px-6 mx-auto overflow-hidden">
	<!-- STATISTICS & BENEFITS  -->
	<div class="lg:mt-32 lg:mb-32 flex flex-col w-full mt-16 mb-16">
		{@render section("Let us do the heavy lifting, you do the insights", "Researchers love CoLoop.")}
		<NakedCardSet set="features" />
	</div>
</div>

<!-- MAX 7XL END -->
<!-- FULL WIDTH START -->

<div class="bg-primary text-primary-foreground lg:px-10 flex flex-col items-center justify-center w-full px-6 py-32">
	<!-- SOLUTIONS -->
	<div class=" min-h-200 flex flex-col items-center justify-center w-full mb-16">
		<h4 class="text-balance text-md mb-4 font-medium tracking-wide text-center">From researchers to analysts</h4>
		{@render section("There's a CoLoop for every team")}
		<CarouselPills />
	</div>
</div>

<!-- FULL WIDTH END -->
<!-- MAX 7XL START -->

<div class="lg:px-10 relative flex flex-col items-center justify-center h-full max-w-6xl px-6 mx-auto">
	<!-- Testimonials -->
	<div class="min-h-max w-full h-full overflow-hidden">
		<div class="min-h-max lg:mb-32 hidden lg:flex flex-col w-full h-full max-w-6xl gap-16 mx-auto mt-16 mb-16">
			{@render section("What our customers say")}
			{#await data.testimonials}
				<span class="text-foreground">Loading testimonials...</span>
			{:then testimonials}
				<div class="h-full w-full mx-auto flex items-center justify-center">
					<CarouselTestimonials {testimonials} />
				</div>
			{:catch}
				<span class="text-foreground">Error loading testimonials</span>
			{/await}
		</div>
	</div>
	<!-- BOOK A CALL CTA -->
	<div class="w-full mt-16 lg:mb-64 mb-32">
		{@render section(
			"This is the future of research",
			"Book a personalized demo to discover how CoLoop can accelerate your research and insights workflow.",
		)}
		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Get a demo" />
	</div>

	<!-- ENTERPRISE READY -->
	{@render section("Enterprise Grade Artificial Intelligence", "Designed by Insights Experts, for Insights Experts")}
	<div class="lg:grid-cols-4 grid grid-cols-2 grid-rows-2 gap-4 mb-16">
		<!-- {
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
		}, -->
		<Card
			title="By Insights Experts, for Insights Experts"
			subtitle="Designed with insights leaders with agencies, household brands and research institutions."
			image="/water/blue-3.png"
			href="/demo"
			cardHeight={96}
			colSpan={2}
			rowSpan={2} />
		<Card
			title="Best In Class Models"
			subtitle="High-performing model ensembles assembled from across platforms and providers for a best in class experience."
			cardHeight={96}
			colSpan={2}>
			<div class="mask-l-from-100 mask-r-from-100 flex items-center justify-center w-full h-full">
				<div class=" h-1/3 mt-18 flex flex-row items-center justify-center w-full gap-4">
					{#each ["google", "openai", "anthropic", "meta", "xai"] as logo}
						<div class="flex items-center justify-center h-full p-4 bg-white rounded">
							<img src={`/security/${logo}.png`} alt={logo} class="w-fit object-contain max-w-xl" />
						</div>
					{/each}
				</div>
			</div>
		</Card>
		<Card
			title="Data Sovereignty"
			subtitle="Your data, your rules. Host your data to be compliant in UK, EU or USA ."
			cardHeight={96}
			rowSpan={2}
			colSpan={2}>
			<div class=" flex items-center justify-center w-full h-full">
				<div
					class="mask-l-from-100 mask-r-from-100 flex flex-row items-center justify-center w-full h-full gap-4 overflow-hidden">
					{#each ["UK", "EU", "USA"] as logo}
						<div
							class="bg-secondary h-2/5 min-w-36 text-secondary-foreground outline-hidden relative flex flex-col items-start justify-start w-full gap-4 mt-12 shadow">
							<div
								class="relative flex flex-row items-center justify-center object-cover w-full h-full overflow-hidden rounded">
								<img
									src={`/security/${logo.toLowerCase()}.png`}
									alt={logo}
									class="object-cover w-full h-full" />
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<Card
			title="Flexible API "
			subtitle="Retrofit your teams, tools and processes in weeks with integrated APIs and expert quality tooling with no prompting experience required." />
		<Card
			title="Agentic Workflows"
			subtitle="Retrofit your teams, tools and processes in weeks with integrated APIs and expert quality tooling with no prompting experience required." />
	</div>
</div>

<!-- MAX 7XL END -->
<!-- FULL WIDTH START -->

<div
	class="text-primary-foreground lg:min-h-200 min-h-156 bg-primary lg:mt-32 lg:mb-32 flex flex-col items-center justify-center w-full mt-16 mb-16">
	<!-- BLOGS CAROUSEL -->
	<!-- {@render section("What our customers say")} -->
	{#await data.articles}
		<span class="text-foreground text-center">Loading articles...</span>
	{:then articles}
		<CarouselBlogs {articles} />
	{:catch}
		<span class="text-foreground text-center">Error loading articles</span>
	{/await}
</div>
<!-- FULL WIDTH END -->

<div class="lg:px-10 relative flex flex-col items-center justify-center max-w-6xl px-6 mx-auto">
	<!-- ORG TRANSFORMATION TIMELINE -->
	<div class="lg:mt-32 lg:mb-32 w-full mt-16 mb-16">
		{@render section("Transform your team to an AI native team")}
		<Timeline></Timeline>
	</div>

	<!-- FINAL GET STARTED -->

	<div
		class="bg-accent-1 text-primary-foreground lg:px-10 lg:mt-32 lg:mb-32 relative flex flex-col items-center justify-center w-full px-6 py-32 mt-16 mb-16 overflow-hidden rounded shadow">
		<div class="relative z-20">
			{@render section(
				"Get Started with CoLoop Now",
				"Book a personalized demo to discover how CoLoop can accelerate your research and insights workflow.",
			)}
			<EmailSubmit {form} placeholder="Enter your email address" buttonText="Get a demo" />
		</div>
		<img src="/wild/super-car.png" alt="Get Started" class="absolute inset-0 object-cover w-full h-full" />
		<div class="bg-gradient-to-t from-primary/90 via-primary/70 to-transparent absolute z-10 w-full h-full"></div>
	</div>

	<!-- PRODUCTS  -->
	<div class="lg:mt-32 lg:mb-32 flex flex-col w-full h-full gap-16 mt-16 mb-16">
		{@render section("Products to run every kind of study, on any kind of data")}
		<ColSideSelectTwoSplit />
	</div>

	<!-- COMPARISON  -->
	<!-- <div class="lg:mt-32 lg:mb-32 flex flex-col w-full gap-16 mt-16 mb-16">
		{@render section("Compare CoLoop to CoPilot, ChatGPT + others etc")}

		<div
			class="bg-primary text-primary-foreground h-96 flex items-center justify-center w-full font-serif text-2xl">
			COMPARISON
		</div>
	</div> -->
</div>

<div class="bg-primary text-primary-foreground">
	<!-- SECURITY -->
	<div class="relative flex flex-col items-center justify-center h-full max-w-6xl mx-auto">
		<div class="lg:px-10 lg:mt-32 lg:mb-32 w-full h-full px-6 mt-16 mb-16">
			<Security />
		</div>
	</div>
</div>

<div class="relative flex flex-col items-center justify-center max-w-6xl mx-auto">
	<!-- <div class="lg:mt-32 lg:mb-32 w-full mt-16 mb-16">
		<div
			class="bg-primary text-primary-foreground h-96 flex items-center justify-center w-full font-serif text-2xl">
			COMMUNITY
		</div>
	</div> -->

	<!-- FINAL GET STARTED -->
	<div class="lg:px-10 lg:mt-32 lg:mb-32 w-full px-6 mt-16 mb-16">
		{@render section(
			"Get Started with CoLoop Now",
			"Book a personalized demo to discover how CoLoop can accelerate your research and insights workflow.",
		)}
		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Get a demo" />
	</div>
	<!-- BLOG ENDER -->
	<div class="lg:px-10 lg:mb-32 w-full px-6 mb-16">
		<BlogEndArtCard />
	</div>
</div>

<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->
<!-- ######################################################### -->

<!-- insert calendar from cal.com -->
<!-- <div class="w-full overflow-hidden rounded">
	<iframe
	src="https://coloop.cal.com/coloop-ai/agencies"
	style="border: 0px #ffffff none"
	width="100%"
	height="800"
	frameborder="0"
	marginheight="0"
	marginwidth="0"
	title="Booking Calendar"></iframe>
	</div> -->
