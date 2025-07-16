<script lang="ts">
  //   import { ModeWatcher } from "mode-watcher"
  import type { Snippet } from "svelte"

  import "../app.css"
  import Footer from "./Footer.svelte"
  import Header from "./Header.svelte"
  import { Button } from "$components/ui/button"

  interface Props {
    children?: Snippet
    data?: any
  }

  let { children, data }: Props = $props()
</script>

<!-- <ModeWatcher /> -->

<div class="bg-background relative flex min-h-screen flex-col">
  <div class="z-20 bg-transparent">
    <div class="bg-background z-20">
      <Header />
      <main class="flex-1">
        {@render children?.()}
      </main>
      <Footer />
    </div>
    <div
      class="from-background via-background/80 h-32 bg-gradient-to-b to-transparent"
    ></div>
  </div>
  <!-- End Reveal -->
  <!-- <div class="w-screen h-screen bg-transparent">
    <h1>Hello World</h1>
  </div> -->
  <!-- <div class="to-primary/50 h-16 bg-gradient-to-b from-black"></div> -->

  <div class="sticky inset-0 bottom-0 h-[800px] w-screen bg-pink-700">
    <div class="flex h-full w-full items-center justify-center">
      <img
        src="/images/wild/reveal.png"
        alt="Footer"
        class="h-full w-full object-cover"
      />
      <div
        class="from-background via-background/80 absolute inset-0 bg-gradient-to-t to-transparent"
      >
        <div class="flex h-full w-full flex-col items-center justify-center">
          <h1
            class="text-foreground font-sans text-[100px] font-light tracking-tighter"
          >
            Insight to Influence.
          </h1>
          <h1
            class=" text-foreground -mt-8 font-serif text-[90px] font-extralight tracking-tighter italic"
          >
            Research Reimagined.
          </h1>
          <div class="flex flex-col items-center justify-center">
            <span class="mt-4">
              CoLoop has saved thousands of
              <span class="font-serif font-semibold italic">Human</span>
              researchers millions of hours in research. Join us.
            </span>

            <Button class="mt-8" href="/demo">Get CoLoop</Button>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="mt-16"> -->
    <!-- <EndReveal /> -->
    <!-- </div> -->
  </div>
</div>
