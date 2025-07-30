<script lang="ts" module>
	import { IconArrowRight } from "@tabler/icons-svelte"
	import type { Snippet } from "svelte"

	import { Button } from "$components/ui/button"

	export interface TwoSideProps {
		label?: string
		heading?: string
		description?: string
		buttonText?: string
		buttonHref?: string
		buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
		showButton?: boolean
		children?: Snippet
		clearBackground?: [boolean, boolean]
		reverse?: boolean
	}
</script>

<script lang="ts">
	let {
		label = "Topic",
		heading = "This is a heading",
		description = "This is a description",
		buttonText = "Click it real good",
		buttonHref = "/",
		buttonVariant = "link",
		showButton = true,
		children,
		clearBackground = [
			false,
			false,
		],
		reverse = false,
	}: TwoSideProps = $props()
</script>

<div class="md:h-156 md:flex-row md:reverse flex flex-col w-full overflow-hidden rounded">
	<!-- Left Side - Dark Background -->
	<div
		class=" text-card-foreground px-xl py-xl flex flex-col justify-center md:max-w-1/2 w-full aspect-square {clearBackground[0]
			? 'bg-transparent'
			: 'bg-card'} {reverse ? 'order-2' : 'order-1'}">
		<div class="space-y-sm">
			<!-- Label -->
			<div class="text-xs font-medium tracking-widest uppercase">{label}</div>

			<!-- Main Heading -->
			<h1 class="font-serif text-2xl font-bold leading-tight tracking-wide">
				{#each heading.split("\n") as line}
					{line}<br />
				{/each}
			</h1>

			<!-- Description -->
			<p class="text-balance text-md pr-16 font-medium leading-tight opacity-75">
				{description}
			</p>

			<!-- Button -->
			{#if showButton}
				<Button
					href={buttonHref}
					variant={buttonVariant}
					size="none"
					class="group opacity-80 hover:opacity-100 inline-flex items-center mt-16 transition-opacity">
					<span class="text-sm">{buttonText}</span>
					<IconArrowRight class="group-hover:translate-x-1 w-4 h-4 transition-transform" />
				</Button>
			{/if}
		</div>
	</div>

	<!-- Right Side - Light Background with Custom Content -->
	<div
		class="bg-accent-1 flex items-center justify-center md:max-w-1/2 w-full aspect-square {clearBackground[1]
			? 'bg-transparent'
			: 'bg-accent-1'} {reverse ? 'order-1' : 'order-2'}">
		{@render children?.()}
	</div>
</div>
