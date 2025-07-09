<script lang="ts">
  import Footer from "./Footer.svelte"
  import Header from "./Header.svelte"

  let { children } = $props()
</script>

<div class="flex min-h-screen flex-col">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
