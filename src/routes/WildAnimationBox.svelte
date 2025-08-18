<script lang="ts">
	import { cn } from "$lib/utils.js"
	let {
		backgroundImage,
		backgroundColor = "bg-secondary",
		children,
	}: { backgroundImage?: string; backgroundColor?: string; children: any } = $props()
</script>

<div class={cn("relative flex items-center justify-center w-full h-full overflow-hidden bg-black", backgroundColor)}>
	{#if backgroundImage}
		<img
			src={backgroundImage}
			alt="Background"
			class="opacity-80 absolute inset-0 object-cover w-full h-full scale-110 bg-black" />
	{/if}
	<div class="h-5/6 z-10 w-5/6">
		{#if children}
			{@render children?.()}
		{/if}
	</div>
</div>
