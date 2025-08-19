<script lang="ts">
	import { cn } from "$lib/utils"
	import Marquee from "$lib/components/ui/Marquee.svelte"

	const featuresLists: string[][] = [
		[
			"Survey Analysis",
			"Code Open Ends",
			"Stimulus Testing",
			"Clip Reels",
			"Transcription",
			"Multiple Languages",
			"API Integration",
			"Secure Collaboration",
			"Concept Testing",
			"Translation",
			"Content Analysis",
			"Knowledge Bases",
			"Segmentation",
			"Consolidate Sources",
		],
		[
			"Segmentation",
			"Clip Reels",
			"Survey Analysis",
			"Transcription",
			"API Integration",
			"Clip Reels",
			"Concept Testing",
			"Translation",
			"Content Analysis",
			"Knowledge Bases",
			"Multiple Languages",
			"Code Open Ends",
			"Secure Collaboration",
			"Consolidate Sources",
		],
	]
</script>

{#snippet feature(item: string)}
	<div
		class={cn(
			"bg-white  rounded-full p-4 px-8 min-w-50 backdrop-blur-sm",
			"flex flex-col items-center justify-center  text-center",
			" transition-all duration-300 pointer-events-none",
		)}>
		<h3 class="text-black text-md font-semibold">{item}</h3>
	</div>
{/snippet}

<div
	class="w-full relative mask-l-from-90% mask-r-from-90% h-full flex items-center justify-center flex-col gap-6 overflow-hidden">
	{#each featuresLists as features}
		<Marquee direction="left" pauseOnHover={true}>
			{#each features as item}
				{@render feature(item)}
			{/each}
		</Marquee>
		<Marquee reverse={true} pauseOnHover={true}>
			{#each features as item}
				{@render feature(item)}
			{/each}
		</Marquee>
	{/each}
</div>
