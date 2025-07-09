<script lang="ts">
  import { navigating, page } from "$app/stores"
  import { Separator } from "$components/ui/separator"
  import * as Icon from "@tabler/icons-svelte"
  import { ModeWatcher } from "mode-watcher"
  import type { Snippet } from "svelte"


  import "../app.css"

  interface Props {
    children?: Snippet
    data?: any
  }

  let { children, data }: Props = $props()
</script>

  <ModeWatcher />

  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-1">
      {@render children()}
    </main>
    <Footer />
  </div>