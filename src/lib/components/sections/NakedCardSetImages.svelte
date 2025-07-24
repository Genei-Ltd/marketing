<script lang="ts">
</script>

<div class="text-foreground max-w-7xl w-full">
	<div class="flex flex-row items-start justify-center w-full h-full gap-4 mx-auto">
		<div class=" text-foreground bg-card flex flex-col items-start flex-1 w-full h-full p-4 text-left">
			<div class=" flex flex-row items-end justify-start w-full h-full gap-4 mb-8">
				{#each ["/security/anthropic.png", "/security/openai.webp", "/security/xai.webp"] as image}
					<div class="bg-primary dark:invert flex-shrink-0 object-contain w-20 h-20 p-4">
						<img
							src={image}
							alt="State of the Art Machine Learning"
							class="saturate-0 brightness-100 invert flex-shrink-0 object-contain w-full h-full" />
					</div>
				{/each}
			</div>
			<span class="mb-2 text-lg font-semibold">State of the Art Machine Learning</span>
			<span class="opacity-70 text-balance pr-8 text-sm">
				High-performing model ensembles assembled from across platforms and providers for a best in class
				experience.
			</span>
		</div>

		<div class=" text-foreground bg-card flex flex-col items-start flex-1 w-full h-full p-4 text-left">
			<div class=" flex flex-row items-end justify-start w-full h-full gap-4 mb-8">
				{#each ["/security/gdpr.svg", "/security/soc-2-vanta.png", "/security/soc-1.png", "/security/soc-2.png"] as image}
					<div class="bg-primary dark:invert flex-shrink-0 object-contain w-20 h-20 p-4">
						<img
							src={image}
							alt="Enterprise-Grade Security"
							class="saturate-0 brightness-100 invert flex-shrink-0 object-contain w-full h-full" />
					</div>
				{/each}
			</div>
			<span class="mb-2 text-lg font-semibold">Enterprise-Grade Security</span>
			<span class="opacity-70 text-balance pr-8 text-sm">
				Robust, industry-standard protection with zero training on your data.
			</span>
		</div>
	</div>
</div>
