import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { execSync } from "child_process"

// Get the current git commit hash
function getGitCommitHash() {
	try {
		return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()
	} catch {
		return "unknown"
	}
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		__COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
	},
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
