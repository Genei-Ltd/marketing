<script lang="ts">
  import { goto } from "$app/navigation"
  import Button from "$components/ui/button/button.svelte"
  import Card from "$components/ui/card/card.svelte"
  import NotionContent from "$lib/components/NotionContent.svelte"
  import * as Icons from "@tabler/icons-svelte"
  import type { PageData } from "./$types"

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function handleBuyClick() {
    goto("/demo/independents/purchase")
  }
</script>

<svelte:head>
  <title>{data.pageTitle} - CoLoop for Independents</title>
  <meta
    name="description"
    content="CoLoop solution designed for independent consultants and freelancers"
  />
</svelte:head>

<main class="min-h-screen bg-background">
  {#if data.error}
    <div
      class="my-8 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded max-w-3xl mx-auto"
    >
      ⚠️ {data.error}
    </div>
  {/if}
  <div
    class="flex flex-col justify-center items-center flex-1 max-w-5xl mx-auto px-4"
  >
    <div class="w-full flex flex-row justify-between items-center pt-8 mt-12">
      <h1 class="text-4xl font-bold text-left w-full text-foreground truncate">
        {data.pageTitle}
      </h1>

      <div class="w-fit flex-0 flex flex-row justify-end items-end gap-4 group">
        <Button variant="link" on:click={handleBuyClick}>
          Skip Demo (Buy CoLoop Now)
          <Icons.IconArrowRight
            class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-all duration-300"
          />
        </Button>
      </div>
    </div>
    <!-- Notion Content -->
    <NotionContent blocks={data.blocks} />

    <!-- Buy Button Section -->
    <Card
      class="bg-primary flex flex-col justify-center items-center text-primary-foreground py-16 w-full my-16"
    >
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p class=" mb-8 max-w-2xl mx-auto">
          Join thousands of independent consultants using CoLoop to deliver
          better insights faster.
        </p>
        <Button
          on:click={handleBuyClick}
          variant="default"
          class="inline-flex items-center bg-background text-foreground hover:bg-background/80 justify-center px-8 py-4 font-semibold text-lg transition-all duration-300 "
        >
          Get Started Now
        </Button>
      </div>
    </Card>
  </div>
</main>
