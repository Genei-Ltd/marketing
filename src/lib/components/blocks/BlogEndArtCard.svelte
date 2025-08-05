<script lang="ts">
	import Button from "$components/ui/button/button.svelte"
</script>

<div class="min-h-128 relative items-center justify-center w-full h-full mx-auto overflow-hidden rounded shadow">
	<div
		class="text-balance pt-xl relative z-30 flex flex-col items-center justify-center flex-1 w-full h-full px-8 text-center">
		<h2 class="md:text-4xl text-primary drop-shadow-sm mb-4 font-serif text-3xl font-medium">
			Insights to influence.
		</h2>
		<p class=" lg:w-1/2 w-full mb-8 text-base">
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

	<!-- src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" -->
	<div class="bg-gradient-to-t to-background via-background/20 from-transparent absolute inset-0 z-20 w-full h-full">
	</div>
	<img
		alt="Castle moat"
		src="/water/vista.png"
		class=" absolute inset-0 z-10 object-cover object-center w-full h-full scale-110 opacity-50" />
</div>
