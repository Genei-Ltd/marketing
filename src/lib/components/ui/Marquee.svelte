<script lang="ts">
	import { cn } from "$lib/utils"
	type Direction = "left" | "up"
	export let direction: Direction = "left"
	export let pauseOnHover: boolean = false
	export let reverse: boolean = false
	export let fade: boolean = false
	export let innerClassName: string = ""
	export let numberOfCopies: number = 2
	export let duration: string = "100s"
	export let gap: string = "1rem"
</script>

<div
	class={cn(`group flex overflow-hidden ${$$restProps.class}`, {
		"flex-row": direction === "left",
		"flex-col": direction !== "left",
	})}
	style={`--duration: ${duration}; --gap: ${gap}; mask-image: ${
		fade
			? `linear-gradient(${
					direction === "left" ? "to right" : "to bottom"
				}, transparent 0%, rgba(0, 0, 0, 1.0) 10%, rgba(0, 0, 0, 1.0) 90%, transparent 100%)`
			: "none"
	};
	  -webkit-mask-image: ${
			fade
				? `linear-gradient(${
						direction === "left" ? "to right" : "to bottom"
					}, transparent 0%, rgba(0, 0, 0, 1.0) 10%, rgba(0, 0, 0, 1.0) 90%, transparent 100%)`
				: "none"
		};
	  `}>
	{#each Array(numberOfCopies).fill(0) as __, i (i)}
		<div
			class={cn(
				"flex justify-around shrink-0 mr-[var(--gap)]",
				direction === "left" ? "flex-row marquee-left" : "flex-col marquee-up",
				pauseOnHover && "group-hover:[animation-play-state:paused]",
				reverse && "[animation-direction:reverse]",
				innerClassName,
			)}
			style={`gap: ${gap}; animation-duration: ${duration};`}>
			<slot />
		</div>
	{/each}
</div>

<style>
	:global(.marquee-left) {
		animation-name: marquee-left-anim;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	:global(.marquee-up) {
		animation-name: marquee-up-anim;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	@keyframes marquee-left-anim {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-100%);
		}
	}

	@keyframes marquee-up-anim {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-100%);
		}
	}
</style>
