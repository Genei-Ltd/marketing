<script lang="ts">
	type Props = {
		title: string
		subtitle: string
		image: string
		colSpan?: number
		height?: number
	}

	let { title, subtitle, image, colSpan = 1, height = 500 }: Props = $props()
</script>

<div
	class="group col-span-{colSpan} bg-card {image
		? 'text-card'
		: 'text-card-foreground'} relative flex h-full min-h-[{height}px] flex-col items-start justify-between overflow-hidden rounded transition-all duration-300 ease-in-out hover:shadow-xl">
	{#if image}
		<div class="absolute inset-0 z-10 w-full h-full from-primary/20 to-primary/50 bg-linear-to-t"></div>
		<img
			src={image}
			alt={title}
			class="absolute inset-0 z-0 object-cover w-full h-full transition-all duration-300 ease-in-out opacity-80 group-hover:opacity-100" />
	{/if}
	<div class="z-20 flex flex-col justify-between w-full h-full p-4 text-left">
		<div class="flex flex-col gap-2 mb-2">
			<h3 class="font-serif">
				{title}
			</h3>
			<span class="text-sm">
				{subtitle}
			</span>
		</div>
	</div>
</div>
