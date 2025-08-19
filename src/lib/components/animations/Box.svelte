<script lang="ts">
	import { cn } from "$lib/utils"

	const { class: className = "", children, innerClass = "" } = $props()
</script>

<div class={cn("w-full transition-all duration-300 ease-in-out", className)}>
	<div
		class={cn(
			"transition-all duration-300 ease-in-out w-full  mx-auto bg-white lg:px-8 lg:py-12 px-4 py-6 rounded-xl overflow-hidden h-full",
			innerClass,
		)}>
		{@render children?.()}
	</div>
</div>
