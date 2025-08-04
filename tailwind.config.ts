/** @type {import('tailwindcss').Config} */
import aspectRatio from "@tailwindcss/aspect-ratio"
import typography from "@tailwindcss/typography"
import svgToDataUri from "mini-svg-data-uri"
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette"
import animate from "tailwindcss-animate"

function addVariablesForColors({ addBase, theme }) {
	const allColors = flattenColorPalette(theme("colors"))
	const newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]))

	addBase({
		":root": newVars,
	})
}

/** @type {import('tailwindcss').Config} */
const config = {
	plugins: [
		animate,
		typography,
		aspectRatio,
		addVariablesForColors,
		addVariablesForColors,
		function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					"bg-grid": (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
						)}")`,
					}),
					"bg-grid-small": (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
						)}")`,
					}),
					"bg-dot": (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
						)}")`,
					}),
				},
				{
					values: flattenColorPalette(theme("backgroundColor")),
					type: "color",
				},
			)
		},
	],

	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
				},
				brand: {
					DEFAULT: "hsl(var(--brand) / <alpha-value>)",
					foreground: "hsl(var(--brand-foreground) / <alpha-value>)",
				},
				"accent-1": {
					DEFAULT: "hsl(var(--accent-1) / <alpha-value>)",
					foreground: "hsl(var(--accent-1-foreground) / <alpha-value>)",
				},
				"accent-2": {
					DEFAULT: "hsl(var(--accent-2) / <alpha-value>)",
					foreground: "hsl(var(--accent-2-foreground) / <alpha-value>)",
				},
				"accent-3": {
					DEFAULT: "hsl(var(--accent-3) / <alpha-value>)",
					foreground: "hsl(var(--accent-3-foreground) / <alpha-value>)",
				},
				"accent-4": {
					DEFAULT: "hsl(var(--accent-4) / <alpha-value>)",
					foreground: "hsl(var(--accent-4-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)",
				},
			},
			borderRadius: {
				xl: "calc(var(--radius) + 8px)",
				lg: "calc(var(--radius) + 4px)",
				md: "calc(var(--radius))",
				DEFAULT: "var(--radius)",
				sm: "calc(var(--radius) - 4px)",
				xs: "calc(var(--radius) - 8px)",
			},
			// fontSize: {
			//   xs: "0.625rem",
			//   sm: "0.7953rem",
			//   base: "1rem",
			//   lg: "1.125rem",
			//   xl: "1.5811rem",
			//   "2xl": "1.9882rem",
			//   "3xl": "2.5rem",
			//   display: "7.5rem",
			// },
			fontWeight: {
				light: 200,
				default: 300,
				normal: 300,
				medium: 400,
				semibold: 500,
				bold: 600,
			},
			animation: {
				"marquee-left": "marquee-left var(--duration, 40s) linear infinite",
				"marquee-up": "marquee-up var(--duration, 40s) linear infinite",
			},
			keyframes: {
				shimmer: {
					"0%, 90%, 100%": {
						"background-position": "calc(-100% - var(--shimmer-width)) 0",
					},
					"30%, 60%": {
						"background-position": "calc(100% + var(--shimmer-width)) 0",
					},
				},
				"marquee-left": {
					from: { transform: "translateX(0)" },
					to: { transform: "translateX(calc(-100% - var(--gap)))" },
				},
				"marquee-up": {
					from: { transform: "translateY(0)" },
					to: { transform: "translateY(calc(-100% - var(--gap)))" },
				},
			},
			typography: {
				DEFAULT: {
					css: {
						p: {
							color: "var(--foreground)",
							fontSize: "0.875rem",
							lineHeight: "1.5rem",
							marginTop: "0.75rem",
							marginBottom: "0.75rem",
						},
					},
				},
			},
		},
	},
}

export default config
