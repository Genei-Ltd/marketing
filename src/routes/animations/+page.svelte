<script lang="ts">
	import ConceptTestingDemo from "$lib/components/animations/ConceptTestingDemo.svelte"
	import DemoInterviewAnalysis from "$lib/components/animations/DemoInterviewAnalysis.svelte"
	import DemoWorkflowSharing from "$lib/components/animations/DemoWorkflowSharing.svelte"
	import DemoWorkflowAssetUpload from "$lib/components/animations/DemoWorkflowAssetUpload.svelte"
	import DemoWorkflow from "$lib/components/animations/DemoWorkflow.svelte"
	import DemoAnimateQuerey from "$lib/components/animations/DemoAnimateQuerey.svelte"
</script>

<svelte:head>
	<title>Animation Demos</title>
</svelte:head>

<div class="max-w-7xl p-8 mx-auto mt-32 space-y-16">
	<header class="mb-12 text-center">
		<h1 class="text-foreground mb-4 text-4xl font-bold">Animation Demos</h1>
		<p class="text-muted-foreground">Collection of all available animation components</p>
	</header>

	<section class="flex flex-col gap-8">
		<div class=" h-256 max-h-256 relative overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Concept Testing Demo</h2>
			<div class="bg-muted/20 relative w-full h-full p-4 overflow-hidden rounded">
				<img
					src="/images/water/tops.png"
					alt="Concept Testing Demo"
					class="blur-sm absolute top-0 left-0 object-cover w-full h-full opacity-50" />
				<ConceptTestingDemo />
			</div>
		</div>

		<div class="">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Interview Analysis Demo</h2>
			<div class="bg-muted/20 relative h-full p-6 overflow-hidden rounded">
				<img
					src="/images/water/tops.png"
					alt="Concept Testing Demo"
					class="blur-sm absolute top-0 left-0 object-cover w-full h-full opacity-50" />
				<DemoInterviewAnalysis />
			</div>
		</div>

		<div class="h-full overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Workflow Sharing Demo</h2>
			<div class="bg-muted/20 p-lg h-full overflow-hidden rounded">
				<DemoWorkflowSharing />
			</div>
		</div>

		<div class="h-156 max-h-156 overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Workflow Asset Upload Demo</h2>
			<div class="bg-muted/20 h-156 max-h-156 p-6 overflow-hidden rounded">
				<DemoWorkflowAssetUpload />
			</div>
		</div>

		<div class="h-156 max-h-156 overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Workflow Demo</h2>
			<div class="bg-muted/20 h-156 max-h-156 p-6 overflow-hidden rounded">
				<DemoWorkflow />
			</div>
		</div>

		<div class="h-156 max-h-156 overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Animate Query Demo</h2>
			<div class="bg-muted/20 h-156 max-h-156 p-6 overflow-hidden rounded">
				<DemoAnimateQuerey />
			</div>
		</div>

		<!-- <div class="h-156 max-h-156 overflow-hidden">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Guest Access</h2>
			<div class="bg-muted/20 p-6 rounded-lg">
				<GuestAccess />
			</div>
		</div> -->

		<!-- <div class="">
			<h2 class="text-foreground mb-4 text-2xl font-semibold">Pharma Insight Demo</h2>
			<div class="bg-muted/20 p-6 rounded-lg">
				<PharmaInsightDemo />
			</div>
		</div> -->
	</section>
</div>
