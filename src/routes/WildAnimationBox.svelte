<script lang="ts">
	let { backgroundImage, children }: { backgroundImage?: string; children: any } = $props()
</script>

<div class="bg-secondary relative flex items-center justify-center w-full h-full">
	{#if backgroundImage}
		<img src={backgroundImage} alt="Background" class="opacity-80 absolute inset-0 object-cover w-full h-full" />
	{/if}
	<div class="h-5/6 z-10 w-5/6">
		{#if children}
			{@render children?.()}
		{/if}
	</div>
</div>
