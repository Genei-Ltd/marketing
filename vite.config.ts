import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    globals: true, /// allows to skip import of test functions like `describe`, `it`, `expect`, etc.
  },
  build: {
    target: "esnext",
    rollupOptions: {
      external: [
        /^node:/, // Mark node built-ins as external
      ],
      output: {
        format: "esm",
      },
    },
  },
})
