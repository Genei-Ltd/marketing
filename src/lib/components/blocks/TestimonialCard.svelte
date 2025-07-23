<script lang="ts">
	import { cn } from "$lib/utils.js"
	import type { Testimonial as TestimonialType } from "$lib/server/connectors/notion-testimonials"

	type Props = {
		testimonial: TestimonialType
		class?: string
		size?: "sm" | "md" | "lg"
	}

	let { testimonial, class: className, size = "md" }: Props = $props()
</script>

<div
	class={cn(
		"bg-card text-xl text-card-foreground hover:shadow-lg max-h-full flex flex-1 h-full p-12 overflow-hidden transition-all duration-300 rounded",
		className,
	)}>
	<div class="flex flex-col justify-between flex-1">
		<!-- Quote Content -->
		<blockquote class="ellipsis flex-1 pr-16 font-serif text-left">
			<span class="">"{testimonial?.content || "No content"}"</span>
		</blockquote>

		<!-- Author Info -->
		<div class="flex-0 flex flex-row items-end justify-between w-full h-16">
			<div>
				{#if testimonial?.avatar && size !== "sm"}
					<img
						src={testimonial.avatar}
						alt={testimonial.name}
						class="grayscale object-cover w-32 h-32 mt-16 rounded-full" />
				{/if}
			</div>
			<div class="flex flex-col {size === 'sm' ? 'text-lg' : 'text-xl'}">
				<div class="opacity-80 font-bold text-right">
					{#if testimonial.company}
						<span class="opacity-80 hover:underline font-semibold"
							><a href={`https://${testimonial?.companyDomain}`} target="_blank">{testimonial?.company}</a
							></span>
					{/if}
				</div>
				<div class="opacity-80 text-sm font-semibold text-right">
					{testimonial?.name}
					<span class="opacity-80 font-normal">•</span>
					{testimonial?.role}
				</div>
			</div>
		</div>
	</div>
</div>
