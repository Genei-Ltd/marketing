<script lang="ts">
	import { cn } from "$lib/utils.js"
	let {
		backgroundImage,
		backgroundColor = "bg-secondary",
		children,
		overrideScaleLg = 100,
		overrideScaleSm = 90,
		overrideClass = "",
	}: {
		backgroundImage?: string
		backgroundColor?: string
		children: any
		overrideScaleLg?: number
		overrideScaleSm?: number
		overrideClass?: string
	} = $props()
</script>

<div class={cn("relative flex items-center justify-center w-full h-full overflow-hidden bg-black", backgroundColor)}>
	{#if backgroundImage}
		<img
			src={backgroundImage}
			alt="Background"
			class="opacity-80 absolute inset-0 object-cover w-full h-full scale-110 bg-black" />
	{/if}
	<div class={cn(` z-10  font-scale-50 w-5/6 h-5/6   transition-all duration-300 ease-in-out`, overrideClass)}>
		{#if children}
			{@render children?.()}
		{/if}
	</div>
</div>

<style>
	@media (max-width: 1280px) {
		.font-scale-50 {
			zoom: 0.65;
		}
	}
</style>
