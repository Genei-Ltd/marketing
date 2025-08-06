<script lang="ts">
</script>

<div class="max-w-6xl w-full mx-auto">
	<!-- Desktop Timeline -->
	<div class="md:flex relative flex-row items-start hidden w-full">
		<!-- Full width horizontal line with arrow -->
		<div class="absolute top-6 left-0 right-0 h-0.5 bg-primary/30 mr-[20px] z-0"></div>
		<div
			class="absolute right-0 top-6.25 w-0 h-0 border-l-[20px] border-l-primary/30 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent z-10 translate-y-[-50%]">
		</div>

		<!-- Step 1 -->
		<div class="relative z-10 flex flex-col items-start flex-1">
			<div
				class="bg-primary-foreground outline-background/30 outline-2 text-primary flex items-center justify-center w-12 h-12 mb-4 text-lg font-bold rounded-full shadow">
				1
			</div>
			<div class="px-4">
				<div class="text-foreground opacity-80 mb-4 text-sm font-semibold uppercase">Day 0</div>
				<h4 class="mb-2 text-lg font-semibold">Kickoff & Alignment</h4>
				<p class="text-muted-foreground text-md">
					Project launch with your team and CoLoop experts. We align on goals, success metrics, and
					integration needs to ensure a smooth start.
				</p>
			</div>
		</div>

		<!-- Step 2 -->
		<div class="relative z-10 flex flex-col items-start flex-1">
			<div
				class="bg-primary-foreground outline-background/30 outline-2 text-primary flex items-center justify-center w-12 h-12 mb-4 text-lg font-bold rounded-full shadow">
				2
			</div>
			<div class="px-4">
				<div class="text-foreground opacity-80 mb-4 text-sm font-semibold uppercase">Month 1</div>
				<h4 class="mb-2 text-lg font-semibold">Onboarding & Enablement</h4>
				<p class="text-muted-foreground text-md">
					Hands-on onboarding, training, and workflow setup. We guide your team through first projects,
					ensuring everyone is confident and productive.
				</p>
			</div>
		</div>

		<!-- Step 3 -->
		<div class="relative z-10 flex flex-col items-start flex-1">
			<div
				class="bg-primary-foreground outline-background/30 outline-2 text-primary flex items-center justify-center w-12 h-12 mb-4 text-lg font-bold rounded-full shadow">
				3
			</div>
			<div class="px-4">
				<div class="text-foreground opacity-80 mb-4 text-sm font-semibold uppercase">Month 3</div>
				<h4 class="mb-2 text-lg font-semibold">AI-Native Transformation</h4>
				<p class="text-muted-foreground text-md">
					Your team operates independently with AI-powered workflows. We review outcomes, optimize processes,
					and celebrate your transformation to AI-native research.
				</p>
			</div>
		</div>
	</div>

	<!-- Mobile Timeline -->
	<div class="md:hidden relative flex flex-col">
		<!-- Continuous vertical line -->
		<div class="absolute top-6 bottom-6 left-6 w-0.5 bg-border z-0"></div>

		<div class="flex flex-col space-y-8">
			<!-- Step 1 -->
			<div class="relative z-10 flex items-start space-x-4">
				<div
					class="bg-primary-foreground outline-background/30 outline-2 text-primary flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full shadow">
					1
				</div>
				<div class="flex-1 pt-2">
					<h4 class="mb-2 text-lg font-semibold">Day 0: Kickoff & Alignment</h4>
					<p class="text-muted-foreground text-base">
						Project launch with your team and CoLoop experts. We align on goals, success metrics, and
						integration needs to ensure a smooth start.
					</p>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="relative z-10 flex items-start space-x-4">
				<div
					class="bg-primary-foreground outline-background/30 outline-2 text-primary flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full shadow">
					2
				</div>
				<div class="flex-1 pt-2">
					<h4 class="mb-2 text-lg font-semibold">Month 1: Onboarding & Enablement</h4>
					<p class="text-muted-foreground text-base">
						Hands-on onboarding, training, and workflow setup. We guide your team through first projects,
						ensuring everyone is confident and productive.
					</p>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="relative z-10 flex items-start space-x-4">
				<div
					class="bg-primary-foreground outline-background/30 outline-2 text-primary flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full shadow">
					3
				</div>
				<div class="flex-1 pt-2">
					<h4 class="mb-2 text-lg font-semibold">Month 3: AI-Native Transformation</h4>
					<p class="text-muted-foreground text-base">
						Your team operates independently with AI-powered workflows. We review outcomes, optimize
						processes, and celebrate your transformation to AI-native research.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
