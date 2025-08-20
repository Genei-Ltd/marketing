<script>
	import { Button } from "$components/ui/button"
</script>

<div class="sticky inset-0 bottom-0 h-[500px] w-screen">
	<div class="flex items-center justify-center w-full h-full">
		<img src="/wild/reveal.png" alt="Footer" class="object-cover w-full h-full" />
		<!-- <div class="from-background via-background/80 bg-gradient-to-b to-transparent h-36 absolute inset-0"></div> -->
		<div class="from-primary bg-gradient-to-t to-primary/50 absolute inset-0">
			<div class="text-secondary flex flex-col items-center justify-center w-full h-full">
				<h1 class="text-secondary font-sans lg:text-[100px] text-2xl font-light tracking-tight drop-shadow">
					Insights to Influence.
				</h1>
				<h1
					class=" text-secondary text-center lg:-mt-4 font-serif lg:text-[90px] text-2xl font-extralight tracking-tighter italic drop-shadow">
					Research Reimagined.
				</h1>
				<div class="text-balance flex flex-col items-center justify-center text-center">
					<span class="mt-4">
						CoLoop has saved thousands of
						<span class="font-serif italic font-semibold">Human</span>
						researchers millions of hours in research. Join us.
					</span>

					<Button class="mt-8" href="/book-a-demo">Get CoLoop</Button>
				</div>
			</div>
		</div>
	</div>
	<!-- <EndReveal /> -->
</div>
