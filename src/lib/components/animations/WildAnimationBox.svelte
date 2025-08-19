<script lang="ts">
	import { cn } from "$lib/utils.js"
	let {
		backgroundImage,
		backgroundColor = "bg-secondary",
		children,
		overrideScaleLg = 100,
		overrideScaleSm = 60,
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
	<div
		class={cn(
			`h-full z-10 w-full lg:w-5/6 lg:h-5/6 scale-${overrideScaleSm} lg:scale-${overrideScaleLg} transition-all duration-300 ease-in-out`,
			overrideClass,
		)}>
		{#if children}
			{@render children?.()}
		{/if}
	</div>
</div>
