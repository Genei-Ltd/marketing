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
