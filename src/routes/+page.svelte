<script lang="ts">
	import BlogEndArtCard from "./../lib/components/blocks/BlogEndArtCard.svelte"
	import DemoWorkflow from "../lib/components/animations/DemoWorkflow.svelte"
	import TwoSplit from "$components/layouts/TwoSplit.svelte"
	import type { Testimonial } from "$lib/server/connectors/notion-testimonials"

	import EmailSubmit from "../lib/components/blocks/EmailSubmit.svelte"
	import ColSideSelectTwoSplit from "../lib/components/sections/ColSideSelectTwoSplit.svelte"
	import Testimonials from "../lib/components/sections/Testimonials.svelte"
	import TestimonialCard from "$components/blocks/TestimonialCard.svelte"
	import Card from "$components/blocks/Card.svelte"
	import NakedCardSet from "$components/sections/NakedCardSet.svelte"
	import CarouselBlogs from "$components/sections/CarouselBlogs.svelte"
	import CarouselPills from "$components/sections/CarouselPills.svelte"
	import type { Article } from "$lib/types/articles"
	import DemoRolodex from "$components/animations/DemoRolerdex.svelte"
	import AnimateQuerey from "$components/animations/DemoAnimateQuerey.svelte"
	import Security from "$components/sections/Security.svelte"
	import DemoWorkflowSharing from "$components/animations/DemoWorkflowSharing.svelte"
	let {
		form,
		data,
	}: { form: FormData; data: { testimonials: Testimonial[]; ctaTestimonial: Testimonial[]; articles: Article[] } } =
		$props()
</script>

{#snippet section(title: string)}
	<h2 class="text-balance w-1/2 mx-auto mb-16 font-serif text-4xl text-center">{title}</h2>
{/snippet}

<!-- Hero image -->
<!-- <div class="relative z-50 w-full mt-16">
	<img
		src="/images/hero-3.png"
		alt="Hero"
		class="border-primary aspect-video max-w-7xl grayscale border-6 relative z-50 object-cover w-full mx-auto rounded shadow-2xl" />
	</div> -->
<!-- <img src="/images/wild/hero.png" alt="Hero" class="absolute inset-0 object-cover w-full h-full py-16 opacity-50" /> -->

<!-- HERO SECTION -->
<div class="pb-96 max-h-300 relative top-0 z-10 w-full h-screen">
	<img
		src="/images/wild/crazy-cola.png"
		alt="Hero"
		class="2xl:object-top-right absolute top-0 z-10 object-cover w-full h-full opacity-100" />
	<div
		class="pb-96 bg-gradient-to-t from-primary/90 via-primary/0 to-transparent opacity-60 absolute bottom-0 z-10 w-full h-screen">
	</div>
	<div
		class="px-auto absolute bottom-0 left-0 right-0 z-50 flex flex-col items-start justify-between h-full py-16 mx-32">
		<div class="h-fit relative top-0 z-10 flex items-center justify-center object-cover w-1/4 mt-16 opacity-100">
			<DemoWorkflow />
		</div>
	</div>
	<div
		class="max-w-7xl absolute bottom-0 left-0 right-0 z-50 flex flex-col items-start justify-between h-full py-16 mx-auto">
		<div class="flex flex-col items-start justify-end h-full">
			<h1
				class="text-huge text-background text-balance drop-shadow-lg capitalize font-serif leading-tight tracking-wide text-left">
				AI-powered analysis <br /> for human-powered insights
			</h1>
			<h2
				class="text-background opacity-80 mt-4 text-xl font-medium capitalize font-sans leading-tight tracking-wide text-left">
				Opinions in, insights out. Fast.
			</h2>
		</div>
	</div>
</div>

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<!-- CUSTOMER LOGOS  -->
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

	<!-- FIRST CTA -->
	<div class="w-full mt-16">
		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Subscribe" />
	</div>

	<!-- PRODUCT BENEFITS  -->
	<div class="flex flex-col w-full gap-32 mt-32 mb-32">
		<TwoSplit
			label="Analysis Agents"
			heading="Specialised for Qualitative"
			description="Delegate complex tasks in natural language to domain-specific agents that can count, search, summarise and cite."
			buttonText="Explore Agents"
			buttonHref="/demo">
			<div class="flex flex-col items-center justify-center w-full h-full gap-16 overflow-hidden">
				<AnimateQuerey />
			</div>
		</TwoSplit>
		<TwoSplit
			label="Integrations"
			heading="Streamlined Analysis in a single tool"
			description="Upload your data from a growing range of file formats, languages and 3rd party tools to create a single unified source of truth."
			buttonText="Explore Integrations"
			reverse
			buttonHref="/demo">
			<div class=" bg-accent-1 w-full h-full">
				<DemoRolodex
					showControls={false}
					items={[
						{ src: "/integrations/capvision.png", title: "Capvision" },
						{ src: "/integrations/teams.png", title: "teams" },
						{ src: "/integrations/zoom.png", title: "zoom" },
						{ src: "/integrations/discuss.png", title: "discuss" },
						{ src: "/integrations/google-meet.png", title: "google meet" },
						{ src: "/integrations/incling.png", title: "incling" },
						{ src: "/integrations/onedrive.png", title: "onedrive" },
						{ src: "/integrations/otter.png", title: "otter" },
						{ src: "/integrations/rev.png", title: "rev" },
						{ src: "/integrations/qualzy.png", title: "qualzy" },
						{ src: "/integrations/qualzy.png", title: "qualzy" },
						{ src: "/integrations/qualzy.png", title: "qualzy" },
						{ src: "/integrations/qualzy.png", title: "qualzy" },
						{ src: "/integrations/qualzy.png", title: "qualzy" },
						{ src: "/integrations/qualzy.png", title: "qualzy" },
					]}>
					{#snippet children(item)}
						<div class="flex flex-col items-center justify-center w-full h-64 p-8">
							<div
								class="text-card-foreground bg-card border-t-20 border-accent-3 flex flex-row items-center justify-center w-full h-full gap-4 mx-auto overflow-hidden rounded shadow-2xl">
								<img
									src={(item as { src: string; alt: string }).src}
									alt={(item as { src: string; title: string }).title}
									class="object-cover h-12" />
								<div class="flex flex-col items-start justify-start">
									<span class="text-balance text-xl font-semibold capitalize"
										>{(item as { src: string; title: string }).title}</span>
									<span class="text-balance font-sans text-xs font-semibold uppercase opacity-50">
										Full Integration
									</span>
								</div>
							</div>
						</div>
					{/snippet}
				</DemoRolodex>
			</div>
		</TwoSplit>
		<TwoSplit
			label="Projects"
			heading="Secure Access Controlled Workspaces"
			description="Combine your research material in secure projects with all of the context."
			buttonText="Explore Projects"
			buttonHref="/demo"
			clearBackground={[false, true]}>
			<div class="bg-accent-2 w-full h-full flex items-center justify-center">
				<div class="w-3/4 h-3/4">
					<DemoWorkflowSharing />
				</div>
			</div>
		</TwoSplit>
		<TwoSplit
			label="Workflows"
			heading="Streamline Your Work"
			description="Precise purpose built workflows for transcription, translation, content analysis, clip reels and more."
			buttonText="Explore Workflows"
			reverse
			buttonHref="/demo">
			<img src="/images/wild/petri-2.png" alt="Workflows" class="p-xl object-cover w-full h-full" />
		</TwoSplit>
	</div>

	<!-- STATISTICS & BENEFITS  -->
	<div class="flex flex-col w-full mt-32 mb-32">
		{@render section("Let us do the heavy lifting, you do the insights")}
		<NakedCardSet set="features" />
	</div>

	<!-- Testimonials -->
	<div class=" w-full">
		<div class="max-w-7xl flex flex-col w-full gap-16 mx-auto mb-32">
			{@render section("What our customers say")}
			<Testimonials testimonials={data.testimonials} />
		</div>
	</div>
</div>

<!-- MAX 7XL END -->
<!-- FULL WIDTH START -->

<div class="bg-primary text-primary-foreground flex flex-col items-center justify-center w-full py-32">
	<!-- TESTIMONIALS  -->
	<div class="max-w-7xl grid items-center justify-center grid-cols-2 mx-auto">
		<div class=" flex items-center justify-center">
			<img src="/images/old-man.png" alt="old man" class="aspect-square object-cover w-full h-full rounded" />
		</div>
		<div class="flex flex-col items-start justify-center flex-1 pl-32">
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

	<!-- SOLUTIONS -->
	<div class=" min-h-200 flex flex-col items-center justify-center w-full mt-32">
		<!-- {@render section("What our customers say")} -->
		<CarouselPills />
	</div>
</div>

<!-- FULL WIDTH END -->
<!-- MAX 7XL START -->

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<!-- BOOK A CALL CTA -->
	<div class="w-full mt-32 mb-32">
		{@render section("This is the future of research")}
		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Get a demo" />
	</div>

	<!-- ENTERPRISE READY -->
	{@render section("Enterprise Grade AI Designed by Insights Experts")}
	<div class="grid grid-cols-4 grid-rows-2 gap-4 mb-16">
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
			title="SOC II Compliant"
			subtitle="Robust, industry-standard protection with zero training on your data."
			image="/images/water/tops.png"
			href="/demo"
			cardHeight={96}
			colSpan={2}
			rowSpan={2} />
		<Card
			title="Live Support & Training"
			subtitle="White glove support to support adoption, maximise value and transform your team to AI first experts."
			image="/images/wild/old-car.png"
			href="/demo"
			cardHeight={96}
			colSpan={2} />
		<Card
			title="Best In Class Models"
			subtitle="High-performing model ensembles assembled from across platforms and providers for a best in class experience."
			colSpan={2}
			rowSpan={2} />
		<Card
			title="Flexible API & Agentic Workflows"
			subtitle="Retrofit your teams, tools and processes in weeks with integrated APIs and expert quality tooling with no prompting experience required." />
		<Card
			title="Flexible API & Agentic Workflows"
			subtitle="Retrofit your teams, tools and processes in weeks with integrated APIs and expert quality tooling with no prompting experience required." />
	</div>
</div>

<!-- MAX 7XL END -->
<!-- FULL WIDTH START -->

<div class="bg-primary text-primary-foreground min-h-200 flex flex-col items-center justify-center w-full mt-32 mb-32">
	<!-- BLOGS CAROUSEL -->
	<!-- {@render section("What our customers say")} -->
	<CarouselBlogs articles={data.articles as Article[]} />
</div>
<!-- FULL WIDTH END -->

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<!-- ORG TRANSFORMATION TIMELINE -->
	<div class="w-full mt-32 mb-32">
		{@render section("Org Transformation Timeline")}
	</div>
	<!-- FINAL GET STARTED -->
	<div class="w-full mt-32 mb-32">
		{@render section("With a Book a call CTA too")}
		<div class="flex flex-col w-full gap-16 mt-32 mb-32">
			<TwoSplit
				label="Get CoLoop"
				heading="See CoLoop in action"
				description="Book a personalized demo to discover how CoLoop can accelerate your research and insights workflow."
				buttonText="Get CoLoop"
				buttonHref="/demo"
				clearBackground={[true, true]}>
				<TestimonialCard testimonial={data.ctaTestimonial[0]} />
			</TwoSplit>
		</div>

		<EmailSubmit {form} placeholder="Enter your email address" buttonText="Get a demo" />
	</div>

	<!-- PRODUCTS  -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Products to run every kind of study, on any kind of data")}
		<ColSideSelectTwoSplit />
	</div>

	<!-- COMPARISON  -->
	<div class="flex flex-col w-full gap-16 mt-32 mb-32">
		{@render section("Compare CoLoop to CoPilot, ChatGPT + others etc")}

		<div
			class="bg-primary text-primary-foreground w-full h-96 flex items-center justify-center text-2xl font-serif">
			COMPARISON
		</div>
	</div>
</div>

<div class="bg-primary text-primary-foreground">
	<!-- SECURITY -->
	<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
		<div class="w-full mt-32 mb-32">
			<Security />
		</div>
	</div>
</div>

<div class="max-w-7xl relative flex flex-col items-center justify-center mx-auto">
	<div class="w-full mt-32 mb-32">
		<!-- COMMUNITY -->
		<div
			class="bg-primary text-primary-foreground w-full h-96 flex items-center justify-center text-2xl font-serif">
			COMMUNITY
		</div>
	</div>

	<!-- BLOG ENDER -->
	<div class="w-full mt-32 mb-32">
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
