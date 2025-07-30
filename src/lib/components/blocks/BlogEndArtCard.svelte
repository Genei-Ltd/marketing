<script lang="ts">
	import Button from "$components/ui/button/button.svelte"
</script>

<div class="min-h-128 rounded-xl relative w-full h-full px-4 overflow-hidden">
	<div class="w-full h-full relative z-0 mask-t-from-20% mask-t-to-90% rounded">
		<!-- src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" -->
		<img
			alt="Castle moat"
			src="/wild/river-valley-2.png"
			class="object-cover object-center w-full h-full"
			style="z-index: 0;" />
		<div class="bg-gradient-to-b from-background/50 to-background/10 absolute inset-0"></div>
	</div>
	<div class="lg:mt-16 absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-8 text-center">
		<h2 class="md:text-4xl text-primary drop-shadow-sm mb-4 font-serif text-3xl font-medium">
			Insights to influence.
		</h2>
		<p class="text-balance w-1/2 mb-8 text-base">
			Join thousands who trust CoLoop to leverage AI for insights that matter. Start your trial today.
		</p>
		<Button
			variant="default"
			size="lg"
			class="px-6 py-2 text-base font-medium rounded shadow-md"
			href="/book-a-demo">
			Get CoLoop
		</Button>
	</div>
</div>
