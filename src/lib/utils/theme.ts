import { browser } from "$app/environment"

type Theme = "light" | "dark" | "system"

// Simple variable to track current theme
let currentTheme: Theme = "system"

// Initialize theme on client side
if (browser) {
	// Get stored theme or default to system
	const stored = localStorage.getItem("theme") as Theme
	currentTheme = stored || "system"

	// Apply theme immediately
	applyTheme(currentTheme)
}

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

export function toggleMode() {
	const newTheme = currentTheme === "dark" ? "light" : "dark"
	setTheme(newTheme)
}

export function getTheme(): Theme {
	return currentTheme
}

// Listen for system theme changes
if (browser) {
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
		if (currentTheme === "system") {
			applyTheme("system")
		}
	})
}
