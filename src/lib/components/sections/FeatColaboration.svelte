<script lang="ts">
  import {
    IconCalendarEvent,
    IconClipboardCopy,
    IconLockAccess,
    IconShare,
  } from "@tabler/icons-svelte"
  import type { Component } from "svelte"

  import * as Demo from "$components/animations"
  import { cn } from "$lib/utils.js"
  // import Marquee from "@selemondev/svelte-marquee"

  interface Feature {
    id: string
    title: string
    subtitle: string
    description: string
    image: string
    icon: Component
  }

  const features: Feature[] = [
    {
      id: "collaborative-work",
      title: "Work simultaneously across projects",
      subtitle: "Never get out of sync again",
      description:
        "Work simultaneously across projects, never get out of sync again.",
      image: "/images/collaborate-bg-gray-wide.png",
      icon: IconClipboardCopy,
    },
    {
      id: "guest-access",
      title: "Guest access",
      subtitle: "Invite your clients and stakeholders to see progress",
      description: "Invite your clients and stakeholders to see progress.",
      image: "/images/guest-bg-gray-wide.png",
      icon: IconLockAccess,
    },
    {
      id: "share-work",
      title: "Share your work",
      subtitle:
        "Select the clips, transcripts, AI chats and analysis grids that shine",
      description:
        "Select the clips, transcripts, AI chats and analysis grids that shine.",
      image: "/images/share-bg-gray-wide.png",
      icon: IconShare,
    },
  ]

  let activeFeature = $state(features[0])
</script>

<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
  <!-- Left side - Feature options -->
  <div class="grid h-full grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-3">
    {#each features as feature}
      <div
        class={cn(
          "  grid min-h-[350px] cursor-pointer grid-rows-1 justify-start rounded p-6 transition-all duration-300",
          activeFeature.id === feature.id ? "" : " ",
        )}
        onmouseenter={() => (activeFeature = feature)}
        role="button"
        tabindex="0"
      >
        <div
          class="bg-card relative flex min-h-96 flex-col justify-between p-6"
        >
          <div
            class="from-card absolute top-0 bottom-0 left-0 z-20 w-1/3 bg-gradient-to-r to-transparent"
          ></div>
          <div
            class="from-card absolute top-0 right-0 bottom-0 z-20 w-1/3 bg-gradient-to-l to-transparent"
          ></div>
          <div
            class="absolute inset-0 z-10 flex flex-row items-center justify-center gap-4 overflow-hidden p-2"
          >
            <div
              class="border-border bg-muted/40 z-10 flex min-h-32 flex-col items-start justify-between rounded-xl p-2 shadow-lg"
            >
              <IconCalendarEvent class="text-primary h-12 w-12" />
              <h3 class="font-serif text-xl font-semibold capitalize">
                Automate
              </h3>
            </div>
            <div
              class="border-border bg-muted/40 flex min-h-32 flex-col items-start justify-between rounded-xl p-2"
            >
              <IconCalendarEvent class="text-primary h-12 w-12" />
              <h3 class="font-serif text-xl font-semibold capitalize">
                Automate
              </h3>
            </div>
            <div
              class="border-border bg-muted/40 flex min-h-32 flex-col items-start justify-between rounded-xl p-2"
            >
              <IconCalendarEvent class="text-primary h-12 w-12" />
              <h3 class="font-serif text-xl font-semibold capitalize">
                Automate
              </h3>
            </div>
            <!-- <svelte:component
            this={feature.icon}
            class="w-16 h-16 text-primary"
          /> -->
            <!-- <Marquee class="text-primary">
            <span class="text-primary">
              {feature.title}
            </span>
          </Marquee> -->
          </div>

          <h3 class="z-30 mb-4 font-serif text-3xl font-semibold capitalize">
            {feature.title}
          </h3>

          <span
            class="z-30 text-base leading-relaxed {activeFeature.id ===
            feature.id
              ? ''
              : ''}"
          >
            {feature.description}
          </span>
        </div>
      </div>
    {/each}
  </div>

  <div class="col-span-2">
    <Demo.GuestAccess />
  </div>

  <!-- Right side - Content display -->
  <!-- <div class="hidden w-full h-full lg:sticky lg:top-8">
    <div class="relative flex w-full h-full rounded bg-card">
      <div
        class="flex items-center justify-center w-full h-full transition-all duration-300 aspect-video"
      >
        <img
          in:fly={{ y: 40, duration: 350, opacity: 0.2 }}
          out:fly={{ y: -40, duration: 250, opacity: 0.2 }}
          src={activeFeature.image}
          alt={activeFeature.title}
          class="object-cover object-left w-full h-full"
        />
      </div>
    </div>
  </div> -->
</div>
