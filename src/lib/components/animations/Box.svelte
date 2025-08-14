<script lang="ts">
	import { cn } from "$lib/utils"

	const { class: className = "", children, innerClass = "" } = $props()
</script>

<div class={cn("w-full", className)}>
	<div class={cn("w-full space-y-8 mx-auto bg-white px-8 py-12 rounded overflow-hidden h-full", innerClass)}>
		{@render children?.()}
	</div>
</div>
