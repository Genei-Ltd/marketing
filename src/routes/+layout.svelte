<script lang="ts">
  import { ModeWatcher } from "mode-watcher"
  import type { Snippet } from "svelte"

  import "../app.css"
  import Footer from "./Footer.svelte"
  import Header from "./Header.svelte"

  interface Props {
    children: Snippet
    data?: any
  }

  let { children, data }: Props = $props()
</script>

<ModeWatcher />

<div class="flex min-h-screen flex-col">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
