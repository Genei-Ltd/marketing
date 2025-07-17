<script lang="ts">
	import Card from "$components/blocks/Card.svelte"

	// Success metrics data
	const successMetrics = [
		{
			title: "50% less manual effort",
			subtitle: "Save the team from painful and arduous work with automation",
			metric: "50% less effort",
			image: "/images/wild/coca-cola.png",
			href: "/blogs/coca-cola",
			cardHeight: 96,
		},
		{
			title: "Pinpoint accuracy, even in challenging settings",
			subtitle: "Over 96% accuracy on multi-language and complex domains benchmark",
			metric: "96% Accuracy",
			cardHeight: 96,
		},
		{
			title: "Expand your analysis capabilities",
			subtitle: "Effortlessly conduct a wider range of studies",
			metric: "Unlimited Scope",
		},
		{
			title: "Expand your analysis capabilities",
			subtitle: "Effortlessly conduct a wider range of studies",
			metric: "Unlimited Scope",
			image: "/images/wild/coca-cola.png",
			href: "/blogs/coca-cola",
		},
		{
			title: "Expand your analysis capabilities",
			subtitle: "Effortlessly conduct a wider range of studies",
			metric: "Unlimited Scope",
			image: "/images/wild/coca-cola.png",
			href: "/blogs/coca-cola",
		},
		{
			title: "Expand your analysis capabilities",
			subtitle: "Effortlessly conduct a wider range of studies",
			metric: "Unlimited Scope",
		},
	]
</script>

<div class="md:grid-cols-2 lg:grid-cols-4 grid grid-cols-1 gap-4 mt-4">
	{#each successMetrics as metric, index}
		<Card
			title={metric.title}
			subtitle={metric.subtitle}
			image={metric?.image ?? ""}
			colSpan={index < 2 ? 2 : 1}
			href={metric?.href ?? ""}
			cardHeight={metric?.cardHeight} />
	{/each}
</div>
