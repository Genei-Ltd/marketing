<script lang="ts">
	import { Button } from "$components/ui/button"

	type Props = {
		title: string
		subtitle: string
		image?: string
		colSpan?: number
		href?: string
		cardHeight?: number
		rowSpan?: number
	}

	let { title, subtitle, image, colSpan = 1, href, cardHeight = 64, rowSpan = 1 }: Props = $props()
</script>

<div
	class="group shadow col-span-{colSpan} row-span-{rowSpan} min-h-{cardHeight} bg-card {image
		? 'text-card'
		: 'text-card-foreground'} relative flex flex-col items-start justify-between overflow-hidden rounded transition-all duration-300 ease-in-out hover:shadow-xl">
	{#if image}
		<div class="from-primary/20 to-primary/50 bg-linear-to-t absolute inset-0 z-10 w-full h-full"></div>
		<img
			src={image}
			alt={title}
			class="opacity-80 group-hover:opacity-100 absolute inset-0 z-0 object-cover w-full h-full transition-all duration-300 ease-in-out" />
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
		<div class="flex flex-col items-end justify-end w-full gap-2">
			{#if href}
				<Button {href} variant="more" size="none" class="mt-auto">Read More</Button>
			{/if}
		</div>
	</div>
</div>
