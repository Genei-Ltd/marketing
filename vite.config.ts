import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		conditions: ["svelte", "browser", "import", "module", "default"],
	},
	build: {
		target: "esnext",
		rollupOptions: {
			external: [
				/^node:/, // Mark node built-ins as external
			],
			output: { format: "esm" },
		},
	},
})
