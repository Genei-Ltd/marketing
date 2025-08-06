<script lang="ts" module>
	import { tv } from "tailwind-variants"

	import { cn } from "$lib/utils.js"

	export const navigationMenuTriggerStyle = tv({
		base: "bg-transparent hover:bg-muted text-foreground/70 hover:text-foreground focus:bg-muted focus:text-foreground data-[state=open]:hover:bg-muted data-[state=open]:text-foreground data-[state=open]:focus:bg-muted data-[state=open]:bg-muted/50 focus-visible:ring-ring/50 group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm  outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
	})
</script>

<script lang="ts">
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down"
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui"

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: NavigationMenuPrimitive.TriggerProps = $props()
</script>

<NavigationMenuPrimitive.Trigger
	bind:ref
	data-slot="navigation-menu-trigger"
	class={cn(navigationMenuTriggerStyle(), "group", className)}
	{...restProps}>
	{@render children?.()}

	<ChevronDownIcon
		class="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
		aria-hidden="true" />
</NavigationMenuPrimitive.Trigger>
