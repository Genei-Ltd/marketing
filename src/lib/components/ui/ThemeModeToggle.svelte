<script lang="ts">
	import { IconSun, IconMoon, IconSettings } from "@tabler/icons-svelte"
	import { Button, type ButtonProps } from "$lib/components/ui/button"

	import { browser } from "$app/environment"

	let { class: className, variant = "ghost", size = "icon", disabled, type = "button" }: ButtonProps = $props()

	type Theme = "light" | "dark" | "system"

	// Reactive state for current theme
	let currentTheme: Theme = $state("system")

	// Initialize theme on client side
	$effect(() => {
		if (browser) {
			// Get stored theme or default to system
			const stored = getTheme()
			currentTheme = stored

			// Apply theme immediately
			applyTheme(currentTheme)
		}
	})

	function applyTheme(theme: Theme) {
		if (!browser) return

		const root = document.documentElement

		if (theme === "system") {
			// Use system preference
			const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
			root.classList.toggle("dark", systemDark)
		} else {
			// Use explicit theme
			root.classList.toggle("dark", theme === "dark")
		}
	}

	function setTheme(theme: Theme) {
		currentTheme = theme
		if (browser) {
			localStorage.setItem("theme", theme)
			applyTheme(theme)
		}
	}

	function toggleMode() {
		const themes: Theme[] = ["light", "dark", "system"]
		const newTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length]
		setTheme(newTheme)
	}

	function getTheme(): Theme {
		if (!browser) return "system"
		return (localStorage.getItem("theme") as Theme) || "system"
	}

	// Listen for system theme changes
	$effect(() => {
		if (browser) {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
			const listener = () => {
				if (currentTheme === "system") {
					applyTheme("system")
				}
			}

			mediaQuery.addEventListener("change", listener)

			// Cleanup
			return () => {
				mediaQuery.removeEventListener("change", listener)
			}
		}
	})
</script>

<Button class={className} {variant} {size} {disabled} {type} aria-label="Toggle Theme" onclick={toggleMode}>
	{#if currentTheme === "dark"}
		<IconMoon class="size-5" />
	{:else if currentTheme === "light"}
		<IconSun class="size-5" />
	{:else if currentTheme === "system"}
		<IconSettings class="size-5" />
	{/if}
</Button>
