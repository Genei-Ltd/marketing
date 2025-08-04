<script lang="ts">
	import { cn } from "$lib/utils"
	import Marquee from "$lib/components/ui/Marquee.svelte"

	const featuresLists: string[][] = [
		[
			"AI-Powered Analysis",
			"Real-time Processing",
			"Team Collaboration",
			"Enterprise Security",
			"Infinitely Scalable",
			"Advanced Analytics",
			"10x Faster Research",
			"Global Coverage",
		],
		[
			"AI-Powered Analysis",
			"Real-time Processing",
			"Open Ends",
			"Data Sovereignty",
			"Translation",
			"Transcription",
			"50+ Languages",
			"Multi Workspace",
		],
	]
</script>

{#snippet feature(item: string)}
	<div
		class={cn(
			"bg-card/60 border border-border/80 rounded-full p-4 px-8 min-w-50 backdrop-blur-sm",
			"flex flex-col items-center justify-center  text-center",
			"hover:bg-card/80 transition-colors duration-200",
		)}>
		<h3 class="text-lg font-semibold text-foreground">{item}</h3>
	</div>
{/snippet}

<div
	class="w-full mask-l-from-90% mask-r-from-90% relative h-full flex items-center justify-center flex-col gap-6 overflow-hidden">
	{#each featuresLists as features}
		<Marquee direction="left" fade={true} pauseOnHover={true}>
			{#each features as item}
				{@render feature(item)}
			{/each}
		</Marquee>
		<Marquee reverse={true} fade={true} pauseOnHover={true}>
			{#each features as item}
				{@render feature(item)}
			{/each}
		</Marquee>
	{/each}
</div>
