<script lang="ts">
</script>

{#snippet card(item: string)}
	<div
		class="flex flex-col items-start justify-end bg-card border-primary text-card-foreground border-b-18 rounded p-2 px-4 w-48 h-48 truncate text-ellipsis overflow-hidden flex-shrink-0">
		<span class="text-lg font-bold">{item}</span>
	</div>
{/snippet}

<div class="group">
	<div class="marquee-container overflow-hidden whitespace-nowrap relative">
		<div class="marquee-track flex gap-4 marquee-right">
			{#each ["Integrations", "Workflows", "Agents", "Projects", "Analysis", "Research", "Insights", "Reports", "Presentations", "Dashboards"] as item}
				{@render card(item)}
			{/each}
			<!-- Duplicate content for seamless loop -->
			{#each ["Integrations", "Workflows", "Agents", "Projects", "Analysis", "Research", "Insights", "Reports", "Presentations", "Dashboards"] as item}
				{@render card(item)}
			{/each}
		</div>
	</div>

	<div class="marquee-container overflow-hidden whitespace-nowrap relative pt-16">
		<div class="marquee-track flex gap-4 marquee-left">
			{#each ["Integrations", "Workflows", "Agents", "Projects", "Analysis", "Research", "Insights", "Reports", "Presentations", "Dashboards"] as item}
				{@render card(item)}
			{/each}
			<!-- Duplicate content for seamless loop -->
			{#each ["Integrations", "Workflows", "Agents", "Projects", "Analysis", "Research", "Insights", "Reports", "Presentations", "Dashboards"] as item}
				{@render card(item)}
			{/each}
		</div>
	</div>
</div>

<style>
	.marquee-container {
		mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
		-webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
	}

	.marquee-track {
		will-change: transform;
	}

	.marquee-left {
		animation: marquee-left 60s linear infinite;
	}

	.marquee-right {
		animation: marquee-right 60s linear infinite;
	}

	@keyframes marquee-left {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(-50%, 0, 0);
		}
	}

	@keyframes marquee-right {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(50%, 0, 0);
		}
	}

	/* Group pause animation on hover */
	.group:hover .marquee-track {
		animation-play-state: paused;
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
	}
</style>
