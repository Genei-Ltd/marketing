<script lang="ts">
	import Button from "$components/ui/button/button.svelte"
</script>

<div class="px-4">
	<section class="mt-36 min-h-128 mb-36 relative w-full max-w-6xl mx-auto overflow-hidden rounded shadow-lg">
		<!-- src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" -->
		<img
			alt="Castle moat"
			src="/images/wild/river-valley.png"
			class="absolute inset-0 w-full h-full object-cover object-center mask-t-to-85%"
			style="z-index: 0;" />
		<!-- <div class="bg-gradient-to-b from-white/90 via-white/70 to-white/30 absolute inset-0" style="z-index: 1;"></div> -->
		<div class="relative z-10 flex flex-col items-center justify-center w-full px-8 py-20 text-center">
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
	</section>
</div>
