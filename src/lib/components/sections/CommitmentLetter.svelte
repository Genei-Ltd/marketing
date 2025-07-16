<script lang="ts">
  import { cn } from "$lib/utils.js"
</script>

<div class="flex justify-center">
  <div
    class="border-border bg-card text-card-foreground max-w-3xl transform rounded border py-8 shadow-2xl shadow-lg transition-all duration-300 ease-in-out hover:rotate-2"
  >
    <div class="m-12">
      <!-- Letter Header -->
      <div class="border-border relative mb-16 pb-6">
        <div class="absolute -top-12 right-0 opacity-30">
          <img
            src="/images/stamp-bg.png"
            alt="CoLoop Logo"
            class="h-36 w-36 invert"
          />
        </div>
        <div class="flex w-full flex-col items-start gap-2">
          <div
            class="mb-2 text-xs font-medium tracking-wider uppercase opacity-50"
          >
            A LETTER
          </div>
          <h3 class="text-foreground font-serif text-2xl font-medium">
            From The CoLoop Team
          </h3>
        </div>
      </div>

      <!-- Letter Body -->
      <div
        class="text-foreground mb-18 space-y-12 py-8 font-serif text-lg leading-relaxed text-balance opacity-85"
      >
        <p>
          Research and the insights we derive from it are evolving rapidly. As
          AI transforms how we analyze data and uncover patterns, we believe the
          future lies in the seamless collaboration between human expertise and
          artificial intelligence.
        </p>

        <p>
          Built from the ground up with researchers and analysts in mind, our
          platform is designed to amplify human insight, not replace it. We're
          here to handle the heavy lifting of data processing and pattern
          recognition, so you can focus on what matters most: understanding your
          audience and making informed decisions.
        </p>
      </div>

      <!-- Signature -->
      <div class="border-border mt-12 flex flex-row pt-6">
        <div class="flex w-full flex-col items-start gap-3">
          <div>
            <div class="text-foreground font-serif text-lg font-medium">
              CoLoop Technologies
            </div>
          </div>
          <div
            class="flex w-fit items-end justify-end gap-4 font-serif text-base opacity-50"
          >
            <div class="font-medium">Adrien W.</div>
            <div class="font-medium">Jack B.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
