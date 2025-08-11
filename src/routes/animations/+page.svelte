<script lang="ts">
	import ConceptTestingDemo from "$components/animations/DemoConceptTesting.svelte"
	import ConceptTestingFlow from "$lib/components/animations/ConceptTestingFlow.svelte"
	import DemoInterviewAnalysis from "$lib/components/animations/DemoInterviewAnalysis.svelte"
	import DemoWorkflowSharing from "$lib/components/animations/DemoWorkflowSharing.svelte"
	import DemoWorkflowAssetUpload from "$lib/components/animations/DemoWorkflowAssetUpload.svelte"
	import DemoWorkflow from "$lib/components/animations/DemoWorkflow.svelte"
	import DemoAnimateQuerey from "$lib/components/animations/DemoAnimateQuerey.svelte"
	import DemoIntegrations from "$lib/components/animations/DemoIntegrations.svelte"
	import DemoSlides from "$lib/components/animations/DemoSlides.svelte"
	import DemoCoreValue from "$components/animations/DemoCoreValue.svelte"
</script>

<svelte:head>
	<title>Animation Demos</title>
</svelte:head>

<div class="max-w-6xl p-8 mx-auto mt-32 space-y-16">
	<header class="mb-12 text-center">
		<h1 class="text-foreground mb-4 text-4xl font-bold">Animation Demos</h1>
		<p class="text-muted-foreground">Collection of all available animation components</p>
	</header>

	<div class="relative overflow-hidden">
		<h2 class="text-foreground mb-4 text-2xl font-semibold">Core Value Demo</h2>
		<div class="border border-border bg-accent-1 h-full p-6 overflow-hidden w-1/2 rounded-lg">
			<DemoCoreValue />
		</div>
	</div>

	<section class="flex flex-col gap-12">
		<div class="relative max-w-2xl overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Integrations Demo</h2>
			<div
				class="bg-secondary saturate-50 relative flex items-center justify-center w-full h-64 rounded-lg overflow-hidden">
				<img
					src="/water/tan-2.png"
					alt="Survey Analysis"
					class="opacity-60 absolute inset-0 object-cover w-full h-full" />
				<div class="h-5/6 w-5/6">
					<DemoIntegrations />
				</div>
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Slides Visual Abstraction (New)</h2>
			<div
				class="aspect-square w-128 h-128 bg-card border border-border relative overflow-hidden rounded-lg shadow-sm">
				<DemoSlides />
			</div>
		</div>
		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Concept Testing Flow (New)</h2>
			<div
				class="aspect-square w-128 h-128 bg-card border border-border relative overflow-hidden rounded-lg shadow-sm">
				<ConceptTestingFlow />
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Concept Testing Demo (Original)</h2>
			<div class="bg-muted/20 relative h-64 p-4 overflow-hidden rounded-lg">
				<img
					src="/water/tan-1.png"
					alt="Concept Testing Demo"
					class="absolute top-0 left-0 object-cover w-full h-full opacity-50" />
				<ConceptTestingDemo />
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Interview Analysis Demo</h2>
			<div class="bg-muted/20 relative h-64 p-6 overflow-hidden rounded-lg">
				<img
					src="/water/tan-1.png"
					alt="Interview Analysis Demo"
					class="absolute top-0 left-0 object-cover w-full h-full opacity-50" />
				<DemoInterviewAnalysis />
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Workflow Sharing Demo</h2>
			<div class="bg-muted/20 h-64 p-6 overflow-hidden rounded-lg">
				<DemoWorkflowSharing />
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Workflow Asset Upload Demo</h2>
			<div class="bg-muted/20 h-64 p-6 overflow-hidden rounded-lg">
				<DemoWorkflowAssetUpload />
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Workflow Demo</h2>
			<div class="bg-muted/20 h-64 p-6 overflow-hidden rounded-lg">
				<DemoWorkflow />
			</div>
		</div>

		<div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Animate Query Demo</h2>
			<div class="bg-muted/20 h-64 p-6 overflow-hidden rounded-lg">
				<DemoAnimateQuerey />
			</div>
		</div>

		<!-- <div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Guest Access</h2>
			<div class="bg-muted/20 h-64 p-6 rounded-lg">
				<GuestAccess />
			</div>
		</div> -->

		<!-- <div class="relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Pharma Insight Demo</h2>
			<div class="bg-muted/20 h-64 p-6 rounded-lg">
				<PharmaInsightDemo />
			</div>
		</div> -->
	</section>
</div>
